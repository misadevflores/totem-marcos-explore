import { Category, Brochure, Specialist, KioskSettings, Lead } from '../types';

// Datos iniciales reales del catálogo MARCO (12 categorías, 20 PDFs, 12 especialistas)
// Estos datos garantizan que en cualquier instalación limpia la app cargue inmediatamente con todo el catálogo.

export const INITIAL_SETTINGS: KioskSettings = {
  idleTimeoutSeconds: 35,
  autoResetConfirmationSeconds: 20,
  enableVirtualKeyboard: true,
  totemFrameMode: true,
  companyName: 'MARCO Peru',
  eventTitle: 'Expomina 2026'
};

export const INITIAL_STATS = {
  views: 286,
  sessions: 173
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'lubricacion-industrial', code: '01',
    title: 'Lubricación Industrial',
    subtitle: 'Bel-Ray y soluciones para industria pesada',
    color: '#8B002A', bgLight: '#FDF2F4',
    bannerTitle: 'BEL-RAY',
    bannerDescription: 'Lubricantes de alto desempeño para minería, industria y aplicaciones severas con máxima protección térmica y antidesgaste.',
    applications: ['Motores diésel de alta potencia y transmisiones', 'Sistemas hidráulicos de maquinaria de mina', 'Reductores, engranajes abiertos y mandos finales', 'Grasas complejas de sulfonato de calcio y litio'],
    brochureCount: 2, iconName: 'Droplets'
  },
  {
    id: 'lubricacion-minera', code: '02',
    title: 'Lubricación Minera',
    subtitle: 'Soluciones Bel-Ray de alto rendimiento para minería',
    color: '#7C1D1D', bgLight: '#FEF2F2',
    bannerTitle: 'BEL-RAY MINERÍA',
    bannerDescription: 'Lubricantes especializados para condiciones extremas de minería subterránea y de superficie.',
    applications: ['Lubricación de equipos de mina subterránea', 'Aceites para transmisiones de camiones mineros', 'Grasas EP para cargadores frontales y excavadoras', 'Lubricación de sistemas de izaje y transporte'],
    brochureCount: 2, iconName: 'Droplets'
  },
  {
    id: 'herramientas-hidraulicas', code: '03',
    title: 'Herramientas Hidráulicas',
    subtitle: 'Power Team y equipos de alta presión para mantenimiento crítico',
    color: '#1E2530', bgLight: '#F1F5F9',
    bannerTitle: 'POWER TEAM',
    bannerDescription: 'Cilindros, bombas, llaves de torque e hidráulica de alta presión (hasta 10,000 PSI) con certificación internacional.',
    applications: ['Cilindros de simple y doble efecto de alto tonelaje', 'Bombas electrohidráulicas y neumáticas portátiles', 'Llaves de torque hidráulicas y tensionadores de pernos', 'Extractores mecánicos e hidráulicos de rodamientos'],
    brochureCount: 2, iconName: 'Wrench'
  },
  {
    id: 'transformacion-materiales', code: '04',
    title: 'Transformación de Materiales',
    subtitle: 'Trituración, molienda, clasificación y revestimientos',
    color: '#991B1B', bgLight: '#FEF2F2',
    bannerTitle: 'PROCESAMIENTO & TRITURACIÓN',
    bannerDescription: 'Equipos y repuestos de alto impacto para plantas concentradoras, chancado y manejo de minerales.',
    applications: ['Revestimientos de chancadoras de quijada y cónicas', 'Mallas de clasificación metálicas y en poliuretano', 'Componentes para molinos SAG y de bolas', 'Sistemas de transportadores y limpiadores de faja'],
    brochureCount: 1, iconName: 'Boxes'
  },
  {
    id: 'filtracion-industrial', code: '05',
    title: 'Filtración Industrial',
    subtitle: 'Sistemas Lube & Fuel y consumibles de alta eficiencia',
    color: '#065F46', bgLight: '#ECFDF5',
    bannerTitle: 'FILTRACIÓN LUBE & FUEL',
    bannerDescription: 'Purificación y remoción de partículas de polvo, agua y barnices en fluidos industriales.',
    applications: ['Carros de filtración de aceite hidráulico dializado', 'Coalescedores para eliminación de agua libre en diésel', 'Filtros de aire de alto flujo para entornos polvorientos', 'Elementos filtrantes absolutos micro-glass'],
    brochureCount: 2, iconName: 'Filter'
  },
  {
    id: 'marco-lab', code: '06',
    title: 'MARCO Lab',
    subtitle: 'Laboratorio de Lubricantes - análisis tribológico',
    color: '#1E3A8A', bgLight: '#EFF6FF',
    bannerTitle: 'MARCO LAB TRIBOLOGÍA',
    bannerDescription: 'Laboratorio para diagnóstico preventivo de fluidos, conteo de partículas ISO y espectrometría de desgaste.',
    applications: ['Análisis elemental FTIR para detección de contaminantes', 'Conteo automático de partículas según Norma ISO 4406', 'Viscosidad cinemática a 40°C y 100°C', 'Interpretación técnica por tribólogos senior'],
    brochureCount: 2, iconName: 'FlaskConical'
  },
  {
    id: 'mangueras-oleo-hidraulicas', code: '07',
    title: 'Mangueras Oleo Hidráulicas',
    subtitle: 'Aeroquip y mangueras de alta presión',
    color: '#92400E', bgLight: '#FFFBEB',
    bannerTitle: 'MANGUERAS AEROQUIP',
    bannerDescription: 'Mangueras y accesorios de alta presión certificados para sistemas oleohidráulicos industriales y mineros.',
    applications: ['Mangueras SAE 100R1, R2, R12 y R15 de alta presión', 'Accesorios y conectores de acero inoxidable', 'Ensamblaje y prueba hidráulica in situ', 'Mangueras termoplásticas para entornos agresivos'],
    brochureCount: 2, iconName: 'Zap'
  },
  {
    id: 'componentes-oleo-hidraulicos', code: '08',
    title: 'Componentes y Sistemas Oleo Hidráulicos',
    subtitle: 'Componentes hidráulicos y multimarca MARCO',
    color: '#3B0764', bgLight: '#FAF5FF',
    bannerTitle: 'HIDRÁULICA MULTIMARCA',
    bannerDescription: 'Portafolio integral de componentes hidráulicos, válvulas, bombas y motores para sistemas industriales y mineros.',
    applications: ['Válvulas direccionales, proporcionales y de presión', 'Bombas de pistones y engranajes industriales', 'Motores hidráulicos de alto par', 'Unidades de potencia hidráulica a medida'],
    brochureCount: 1, iconName: 'Settings'
  },
  {
    id: 'transmision-potencia', code: '09',
    title: 'Transmisión de Potencia',
    subtitle: 'Brevini y soluciones de transmisión industrial',
    color: '#1C4532', bgLight: '#F0FDF4',
    bannerTitle: 'TRANSMISIÓN BREVINI',
    bannerDescription: 'Reductores planetarios, acopladores y soluciones de transmisión de potencia de alta eficiencia.',
    applications: ['Reductores planetarios y helicoidales de alta relación', 'Acopladores hidráulicos y mecánicos de par constante', 'Variadores de velocidad para cintas transportadoras', 'Sistemas de transmisión para molinos y chancadoras'],
    brochureCount: 2, iconName: 'Settings'
  },
  {
    id: 'soluciones-ingenieria-mineria', code: '10',
    title: 'Soluciones de Ingeniería para Minería',
    subtitle: 'Proyectos mineros y soluciones de ingeniería integral',
    color: '#0C4A6E', bgLight: '#F0F9FF',
    bannerTitle: 'PROYECTOS MINEROS',
    bannerDescription: 'Soluciones de ingeniería especializadas para operaciones mineras de gran escala.',
    applications: ['Diseño de sistemas de lubricación centralizada', 'Ingeniería de sistemas hidráulicos para maquinaria pesada', 'Proyectos de mejora de confiabilidad y mantenimiento predictivo', 'Consultoría técnica para optimización de procesos mineros'],
    brochureCount: 1, iconName: 'Settings'
  },
  {
    id: 'sistemas-lubricacion', code: '11',
    title: 'Sistemas de Lubricación',
    subtitle: 'SKF y sistemas automáticos de lubricación centralizada',
    color: '#7C3AED', bgLight: '#F5F3FF',
    bannerTitle: 'SISTEMAS SKF',
    bannerDescription: 'Sistemas automáticos de lubricación monopunto, multipunto y centralizada para equipos críticos.',
    applications: ['Sistemas de lubricación multipunto SKF VOGEL', 'Lubricadores automáticos para rodamientos y guías', 'Centrales de lubricación para maquinaria pesada', 'Sistemas de monitoreo y alarma de lubricación'],
    brochureCount: 2, iconName: 'Activity'
  },
  {
    id: 'soluciones-anti-desgaste', code: '12',
    title: 'Soluciones Anti Desgaste',
    subtitle: 'RMWT y recubrimientos antidesgaste para equipos críticos',
    color: '#B45309', bgLight: '#FFFBEB',
    bannerTitle: 'ANTI DESGASTE RMWT',
    bannerDescription: 'Recubrimientos, revestimientos y soluciones antidesgaste de alto rendimiento para equipos mineros e industriales.',
    applications: ['Recubrimientos poliuretánicos para tolvas y chutes', 'Revestimientos cerámicos para alta abrasión', 'Placas bimetálicas y de cromo para desgaste extremo', 'Soldadura dura y reparación de equipos desgastados'],
    brochureCount: 1, iconName: 'Shield'
  }
];

export const INITIAL_BROCHURES: Brochure[] = [
  // (01) Lubricación Industrial
  { id: 'b-lu-ind-1', categoryId: 'lubricacion-industrial', title: 'Brochure Lubricación Industrial', pages: 16, yearOrType: 'PDF · Español', fileSize: '11.7 MB', description: 'Catálogo general con soluciones de lubricación para maquinaria pesada de minería y plantas de procesamiento.', pdfUrl: '/catalogo_pdfs/(01) Lubricación Industrial/Brochure Lubricación.pdf', pageImages: [] },
  { id: 'b-lu-ind-2', categoryId: 'lubricacion-industrial', title: 'Catálogo General Cogelsa 2026', pages: 40, yearOrType: 'Edición 2026 · PDF · Español', fileSize: '5.7 MB', description: 'Catálogo completo de productos Cogelsa para lubricación industrial.', pdfUrl: '/catalogo_pdfs/(01) Lubricación Industrial/CATALOGO-GENERAL-COGELSA-2026_LD.pdf', pageImages: [] },
  // (02) Lubricación Minera
  { id: 'b-lu-min-1', categoryId: 'lubricacion-minera', title: 'Brochure Lubricación Minera', pages: 16, yearOrType: 'PDF · Español', fileSize: '11.7 MB', description: 'Soluciones de lubricación especializadas para el sector minero.', pdfUrl: '/catalogo_pdfs/(02) Lubricación Minera/Brochure Lubricación.pdf', pageImages: [] },
  { id: 'b-lu-min-2', categoryId: 'lubricacion-minera', title: 'Bel-Ray Mining Brochure 2025', pages: 24, yearOrType: 'Edición 2025 · PDF · Inglés', fileSize: '8.5 MB', description: 'Guía especializada de lubricantes Bel-Ray para aplicaciones mineras.', pdfUrl: '/catalogo_pdfs/(02) Lubricación Minera/Mining-Brochure_BEL RAY 2025.pdf', pageImages: [] },
  // (03) Herramientas Hidráulicas
  { id: 'b-hh-1', categoryId: 'herramientas-hidraulicas', title: 'Brochure Power Team 2025', pages: 20, yearOrType: 'Catálogo 2025 · PDF · Español', fileSize: '8.0 MB', description: 'Herramientas hidráulicas de alta presión Power Team: cilindros, bombas y accesorios.', pdfUrl: '/catalogo_pdfs/(03) Herramientas Hidraulicas/BROCHURE POWER TEAM 2025.pdf', pageImages: [] },
  { id: 'b-hh-2', categoryId: 'herramientas-hidraulicas', title: 'Catálogo Power Team en Español', pages: 80, yearOrType: 'Catálogo General · PDF · Español', fileSize: '15.0 MB', description: 'Catálogo completo Power Team: cilindros, bombas electro-hidráulicas y llaves de torque.', pdfUrl: '/catalogo_pdfs/(03) Herramientas Hidraulicas/CATALOGO EN ESPAÑOL POWER TEAM.pdf', pageImages: [] },
  // (04) Transformación de Materiales
  { id: 'b-tm-1', categoryId: 'transformacion-materiales', title: 'Brochure Transformación de Materiales', pages: 16, yearOrType: 'PDF · Español', fileSize: '6.0 MB', description: 'Soluciones para trituración, molienda y clasificación de materiales.', pdfUrl: '/catalogo_pdfs/(04) Transfomación de Materiales/brochure transformacion de Materiales.pdf', pageImages: [] },
  // (05) Filtración
  { id: 'b-fi-1', categoryId: 'filtracion-industrial', title: 'Brochure Filtración Industrial', pages: 16, yearOrType: 'PDF · Español', fileSize: '6.0 MB', description: 'Sistemas de filtración Lube & Fuel para purificación de aceites y combustibles.', pdfUrl: '/catalogo_pdfs/(05) Filtración/Brochure Filtración.pdf', pageImages: [] },
  { id: 'b-fi-2', categoryId: 'filtracion-industrial', title: 'Schroeder - Hydraulic Lube Catalog', pages: 60, yearOrType: 'Catálogo Técnico · PDF · Inglés', fileSize: '12.0 MB', description: 'Catálogo técnico completo Schroeder de elementos filtrantes hidráulicos.', pdfUrl: '/catalogo_pdfs/(05) Filtración/Schoroeder - HydraulicLubeCatalog.pdf', pageImages: [] },
  // (06) Marco LAB
  { id: 'b-ml-1', categoryId: 'marco-lab', title: 'Marco LAB - Laboratorio de Lubricantes', pages: 12, yearOrType: 'PDF · Español', fileSize: '5.0 MB', description: 'Servicios del laboratorio Marco LAB: análisis tribológico y diagnóstico de fluidos.', pdfUrl: '/catalogo_pdfs/(06) Marco LAB - Laboratorio de Lubricantes/Marco LAB.pdf', pageImages: [] },
  { id: 'b-ml-2', categoryId: 'marco-lab', title: 'PAMAS S40 - Contador de Partículas', pages: 8, yearOrType: 'Ficha Técnica · PDF · Español', fileSize: '3.0 MB', description: 'Especificaciones técnicas del contador de partículas PAMAS S40 para análisis ISO 4406.', pdfUrl: '/catalogo_pdfs/(06) Marco LAB - Laboratorio de Lubricantes/PAMAS S40_es.pdf', pageImages: [] },
  // (07) Mangueras Oleo Hidráulicas
  { id: 'b-moh-1', categoryId: 'mangueras-oleo-hidraulicas', title: 'Brochure Lubricación y Mangueras', pages: 16, yearOrType: 'PDF · Español', fileSize: '7.0 MB', description: 'Soluciones integradas de lubricación y mangueras oleo-hidráulicas.', pdfUrl: '/catalogo_pdfs/(07) Mangueras Oleo Hidráulicas/Brochure Lubricación y Mangueras.pdf', pageImages: [] },
  { id: 'b-moh-2', categoryId: 'mangueras-oleo-hidraulicas', title: 'Catálogo de Mangueras Aeroquip', pages: 50, yearOrType: 'Catálogo General · PDF · Español', fileSize: '10.0 MB', description: 'Catálogo completo Aeroquip de mangueras industriales de alta presión y accesorios.', pdfUrl: '/catalogo_pdfs/(07) Mangueras Oleo Hidráulicas/Catalogo de Mangueras Aeroquip.pdf', pageImages: [] },
  // (08) Componentes Oleo Hidráulicos
  { id: 'b-coh-1', categoryId: 'componentes-oleo-hidraulicos', title: 'Brochure Multimarca MARCO', pages: 40, yearOrType: 'Catálogo Corporativo · PDF · Español', fileSize: '9.8 MB', description: 'Portafolio consolidado de marcas globales representadas por MARCO.', pdfUrl: '/catalogo_pdfs/(08) Componentes y sistemas Oleo hidráulicos/BROCHURE MULTIMARCA MARCO.pdf', pageImages: [] },
  // (09) Transmisión de Potencia
  { id: 'b-tp-1', categoryId: 'transmision-potencia', title: 'Brevini S270 - Industrial Gearbox', pages: 20, yearOrType: 'Ficha Técnica · PDF · Inglés', fileSize: '5.0 MB', description: 'Especificaciones técnicas del reductor planetario Brevini S270.', pdfUrl: '/catalogo_pdfs/(09) Transmisión de Potencia/Brevini-S270-Industrial-Gearbox.pdf', pageImages: [] },
  { id: 'b-tp-2', categoryId: 'transmision-potencia', title: 'Brochure Multimarca MARCO - Transmisión', pages: 40, yearOrType: 'Catálogo Corporativo · PDF · Español', fileSize: '9.8 MB', description: 'Soluciones de transmisión de potencia del portafolio multimarca MARCO.', pdfUrl: '/catalogo_pdfs/(09) Transmisión de Potencia/BROCHURE MULTIMARCA MARCO.pdf', pageImages: [] },
  // (10) Soluciones Ingeniería Minería
  { id: 'b-sim-1', categoryId: 'soluciones-ingenieria-mineria', title: 'Brochure Proyectos Mineros', pages: 24, yearOrType: 'PDF · Español', fileSize: '8.0 MB', description: 'Soluciones de ingeniería integral para operaciones mineras.', pdfUrl: '/catalogo_pdfs/(10) Soluciones de Ingenieria para Minería/BROCHURE PROYECTOS MINEROS.pdf', pageImages: [] },
  // (11) Sistemas de Lubricación
  { id: 'b-sl-1', categoryId: 'sistemas-lubricacion', title: 'Brochures Sistemas de Lubricación', pages: 20, yearOrType: 'PDF · Español', fileSize: '7.0 MB', description: 'Sistemas automáticos de lubricación centralizada para equipos críticos.', pdfUrl: '/catalogo_pdfs/(11) Sistemas de Lubricación/Brochures Sistemas de Lubricacion.pdf', pageImages: [] },
  { id: 'b-sl-2', categoryId: 'sistemas-lubricacion', title: 'SKF - Lubricación Multilínea', pages: 30, yearOrType: 'Catálogo Técnico · PDF · Español', fileSize: '9.0 MB', description: 'Sistema de lubricación multilínea SKF para lubricación simultánea de múltiples puntos.', pdfUrl: '/catalogo_pdfs/(11) Sistemas de Lubricación/SKF - Lubricación Multilinea.pdf', pageImages: [] },
  // (12) Soluciones Anti Desgaste
  { id: 'b-sad-1', categoryId: 'soluciones-anti-desgaste', title: 'RMWT - Soluciones Anti Desgaste', pages: 20, yearOrType: 'PDF · Español', fileSize: '7.0 MB', description: 'Recubrimientos y revestimientos antidesgaste RMWT para equipos mineros e industriales.', pdfUrl: '/catalogo_pdfs/(12) Soluciones Anti Desgaste/Brochures RMWT - Soluciones Anti desgaste.pdf', pageImages: [] },
];

export const INITIAL_SPECIALISTS: Specialist[] = [
  { id: 'spec-1',  categoryId: 'lubricacion-industrial',       title: 'Lubricación Industrial',          role: 'Especialista Técnico Bel-Ray',          email: 'lubricacion@marco.com.pe', phone: '+51 987 654 321' },
  { id: 'spec-2',  categoryId: 'lubricacion-minera',           title: 'Lubricación Minera',               role: 'Especialista Técnico Bel-Ray Minería',   email: 'mineria@marco.com.pe',     phone: '+51 987 654 326' },
  { id: 'spec-3',  categoryId: 'herramientas-hidraulicas',     title: 'Herramientas Hidráulicas',         role: 'Especialista Power Team',               email: 'hidraulica@marco.com.pe',  phone: '+51 987 654 322' },
  { id: 'spec-4',  categoryId: 'transformacion-materiales',    title: 'Transformación de Materiales',     role: 'Especialista Técnico-Comercial',        email: 'procesamiento@marco.com.pe',phone: '+51 987 654 323' },
  { id: 'spec-5',  categoryId: 'filtracion-industrial',        title: 'Filtración Industrial',            role: 'Especialista Lube & Fuel',              email: 'filtracion@marco.com.pe',  phone: '+51 987 654 324' },
  { id: 'spec-6',  categoryId: 'marco-lab',                   title: 'MARCO Lab Tribología',             role: 'Asesor de Análisis de Aceite',          email: 'lab@marco.com.pe',         phone: '+51 987 654 325' },
  { id: 'spec-7',  categoryId: 'mangueras-oleo-hidraulicas',   title: 'Mangueras Hidráulicas',            role: 'Especialista en Conexiones Hidráulicas',email: 'mangueras@marco.com.pe',   phone: '+51 987 654 327' },
  { id: 'spec-8',  categoryId: 'componentes-oleo-hidraulicos', title: 'Componentes Hidráulicos',          role: 'Especialista en Sistemas Hidráulicos',  email: 'componentes@marco.com.pe', phone: '+51 987 654 328' },
  { id: 'spec-9',  categoryId: 'transmision-potencia',         title: 'Transmisión de Potencia',          role: 'Especialista Brevini',                  email: 'transmision@marco.com.pe', phone: '+51 987 654 329' },
  { id: 'spec-10', categoryId: 'soluciones-ingenieria-mineria',title: 'Proyectos Mineros',                role: 'Ingeniero de Proyectos',               email: 'proyectos@marco.com.pe',   phone: '+51 987 654 330' },
  { id: 'spec-11', categoryId: 'sistemas-lubricacion',         title: 'Sistemas de Lubricación',          role: 'Especialista SKF',                      email: 'sistemas@marco.com.pe',    phone: '+51 987 654 331' },
  { id: 'spec-12', categoryId: 'soluciones-anti-desgaste',     title: 'Soluciones Anti Desgaste',         role: 'Especialista RMWT',                     email: 'antidesgaste@marco.com.pe',phone: '+51 987 654 332' },
];

// ── Helpers de Caché Local (localStorage) ────────────────────────────────────

const CACHE_KEYS = {
  CATEGORIES: 'totem_marco_categories_cache',
  BROCHURES: 'totem_marco_brochures_cache',
  SPECIALISTS: 'totem_marco_specialists_cache',
  SETTINGS: 'totem_marco_settings_cache',
  STATS: 'totem_marco_stats_cache',
  LEADS: 'totem_marco_leads_cache',
  INITIALIZED: 'totem_marco_cache_initialized_v2'
};

export interface LocalDataCache {
  categories: Category[];
  brochures: Brochure[];
  specialists: Specialist[];
  settings: KioskSettings;
  stats: { views: number; sessions: number };
  leads: Lead[];
}

export function loadLocalDataCache(): LocalDataCache {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        categories: INITIAL_CATEGORIES,
        brochures: INITIAL_BROCHURES,
        specialists: INITIAL_SPECIALISTS,
        settings: INITIAL_SETTINGS,
        stats: INITIAL_STATS,
        leads: []
      };
    }

    const savedCats = localStorage.getItem(CACHE_KEYS.CATEGORIES);
    const savedBros = localStorage.getItem(CACHE_KEYS.BROCHURES);
    const savedSpecs = localStorage.getItem(CACHE_KEYS.SPECIALISTS);
    const savedSets = localStorage.getItem(CACHE_KEYS.SETTINGS);
    const savedStats = localStorage.getItem(CACHE_KEYS.STATS);
    const savedLeads = localStorage.getItem(CACHE_KEYS.LEADS);

    return {
      categories: savedCats ? JSON.parse(savedCats) : INITIAL_CATEGORIES,
      brochures: savedBros ? JSON.parse(savedBros) : INITIAL_BROCHURES,
      specialists: savedSpecs ? JSON.parse(savedSpecs) : INITIAL_SPECIALISTS,
      settings: savedSets ? JSON.parse(savedSets) : INITIAL_SETTINGS,
      stats: savedStats ? JSON.parse(savedStats) : INITIAL_STATS,
      leads: savedLeads ? JSON.parse(savedLeads) : []
    };
  } catch (e) {
    console.warn('[Cache] Error leyendo localStorage, usando defaults:', e);
    return {
      categories: INITIAL_CATEGORIES,
      brochures: INITIAL_BROCHURES,
      specialists: INITIAL_SPECIALISTS,
      settings: INITIAL_SETTINGS,
      stats: INITIAL_STATS,
      leads: []
    };
  }
}

export function saveLocalDataCache(data: Partial<LocalDataCache>): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (data.categories) localStorage.setItem(CACHE_KEYS.CATEGORIES, JSON.stringify(data.categories));
    if (data.brochures) localStorage.setItem(CACHE_KEYS.BROCHURES, JSON.stringify(data.brochures));
    if (data.specialists) localStorage.setItem(CACHE_KEYS.SPECIALISTS, JSON.stringify(data.specialists));
    if (data.settings) localStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(data.settings));
    if (data.stats) localStorage.setItem(CACHE_KEYS.STATS, JSON.stringify(data.stats));
    if (data.leads) localStorage.setItem(CACHE_KEYS.LEADS, JSON.stringify(data.leads));
    localStorage.setItem(CACHE_KEYS.INITIALIZED, 'true');
  } catch (e) {
    console.warn('[Cache] Error guardando en localStorage:', e);
  }
}

export function resetLocalDataCache(): LocalDataCache {
  const defaults: LocalDataCache = {
    categories: INITIAL_CATEGORIES,
    brochures: INITIAL_BROCHURES,
    specialists: INITIAL_SPECIALISTS,
    settings: INITIAL_SETTINGS,
    stats: INITIAL_STATS,
    leads: []
  };
  saveLocalDataCache(defaults);
  return defaults;
}
