/**
 * storage.ts — Capa de datos universal con caché por defecto resiliente
 *
 * Dev/PC  → server.js (Express + better-sqlite3) → public/totem-marco
 * Android → @capacitor-community/sqlite nativo    → persiste en disco del dispositivo
 * Offline → Caché por defecto precargada + localStorage sincronizado (0ms latency, anti-fallos)
 */

import { Lead, KioskSettings, AdminStats, Category, Brochure, Specialist } from '../types';
import { openDb, getAdapter } from './db';
import {
  INITIAL_CATEGORIES,
  INITIAL_BROCHURES,
  INITIAL_SPECIALISTS,
  INITIAL_SETTINGS,
  INITIAL_STATS,
  loadLocalDataCache,
  saveLocalDataCache,
  resetLocalDataCache
} from '../data/mockCatalog';

// ── Constantes ─────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: KioskSettings = INITIAL_SETTINGS;

const PDF_FALLBACKS: Record<string, string> = {
  'b-mm-1': './pdfs/BROCHURE_MULTIMARCA_MARCO.pdf',
};

// ── Estado en memoria inicializado inmediatamente desde caché local ─────────

const initialCache = loadLocalDataCache();

let storageReady = false;
let isOfflineMode = false;
let initPromise: Promise<void> | null = null;

export const storageEvents = new EventTarget();

let leadsCache:       Lead[]        = initialCache.leads || [];
let categoriesCache:  Category[]    = sortCategoriesByCode(initialCache.categories || INITIAL_CATEGORIES);
let brochuresCache:   Brochure[]    = sortBrochuresByCategory(initialCache.brochures || INITIAL_BROCHURES, categoriesCache);
let specialistsCache: Specialist[]  = sortSpecialistsByCategory(initialCache.specialists || INITIAL_SPECIALISTS, categoriesCache);
let settingsCache:    KioskSettings = initialCache.settings || INITIAL_SETTINGS;
let statsCache                      = initialCache.stats || INITIAL_STATS;

// ── Escape SQL ─────────────────────────────────────────────────────────────

function esc(s: unknown): string {
  if (s === null || s === undefined) return '';
  return String(s).replace(/'/g, "''");
}

// ── Mappers ────────────────────────────────────────────────────────────────

function parseJsonArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v !== 'string' || !v.trim()) return [];
  try { const p = JSON.parse(v); return Array.isArray(p) ? p.map(String) : []; }
  catch { return []; }
}

function toCategory(r: Record<string, unknown>): Category {
  return {
    id: String(r.id), code: String(r.code ?? ''), title: String(r.title),
    subtitle: String(r.subtitle ?? ''), color: String(r.color ?? '#991b1b'),
    bgLight: String(r.bg_light ?? '#fff7f7'), bannerTitle: String(r.banner_title ?? ''),
    bannerDescription: String(r.banner_description ?? ''),
    applications: parseJsonArray(r.applications),
    brochureCount: Number(r.brochure_count) || 0,
    iconName: String(r.icon_name ?? 'BookOpen'),
  };
}

function toBrochure(r: Record<string, unknown>): Brochure {
  const id = String(r.id);
  return {
    id, categoryId: String(r.category_id), title: String(r.title),
    pages: Number(r.pages) || 0, yearOrType: String(r.year_or_type ?? ''),
    fileSize: String(r.file_size ?? ''), description: String(r.description ?? ''),
    pdfUrl: r.pdf_url ? String(r.pdf_url) : (PDF_FALLBACKS[id] || undefined),
    coverImage: r.cover_image ? String(r.cover_image) : undefined,
    pageImages: parseJsonArray(r.page_images),
  };
}

function toSpecialist(r: Record<string, unknown>): Specialist {
  return {
    id: String(r.id), categoryId: String(r.category_id), title: String(r.title),
    role: String(r.role ?? ''), email: String(r.email ?? ''), phone: String(r.phone ?? ''),
  };
}

function toLead(r: Record<string, unknown>): Lead {
  return {
    id: String(r.id), createdAt: String(r.created_at), fullName: String(r.full_name),
    company:  r.company  ? String(r.company)  : '',
    email:    r.email    ? String(r.email)    : '',
    phone:    r.phone    ? String(r.phone)    : '',
    position: r.position ? String(r.position) : '',
    categoryId:        r.category_id        ? String(r.category_id)        : undefined,
    categoryName:      r.category_name      ? String(r.category_name)      : undefined,
    brochureId:        r.brochure_id        ? String(r.brochure_id)        : undefined,
    brochureTitle:     r.brochure_title     ? String(r.brochure_title)     : undefined,
    requirementType:   r.requirement_type   ? String(r.requirement_type)   : undefined,
    requirementDetail: r.requirement_detail ? String(r.requirement_detail) : undefined,
    specialistArea:    r.specialist_area    ? String(r.specialist_area)    : undefined,
    authorizedTerms: !!r.authorized_terms,
    status: r.status as Lead['status'],
    source: r.source as Lead['source'],
  };
}

// ── Carga inicial de caches y esquema ────────────────────────────────────────

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    color TEXT NOT NULL,
    bg_light TEXT NOT NULL,
    banner_title TEXT NOT NULL,
    banner_description TEXT NOT NULL,
    applications TEXT NOT NULL DEFAULT '[]',
    brochure_count INTEGER NOT NULL DEFAULT 0,
    icon_name TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS brochures (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    title TEXT NOT NULL,
    pages INTEGER NOT NULL DEFAULT 0,
    year_or_type TEXT NOT NULL,
    file_size TEXT NOT NULL,
    description TEXT NOT NULL,
    pdf_url TEXT,
    cover_image TEXT,
    page_images TEXT NOT NULL DEFAULT '[]',
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS specialists (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    title TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    full_name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    position TEXT,
    category_id TEXT,
    category_name TEXT,
    brochure_id TEXT,
    brochure_title TEXT,
    requirement_type TEXT,
    requirement_detail TEXT,
    specialist_area TEXT,
    authorized_terms INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Nuevo',
    source TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS kiosk_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    idle_timeout_seconds INTEGER NOT NULL DEFAULT 35,
    auto_reset_confirmation_seconds INTEGER NOT NULL DEFAULT 20,
    enable_virtual_keyboard INTEGER NOT NULL DEFAULT 1,
    totem_frame_mode INTEGER NOT NULL DEFAULT 1,
    company_name TEXT NOT NULL DEFAULT 'MARCO Peru',
    event_title TEXT NOT NULL DEFAULT 'Expomina 2026'
  )`,
  `CREATE TABLE IF NOT EXISTS stats (
    key TEXT PRIMARY KEY,
    value INTEGER NOT NULL
  )`
];

// ── Helpers de ordenación ascendente (por código numérico 01→12) ──────────────

function sortCategoriesByCode(cats: Category[]): Category[] {
  return [...cats].sort((a, b) => {
    const na = parseInt(a.code, 10) || 0;
    const nb = parseInt(b.code, 10) || 0;
    return na !== nb ? na - nb : a.code.localeCompare(b.code);
  });
}

function sortBrochuresByCategory(bros: Brochure[], cats: Category[]): Brochure[] {
  const codeOf: Record<string, number> = {};
  cats.forEach(c => { codeOf[c.id] = parseInt(c.code, 10) || 0; });
  return [...bros].sort((a, b) => {
    const ca = codeOf[a.categoryId] ?? 999;
    const cb = codeOf[b.categoryId] ?? 999;
    return ca !== cb ? ca - cb : a.title.localeCompare(b.title);
  });
}

function sortSpecialistsByCategory(specs: Specialist[], cats: Category[]): Specialist[] {
  const codeOf: Record<string, number> = {};
  cats.forEach(c => { codeOf[c.id] = parseInt(c.code, 10) || 0; });
  return [...specs].sort((a, b) => {
    const ca = codeOf[a.categoryId] ?? 999;
    const cb = codeOf[b.categoryId] ?? 999;
    return ca !== cb ? ca - cb : a.title.localeCompare(b.title);
  });
}

async function seedDatabaseDefaults(db: any): Promise<void> {
  console.info('[DB] Sembrando catálogo por defecto completo (12 categorías, 20 brochures, 12 especialistas)...');
  
  const statements: string[] = [];

  // Categorías
  for (const c of INITIAL_CATEGORIES) {
    statements.push(`INSERT OR REPLACE INTO categories (
      id, code, title, subtitle, color, bg_light, banner_title,
      banner_description, applications, brochure_count, icon_name
    ) VALUES (
      '${esc(c.id)}','${esc(c.code)}','${esc(c.title)}','${esc(c.subtitle)}',
      '${esc(c.color)}','${esc(c.bgLight)}','${esc(c.bannerTitle)}',
      '${esc(c.bannerDescription)}',
      '${esc(JSON.stringify(c.applications))}',
      ${Number(c.brochureCount) || 0},'${esc(c.iconName)}'
    )`);
  }

  // Brochures
  for (const b of INITIAL_BROCHURES) {
    statements.push(`INSERT OR REPLACE INTO brochures (
      id, category_id, title, pages, year_or_type, file_size,
      description, pdf_url, cover_image, page_images
    ) VALUES (
      '${esc(b.id)}','${esc(b.categoryId)}','${esc(b.title)}',
      ${Number(b.pages) || 0},'${esc(b.yearOrType)}','${esc(b.fileSize)}',
      '${esc(b.description)}',
      ${b.pdfUrl ? `'${esc(b.pdfUrl)}'` : 'NULL'},
      ${b.coverImage ? `'${esc(b.coverImage)}'` : 'NULL'},
      '${esc(JSON.stringify(b.pageImages || []))}'
    )`);
  }

  // Especialistas
  for (const s of INITIAL_SPECIALISTS) {
    statements.push(`INSERT OR REPLACE INTO specialists (
      id, category_id, title, role, email, phone
    ) VALUES (
      '${esc(s.id)}','${esc(s.categoryId)}','${esc(s.title)}','${esc(s.role)}',
      '${esc(s.email)}','${esc(s.phone)}'
    )`);
  }

  // Settings & Stats
  statements.push(
    `INSERT OR IGNORE INTO kiosk_settings (id, idle_timeout_seconds, auto_reset_confirmation_seconds, enable_virtual_keyboard, totem_frame_mode, company_name, event_title) VALUES (1, ${INITIAL_SETTINGS.idleTimeoutSeconds}, ${INITIAL_SETTINGS.autoResetConfirmationSeconds}, ${INITIAL_SETTINGS.enableVirtualKeyboard ? 1 : 0}, ${INITIAL_SETTINGS.totemFrameMode ? 1 : 0}, '${esc(INITIAL_SETTINGS.companyName)}', '${esc(INITIAL_SETTINGS.eventTitle)}')`,
    `INSERT OR IGNORE INTO stats (key, value) VALUES ('brochure_views', ${INITIAL_STATS.views}), ('sessions', ${INITIAL_STATS.sessions})`
  );

  await db.batch(statements);
}

async function loadAll(): Promise<void> {
  const db = getAdapter();
  try {
    await db.batch(SCHEMA_STATEMENTS);
  } catch (e) {
    console.warn('[DB] Schema check:', e);
  }

  let [leads, cats, bros, specs, sets, stats] = await Promise.all([
    db.query('SELECT * FROM leads ORDER BY datetime(created_at) DESC').catch(() => []),
    db.query("SELECT * FROM categories ORDER BY CAST(code AS INTEGER) ASC, code ASC").catch(() => []),
    db.query('SELECT * FROM brochures ORDER BY category_id ASC, id ASC').catch(() => []),
    db.query("SELECT * FROM specialists ORDER BY CAST(REPLACE(id, 'spec-', '') AS INTEGER) ASC, id ASC").catch(() => []),
    db.query('SELECT * FROM kiosk_settings WHERE id = 1').catch(() => []),
    db.query('SELECT key, value FROM stats').catch(() => []),
  ]);

  // Si la BD está vacía (primer inicio, Android o SQLite nuevo), sembramos datos por defecto
  if (cats.length === 0) {
    await seedDatabaseDefaults(db);

    [leads, cats, bros, specs, sets, stats] = await Promise.all([
      db.query('SELECT * FROM leads ORDER BY datetime(created_at) DESC').catch(() => []),
      db.query("SELECT * FROM categories ORDER BY CAST(code AS INTEGER) ASC, code ASC").catch(() => []),
      db.query('SELECT * FROM brochures ORDER BY category_id ASC, id ASC').catch(() => []),
      db.query("SELECT * FROM specialists ORDER BY CAST(REPLACE(id, 'spec-', '') AS INTEGER) ASC, id ASC").catch(() => []),
      db.query('SELECT * FROM kiosk_settings WHERE id = 1').catch(() => []),
      db.query('SELECT key, value FROM stats').catch(() => []),
    ]);
  }

  leadsCache       = leads.length > 0 ? leads.map(toLead) : leadsCache;
  categoriesCache  = cats.length > 0 ? sortCategoriesByCode(cats.map(toCategory)) : sortCategoriesByCode(INITIAL_CATEGORIES);
  brochuresCache   = bros.length > 0 ? sortBrochuresByCategory(bros.map(toBrochure), categoriesCache) : sortBrochuresByCategory(INITIAL_BROCHURES, categoriesCache);
  specialistsCache = specs.length > 0 ? sortSpecialistsByCategory(specs.map(toSpecialist), categoriesCache) : sortSpecialistsByCategory(INITIAL_SPECIALISTS, categoriesCache);

  if (sets.length) {
    const r = sets[0];
    settingsCache = {
      idleTimeoutSeconds:           Number(r.idle_timeout_seconds)            || INITIAL_SETTINGS.idleTimeoutSeconds,
      autoResetConfirmationSeconds: Number(r.auto_reset_confirmation_seconds) || INITIAL_SETTINGS.autoResetConfirmationSeconds,
      enableVirtualKeyboard: !!Number(r.enable_virtual_keyboard),
      totemFrameMode:        !!Number(r.totem_frame_mode),
      companyName: String(r.company_name || INITIAL_SETTINGS.companyName),
      eventTitle:  String(r.event_title  || INITIAL_SETTINGS.eventTitle),
    };
  }

  statsCache = { views: INITIAL_STATS.views, sessions: INITIAL_STATS.sessions };
  stats.forEach((r: Record<string, unknown>) => {
    if (r.key === 'brochure_views') statsCache.views    = Number(r.value) || 0;
    if (r.key === 'sessions')       statsCache.sessions = Number(r.value) || 0;
  });

  // Guardar en la caché local persistente
  saveLocalDataCache({
    leads: leadsCache,
    categories: categoriesCache,
    brochures: brochuresCache,
    specialists: specialistsCache,
    settings: settingsCache,
    stats: statsCache
  });
}

// ── Init Resiliente ────────────────────────────────────────────────────────

export function isStorageReady(): boolean { return storageReady; }

export function initStorage(): Promise<void> {
  if (storageReady) return Promise.resolve();
  if (initPromise)  return initPromise;

  initPromise = (async () => {
    try {
      await openDb();       // conecta al adaptador según plataforma
      await loadAll();      // sincroniza SQLite con memoria y local cache
      isOfflineMode = false;
      try { if (typeof window !== 'undefined') window.localStorage.clear(); } catch(e) {}
      console.info('[DB] totem-marco sincronizado exitosamente con el backend / SQLite. Cache local limpiado.');
    } catch (err: any) {
      console.warn('[DB WARNING] No se pudo conectar con la BD SQLite directa:', err?.message || err);
      console.info('[DB] Activando modo resiliente: usando caché local por defecto (12 categorías, 20 brochures).');
      isOfflineMode = true;
      // Usar los datos de la caché local existente o iniciales
      const local = loadLocalDataCache();
      categoriesCache = sortCategoriesByCode(local.categories);
      brochuresCache = sortBrochuresByCategory(local.brochures, categoriesCache);
      specialistsCache = sortSpecialistsByCategory(local.specialists, categoriesCache);
      settingsCache = local.settings;
      statsCache = local.stats;
      leadsCache = local.leads;
    } finally {
      storageReady = true;
      storageEvents.dispatchEvent(new Event('storageReady'));
      storageEvents.dispatchEvent(new Event('categoriesChanged'));
      storageEvents.dispatchEvent(new Event('brochuresChanged'));
      storageEvents.dispatchEvent(new Event('specialistsChanged'));
      storageEvents.dispatchEvent(new Event('settingsChanged'));
      storageEvents.dispatchEvent(new Event('leadsChanged'));
    }
  })();

  return initPromise;
}

// ── Restaurar Catálogo por Defecto ─────────────────────────────────────────

export async function resetToDefaultCatalog(): Promise<boolean> {
  try {
    console.info('[DB] Restaurando catálogo a valores de fábrica...');
    
    // 1. Resetear memoria y LocalStorage
    const defaults = resetLocalDataCache();
    categoriesCache = sortCategoriesByCode(defaults.categories);
    brochuresCache = sortBrochuresByCategory(defaults.brochures, categoriesCache);
    specialistsCache = sortSpecialistsByCategory(defaults.specialists, categoriesCache);
    settingsCache = defaults.settings;
    statsCache = defaults.stats;

    // 2. Si el adaptador SQLite está disponible, actualizarlo en BD
    try {
      const db = getAdapter();
      await db.batch(SCHEMA_STATEMENTS);
      await seedDatabaseDefaults(db);
      console.info('[DB] Base de datos SQLite restaurada.');
    } catch (dbErr) {
      console.warn('[DB] SQLite no disponible en este momento, restauración completada en caché local.');
    }

    // 3. Notificar a los componentes
    storageEvents.dispatchEvent(new Event('categoriesChanged'));
    storageEvents.dispatchEvent(new Event('brochuresChanged'));
    storageEvents.dispatchEvent(new Event('specialistsChanged'));
    storageEvents.dispatchEvent(new Event('settingsChanged'));
    storageEvents.dispatchEvent(new Event('storageReady'));
    return true;
  } catch (err) {
    console.error('[DB ERROR] Error restaurando catálogo por defecto:', err);
    return false;
  }
}

// ── Leads ──────────────────────────────────────────────────────────────────

export function getStoredLeads(): Lead[] { return leadsCache; }

export async function saveLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>): Promise<Lead> {
  const l: Lead = {
    ...leadData,
    id: 'lead-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
    status: 'Nuevo',
  };
  leadsCache = [l, ...leadsCache];
  saveLocalDataCache({ leads: leadsCache });

  try {
    await getAdapter().execute(`INSERT OR REPLACE INTO leads (
      id, created_at, full_name, company, email, phone, position,
      category_id, category_name, brochure_id, brochure_title,
      requirement_type, requirement_detail, specialist_area,
      authorized_terms, status, source
    ) VALUES (
      '${esc(l.id)}','${esc(l.createdAt)}','${esc(l.fullName)}',
      ${l.company       ? `'${esc(l.company)}'`       : 'NULL'},
      ${l.email         ? `'${esc(l.email)}'`         : 'NULL'},
      ${l.phone         ? `'${esc(l.phone)}'`         : 'NULL'},
      ${l.position      ? `'${esc(l.position)}'`      : 'NULL'},
      ${l.categoryId    ? `'${esc(l.categoryId)}'`    : 'NULL'},
      ${l.categoryName  ? `'${esc(l.categoryName)}'`  : 'NULL'},
      ${l.brochureId    ? `'${esc(l.brochureId)}'`    : 'NULL'},
      ${l.brochureTitle ? `'${esc(l.brochureTitle)}'` : 'NULL'},
      ${l.requirementType   ? `'${esc(l.requirementType)}'`   : 'NULL'},
      ${l.requirementDetail ? `'${esc(l.requirementDetail)}'` : 'NULL'},
      ${l.specialistArea    ? `'${esc(l.specialistArea)}'`    : 'NULL'},
      ${l.authorizedTerms ? 1 : 0},
      '${esc(l.status)}','${esc(l.source ?? 'Biblioteca')}'
    )`);
  } catch (e) {
    console.warn('[DB] saveLead guardado en caché local (offline/fallback):', e);
  }
  storageEvents.dispatchEvent(new Event('leadsChanged'));
  return l;
}

export async function updateLeadStatus(id: string, newStatus: Lead['status']): Promise<Lead[]> {
  leadsCache = leadsCache.map(l => l.id === id ? { ...l, status: newStatus } : l);
  saveLocalDataCache({ leads: leadsCache });

  try {
    await getAdapter().execute(`UPDATE leads SET status = '${esc(newStatus)}' WHERE id = '${esc(id)}'`);
  } catch (e) {
    console.warn('[DB] updateLeadStatus guardado en caché local:', e);
  }
  storageEvents.dispatchEvent(new Event('leadsChanged'));
  return leadsCache;
}

export async function deleteLead(id: string): Promise<boolean> {
  if (!leadsCache.some(l => l.id === id)) return false;
  leadsCache = leadsCache.filter(l => l.id !== id);
  saveLocalDataCache({ leads: leadsCache });

  try {
    await getAdapter().execute(`DELETE FROM leads WHERE id = '${esc(id)}'`);
  } catch (e) {
    console.warn('[DB] deleteLead actualizado en caché local:', e);
  }
  storageEvents.dispatchEvent(new Event('leadsChanged'));
  return true;
}

// ── Settings ───────────────────────────────────────────────────────────────

export function getKioskSettings(): KioskSettings { return settingsCache; }

export async function saveKioskSettings(s: Partial<KioskSettings>): Promise<{ settings: KioskSettings; saved: boolean }> {
  settingsCache = { ...settingsCache, ...s };
  saveLocalDataCache({ settings: settingsCache });
  const c = settingsCache;

  try {
    await getAdapter().execute(`UPDATE kiosk_settings SET
      idle_timeout_seconds = ${c.idleTimeoutSeconds},
      auto_reset_confirmation_seconds = ${c.autoResetConfirmationSeconds},
      enable_virtual_keyboard = ${c.enableVirtualKeyboard ? 1 : 0},
      totem_frame_mode = ${c.totemFrameMode ? 1 : 0},
      company_name = '${esc(c.companyName)}',
      event_title = '${esc(c.eventTitle)}'
      WHERE id = 1`
    );
    storageEvents.dispatchEvent(new Event('settingsChanged'));
    return { settings: settingsCache, saved: true };
  } catch (e) {
    console.warn('[DB] saveKioskSettings guardado en caché local:', e);
    storageEvents.dispatchEvent(new Event('settingsChanged'));
    return { settings: settingsCache, saved: true };
  }
}

// ── Stats ──────────────────────────────────────────────────────────────────

export function recordBrochureView(): number {
  statsCache.views++;
  saveLocalDataCache({ stats: statsCache });
  try {
    getAdapter().execute(`UPDATE stats SET value = value + 1 WHERE key = 'brochure_views'`).catch(() => {});
  } catch {}
  return statsCache.views;
}

export function recordNewSession(): number {
  statsCache.sessions++;
  saveLocalDataCache({ stats: statsCache });
  try {
    getAdapter().execute(`UPDATE stats SET value = value + 1 WHERE key = 'sessions'`).catch(() => {});
  } catch {}
  return statsCache.sessions;
}

export function getAdminStats(): AdminStats {
  const rate = statsCache.sessions > 0
    ? Math.round((leadsCache.length / statsCache.sessions) * 100) : 74;
  return {
    totalLeads: leadsCache.length,
    conversionRate: Math.min(100, Math.max(10, rate)),
    totalBrochuresViewed: statsCache.views,
    totalSessions: statsCache.sessions,
  };
}

// ── Categorías ─────────────────────────────────────────────────────────────

export function getStoredCategories(): Category[] { return categoriesCache; }

export async function saveCategories(categories: Category[]): Promise<boolean> {
  const prev = categoriesCache;
  categoriesCache = sortCategoriesByCode(categories);
  saveLocalDataCache({ categories: categoriesCache });

  try {
    const statements: string[] = [];
    if (categories.length > 0) {
      const ids = categories.map(c => `'${esc(c.id)}'`).join(',');
      statements.push(`DELETE FROM categories WHERE id NOT IN (${ids})`);
    } else {
      statements.push('DELETE FROM categories');
    }
    for (const c of categories) {
      statements.push(`INSERT OR REPLACE INTO categories (
        id, code, title, subtitle, color, bg_light, banner_title,
        banner_description, applications, brochure_count, icon_name
      ) VALUES (
        '${esc(c.id)}','${esc(c.code ?? '')}','${esc(c.title ?? '')}','${esc(c.subtitle ?? '')}',
        '${esc(c.color ?? '#991b1b')}','${esc(c.bgLight ?? '#fff7f7')}','${esc(c.bannerTitle ?? '')}',
        '${esc(c.bannerDescription ?? '')}',
        '${esc(JSON.stringify(c.applications ?? []))}',
        ${Number(c.brochureCount) || 0},'${esc(c.iconName ?? 'BookOpen')}'
      )`);
    }
    await getAdapter().batch(statements);
    storageEvents.dispatchEvent(new Event('categoriesChanged'));
    return true;
  } catch (e) {
    console.warn('[DB] saveCategories guardado en caché local:', e);
    storageEvents.dispatchEvent(new Event('categoriesChanged'));
    return true;
  }
}

// ── Brochures ──────────────────────────────────────────────────────────────

export function getStoredBrochures(): Brochure[] { return brochuresCache; }

export async function saveBrochures(brochures: Brochure[]): Promise<boolean> {
  const prev = brochuresCache;
  brochuresCache = sortBrochuresByCategory(brochures, categoriesCache);
  saveLocalDataCache({ brochures: brochuresCache });

  try {
    const statements: string[] = [];
    if (brochures.length > 0) {
      const ids = brochures.map(b => `'${esc(b.id)}'`).join(',');
      statements.push(`DELETE FROM brochures WHERE id NOT IN (${ids})`);
    } else {
      statements.push('DELETE FROM brochures');
    }
    for (const b of brochures) {
      statements.push(`INSERT OR REPLACE INTO brochures (
        id, category_id, title, pages, year_or_type, file_size,
        description, pdf_url, cover_image, page_images
      ) VALUES (
        '${esc(b.id)}','${esc(b.categoryId)}','${esc(b.title ?? '')}',
        ${Number(b.pages) || 0},
        '${esc(b.yearOrType ?? '')}','${esc(b.fileSize ?? '')}',
        '${esc(b.description ?? '')}',
        ${b.pdfUrl     ? `'${esc(b.pdfUrl)}'`     : 'NULL'},
        ${b.coverImage ? `'${esc(b.coverImage)}'` : 'NULL'},
        '${esc(JSON.stringify(b.pageImages ?? []))}'
      )`);
    }
    await getAdapter().batch(statements);
    storageEvents.dispatchEvent(new Event('brochuresChanged'));
    return true;
  } catch (e) {
    console.warn('[DB] saveBrochures guardado en caché local:', e);
    storageEvents.dispatchEvent(new Event('brochuresChanged'));
    return true;
  }
}

// ── Especialistas ──────────────────────────────────────────────────────────

export function getStoredSpecialists(): Specialist[] { return specialistsCache; }

// ── Exportar ───────────────────────────────────────────────────────────────

export async function exportLeadsToXLSX(): Promise<void> {
  const XLSX = await import('xlsx');
  const data = leadsCache.map((l, i) => ({
    N: i + 1, ID: l.id,
    'Fecha y Hora': new Date(l.createdAt).toLocaleString('es-PE'),
    'Nombre y Apellido': l.fullName, Empresa: l.company,
    'Correo Corporativo': l.email, 'Teléfono / WhatsApp': l.phone || 'N/A',
    Cargo: l.position || 'N/A', 'Categoría de Interés': l.categoryName || 'General',
    'Brochure Consultado': l.brochureTitle || 'N/A',
    'Tipo de Requerimiento': l.requirementType || 'N/A',
    'Detalle Requerimiento': l.requirementDetail || 'N/A',
    'Origen Recorrido': l.source, Estado: l.status,
    'Autorizó Datos': l.authorizedTerms ? 'SÍ' : 'NO',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads MARCO Explorer');
  XLSX.writeFile(wb, `MARCO_Explorer_Leads_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportAllDataAsJSON(): void {
  const blob = new Blob([JSON.stringify({
    leads: leadsCache, categories: categoriesCache, brochures: brochuresCache,
    specialists: specialistsCache, settings: settingsCache, stats: statsCache,
  }, null, 2)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `MARCO_Backup_${new Date().toISOString().split('T')[0]}.json`,
  });
  document.body.appendChild(a); a.click(); a.remove();
}
