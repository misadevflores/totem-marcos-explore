/**
 * db.ts — Capa de abstracción SQLite
 *
 * En Android (APK via Capacitor) usa @capacitor-community/sqlite nativo.
 * En browser (dev / PWA) usa sql.js con persistencia en IndexedDB.
 */

import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import initSqlJs, { Database as SqlJsDatabase, SqlJsStatic } from 'sql.js';
import sqlWasm from 'sql.js/dist/sql-wasm.wasm?url';

// ── Tipos públicos ─────────────────────────────────────────────────────────

export interface DbRow {
  [key: string]: unknown;
}

export interface DbAdapter {
  query(sql: string, params?: unknown[]): Promise<DbRow[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
  run(sql: string): Promise<void>;
  /** Ejecuta múltiples sentencias sin persistir snapshot entre ellas */
  batch(statements: { sql: string; params?: unknown[] }[]): Promise<void>;
  close(): Promise<void>;
}

// ── IndexedDB helpers (solo para web) ─────────────────────────────────────

const IDB_NAME = 'totem-marco-db';
const IDB_STORE = 'snapshots';
const IDB_KEY = 'db';

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadSnapshotFromIdb(): Promise<Uint8Array | null> {
  try {
    const idb = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function saveSnapshotToIdb(data: Uint8Array): Promise<void> {
  try {
    const idb = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readwrite');
      const req = tx.objectStore(IDB_STORE).put(data, IDB_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[DB] No se pudo guardar snapshot en IndexedDB:', err);
  }
}

// ── Adaptador Web (sql.js + IndexedDB) ────────────────────────────────────

class WebAdapter implements DbAdapter {
  private db: SqlJsDatabase;

  constructor(db: SqlJsDatabase) {
    this.db = db;
  }

  async query(sql: string, params: unknown[] = []): Promise<DbRow[]> {
    const stmt = this.db.prepare(sql);
    stmt.bind(params as any);
    const rows: DbRow[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as DbRow);
    }
    stmt.free();
    return rows;
  }

  async execute(sql: string, params: unknown[] = []): Promise<void> {
    const stmt = this.db.prepare(sql);
    stmt.run(params as any);
    stmt.free();
    // Persistir tras cada escritura individual
    await saveSnapshotToIdb(this.db.export());
  }

  async run(sql: string): Promise<void> {
    this.db.run(sql);
    await saveSnapshotToIdb(this.db.export());
  }

  /** Ejecuta varias sentencias y persiste el snapshot solo al final */
  async batch(statements: { sql: string; params?: unknown[] }[]): Promise<void> {
    for (const { sql, params = [] } of statements) {
      const stmt = this.db.prepare(sql);
      stmt.run(params as any);
      stmt.free();
    }
    // Un solo snapshot al finalizar todas las operaciones
    await saveSnapshotToIdb(this.db.export());
  }

  async close(): Promise<void> {
    this.db.close();
  }
}

// ── Adaptador Android (Capacitor SQLite nativo) ────────────────────────────

class NativeAdapter implements DbAdapter {
  private conn: SQLiteDBConnection;

  constructor(conn: SQLiteDBConnection) {
    this.conn = conn;
  }

  async query(sql: string, params: unknown[] = []): Promise<DbRow[]> {
    const result = await this.conn.query(sql, params as any[]);
    return (result.values ?? []) as DbRow[];
  }

  async execute(sql: string, params: unknown[] = []): Promise<void> {
    await this.conn.run(sql, params as any[]);
  }

  async run(sql: string): Promise<void> {
    await this.conn.execute(sql);
  }

  async batch(statements: { sql: string; params?: unknown[] }[]): Promise<void> {
    const set = statements.map(({ sql, params = [] }) => ({
      statement: sql,
      values: params as any[],
    }));
    await this.conn.executeSet(set);
  }

  async close(): Promise<void> {
    await this.conn.close();
  }
}

// ── Función pública: abrir la DB ───────────────────────────────────────────

const DB_NAME = 'totem-marco';

let _adapter: DbAdapter | null = null;

export async function openDb(): Promise<DbAdapter> {
  if (_adapter) return _adapter;

  const platform = Capacitor.getPlatform(); // 'android' | 'ios' | 'web'
  console.info('[DB] Plataforma detectada:', platform);

  if (platform === 'android' || platform === 'ios') {
    // ── Nativo ──────────────────────────────────────────────────────────
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    const ret = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;

    let conn: SQLiteDBConnection;
    if (ret.result && isConn) {
      conn = await sqlite.retrieveConnection(DB_NAME, false);
    } else {
      conn = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    }

    await conn.open();
    _adapter = new NativeAdapter(conn);
    console.info('[DB] SQLite nativo abierto:', DB_NAME);
  } else {
    // ── Web / Dev ────────────────────────────────────────────────────────
    let SQL: SqlJsStatic;
    try {
      SQL = await initSqlJs({ locateFile: () => sqlWasm });
    } catch (e) {
      throw new Error('No se pudo cargar sql.js WASM: ' + String(e));
    }

    // Intentar cargar snapshot guardado (ediciones previas)
    const saved = await loadSnapshotFromIdb();
    let sqlDb: SqlJsDatabase;

    if (saved) {
      sqlDb = new SQL.Database(saved);
      console.info('[DB] Snapshot cargado desde IndexedDB');
    } else {
      // Primera vez: cargar el archivo base desde public/
      const resp = await fetch('/totem-marco');
      if (!resp.ok) throw new Error(`No se pudo cargar totem-marco: ${resp.status}`);
      const buf = await resp.arrayBuffer();
      sqlDb = new SQL.Database(new Uint8Array(buf));
      await saveSnapshotToIdb(sqlDb.export());
      console.info('[DB] Base cargada desde archivo y guardada en IndexedDB');
    }

    _adapter = new WebAdapter(sqlDb);
  }

  return _adapter;
}

/** Reinicia la DB eliminando el snapshot de IndexedDB (útil para reset de fábrica) */
export async function resetDb(): Promise<void> {
  try {
    const idb = await openIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readwrite');
      const req = tx.objectStore(IDB_STORE).delete(IDB_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    _adapter = null;
    console.info('[DB] Snapshot eliminado — se recargará desde archivo base');
  } catch (err) {
    console.warn('[DB] No se pudo resetear:', err);
  }
}
