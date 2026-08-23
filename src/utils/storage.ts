/**
 * storage.ts — Capa de datos universal
 *
 * Dev/PC  → server.js (Express + better-sqlite3) → public/totem-marco visible en cualquier visor SQLite
 * Android → @capacitor-community/sqlite nativo    → persiste en disco del dispositivo
 *
 * Comando único: npm run dev  (arranca Vite + servidor juntos)
 */

import * as XLSX from 'xlsx';
import { Lead, KioskSettings, AdminStats, Category, Brochure, Specialist } from '../types';
import brochureMultimarcaPdf from '../../assets/pdf/BROCHURE MULTIMARCA MARCO.pdf';
import { openDb, getAdapter } from './db';

// ── Constantes ─────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: KioskSettings = {
  idleTimeoutSeconds: 35,
  autoResetConfirmationSeconds: 20,
  enableVirtualKeyboard: true,
  totemFrameMode: true,
  companyName: 'MARCO Peru',
  eventTitle: 'Expomina 2026',
};

const PDF_FALLBACKS: Record<string, string> = {
  'b-mm-1': brochureMultimarcaPdf,
};

// ── Estado en memoria ──────────────────────────────────────────────────────

let storageReady = false;
let initPromise: Promise<void> | null = null;

export const storageEvents = new EventTarget();

let leadsCache:       Lead[]        = [];
let categoriesCache:  Category[]    = [];
let brochuresCache:   Brochure[]    = [];
let specialistsCache: Specialist[]  = [];
let settingsCache:    KioskSettings = DEFAULT_SETTINGS;
let statsCache = { views: 0, sessions: 0 };

// ── Escape SQL ─────────────────────────────────────────────────────────────

function esc(s: string): string { return s.replace(/'/g, "''"); }

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
    pdfUrl: r.pdf_url ? String(r.pdf_url) : PDF_FALLBACKS[id],
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

// ── Carga inicial de caches ────────────────────────────────────────────────

async function loadAll(): Promise<void> {
  const db = getAdapter();
  const [leads, cats, bros, specs, sets, stats] = await Promise.all([
    db.query('SELECT * FROM leads ORDER BY datetime(created_at) DESC'),
    db.query('SELECT * FROM categories ORDER BY title'),
    db.query('SELECT * FROM brochures ORDER BY title'),
    db.query('SELECT * FROM specialists ORDER BY title'),
    db.query('SELECT * FROM kiosk_settings WHERE id = 1'),
    db.query('SELECT key, value FROM stats'),
  ]);

  leadsCache       = leads.map(toLead);
  categoriesCache  = cats.map(toCategory);
  brochuresCache   = bros.map(toBrochure);
  specialistsCache = specs.map(toSpecialist);

  if (sets.length) {
    const r = sets[0];
    settingsCache = {
      idleTimeoutSeconds:           Number(r.idle_timeout_seconds)            || DEFAULT_SETTINGS.idleTimeoutSeconds,
      autoResetConfirmationSeconds: Number(r.auto_reset_confirmation_seconds) || DEFAULT_SETTINGS.autoResetConfirmationSeconds,
      enableVirtualKeyboard: !!Number(r.enable_virtual_keyboard),
      totemFrameMode:        !!Number(r.totem_frame_mode),
      companyName: String(r.company_name || DEFAULT_SETTINGS.companyName),
      eventTitle:  String(r.event_title  || DEFAULT_SETTINGS.eventTitle),
    };
  }

  statsCache = { views: 0, sessions: 0 };
  stats.forEach(r => {
    if (r.key === 'brochure_views') statsCache.views    = Number(r.value) || 0;
    if (r.key === 'sessions')       statsCache.sessions = Number(r.value) || 0;
  });
}

// ── Init ───────────────────────────────────────────────────────────────────

export function isStorageReady(): boolean { return storageReady; }

export function initStorage(): Promise<void> {
  if (storageReady) return Promise.resolve();
  if (initPromise)  return initPromise;

  initPromise = (async () => {
    await openDb();       // conecta al adaptador correcto según plataforma
    await loadAll();      // carga todos los datos en cache
    storageReady = true;
    console.info('[DB] totem-marco listo');
    storageEvents.dispatchEvent(new Event('storageReady'));
  })().catch(err => {
    initPromise = null;
    throw err;
  });

  return initPromise;
}

// ── Leads ──────────────────────────────────────────────────────────────────

export function getStoredLeads(): Lead[] { return leadsCache; }

export function saveLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>): Lead {
  const l: Lead = {
    ...leadData,
    id: 'lead-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
    status: 'Nuevo',
  };
  leadsCache = [l, ...leadsCache];
  getAdapter().execute(`INSERT OR REPLACE INTO leads (
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
  )`).catch(e => console.error('[DB] saveLead:', e));
  storageEvents.dispatchEvent(new Event('leadsChanged'));
  return l;
}

export function updateLeadStatus(id: string, newStatus: Lead['status']): Lead[] {
  leadsCache = leadsCache.map(l => l.id === id ? { ...l, status: newStatus } : l);
  getAdapter().execute(`UPDATE leads SET status = '${esc(newStatus)}' WHERE id = '${esc(id)}'`)
    .catch(e => console.error('[DB] updateLeadStatus:', e));
  storageEvents.dispatchEvent(new Event('leadsChanged'));
  return leadsCache;
}

export function deleteLead(id: string): boolean {
  if (!leadsCache.some(l => l.id === id)) return false;
  leadsCache = leadsCache.filter(l => l.id !== id);
  getAdapter().execute(`DELETE FROM leads WHERE id = '${esc(id)}'`)
    .catch(e => console.error('[DB] deleteLead:', e));
  storageEvents.dispatchEvent(new Event('leadsChanged'));
  return true;
}

// ── Settings ───────────────────────────────────────────────────────────────

export function getKioskSettings(): KioskSettings { return settingsCache; }

export function saveKioskSettings(s: Partial<KioskSettings>): { settings: KioskSettings; saved: boolean } {
  settingsCache = { ...settingsCache, ...s };
  const c = settingsCache;
  getAdapter().execute(`UPDATE kiosk_settings SET
    idle_timeout_seconds = ${c.idleTimeoutSeconds},
    auto_reset_confirmation_seconds = ${c.autoResetConfirmationSeconds},
    enable_virtual_keyboard = ${c.enableVirtualKeyboard ? 1 : 0},
    totem_frame_mode = ${c.totemFrameMode ? 1 : 0},
    company_name = '${esc(c.companyName)}',
    event_title = '${esc(c.eventTitle)}'
    WHERE id = 1`
  ).catch(e => console.error('[DB] saveKioskSettings:', e));
  storageEvents.dispatchEvent(new Event('settingsChanged'));
  return { settings: settingsCache, saved: true };
}

// ── Stats ──────────────────────────────────────────────────────────────────

export function recordBrochureView(): number {
  statsCache.views++;
  getAdapter().execute(`UPDATE stats SET value = value + 1 WHERE key = 'brochure_views'`).catch(() => {});
  return statsCache.views;
}

export function recordNewSession(): number {
  statsCache.sessions++;
  getAdapter().execute(`UPDATE stats SET value = value + 1 WHERE key = 'sessions'`).catch(() => {});
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
  categoriesCache = categories;
  try {
    await getAdapter().batch([
      'DELETE FROM categories',
      ...categories.map(c => `INSERT INTO categories (
        id, code, title, subtitle, color, bg_light, banner_title,
        banner_description, applications, brochure_count, icon_name
      ) VALUES (
        '${esc(c.id)}','${esc(c.code)}','${esc(c.title)}','${esc(c.subtitle)}',
        '${esc(c.color)}','${esc(c.bgLight)}','${esc(c.bannerTitle)}',
        '${esc(c.bannerDescription)}',
        '${esc(JSON.stringify(c.applications))}',
        ${c.brochureCount},'${esc(c.iconName)}'
      )`),
    ]);
    storageEvents.dispatchEvent(new Event('categoriesChanged'));
    return true;
  } catch (e) {
    console.error('[DB] saveCategories:', e);
    categoriesCache = prev;
    storageEvents.dispatchEvent(new Event('categoriesChanged'));
    return false;
  }
}

// ── Brochures ──────────────────────────────────────────────────────────────

export function getStoredBrochures(): Brochure[] { return brochuresCache; }

export async function saveBrochures(brochures: Brochure[]): Promise<boolean> {
  const prev = brochuresCache;
  brochuresCache = brochures;
  try {
    await getAdapter().batch([
      'DELETE FROM brochures',
      ...brochures.map(b => `INSERT INTO brochures (
        id, category_id, title, pages, year_or_type, file_size,
        description, pdf_url, cover_image, page_images
      ) VALUES (
        '${esc(b.id)}','${esc(b.categoryId)}','${esc(b.title)}',
        ${b.pages || 0},
        '${esc(b.yearOrType ?? '')}','${esc(b.fileSize ?? '')}',
        '${esc(b.description ?? '')}',
        ${b.pdfUrl     ? `'${esc(b.pdfUrl)}'`     : 'NULL'},
        ${b.coverImage ? `'${esc(b.coverImage)}'` : 'NULL'},
        '${esc(JSON.stringify(b.pageImages ?? []))}'
      )`),
    ]);
    storageEvents.dispatchEvent(new Event('brochuresChanged'));
    return true;
  } catch (e) {
    console.error('[DB] saveBrochures:', e);
    brochuresCache = prev;
    storageEvents.dispatchEvent(new Event('brochuresChanged'));
    return false;
  }
}

// ── Especialistas ──────────────────────────────────────────────────────────

export function getStoredSpecialists(): Specialist[] { return specialistsCache; }

// ── Exportar ───────────────────────────────────────────────────────────────

export function exportLeadsToXLSX(): void {
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
