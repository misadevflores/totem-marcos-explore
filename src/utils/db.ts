/**
 * db.ts — Adaptador SQLite universal
 *
 * - En Android APK (Capacitor): usa @capacitor-community/sqlite nativo → persiste en disco
 * - En browser/dev: usa servidor Express local (localhost:3001) → escribe en public/totem-marco
 */

import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

const DB_NAME = 'totem-marco';
const API     = 'http://localhost:3001/api';

export interface DbRow { [key: string]: unknown; }

// ── Interfaz común ─────────────────────────────────────────────────────────

interface Adapter {
  query(sql: string): Promise<DbRow[]>;
  execute(sql: string): Promise<void>;
  batch(statements: string[]): Promise<void>;
}

// ── Adaptador Web: llama al servidor Express ───────────────────────────────

class WebAdapter implements Adapter {
  async query(sql: string): Promise<DbRow[]> {
    const res = await fetch(`${API}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    });
    if (!res.ok) throw new Error(`Query error: ${res.statusText}`);
    return (await res.json()).data ?? [];
  }

  async execute(sql: string): Promise<void> {
    const res = await fetch(`${API}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    });
    if (!res.ok) throw new Error(`Execute error: ${res.statusText}`);
  }

  async batch(statements: string[]): Promise<void> {
    const res = await fetch(`${API}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statements }),
    });
    if (!res.ok) throw new Error(`Batch error: ${res.statusText}`);
  }
}

// ── Adaptador Android: Capacitor SQLite nativo ─────────────────────────────

class NativeAdapter implements Adapter {
  private conn: SQLiteDBConnection;

  constructor(conn: SQLiteDBConnection) {
    this.conn = conn;
  }

  async query(sql: string): Promise<DbRow[]> {
    const result = await this.conn.query(sql);
    return (result.values ?? []) as DbRow[];
  }

  async execute(sql: string): Promise<void> {
    await this.conn.run(sql, []);
  }

  async batch(statements: string[]): Promise<void> {
    const set = statements.map(s => ({ statement: s, values: [] }));
    await this.conn.executeSet(set);
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────

let _adapter: Adapter | null = null;

export async function openDb(): Promise<Adapter> {
  if (_adapter) return _adapter;

  const platform = Capacitor.getPlatform();
  console.info('[DB] Plataforma:', platform);

  if (platform === 'android' || platform === 'ios') {
    // ── Nativo ──────────────────────────────────────────────────────────
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;
    let conn: SQLiteDBConnection;

    if (isConn) {
      conn = await sqlite.retrieveConnection(DB_NAME, false);
    } else {
      conn = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    }
    await conn.open();
    _adapter = new NativeAdapter(conn);
    console.info('[DB] SQLite nativo abierto');
  } else {
    // ── Web/Dev ──────────────────────────────────────────────────────────
    const health = await fetch(`${API}/health`).catch(() => null);
    if (!health?.ok) {
      throw new Error(
        'El servidor SQLite no está corriendo.\n' +
        'Ejecuta: npm run dev\n' +
        '(arranca Vite + servidor automáticamente)'
      );
    }
    _adapter = new WebAdapter();
    console.info('[DB] Adaptador web listo → public/totem-marco');
  }

  return _adapter;
}

export function getAdapter(): Adapter {
  if (!_adapter) throw new Error('DB no inicializada — llama a openDb() primero');
  return _adapter;
}

export async function resetDb(): Promise<void> {
  _adapter = null;
  console.info('[DB] Adaptador reseteado — se reconectará en el próximo initStorage()');
}
