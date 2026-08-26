/**
 * api/_shared.js — Helper compartido para las Vercel Functions
 *
 * - Carga sql.js (SQLite puro JS, sin binarios nativos) con el archivo bundled
 * - Superpone leads persistidos desde Vercel KV (sobrevive entre invocaciones)
 * - Persiste leads de vuelta a KV tras cada mutación
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// ── Cache de módulo (warm invocations) ─────────────────────────────────────
let _SQL   = null; // sql.js library
let _dbBuf = null; // buffer del archivo SQLite base

const DB_FILE = join(process.cwd(), 'public', 'totem-marco');
const LEAD_MUTATING = /INTO leads|UPDATE leads|DELETE FROM leads/i;

// ── sql.js ─────────────────────────────────────────────────────────────────

async function getSqlLib() {
  if (_SQL) return _SQL;
  const { default: initSqlJs } = await import('sql.js');
  const wasmPath = join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  const wasmBinary = readFileSync(wasmPath);
  _SQL = await initSqlJs({ wasmBinary });
  return _SQL;
}

function getDbBuffer() {
  if (!_dbBuf) _dbBuf = readFileSync(DB_FILE);
  return _dbBuf;
}

// ── Vercel KV (opcional) ────────────────────────────────────────────────────

const HAS_KV = !!process.env.KV_REST_API_URL;

async function kvGet(key) {
  if (!HAS_KV) return null;
  try {
    const { kv } = await import('@vercel/kv');
    return kv.get(key);
  } catch { return null; }
}

async function kvSet(key, value) {
  if (!HAS_KV) return;
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set(key, value);
  } catch (e) {
    console.warn('[KV] set error:', e.message);
  }
}

// ── DB factory ──────────────────────────────────────────────────────────────

export async function openDb() {
  const SQL = await getSqlLib();
  const db  = new SQL.Database(getDbBuffer());

  // Aplicar leads persistidos desde KV
  const leads = await kvGet('marco:leads');
  if (Array.isArray(leads) && leads.length > 0) {
    for (const l of leads) {
      try {
        db.run(
          `INSERT OR IGNORE INTO leads VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            l.id, l.created_at, l.full_name, l.company ?? null,
            l.email ?? null, l.phone ?? null, l.position ?? null,
            l.category_id ?? null, l.category_name ?? null,
            l.brochure_id ?? null, l.brochure_title ?? null,
            l.requirement_type ?? null, l.requirement_detail ?? null,
            l.specialist_area ?? null, l.authorized_terms ?? 0,
            l.status ?? 'Nuevo', l.source ?? 'Brochure',
          ]
        );
      } catch {/* lead ya existe, ignorar */}
    }
  }

  // Aplicar settings persistidos desde KV
  const settings = await kvGet('marco:settings');
  if (settings) {
    try {
      db.run(
        `UPDATE kiosk_settings SET
          idle_timeout_seconds = ?, auto_reset_confirmation_seconds = ?,
          enable_virtual_keyboard = ?, totem_frame_mode = ?,
          company_name = ?, event_title = ?
        WHERE id = 1`,
        [
          settings.idle_timeout_seconds, settings.auto_reset_confirmation_seconds,
          settings.enable_virtual_keyboard, settings.totem_frame_mode,
          settings.company_name, settings.event_title,
        ]
      );
    } catch {/* ignorar */}
  }

  return db;
}

// ── Query helpers ───────────────────────────────────────────────────────────

export function execQuery(db, sql) {
  const result = db.exec(sql);
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map(row =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

// ── Persistencia ────────────────────────────────────────────────────────────

export async function persistAfterMutation(db, sql) {
  if (LEAD_MUTATING.test(sql)) {
    const rows = execQuery(db, 'SELECT * FROM leads ORDER BY datetime(created_at) DESC');
    await kvSet('marco:leads', rows);
  }
  if (/UPDATE kiosk_settings/i.test(sql)) {
    const rows = execQuery(db, 'SELECT * FROM kiosk_settings WHERE id = 1');
    if (rows.length) await kvSet('marco:settings', rows[0]);
  }
}

// ── CORS ────────────────────────────────────────────────────────────────────

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
