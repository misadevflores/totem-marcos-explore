export interface Category {
  id: string;
  code: string; // e.g. LU, HH, TM, FI, ML, MM
  title: string;
  subtitle: string;
  color: string;
  bgLight: string;
  bannerTitle: string;
  bannerDescription: string;
  applications: string[];
  brochureCount: number;
  iconName: string;
}

export interface Brochure {
  id: string;
  categoryId: string;
  title: string;
  pages: number;
  yearOrType: string;
  fileSize: string;
  description: string;
  pdfUrl?: string;
  coverImage?: string;
  pageImages: string[];
}

export interface Lead {
  id: string;
  createdAt: string; // ISO string
  fullName: string;
  company: string;
  email: string;
  phone: string;
  position: string;
  categoryId?: string;
  categoryName?: string;
  brochureId?: string;
  brochureTitle?: string;
  requirementType?: string;
  requirementDetail?: string;
  specialistArea?: string;
  authorizedTerms: boolean;
  status: 'Nuevo' | 'Asignado' | 'Contactado';
  source: 'Brochure' | 'No Encontró' | 'Especialista Directo' | 'Biblioteca';
}

export interface Specialist {
  id: string;
  categoryId: string;
  title: string;
  role: string;
  email: string;
  phone: string;
}

export interface KioskSettings {
  idleTimeoutSeconds: number; // e.g. 30, 45, 60 or 0 (disabled)
  autoResetConfirmationSeconds: number; // default 20
  enableVirtualKeyboard: boolean;
  totemFrameMode: boolean; // True: show 1080x1920 Totem Frame bezel, False: fullscreen fit
  companyName: string;
  eventTitle: string;
  cloudSyncUrl?: string; // URL for offline-first synchronization
}

export interface AdminStats {
  totalLeads: number;
  conversionRate: number; // percentage e.g. 74
  totalBrochuresViewed: number;
  totalSessions: number;
}
