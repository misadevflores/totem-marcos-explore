import * as XLSX from 'xlsx';
import { Lead, KioskSettings, AdminStats, Category, Brochure, Specialist } from '../types';
import brochureMultimarcaPdf from '../../assets/pdf/BROCHURE MULTIMARCA MARCO.pdf';
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

const API_BASE = (typeof window !== 'undefined' && window.location.hostname !== 'localhost') 
  ? '/api' 
  : 'http://localhost:3001/api';

export const DEFAULT_SETTINGS: KioskSettings = INITIAL_SETTINGS;

const PDF_URL_FALLBACKS: Record<string, string> = {
  'b-mm-1': brochureMultimarcaPdf
};

let storageReady = false;
let initPromise: Promise<void> | null = null;

// Event emitter for notifying UI about changes
export const storageEvents = new EventTarget();

const initialCache = loadLocalDataCache();

let leadsCache: Lead[] = initialCache.leads || [];
let categoriesCache: Category[] = sortCategoriesByCode(initialCache.categories || INITIAL_CATEGORIES);
let brochuresCache: Brochure[] = sortBrochuresByCategory(initialCache.brochures || INITIAL_BROCHURES, categoriesCache);
let specialistsCache: Specialist[] = sortSpecialistsByCategory(initialCache.specialists || INITIAL_SPECIALISTS, categoriesCache);
let settingsCache: KioskSettings = initialCache.settings || INITIAL_SETTINGS;
let statsCache = initialCache.stats || INITIAL_STATS;

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

async function loadCachesFromDb() {
  try {
    const leads = await apiQuery('SELECT * FROM leads ORDER BY datetime(created_at) DESC');
    leadsCache = leads.map(mapLeadRow);

    const categories = await apiQuery("SELECT * FROM categories ORDER BY CAST(code AS INTEGER) ASC, code ASC");
    if (categories.length > 0) {
      categoriesCache = sortCategoriesByCode(categories.map(mapCategoryRow));
    }

    const brochures = await apiQuery('SELECT * FROM brochures ORDER BY category_id ASC, id ASC');
    if (brochures.length > 0) {
      brochuresCache = sortBrochuresByCategory(brochures.map(mapBrochureRow), categoriesCache);
    }

    const specialists = await apiQuery("SELECT * FROM specialists ORDER BY CAST(REPLACE(id, 'spec-', '') AS INTEGER) ASC, id ASC");
    if (specialists.length > 0) {
      specialistsCache = sortSpecialistsByCategory(specialists.map(mapSpecialistRow), categoriesCache);
    }

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
    }

    const stats = await apiQuery('SELECT key, value FROM stats');
    statsCache = { views: INITIAL_STATS.views, sessions: INITIAL_STATS.sessions };
    stats.forEach((row) => {
      if (row.key === 'brochure_views') statsCache.views = Number(row.value) || 0;
      if (row.key === 'sessions') statsCache.sessions = Number(row.value) || 0;
    });

    saveLocalDataCache({
      leads: leadsCache,
      categories: categoriesCache,
      brochures: brochuresCache,
      specialists: specialistsCache,
      settings: settingsCache,
      stats: statsCache
    });
  } catch (err) {
    console.warn('[DB WARNING] No se pudo cargar los datos desde la BD, usando caché:', err);
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
      const healthResp = await fetch(`${API_BASE}/health`).catch(() => null);
      if (healthResp?.ok) {
        await loadCachesFromDb();
      } else {
        console.info('[DB] Backend no disponible, usando caché local.');
      }
    } catch (error) {
      console.warn('[DB] Inicializado en modo caché local:', error);
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

  leadsCache = [newLead, ...leadsCache];
  saveLocalDataCache({ leads: leadsCache });

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
    
    await apiExecute(sql);
  } catch (err) {
    console.warn('[DB] Lead guardado en caché local:', err);
  }

  storageEvents.dispatchEvent(new Event('leadsChanged'));
  return newLead;
}

export async function updateLeadStatus(leadId: string, newStatus: Lead['status']): Promise<void> {
  const leadIdx = leadsCache.findIndex((l) => l.id === leadId);
  if (leadIdx >= 0) {
    leadsCache[leadIdx].status = newStatus;
    saveLocalDataCache({ leads: leadsCache });
    storageEvents.dispatchEvent(new Event('leadsChanged'));
  }

  try {
    const sql = `UPDATE leads SET status = '${newStatus}' WHERE id = '${leadId}'`;
    await apiExecute(sql);
  } catch (err) {
    console.warn('[DB] Estado de lead actualizado en caché local:', err);
  }
}

export async function deleteLead(leadId: string): Promise<void> {
  leadsCache = leadsCache.filter((l) => l.id !== leadId);
  saveLocalDataCache({ leads: leadsCache });
  storageEvents.dispatchEvent(new Event('leadsChanged'));

  try {
    const sql = `DELETE FROM leads WHERE id = '${leadId}'`;
    await apiExecute(sql);
  } catch (err) {
    console.warn('[DB] Lead eliminado de caché local:', err);
  }
}

export async function saveKioskSettings(settings: KioskSettings): Promise<void> {
  settingsCache = settings;
  saveLocalDataCache({ settings: settingsCache });
  storageEvents.dispatchEvent(new Event('settingsChanged'));

  try {
    const sql = `UPDATE kiosk_settings SET 
      idle_timeout_seconds = ${settings.idleTimeoutSeconds},
      auto_reset_confirmation_seconds = ${settings.autoResetConfirmationSeconds},
      enable_virtual_keyboard = ${settings.enableVirtualKeyboard ? 1 : 0},
      totem_frame_mode = ${settings.totemFrameMode ? 1 : 0},
      company_name = '${settings.companyName.replace(/'/g, "''")}',
      event_title = '${settings.eventTitle.replace(/'/g, "''")}'
      WHERE id = 1`;
    await apiExecute(sql);
  } catch (err) {
    console.warn('[DB] Settings guardados en caché local:', err);
  }
}

export async function incrementBrochureViews(brochureId: string): Promise<void> {
  statsCache.views++;
  saveLocalDataCache({ stats: statsCache });
  try {
    const sql = `UPDATE stats SET value = value + 1 WHERE key = 'brochure_views'`;
    await apiExecute(sql);
  } catch {}
}

export async function incrementSessions(): Promise<void> {
  statsCache.sessions++;
  saveLocalDataCache({ stats: statsCache });
  try {
    const sql = `UPDATE stats SET value = value + 1 WHERE key = 'sessions'`;
    await apiExecute(sql);
  } catch {}
}

export function getStoredSettings(): KioskSettings {
  return settingsCache;
}

export function getAdminStats(): AdminStats {
  const rate = statsCache.sessions > 0
    ? Math.round((leadsCache.length / statsCache.sessions) * 100) : 74;
  return {
    totalLeads: leadsCache.length,
    conversionRate: Math.min(100, Math.max(10, rate)),
    totalBrochuresViewed: statsCache.views,
    totalSessions: statsCache.sessions
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
  categoriesCache = sortCategoriesByCode(categories);
  saveLocalDataCache({ categories: categoriesCache });
  storageEvents.dispatchEvent(new Event('categoriesChanged'));

  try {
    for (const cat of categories) {
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
      await apiExecute(sqlStr);
    }
  } catch (err) {
    console.warn('[DB] Categorías guardadas en caché local:', err);
  }
}

export async function saveBrochures(brochures: Brochure[]): Promise<void> {
  brochuresCache = sortBrochuresByCategory(brochures, categoriesCache);
  saveLocalDataCache({ brochures: brochuresCache });
  storageEvents.dispatchEvent(new Event('brochuresChanged'));

  try {
    for (const bro of brochures) {
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
      await apiExecute(sqlStr);
    }
  } catch (err) {
    console.warn('[DB] Brochures guardados en caché local:', err);
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
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  XLSX.writeFile(wb, fileName);
}
