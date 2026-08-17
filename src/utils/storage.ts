import * as XLSX from 'xlsx';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { Lead, KioskSettings, AdminStats, Category, Brochure, Specialist } from '../types';
import brochureMultimarcaPdf from '../../assets/pdf/BROCHURE MULTIMARCA MARCO.pdf';

export const DEFAULT_SETTINGS: KioskSettings = {
  idleTimeoutSeconds: 35,
  autoResetConfirmationSeconds: 20,
  enableVirtualKeyboard: true,
  totemFrameMode: true,
  companyName: 'MARCO Peru',
  eventTitle: 'Expomina 2026'
};

const PDF_URL_FALLBACKS: Record<string, string> = {
  'b-mm-1': brochureMultimarcaPdf
};

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let storageReady = false;
let initPromise: Promise<void> | null = null;

// Event emitter for notifying UI about changes
export const storageEvents = new EventTarget();

let leadsCache: Lead[] = [];
let categoriesCache: Category[] = [];
let brochuresCache: Brochure[] = [];
let specialistsCache: Specialist[] = [];
let settingsCache: KioskSettings = DEFAULT_SETTINGS;
let statsCache = { views: 0, sessions: 0 };
const SQLITE_PERSIST_KEY = 'marco_totem_sqlite_snapshot';

function arrayBufferToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function base64ToUint8Array(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function persistDbSnapshot(): void {
  if (!db) return;
  try {
    const binary = db.export();
    const base64 = arrayBufferToBase64(new Uint8Array(binary));
    localStorage.setItem(SQLITE_PERSIST_KEY, base64);
  } catch (err) {
    console.warn('No se pudo guardar la base persistente en localStorage:', err);
  }
}

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function rowsFromResult(res: { columns: string[]; values: unknown[][] }) {
  return res.values.map((vals) => {
    const obj: Record<string, unknown> = {};
    vals.forEach((v, i) => {
      obj[res.columns[i]] = v;
    });
    return obj;
  });
}

function mapCategoryRow(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    code: String(row.code),
    title: String(row.title),
    subtitle: String(row.subtitle),
    color: String(row.color),
    bgLight: String(row.bg_light),
    bannerTitle: String(row.banner_title),
    bannerDescription: String(row.banner_description),
    applications: parseJsonArray(row.applications),
    brochureCount: Number(row.brochure_count) || 0,
    iconName: String(row.icon_name)
  };
}

function mapBrochureRow(row: Record<string, unknown>): Brochure {
  const id = String(row.id);
  const pdfFromDb = row.pdf_url ? String(row.pdf_url) : undefined;
  return {
    id,
    categoryId: String(row.category_id),
    title: String(row.title),
    pages: Number(row.pages) || 0,
    yearOrType: String(row.year_or_type),
    fileSize: String(row.file_size),
    description: String(row.description),
    pdfUrl: pdfFromDb || PDF_URL_FALLBACKS[id],
    coverImage: row.cover_image ? String(row.cover_image) : undefined,
    pageImages: parseJsonArray(row.page_images)
  };
}

function mapSpecialistRow(row: Record<string, unknown>): Specialist {
  return {
    id: String(row.id),
    categoryId: String(row.category_id),
    title: String(row.title),
    role: String(row.role),
    email: String(row.email),
    phone: String(row.phone)
  };
}

function mapLeadRow(row: Record<string, unknown>): Lead {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    fullName: String(row.full_name),
    company: row.company ? String(row.company) : '',
    email: row.email ? String(row.email) : '',
    phone: row.phone ? String(row.phone) : '',
    position: row.position ? String(row.position) : '',
    categoryId: row.category_id ? String(row.category_id) : undefined,
    categoryName: row.category_name ? String(row.category_name) : undefined,
    brochureId: row.brochure_id ? String(row.brochure_id) : undefined,
    brochureTitle: row.brochure_title ? String(row.brochure_title) : undefined,
    requirementType: row.requirement_type ? String(row.requirement_type) : undefined,
    requirementDetail: row.requirement_detail ? String(row.requirement_detail) : undefined,
    specialistArea: row.specialist_area ? String(row.specialist_area) : undefined,
    authorizedTerms: !!row.authorized_terms,
    status: row.status as Lead['status'],
    source: row.source as Lead['source']
  };
}

function loadCachesFromDb() {
  if (!db) return;

  const leadsRes = db.exec('SELECT * FROM leads ORDER BY datetime(created_at) DESC');
  leadsCache = leadsRes[0] ? rowsFromResult(leadsRes[0]).map(mapLeadRow) : [];

  const catRes = db.exec('SELECT * FROM categories ORDER BY title');
  categoriesCache = catRes[0] ? rowsFromResult(catRes[0]).map(mapCategoryRow) : [];

  const broRes = db.exec('SELECT * FROM brochures ORDER BY title');
  brochuresCache = broRes[0] ? rowsFromResult(broRes[0]).map(mapBrochureRow) : [];

  const specRes = db.exec('SELECT * FROM specialists ORDER BY title');
  specialistsCache = specRes[0] ? rowsFromResult(specRes[0]).map(mapSpecialistRow) : [];

  const setRes = db.exec('SELECT * FROM kiosk_settings WHERE id = 1');
  if (setRes[0]) {
    const row = rowsFromResult(setRes[0])[0];
    settingsCache = {
      idleTimeoutSeconds: Number(row.idle_timeout_seconds) || DEFAULT_SETTINGS.idleTimeoutSeconds,
      autoResetConfirmationSeconds: Number(row.auto_reset_confirmation_seconds) || DEFAULT_SETTINGS.autoResetConfirmationSeconds,
      enableVirtualKeyboard: !!Number(row.enable_virtual_keyboard),
      totemFrameMode: !!Number(row.totem_frame_mode),
      companyName: String(row.company_name || DEFAULT_SETTINGS.companyName),
      eventTitle: String(row.event_title || DEFAULT_SETTINGS.eventTitle)
    };
  } else {
    settingsCache = DEFAULT_SETTINGS;
  }

  const statsRes = db.exec('SELECT key, value FROM stats');
  statsCache = { views: 0, sessions: 0 };
  if (statsRes[0]) {
    rowsFromResult(statsRes[0]).forEach((row) => {
      if (row.key === 'brochure_views') statsCache.views = Number(row.value) || 0;
      if (row.key === 'sessions') statsCache.sessions = Number(row.value) || 0;
    });
  }
}

export function isStorageReady(): boolean {
  return storageReady;
}

export function initStorage(): Promise<void> {
  if (storageReady) return Promise.resolve();
  if (initPromise) return initPromise;

  initPromise = (async () => {
    SQL = await initSqlJs({ locateFile: () => wasmUrl });

    try {
      const persisted = localStorage.getItem(SQLITE_PERSIST_KEY);
      if (persisted) {
        db = new SQL.Database(base64ToUint8Array(persisted));
        console.info('totem-marco restaurado desde almacenamiento local');
      } else {
        const resp = await fetch('/totem-marco');
        if (!resp.ok) throw new Error('No se pudo cargar la base de datos totem-marco');
        const buffer = await resp.arrayBuffer();
        db = new SQL.Database(new Uint8Array(buffer));
        persistDbSnapshot();
      }
    } catch (error) {
      console.warn('No se pudo restaurar la base local, se cargará desde archivo estático:', error);
      const resp = await fetch('/totem-marco');
      if (!resp.ok) throw new Error('No se pudo cargar la base de datos totem-marco');
      const buffer = await resp.arrayBuffer();
      db = new SQL.Database(new Uint8Array(buffer));
      persistDbSnapshot();
    }

    loadCachesFromDb();
    storageReady = true;
    console.info('totem-marco sincronizado con el sistema');
    storageEvents.dispatchEvent(new Event('storageReady'));
  })().catch((err) => {
    initPromise = null;
    console.error('Error inicializando totem-marco:', err);
    throw err;
  });

  return initPromise;
}

function assertDb(): Database {
  if (!db) throw new Error('totem-marco no está inicializado');
  return db;
}

export function getStoredLeads(): Lead[] {
  return leadsCache;
}

export function saveLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>): Lead {
  const newLead: Lead = {
    ...leadData,
    id: 'lead-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
    status: 'Nuevo'
  };

  leadsCache = [newLead, ...leadsCache];

  try {
    const database = assertDb();
    const stmt = database.prepare(
      `INSERT OR REPLACE INTO leads (
        id, created_at, full_name, company, email, phone, position,
        category_id, category_name, brochure_id, brochure_title,
        requirement_type, requirement_detail, specialist_area,
        authorized_terms, status, source
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    );
    stmt.run([
      newLead.id,
      newLead.createdAt,
      newLead.fullName,
      newLead.company || null,
      newLead.email || null,
      newLead.phone || null,
      newLead.position || null,
      newLead.categoryId || null,
      newLead.categoryName || null,
      newLead.brochureId || null,
      newLead.brochureTitle || null,
      newLead.requirementType || null,
      newLead.requirementDetail || null,
      newLead.specialistArea || null,
      newLead.authorizedTerms ? 1 : 0,
      newLead.status,
      newLead.source || 'Biblioteca'
    ]);
    stmt.free();
  } catch (err) {
    console.error('Error insertando lead en totem-marco', err);
  }

  persistDbSnapshot();
  storageEvents.dispatchEvent(new Event('leadsChanged'));

  return newLead;
}

export function updateLead(id: string, patch: Partial<Lead>): Lead | null {
  const existing = leadsCache.find(l => l.id === id);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  leadsCache = leadsCache.map(l => l.id === id ? updated : l);
    try {
    const dbIns = assertDb();
    // Build simple UPDATE with provided fields
    const fields = Object.keys(patch).filter(k => k !== 'id' && k !== 'createdAt');
    if (fields.length) {
      const setSql = fields.map(f => `${toSnakeCase(String(f))} = ?`).join(', ');
      const values = fields.map(f => (updated as any)[f]);
      values.push(id);
      const stmt = dbIns.prepare(`UPDATE leads SET ${setSql} WHERE id = ?`);
      stmt.run(values);
      stmt.free();
    }
  } catch (err) {
    console.error('Error actualizando lead en totem-marco', err);
  }
  persistDbSnapshot();
  storageEvents.dispatchEvent(new Event('leadsChanged'));
  return updated;
}

export function deleteLead(id: string): boolean {
  const exists = leadsCache.some(l => l.id === id);
  if (!exists) return false;
  leadsCache = leadsCache.filter(l => l.id !== id);
  try {
    const stmt = assertDb().prepare('DELETE FROM leads WHERE id = ?');
    stmt.run([id]);
    stmt.free();
  } catch (err) {
    console.error('Error borrando lead en totem-marco', err);
  }
  persistDbSnapshot();
  storageEvents.dispatchEvent(new Event('leadsChanged'));
  return true;
}

function toSnakeCase(s: string) {
  return s.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
}

export function updateLeadStatus(id: string, newStatus: Lead['status']): Lead[] {
  leadsCache = leadsCache.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
  try {
    const stmt = assertDb().prepare('UPDATE leads SET status = ? WHERE id = ?');
    stmt.run([newStatus, id]);
    stmt.free();
  } catch (err) {
    console.error('Error actualizando estado del lead en totem-marco', err);
  }
  persistDbSnapshot();
  storageEvents.dispatchEvent(new Event('leadsChanged'));
  return leadsCache;
}

export function getKioskSettings(): KioskSettings {
  return settingsCache;
}

export function saveKioskSettings(settings: Partial<KioskSettings>): KioskSettings {
  settingsCache = { ...settingsCache, ...settings };
  try {
    const stmt = assertDb().prepare(
      `UPDATE kiosk_settings SET
        idle_timeout_seconds = ?,
        auto_reset_confirmation_seconds = ?,
        enable_virtual_keyboard = ?,
        totem_frame_mode = ?,
        company_name = ?,
        event_title = ?
      WHERE id = 1`
    );
    stmt.run([
      settingsCache.idleTimeoutSeconds,
      settingsCache.autoResetConfirmationSeconds,
      settingsCache.enableVirtualKeyboard ? 1 : 0,
      settingsCache.totemFrameMode ? 1 : 0,
      settingsCache.companyName,
      settingsCache.eventTitle
    ]);
    stmt.free();
  } catch (err) {
    console.error('Error guardando configuración en totem-marco', err);
  }
  persistDbSnapshot();
  storageEvents.dispatchEvent(new Event('settingsChanged'));
  return settingsCache;
}

export function recordBrochureView(): number {
  statsCache.views = (statsCache.views || 0) + 1;
  try {
    const stmt = assertDb().prepare('INSERT OR REPLACE INTO stats (key, value) VALUES (?, ?)');
    stmt.run(['brochure_views', statsCache.views]);
    stmt.free();
  } catch (err) {
    console.error('Error actualizando brochure_views en totem-marco', err);
  }
  persistDbSnapshot();
  storageEvents.dispatchEvent(new Event('statsChanged'));
  return statsCache.views;
}

export function recordNewSession(): number {
  statsCache.sessions = (statsCache.sessions || 0) + 1;
  try {
    const stmt = assertDb().prepare('INSERT OR REPLACE INTO stats (key, value) VALUES (?, ?)');
    stmt.run(['sessions', statsCache.sessions]);
    stmt.free();
  } catch (err) {
    console.error('Error actualizando sessions en totem-marco', err);
  }
  persistDbSnapshot();
  storageEvents.dispatchEvent(new Event('statsChanged'));
  return statsCache.sessions;
}

export function getAdminStats(): AdminStats {
  const leads = leadsCache;
  const views = statsCache.views || 0;
  const sessions = statsCache.sessions || 0;
  const rate = sessions > 0 ? Math.round((leads.length / sessions) * 100) : 74;
  return {
    totalLeads: leads.length,
    conversionRate: Math.min(100, Math.max(10, rate)),
    totalBrochuresViewed: views,
    totalSessions: sessions
  };
}

export function exportLeadsToXLSX(): void {
  const leads = getStoredLeads();
  const formattedData = leads.map((lead, index) => ({
    N: index + 1,
    ID: lead.id,
    'Fecha y Hora': new Date(lead.createdAt).toLocaleString('es-PE'),
    'Nombre y Apellido': lead.fullName,
    Empresa: lead.company,
    'Correo Corporativo': lead.email,
    'Teléfono / WhatsApp': lead.phone || 'N/A',
    Cargo: lead.position || 'N/A',
    'Categoría de Interés': lead.categoryName || 'General',
    'Brochure Consultado': lead.brochureTitle || 'N/A',
    'Tipo de Requerimiento': lead.requirementType || 'N/A',
    'Detalle Requerimiento': lead.requirementDetail || 'N/A',
    'Origen Recorrido': lead.source,
    Estado: lead.status,
    'Autorizó Datos': lead.authorizedTerms ? 'SÍ' : 'NO'
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads MARCO Explorer');
  const max_width = formattedData.reduce((acc, row) => {
    Object.keys(row).forEach((k, i) => {
      const valStr = String((row as Record<string, unknown>)[k] || '');
      acc[i] = Math.max(acc[i] || 10, valStr.length + 3);
    });
    return acc;
  }, [] as number[]);
  worksheet['!cols'] = max_width.map((w) => ({ wch: w }));
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `MARCO_Explorer_Leads_${dateStr}.xlsx`);
}

export function exportAllDataAsJSON(): void {
  try {
    const payload = {
      leads: getStoredLeads(),
      categories: getStoredCategories(),
      brochures: getStoredBrochures(),
      specialists: getStoredSpecialists(),
      settings: getKioskSettings(),
      stats: { views: statsCache.views, sessions: statsCache.sessions }
    };
    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MARCO_Explorer_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error exportando datos JSON', err);
  }
}

export function importDataFromJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    const database = assertDb();

    if (data.leads) {
      database.run('DELETE FROM leads');
      const stmt = database.prepare(
        `INSERT OR REPLACE INTO leads (
          id, created_at, full_name, company, email, phone, position,
          category_id, category_name, brochure_id, brochure_title,
          requirement_type, requirement_detail, specialist_area,
          authorized_terms, status, source
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      );
      data.leads.forEach((lead: Lead) => {
        stmt.run([
          lead.id,
          lead.createdAt,
          lead.fullName,
          lead.company || null,
          lead.email || null,
          lead.phone || null,
          lead.position || null,
          lead.categoryId || null,
          lead.categoryName || null,
          lead.brochureId || null,
          lead.brochureTitle || null,
          lead.requirementType || null,
          lead.requirementDetail || null,
          lead.specialistArea || null,
          lead.authorizedTerms ? 1 : 0,
          lead.status,
          lead.source
        ]);
      });
      stmt.free();
    }

    if (data.categories) saveCategories(data.categories);
    if (data.brochures) saveBrochures(data.brochures);

    if (data.settings) saveKioskSettings(data.settings);

    if (data.stats) {
      if (typeof data.stats.views === 'number') {
        statsCache.views = data.stats.views;
        const stmt = database.prepare('INSERT OR REPLACE INTO stats (key, value) VALUES (?, ?)');
        stmt.run(['brochure_views', statsCache.views]);
        stmt.free();
      }
      if (typeof data.stats.sessions === 'number') {
        statsCache.sessions = data.stats.sessions;
        const stmt2 = database.prepare('INSERT OR REPLACE INTO stats (key, value) VALUES (?, ?)');
        stmt2.run(['sessions', statsCache.sessions]);
        stmt2.free();
      }
    }

    loadCachesFromDb();
    // Notify listeners
    storageEvents.dispatchEvent(new Event('leadsChanged'));
    storageEvents.dispatchEvent(new Event('categoriesChanged'));
    storageEvents.dispatchEvent(new Event('brochuresChanged'));
    storageEvents.dispatchEvent(new Event('specialistsChanged'));
    storageEvents.dispatchEvent(new Event('settingsChanged'));
    storageEvents.dispatchEvent(new Event('statsChanged'));
    return true;
  } catch (err) {
    console.error('Error importando datos JSON', err);
    return false;
  }
}

export function getStoredCategories(): Category[] {
  return categoriesCache;
}

export function saveCategories(categories: Category[]): void {
  categoriesCache = categories;
  try {
    const database = assertDb();
    database.run('DELETE FROM categories');
    const stmt = database.prepare(
      `INSERT INTO categories (
        id, code, title, subtitle, color, bg_light, banner_title, banner_description,
        applications, brochure_count, icon_name
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
    );
    categories.forEach((category) => {
      stmt.run([
        category.id,
        category.code,
        category.title,
        category.subtitle,
        category.color,
        category.bgLight,
        category.bannerTitle,
        category.bannerDescription,
        JSON.stringify(category.applications),
        category.brochureCount,
        category.iconName
      ]);
    });
    stmt.free();
  } catch (err) {
    console.error('Error guardando categorías en totem-marco', err);
  }
  persistDbSnapshot();
  storageEvents.dispatchEvent(new Event('categoriesChanged'));
}

export function createCategory(category: Category): Category[] {
  const categories = [...getStoredCategories(), category];
  saveCategories(categories);
  return categories;
}

export function updateCategory(category: Category): Category[] {
  const categories = getStoredCategories().map((item) => (item.id === category.id ? category : item));
  saveCategories(categories);
  return categories;
}

export function deleteCategory(id: string): Category[] {
  const categories = getStoredCategories().filter((item) => item.id !== id);
  saveCategories(categories);
  return categories;
}

export function getStoredBrochures(): Brochure[] {
  return brochuresCache;
}

export function saveBrochures(brochures: Brochure[]): void {
  brochuresCache = brochures;
  try {
    const database = assertDb();
    database.run('DELETE FROM brochures');
    const stmt = database.prepare(
      `INSERT INTO brochures (
        id, category_id, title, pages, year_or_type, file_size, description,
        pdf_url, cover_image, page_images
      ) VALUES (?,?,?,?,?,?,?,?,?,?)`
    );
    brochures.forEach((brochure) => {
      stmt.run([
        brochure.id,
        brochure.categoryId,
        brochure.title,
        brochure.pages || 0,
        brochure.yearOrType || '',
        brochure.fileSize || '',
        brochure.description || '',
        brochure.pdfUrl || null,
        brochure.coverImage || null,
        JSON.stringify(brochure.pageImages || [])
      ]);
    });
    stmt.free();
  } catch (err) {
    console.error('Error guardando brochures en totem-marco', err);
  }
  persistDbSnapshot();
  storageEvents.dispatchEvent(new Event('brochuresChanged'));
}

export function createBrochure(brochure: Brochure): Brochure[] {
  const brochures = [...getStoredBrochures(), brochure];
  saveBrochures(brochures);
  return brochures;
}

export function updateBrochure(brochure: Brochure): Brochure[] {
  const brochures = getStoredBrochures().map((item) => (item.id === brochure.id ? brochure : item));
  saveBrochures(brochures);
  return brochures;
}

export function deleteBrochure(id: string): Brochure[] {
  const brochures = getStoredBrochures().filter((item) => item.id !== id);
  saveBrochures(brochures);
  return brochures;
}

export function getStoredSpecialists(): Specialist[] {
  return specialistsCache;
}

export function exportDatabase(): void {
  if (!db || !SQL) {
    console.warn('totem-marco no está inicializado — no hay base de datos para exportar');
    return;
  }
  try {
    const binary = db.export();
    const blob = new Blob([binary], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'totem-marco';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error exportando totem-marco', err);
  }
}
