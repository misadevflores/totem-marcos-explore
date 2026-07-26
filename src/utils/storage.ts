import * as XLSX from 'xlsx';
import { Lead, KioskSettings, AdminStats, Category, Brochure } from '../types';
import { INITIAL_CATEGORIES, INITIAL_BROCHURES } from '../data/mockCatalog';

const STORAGE_KEYS = {
  LEADS: 'marco_totem_leads_v1',
  SETTINGS: 'marco_totem_settings_v1',
  BROCHURES: 'marco_totem_brochures_v1',
  CATEGORIES: 'marco_totem_categories_v1',
  STATS_VIEW_COUNT: 'marco_totem_brochures_view_count_v1',
  STATS_SESSION_COUNT: 'marco_totem_sessions_count_v1'
};

export const DEFAULT_SETTINGS: KioskSettings = {
  idleTimeoutSeconds: 35, // 30-45s auto reset as specified in PDF page 3
  autoResetConfirmationSeconds: 20, // 20s as specified in PDF page 11
  enableVirtualKeyboard: true,
  totemFrameMode: true, // Show vertical 1080x1920 Totem bezel by default
  companyName: 'MARCO Peru',
  eventTitle: 'Expomina 2026'
};

// Initial Seed Leads for Admin panel demonstration
const SEED_LEADS: Lead[] = [
  {
    id: 'lead-101',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    fullName: 'Carlos Mendoza',
    company: 'Compañía Minera Andina',
    email: 'cmendoza@mineraandina.pe',
    phone: '+51 998 123 456',
    position: 'Jefe de Mantenimiento',
    categoryId: 'lubricacion-industrial',
    categoryName: 'Lubricación Industrial',
    brochureId: 'b-lu-1',
    brochureTitle: 'Brochure Lubricación Industrial',
    authorizedTerms: true,
    status: 'Nuevo',
    source: 'Brochure'
  },
  {
    id: 'lead-102',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    fullName: 'Ana Paredes',
    company: 'Servicios Mineros SAC',
    email: 'aparedes@serviciosmineros.pe',
    phone: '+51 987 654 321',
    position: 'Ingeniera de Procesos',
    categoryId: 'filtracion-industrial',
    categoryName: 'Filtración Industrial',
    brochureId: 'b-fi-1',
    brochureTitle: 'Sistemas de Filtración de Flota y Planta',
    authorizedTerms: true,
    status: 'Asignado',
    source: 'Brochure'
  },
  {
    id: 'lead-103',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    fullName: 'José Ramírez',
    company: 'Mina Sur Operating',
    email: 'jramirez@minasur.pe',
    phone: '+51 954 112 334',
    position: 'Superintendente Mecánico',
    categoryId: 'herramientas-hidraulicas',
    categoryName: 'Herramientas Hidráulicas',
    authorizedTerms: true,
    status: 'Contactado',
    source: 'Especialista Directo'
  },
  {
    id: 'lead-104',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    fullName: 'Lucía Torres',
    company: 'Industrial Perú Corp',
    email: 'ltorres@industrialperu.com',
    phone: '+51 912 887 665',
    position: 'Jefe de Laboratorio',
    categoryId: 'marco-lab',
    categoryName: 'MARCO Lab',
    authorizedTerms: true,
    status: 'Nuevo',
    source: 'No Encontró',
    requirementType: 'Necesito asesoría técnica',
    requirementDetail: 'Busco un sistema de filtración dializado para aceite hidráulico de chancadora'
  }
];

export function getStoredLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(SEED_LEADS));
      return SEED_LEADS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading leads from localStorage:', err);
    return SEED_LEADS;
  }
}

export function saveLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>): Lead {
  const existing = getStoredLeads();
  const newLead: Lead = {
    ...leadData,
    id: 'lead-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    createdAt: new Date().toISOString(),
    status: 'Nuevo'
  };

  const updated = [newLead, ...existing];
  try {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving lead to localStorage:', err);
  }
  return newLead;
}

export function updateLeadStatus(id: string, newStatus: 'Nuevo' | 'Asignado' | 'Contactado'): Lead[] {
  const existing = getStoredLeads();
  const updated = existing.map(item => item.id === id ? { ...item, status: newStatus } : item);
  try {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
  } catch (err) {
    console.error('Error updating lead status:', err);
  }
  return updated;
}

export function getKioskSettings(): KioskSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveKioskSettings(settings: Partial<KioskSettings>): KioskSettings {
  const current = getKioskSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving kiosk settings:', err);
  }
  return updated;
}

export function recordBrochureView(): number {
  try {
    const current = parseInt(localStorage.getItem(STORAGE_KEYS.STATS_VIEW_COUNT) || '286', 10);
    const updated = current + 1;
    localStorage.setItem(STORAGE_KEYS.STATS_VIEW_COUNT, updated.toString());
    return updated;
  } catch {
    return 287;
  }
}

export function recordNewSession(): number {
  try {
    const current = parseInt(localStorage.getItem(STORAGE_KEYS.STATS_SESSION_COUNT) || '173', 10);
    const updated = current + 1;
    localStorage.setItem(STORAGE_KEYS.STATS_SESSION_COUNT, updated.toString());
    return updated;
  } catch {
    return 174;
  }
}

export function getAdminStats(): AdminStats {
  const leads = getStoredLeads();
  const views = parseInt(localStorage.getItem(STORAGE_KEYS.STATS_VIEW_COUNT) || '286', 10);
  const sessions = parseInt(localStorage.getItem(STORAGE_KEYS.STATS_SESSION_COUNT) || '173', 10);

  // Conversion rate = (leads / sessions) * 100
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
    'Empresa': lead.company,
    'Correo Corporativo': lead.email,
    'Teléfono / WhatsApp': lead.phone || 'N/A',
    'Cargo': lead.position || 'N/A',
    'Categoría de Interés': lead.categoryName || 'General',
    'Brochure Consultado': lead.brochureTitle || 'N/A',
    'Tipo de Requerimiento': lead.requirementType || 'N/A',
    'Detalle Requerimiento': lead.requirementDetail || 'N/A',
    'Origen Recorrido': lead.source,
    'Estado': lead.status,
    'Autorizó Datos': lead.authorizedTerms ? 'SÍ' : 'NO'
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads MARCO Explorer');

  // Auto column width padding
  const max_width = formattedData.reduce((acc, row) => {
    Object.keys(row).forEach((k, i) => {
      const valStr = String((row as any)[k] || '');
      acc[i] = Math.max(acc[i] || 10, valStr.length + 3);
    });
    return acc;
  }, [] as number[]);
  worksheet['!cols'] = max_width.map(w => ({ wch: w }));

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `MARCO_Explorer_Leads_${dateStr}.xlsx`);
}

// Categories and Brochures stored in localStorage for Admin editing capability
export function getStoredCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Error saving categories:', err);
  }
}

export function getStoredBrochures(): Brochure[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BROCHURES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BROCHURES, JSON.stringify(INITIAL_BROCHURES));
      return INITIAL_BROCHURES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BROCHURES;
  }
}

export function saveBrochures(brochures: Brochure[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BROCHURES, JSON.stringify(brochures));
  } catch (err) {
    console.error('Error saving brochures:', err);
  }
}
