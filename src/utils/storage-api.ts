import * as XLSX from 'xlsx';
import { Lead, KioskSettings, AdminStats, Category, Brochure, Specialist } from '../types';
import brochureMultimarcaPdf from '../../assets/pdf/BROCHURE MULTIMARCA MARCO.pdf';

const API_BASE = 'http://localhost:3001/api';

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

async function apiQuery(sql: string): Promise<Record<string, unknown>[]> {
  const response = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql })
  });
  if (!response.ok) throw new Error(`Query failed: ${response.statusText}`);
  const result = await response.json();
  return result.data || [];
}

async function apiExecute(sql: string): Promise<{ changes: number; lastId: number }> {
  const response = await fetch(`${API_BASE}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql })
  });
  if (!response.ok) throw new Error(`Execute failed: ${response.statusText}`);
  const result = await response.json();
  return { changes: result.changes, lastId: result.lastId };
}

async function loadCachesFromDb() {
  try {
    const leads = await apiQuery('SELECT * FROM leads ORDER BY datetime(created_at) DESC');
    leadsCache = leads.map(mapLeadRow);

    const categories = await apiQuery('SELECT * FROM categories ORDER BY title');
    categoriesCache = categories.map(mapCategoryRow);

    const brochures = await apiQuery('SELECT * FROM brochures ORDER BY title');
    brochuresCache = brochures.map(mapBrochureRow);

    const specialists = await apiQuery('SELECT * FROM specialists ORDER BY title');
    specialistsCache = specialists.map(mapSpecialistRow);

    const settings = await apiQuery('SELECT * FROM kiosk_settings WHERE id = 1');
    if (settings.length > 0) {
      const row = settings[0];
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

    const stats = await apiQuery('SELECT key, value FROM stats');
    statsCache = { views: 0, sessions: 0 };
    stats.forEach((row) => {
      if (row.key === 'brochure_views') statsCache.views = Number(row.value) || 0;
      if (row.key === 'sessions') statsCache.sessions = Number(row.value) || 0;
    });
  } catch (err) {
    console.error('[DB ERROR] No se pudo cargar los datos:', err);
    throw err;
  }
}

export function isStorageReady(): boolean {
  return storageReady;
}

export function initStorage(): Promise<void> {
  if (storageReady) return Promise.resolve();
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Verificar conectividad con el backend
      const healthResp = await fetch(`${API_BASE}/health`);
      if (!healthResp.ok) throw new Error('Backend no disponible');
      console.info('[DB] Backend conectado correctamente');

      // Cargar datos desde la BD
      await loadCachesFromDb();
      storageReady = true;
      console.info('[DB] totem-marco sincronizado con el sistema');
      storageEvents.dispatchEvent(new Event('storageReady'));
    } catch (error) {
      console.error('[DB ERROR] Error inicializando totem-marco:', error);
      throw error;
    }
  })().catch((err) => {
    initPromise = null;
    throw err;
  });

  return initPromise;
}

export function getStoredLeads(): Lead[] {
  return leadsCache;
}

export async function saveLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>): Promise<Lead> {
  const newLead: Lead = {
    ...leadData,
    id: 'lead-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
    status: 'Nuevo'
  };

  try {
    const sql = `INSERT OR REPLACE INTO leads (
        id, created_at, full_name, company, email, phone, position,
        category_id, category_name, brochure_id, brochure_title,
        requirement_type, requirement_detail, specialist_area,
        authorized_terms, status, source
      ) VALUES (
        '${newLead.id}',
        '${newLead.createdAt}',
        '${newLead.fullName.replace(/'/g, "''")}',
        ${newLead.company ? `'${newLead.company.replace(/'/g, "''")}'` : 'NULL'},
        ${newLead.email ? `'${newLead.email.replace(/'/g, "''")}'` : 'NULL'},
        ${newLead.phone ? `'${newLead.phone.replace(/'/g, "''")}'` : 'NULL'},
        ${newLead.position ? `'${newLead.position.replace(/'/g, "''")}'` : 'NULL'},
        ${newLead.categoryId ? `'${newLead.categoryId}'` : 'NULL'},
        ${newLead.categoryName ? `'${newLead.categoryName.replace(/'/g, "''")}'` : 'NULL'},
        ${newLead.brochureId ? `'${newLead.brochureId}'` : 'NULL'},
        ${newLead.brochureTitle ? `'${newLead.brochureTitle.replace(/'/g, "''")}'` : 'NULL'},
        ${newLead.requirementType ? `'${newLead.requirementType.replace(/'/g, "''")}'` : 'NULL'},
        ${newLead.requirementDetail ? `'${newLead.requirementDetail.replace(/'/g, "''")}'` : 'NULL'},
        ${newLead.specialistArea ? `'${newLead.specialistArea.replace(/'/g, "''")}'` : 'NULL'},
        ${newLead.authorizedTerms ? 1 : 0},
        '${newLead.status}',
        '${newLead.source}'
      )`;
    
    console.log('[SQL LOG] INSERT LEAD:', sql);
    await apiExecute(sql);
    
    leadsCache = [newLead, ...leadsCache];
    storageEvents.dispatchEvent(new Event('leadsChanged'));
    return newLead;
  } catch (err) {
    console.error('[DB ERROR] Error insertando lead en totem-marco:', err);
    throw err;
  }
}

export async function updateLeadStatus(leadId: string, newStatus: Lead['status']): Promise<void> {
  try {
    const sql = `UPDATE leads SET status = '${newStatus}' WHERE id = '${leadId}'`;
    console.log('[SQL LOG] UPDATE LEAD STATUS:', sql);
    await apiExecute(sql);

    const leadIdx = leadsCache.findIndex((l) => l.id === leadId);
    if (leadIdx >= 0) {
      leadsCache[leadIdx].status = newStatus;
      storageEvents.dispatchEvent(new Event('leadsChanged'));
    }
  } catch (err) {
    console.error('[DB ERROR] Error actualizando estado del lead en totem-marco:', err);
    throw err;
  }
}

export async function deleteLead(leadId: string): Promise<void> {
  try {
    const sql = `DELETE FROM leads WHERE id = '${leadId}'`;
    console.log('[SQL LOG] DELETE LEAD:', sql);
    await apiExecute(sql);

    leadsCache = leadsCache.filter((l) => l.id !== leadId);
    storageEvents.dispatchEvent(new Event('leadsChanged'));
  } catch (err) {
    console.error('[DB ERROR] Error borrando lead en totem-marco:', err);
    throw err;
  }
}

export async function saveKioskSettings(settings: KioskSettings): Promise<void> {
  try {
    const sql = `UPDATE kiosk_settings SET 
      idle_timeout_seconds = ${settings.idleTimeoutSeconds},
      auto_reset_confirmation_seconds = ${settings.autoResetConfirmationSeconds},
      enable_virtual_keyboard = ${settings.enableVirtualKeyboard ? 1 : 0},
      totem_frame_mode = ${settings.totemFrameMode ? 1 : 0},
      company_name = '${settings.companyName.replace(/'/g, "''")}',
      event_title = '${settings.eventTitle.replace(/'/g, "''")}'
      WHERE id = 1`;
    
    console.log('[SQL LOG] UPDATE SETTINGS:', sql);
    await apiExecute(sql);

    settingsCache = settings;
    storageEvents.dispatchEvent(new Event('settingsChanged'));
  } catch (err) {
    console.error('[DB ERROR] Error guardando configuración en totem-marco:', err);
    throw err;
  }
}

export async function incrementBrochureViews(brochureId: string): Promise<void> {
  try {
    const sql = `UPDATE stats SET value = value + 1 WHERE key = 'brochure_views'`;
    console.log('[SQL LOG] INCREMENT BROCHURE VIEWS:', sql);
    await apiExecute(sql);

    statsCache.views++;
  } catch (err) {
    console.error('[DB ERROR] Error actualizando brochure_views en totem-marco:', err);
  }
}

export async function incrementSessions(): Promise<void> {
  try {
    const sql = `UPDATE stats SET value = value + 1 WHERE key = 'sessions'`;
    console.log('[SQL LOG] INCREMENT SESSIONS:', sql);
    await apiExecute(sql);

    statsCache.sessions++;
  } catch (err) {
    console.error('[DB ERROR] Error actualizando sessions en totem-marco:', err);
  }
}

export function getStoredSettings(): KioskSettings {
  return settingsCache;
}

export function getAdminStats(): AdminStats {
  return {
    totalLeads: leadsCache.length,
    newLeads: leadsCache.filter((l) => l.status === 'Nuevo').length,
    brochureViews: statsCache.views,
    sessions: statsCache.sessions
  };
}

export function getStoredCategories(): Category[] {
  return categoriesCache;
}

export function getStoredBrochures(): Brochure[] {
  return brochuresCache;
}

export function getStoredSpecialists(): Specialist[] {
  return specialistsCache;
}

export async function saveCategories(categories: Category[]): Promise<void> {
  try {
    const statements = categories.map((cat) => {
      const sqlStr = `INSERT OR REPLACE INTO categories (
        id, code, title, subtitle, color, bg_light, banner_title, banner_description,
        applications, brochure_count, icon_name
      ) VALUES (
        '${cat.id}',
        '${cat.code}',
        '${cat.title.replace(/'/g, "''")}',
        '${cat.subtitle.replace(/'/g, "''")}',
        '${cat.color}',
        '${cat.bgLight}',
        '${cat.bannerTitle.replace(/'/g, "''")}',
        '${cat.bannerDescription.replace(/'/g, "''")}',
        '${JSON.stringify(cat.applications).replace(/'/g, "''")}',
        ${cat.brochureCount},
        '${cat.iconName}'
      )`;
      return sqlStr;
    });

    console.log('[SQL LOG] BATCH INSERT/UPDATE CATEGORIES:', statements.length);
    for (const stmt of statements) {
      await apiExecute(stmt);
    }

    categoriesCache = categories;
    storageEvents.dispatchEvent(new Event('categoriesChanged'));
  } catch (err) {
    console.error('[DB ERROR] Error guardando categorías en totem-marco:', err);
    throw err;
  }
}

export async function saveBrochures(brochures: Brochure[]): Promise<void> {
  try {
    const statements = brochures.map((bro) => {
      const sqlStr = `INSERT OR REPLACE INTO brochures (
        id, category_id, title, pages, year_or_type, file_size, description,
        pdf_url, cover_image, page_images
      ) VALUES (
        '${bro.id}',
        '${bro.categoryId}',
        '${bro.title.replace(/'/g, "''")}',
        ${bro.pages},
        '${bro.yearOrType.replace(/'/g, "''")}',
        '${bro.fileSize.replace(/'/g, "''")}',
        '${bro.description.replace(/'/g, "''")}',
        ${bro.pdfUrl ? `'${bro.pdfUrl.replace(/'/g, "''")}'` : 'NULL'},
        ${bro.coverImage ? `'${bro.coverImage.replace(/'/g, "''")}'` : 'NULL'},
        '${JSON.stringify(bro.pageImages).replace(/'/g, "''")}'
      )`;
      return sqlStr;
    });

    console.log('[SQL LOG] BATCH INSERT/UPDATE BROCHURES:', statements.length);
    for (const stmt of statements) {
      await apiExecute(stmt);
    }

    brochuresCache = brochures;
    storageEvents.dispatchEvent(new Event('brochuresChanged'));
  } catch (err) {
    console.error('[DB ERROR] Error guardando brochures en totem-marco:', err);
    throw err;
  }
}

export async function exportDatabase(): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE}/export`);
    if (!response.ok) throw new Error('No se pudo exportar la base de datos');
    return response.blob();
  } catch (err) {
    console.error('[DB ERROR] Error exportando totem-marco:', err);
    throw err;
  }
}

export async function exportLeadsToExcel(fileName: string): Promise<void> {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(leadsCache, { header: 1 });
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  XLSX.writeFile(wb, fileName);
}
