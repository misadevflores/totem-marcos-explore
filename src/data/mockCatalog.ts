import { Category, Brochure, Specialist, KioskSettings, Lead } from '../types';

// Datos iniciales reales del catálogo MARCO (12 categorías, 20 PDFs, 12 especialistas)
// Estos datos garantizan que en cualquier instalación limpia la app cargue inmediatamente con todo el catálogo.

export const INITIAL_SETTINGS: KioskSettings = {
  idleTimeoutSeconds: 35,
  autoResetConfirmationSeconds: 20,
  enableVirtualKeyboard: true,
  totemFrameMode: false,
  companyName: 'MARCO Peru',
  eventTitle: 'Expomina 2026',
  cloudSyncUrl: ''
};

export const INITIAL_STATS = {
  views: 286,
  sessions: 173
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "lubricacion-industrial",
    code: "01",
    title: "Lubricación Industrial",
    subtitle: "Soluciones especializadas de lubricación para proteger componentes",
    color: "#8B002A",
    bgLight: "#FDF2F4",
    bannerTitle: "Lubricación Industrial",
    bannerDescription: "Soluciones especializadas de lubricación para proteger componentes, reducir el desgaste y mejorar la confiabilidad de equipos y procesos industriales, incluso bajo condiciones exigentes de operación.",
    applications: [
      "• Reductores y cajas de engranajes: protección frente al desgaste, altas cargas y temperaturas.",
      "• Rodamientos y sistemas de transmisión: lubricación para motores, ventiladores, bombas y equipos rotativos.",
      "• Compresores y sistemas hidráulicos: lubricantes para una operación eficiente, estable y confiable.",
      "• Maquinaria y procesos industriales: soluciones para equipos de producciónsometidos a operación continua y condiciones exigentes."
    ],
    brochureCount: 2,
    iconName: "Droplets"
  },
  {
    id: "lubricacion-minera",
    code: "02",
    title: "Lubricación Minera",
    subtitle: "Soluciones de lubricación de alto desempeño desarrolladas para proteger equipos y componentes críticos",
    color: "#7C1D1D",
    bgLight: "#FEF2F2",
    bannerTitle: "Lubricación Minera",
    bannerDescription: "Soluciones de lubricación de alto desempeño desarrolladas para proteger equipos y componentes críticos, extender su vida útil y mejorar la confiabilidad de las operaciones mineras, incluso bajo condiciones extremas de carga, temperatura, polvo y contaminación.",
    applications: [
      "• Equipos móviles de mina: lubricación para camiones, palas, cargadores, perforadoras y maquinaria pesada.",
      "• Chancado y molienda: protección de chancadoras, molinos, engranajes abiertos, rodamientos y componentes sometidos a altas cargas.",
      "• Fajas y sistemas de transporte: lubricación de rodamientos, reductores y mecanismos de transmisión.",
      "• Equipos de planta concentradora: soluciones para bombas, motores, celdas de flotación y otros equipos críticos del proceso."
    ],
    brochureCount: 2,
    iconName: "Droplets"
  },
  {
    id: "herramientas-hidraulicas",
    code: "03",
    title: "Herramientas Hidráulicas",
    subtitle: "Soluciones hidráulicas de alta presión para mantenimiento y montaje",
    color: "#1E2530",
    bgLight: "#F1F5F9",
    bannerTitle: "Herramientas Hidráulicas",
    bannerDescription: "Soluciones hidráulicas de alta presión para generar y controlar grandes fuerzas con precisión y seguridad en trabajos de mantenimiento, montaje y reparación de equipos industriales y mineros.",
    applications: [
      "• Elevación y posicionamiento de cargas: cilindros y gatos hidráulicos para levantar, nivelar y posicionar equipos y componentes pesados.",
      "• Montaje y desmontaje de componentes: herramientas para facilitar trabajos de extracción, separación, empuje y ajuste de piezas.",
      "• Mantenimiento de equipos pesados: soluciones hidráulicas para intervenciones seguras y eficientes en maquinaria y equipos de gran tamaño.",
      "• Torque y tensionado: herramientas hidráulicas para el ajuste y control preciso de uniones empernadas en aplicaciones críticas."
    ],
    brochureCount: 2,
    iconName: "Wrench"
  },
  {
    id: "transformacion-materiales",
    code: "04",
    title: "Transformación de Materiales",
    subtitle: "Soluciones especializadas en trituración, molienda y procesamiento de materiales",
    color: "#991B1B",
    bgLight: "#FEF2F2",
    bannerTitle: "Transformación de Materiales",
    bannerDescription: "Soluciones especializadas en trituración, molienda y procesamiento de materiales, integrando equipos, repuestos y piezas de desgaste diseñados para brindar alto rendimiento y confiabilidad en operaciones exigentes.",
    applications: [
      "• Trituración y cribado: equipos y componentes para trituradoras de mandíbulas, conos, HSI, VSI y sistemas de clasificación de materiales.",
      "• Piezas de desgaste: repuestos y componentes fabricados en aleaciones especiales para aplicaciones sometidas a abrasión, impacto y altas exigencias operativas.",
      "• Molienda: blindajes, placas y rejillas para molinos, desarrollados de acuerdo con las condiciones específicas de cada operación.",
      "• Manejo de lodos: componentes y repuestos para bombas de lodos, incluyendo carcasas, rodetes y tapas en aleaciones anti-desgaste."
    ],
    brochureCount: 1,
    iconName: "Boxes"
  },
  {
    id: "filtracion-industrial",
    code: "05",
    title: "Filtración Industrial",
    subtitle: "Soluciones para la purificación y control de contaminación en combustibles y aceites",
    color: "#065F46",
    bgLight: "#ECFDF5",
    bannerTitle: "Filtración Industrial",
    bannerDescription: "Soluciones para la purificación y control de contaminación en combustibles y aceites, orientadas a proteger componentes críticos, reducir fallas y mejorar la confiabilidad y disponibilidad de los equipos.",
    applications: [
      "• Purificación de combustible diésel: separación de agua y partículas contaminantes para proteger motores y sistemas de inyección.",
      "• Aceites hidráulicos: control de contaminación para mantener la confiabilidad y prolongar la vida útil de componentes hidráulicos.",
      "• Equipos y motores diésel: protección de sistemas críticos frente a contaminantes que generan desgaste, fallas y mantenimiento no planificado.",
      "• Grupos electrógenos y sistemas industriales: tratamiento de combustibles y aceites para favorecer una operación continua y confiable."
    ],
    brochureCount: 2,
    iconName: "Filter"
  },
  {
    id: "marco-lab",
    code: "06",
    title: "MARCO Lab",
    subtitle: "Laboratorio de Lubricantes - análisis tribológico",
    color: "#1E3A8A",
    bgLight: "#EFF6FF",
    bannerTitle: "MARCO Lab",
    bannerDescription: "Laboratorio especializado en análisis de lubricantes y monitoreo de condición, orientado a identificar contaminación, desgaste y cambios en las propiedades del lubricante para contribuir a la confiabilidad y disponibilidad de los equipos.",
    applications: [
      "• Análisis de aceites lubricantes: evaluación de la condición del lubricante para detectar cambios que puedan afectar el desempeño de los equipos.",
      "• Monitoreo de desgaste: identificación de partículas y contaminantes asociados al desgaste de componentes.",
      "• Control de contaminación: medición y conteo de partículas en aceites hidráulicos, lubricantes y combustibles.",
      "• Mantenimiento predictivo: generación de información para apoyar la toma de decisiones, anticipar fallas y optimizar los intervalos de mantenimiento."
    ],
    brochureCount: 2,
    iconName: "FlaskConical"
  },
  {
    id: "mangueras-oleo-hidraulicas",
    code: "07",
    title: "Mangueras Oleo Hidráulicas",
    subtitle: "Aeroquip y mangueras de alta presión",
    color: "#92400E",
    bgLight: "#FFFBEB",
    bannerTitle: "Mangueras Oleo Hidráulicas",
    bannerDescription: "Confiabilidad y resistencia para sistemas hidráulicos de alta exigencia. Soluciones en mangueras y conexiones oleohidráulicas Danfoss, diseñadas para responder a diferentes condiciones de presión, temperatura y resistencia a la abrasión, con alternativas para diversas aplicaciones en minería e industria.",
    applications: [
      "• Mangueras hidráulicas trenzadas de 1 y 2 hilos.",
      "• Mangueras hidráulicas espirales de 4 hilos.",
      "• Mangueras termoplásticas.",
      "• Mangueras estándar y de alto rendimiento.",
      "• Conexiones y accesorios.",
      "• Soluciones y conjuntos para diferentes requerimientos de sistemas hidráulicos."
    ],
    brochureCount: 2,
    iconName: "Zap"
  },
  {
    id: "componentes-oleo-hidraulicos",
    code: "08",
    title: "Componentes y Sistemas Oleo Hidráulicos",
    subtitle: "Soluciones en componentes oleo hidráulicos y control de movimiento",
    color: "#3B0764",
    bgLight: "#FAF5FF",
    bannerTitle: "Componentes y Sistemas Oleo Hidráulicos",
    bannerDescription: "Soluciones en componentes oleo hidráulicos y control de movimiento para maquinaria y sistemas de minería e industria, con un portafolio multimarca para aplicaciones de media y alta presión.",
    applications: [
      "• Bombas hidráulicas: bombas de pistones, paletas y otras configuraciones para sistemas industriales y equipos móviles.",
      "• Motores hidráulicos: soluciones de alto torque y baja velocidad para maquinaria minera e industrial.",
      "• Válvulas y control: válvulas modulares, direccionales y soluciones electrohidráulicas para el control preciso de los sistemas.",
      "• Unidades de potencia hidráulica (UPH): diseño e integración de sistemas con bombas, motores, válvulas, tanques, filtración y sistemas de control."
    ],
    brochureCount: 1,
    iconName: "Settings"
  },
  {
    id: "transmision-potencia",
    code: "09",
    title: "Transmisión de Potencia",
    subtitle: "Soluciones para la transmisión, control y gestión de potencia mecánica",
    color: "#1C4532",
    bgLight: "#F0FDF4",
    bannerTitle: "Transmisión de Potencia",
    bannerDescription: "Soluciones para la transmisión, control y gestión de potencia mecánica en equipos industriales y mineros, integrando tecnologías de alto desempeño para aplicaciones sometidas a elevados torques y condiciones exigentes de operación.",
    applications: [
      "• Reductores y accionamientos: reductores planetarios, helicoidales y cónico-helicoidales para maquinaria y equipos industriales de alta exigencia.",
      "• Acoplamientos: soluciones para la transmisión de potencia entre equipos motrices y accionados en aplicaciones industriales y mineras.",
      "• Sistemas de frenado: frenos industriales para el control y parada segura de equipos y sistemas de movimiento. VULKAN incluye específicamente soluciones de frenado hidráulico para aplicaciones industriales.",
      "• Accionamientos de alto torque: soluciones para aplicaciones que requieren elevada capacidad de transmisión, incluyendo manejo de materiales, minería y equipos industriales de alta potencia."
    ],
    brochureCount: 2,
    iconName: "Settings"
  },
  {
    id: "soluciones-ingenieria-mineria",
    code: "10",
    title: "Soluciones de Ingeniería para Minería",
    subtitle: "Diseñamos y desarrollamos soluciones de ingeniería a medida",
    color: "#0C4A6E",
    bgLight: "#F0F9FF",
    bannerTitle: "Soluciones de Ingeniería para Minería",
    bannerDescription: "Diseñamos y desarrollamos soluciones de ingeniería a medida para optimizar tareas críticas de mantenimiento en operaciones mineras, orientadas a reducir tiempos de intervención, mejorar la seguridad y aumentar la eficiencia operativa.",
    applications: [
      "• Mantenimiento de molinos: plataformas hidráulicas y soluciones para facilitar trabajos en molinos SAG y de bolas, incluyendo cambio de revestimientos y extracción de pernos.",
      "• Mantenimiento de chancadoras: sistemas especializados para extracción, manipulación y mantenimiento de componentes críticos en chancado primario.",
      "• Izaje y manipulación de componentes: soluciones remotas que permiten reducir maniobras de izaje y la exposición del personal durante trabajos críticos.",
      "• Trabajos de mantenimiento en altura: plataformas y sistemas hidráulicos para facilitar labores de inspección, corte, esmerilado, soldadura y mantenimiento en zonas de difícil acceso."
    ],
    brochureCount: 1,
    iconName: "Settings"
  },
  {
    id: "sistemas-lubricacion",
    code: "11",
    title: "Sistemas de Lubricación",
    subtitle: "Diseño e implementación de sistemas y equipos de lubricación para minería e industria",
    color: "#7C3AED",
    bgLight: "#F5F3FF",
    bannerTitle: "Sistemas de Lubricación",
    bannerDescription: "Diseño e implementación de sistemas y equipos de lubricación para minería e industria, desde soluciones automatizadas hasta proyectos desarrollados a medida, orientados a optimizar el suministro y control de lubricantes en equipos y procesos críticos.",
    applications: [
      "• Camiones lubricadores: diseño y fabricación de camiones lubricadores para minería subterránea y de superficie, configurados para el almacenamiento, bombeo, filtración y suministro de aceites, grasas, refrigerantes y recuperación de aceite usado.",
      "• Lubricación automática de equipos: sistemas progresivos y soluciones automatizadas para maquinaria móvil, orientados a suministrar lubricante de manera controlada en los diferentes puntos de lubricación.",
      "• Sistemas de lubricación para molinos: soluciones de lubricación con aceite y sistemas de engrase automático para componentes críticos, incluyendo aplicaciones en catalinas de molinos.",
      "• Bahías y estaciones de lubricación: diseño e implementación de instalaciones para almacenamiento, filtración, bombeo, despacho y control del consumo de lubricantes."
    ],
    brochureCount: 2,
    iconName: "Activity"
  },
  {
    id: "soluciones-anti-desgaste",
    code: "12",
    title: "Soluciones Anti Desgaste",
    subtitle: "Soluciones especializadas para proteger equipos y componentes sometidos a abrasión e impacto",
    color: "#B45309",
    bgLight: "#FFFBEB",
    bannerTitle: "Soluciones Anti Desgaste",
    bannerDescription: "Soluciones especializadas para proteger equipos y componentes sometidos a abrasión e impacto, mediante revestimientos, materiales y desarrollos a medida orientados a extender la vida útil y mejorar la disponibilidad de los equipos en minería e industria.",
    applications: [
      "• Chutes y puntos de transferencia: revestimientos antidesgaste para zonas sometidas a abrasión, impacto y flujo continuo de mineral.",
      "• Chancado y procesamiento de mineral: protección de componentes como Main Frame Liners, Skirt Liners, octógonos de chancado primario y otros elementos expuestos a desgaste severo.",
      "• Equipos de movimiento de tierra: revestimientos y elementos de protección para baldes, palas, cargadores, excavadoras y bulldozers.",
      "• Fabricaciones y revestimientos especiales: diseño de soluciones a medida mediante materiales bimetálicos, fundidos, cerámicos, caucho-cerámicos y elementos de alto impacto."
    ],
    brochureCount: 1,
    iconName: "Shield"
  }
];

export const INITIAL_BROCHURES: Brochure[] = [
  {
    id: "b-lu-ind-1",
    categoryId: "lubricacion-industrial",
    title: "Brochure Lubricación Industrial",
    pages: 16,
    yearOrType: "PDF · Español",
    fileSize: "12.3 MB",
    description: "Catálogo general con soluciones de lubricación para maquinaria pesada de minería y plantas de procesamiento.",
    pdfUrl: "/catalogo_pdfs/(01) Lubricación Industrial/Brochure Lubricación.pdf",
    pageImages: []
  },
  {
    id: "b-lu-ind-2",
    categoryId: "lubricacion-industrial",
    title: "Catálogo General Cogelsa 2026",
    pages: 40,
    yearOrType: "Edición 2026 · PDF · Español",
    fileSize: "6.0 MB",
    description: "Catálogo completo de productos Cogelsa para lubricación industrial.",
    pdfUrl: "/catalogo_pdfs/(01) Lubricación Industrial/CATALOGO-GENERAL-COGELSA-2026_LD.pdf",
    pageImages: []
  },
  {
    id: "b-lu-min-1",
    categoryId: "lubricacion-minera",
    title: "Brochure Lubricación Minera",
    pages: 16,
    yearOrType: "PDF · Español",
    fileSize: "12.3 MB",
    description: "Soluciones de lubricación especializadas para el sector minero.",
    pdfUrl: "/catalogo_pdfs/(02) Lubricación Minera/Brochure Lubricación.pdf",
    pageImages: []
  },
  {
    id: "b-lu-min-2",
    categoryId: "lubricacion-minera",
    title: "Bel-Ray Mining Brochure 2025",
    pages: 24,
    yearOrType: "Edición 2025 · PDF · Inglés",
    fileSize: "3.0 MB",
    description: "Guía especializada de lubricantes Bel-Ray para aplicaciones mineras.",
    pdfUrl: "/catalogo_pdfs/(02) Lubricación Minera/Mining-Brochure_BEL RAY 2025.pdf",
    pageImages: []
  },
  {
    id: "b-hh-1",
    categoryId: "herramientas-hidraulicas",
    title: "Brochure Power Team 2025",
    pages: 20,
    yearOrType: "Catálogo 2025 · PDF · Español",
    fileSize: "6.2 MB",
    description: "Herramientas hidráulicas de alta presión Power Team: cilindros, bombas y accesorios.",
    pdfUrl: "/catalogo_pdfs/(03) Herramientas Hidraulicas/BROCHURE POWER TEAM 2025.pdf",
    pageImages: []
  },
  {
    id: "b-hh-2",
    categoryId: "herramientas-hidraulicas",
    title: "Catálogo Power Team en Español",
    pages: 80,
    yearOrType: "Catálogo General · PDF · Español",
    fileSize: "64.1 MB",
    description: "Catálogo completo Power Team: cilindros, bombas electro-hidráulicas y llaves de torque.",
    pdfUrl: "/catalogo_pdfs/(03) Herramientas Hidraulicas/CATALOGO EN ESPAÑOL POWER TEAM.pdf",
    pageImages: []
  },
  {
    id: "b-tm-1",
    categoryId: "transformacion-materiales",
    title: "Brochure Transformación de Materiales",
    pages: 16,
    yearOrType: "PDF · Español",
    fileSize: "15.3 MB",
    description: "Soluciones para trituración, molienda y clasificación de materiales.",
    pdfUrl: "/catalogo_pdfs/(04) Transfomación de Materiales/brochure transformacion de Materiales.pdf",
    pageImages: []
  },
  {
    id: "b-fi-1",
    categoryId: "filtracion-industrial",
    title: "Brochure Filtración Industrial",
    pages: 16,
    yearOrType: "PDF · Español",
    fileSize: "10.5 MB",
    description: "Sistemas de filtración Lube & Fuel para purificación de aceites y combustibles.",
    pdfUrl: "/catalogo_pdfs/(05) Filtración/Brochure Filtración.pdf",
    pageImages: []
  },
  {
    id: "b-fi-2",
    categoryId: "filtracion-industrial",
    title: "Schroeder - Hydraulic Lube Catalog",
    pages: 60,
    yearOrType: "Catálogo Técnico · PDF · Inglés",
    fileSize: "50.2 MB",
    description: "Catálogo técnico completo Schroeder de elementos filtrantes hidráulicos.",
    pdfUrl: "/catalogo_pdfs/(05) Filtración/Schoroeder - HydraulicLubeCatalog.pdf",
    pageImages: []
  },
  {
    id: "b-ml-1",
    categoryId: "marco-lab",
    title: "Marco LAB - Laboratorio de Lubricantes",
    pages: 12,
    yearOrType: "PDF · Español",
    fileSize: "3.8 MB",
    description: "Servicios del laboratorio Marco LAB: análisis tribológico y diagnóstico de fluidos.",
    pdfUrl: "/catalogo_pdfs/(06) Marco LAB - Laboratorio de Lubricantes/Marco LAB.pdf",
    pageImages: []
  },
  {
    id: "b-ml-2",
    categoryId: "marco-lab",
    title: "PAMAS S40 - Contador de Partículas",
    pages: 8,
    yearOrType: "Ficha Técnica · PDF · Español",
    fileSize: "1.3 MB",
    description: "Especificaciones técnicas del contador de partículas PAMAS S40 para análisis ISO 4406.",
    pdfUrl: "/catalogo_pdfs/(06) Marco LAB - Laboratorio de Lubricantes/PAMAS S40_es.pdf",
    pageImages: []
  },
  {
    id: "b-moh-1",
    categoryId: "mangueras-oleo-hidraulicas",
    title: "Brochure Lubricación y Mangueras",
    pages: 16,
    yearOrType: "PDF · Español",
    fileSize: "12.3 MB",
    description: "Soluciones integradas de lubricación y mangueras oleo-hidráulicas.",
    pdfUrl: "/catalogo_pdfs/(07) Mangueras Oleo Hidráulicas/Brochure Lubricación y Mangueras.pdf",
    pageImages: []
  },
  {
    id: "b-moh-2",
    categoryId: "mangueras-oleo-hidraulicas",
    title: "Catálogo de Mangueras Aeroquip",
    pages: 50,
    yearOrType: "Catálogo General · PDF · Español",
    fileSize: "29.0 MB",
    description: "Catálogo completo Aeroquip de mangueras industriales de alta presión y accesorios.",
    pdfUrl: "/catalogo_pdfs/(07) Mangueras Oleo Hidráulicas/Catalogo de Mangueras Aeroquip.pdf",
    pageImages: []
  },
  {
    id: "b-coh-1",
    categoryId: "componentes-oleo-hidraulicos",
    title: "Brochure Multimarca MARCO",
    pages: 40,
    yearOrType: "Catálogo Corporativo · PDF · Español",
    fileSize: "78.6 MB",
    description: "Portafolio consolidado de marcas globales representadas por MARCO.",
    pdfUrl: "/catalogo_pdfs/(08) Componentes y sistemas Oleo hidráulicos/BROCHURE MULTIMARCA MARCO.pdf",
    pageImages: []
  },
  {
    id: "b-tp-1",
    categoryId: "transmision-potencia",
    title: "Brevini S270 - Industrial Gearbox",
    pages: 20,
    yearOrType: "Ficha Técnica · PDF · Inglés",
    fileSize: "16.2 MB",
    description: "Especificaciones técnicas del reductor planetario Brevini S270.",
    pdfUrl: "/catalogo_pdfs/(09) Transmisión de Potencia/Brevini-S270-Industrial-Gearbox.pdf",
    pageImages: []
  },
  {
    id: "b-tp-2",
    categoryId: "transmision-potencia",
    title: "Brochure Multimarca MARCO - Transmisión",
    pages: 40,
    yearOrType: "Catálogo Corporativo · PDF · Español",
    fileSize: "78.6 MB",
    description: "Soluciones de transmisión de potencia del portafolio multimarca MARCO.",
    pdfUrl: "/catalogo_pdfs/(09) Transmisión de Potencia/BROCHURE MULTIMARCA MARCO.pdf",
    pageImages: []
  },
  {
    id: "b-sim-1",
    categoryId: "soluciones-ingenieria-mineria",
    title: "Brochure Proyectos Mineros",
    pages: 24,
    yearOrType: "PDF · Español",
    fileSize: "68.7 MB",
    description: "Soluciones de ingeniería integral para operaciones mineras.",
    pdfUrl: "/catalogo_pdfs/(10) Soluciones de Ingenieria para Minería/BROCHURE PROYECTOS MINEROS.pdf",
    pageImages: []
  },
  {
    id: "b-sl-1",
    categoryId: "sistemas-lubricacion",
    title: "Brochures Sistemas de Lubricación",
    pages: 20,
    yearOrType: "PDF · Español",
    fileSize: "3.2 MB",
    description: "Sistemas automáticos de lubricación centralizada para equipos críticos.",
    pdfUrl: "/catalogo_pdfs/(11) Sistemas de Lubricación/Brochures Sistemas de Lubricacion.pdf",
    pageImages: []
  },
  {
    id: "b-sl-2",
    categoryId: "sistemas-lubricacion",
    title: "SKF - Lubricación Multilínea",
    pages: 30,
    yearOrType: "Catálogo Técnico · PDF · Español",
    fileSize: "5.1 MB",
    description: "Sistema de lubricación multilínea SKF para lubricación simultánea de múltiples puntos.",
    pdfUrl: "/catalogo_pdfs/(11) Sistemas de Lubricación/SKF - Lubricación Multilinea.pdf",
    pageImages: []
  },
  {
    id: "b-sad-1",
    categoryId: "soluciones-anti-desgaste",
    title: "RMWT - Soluciones Anti Desgaste",
    pages: 20,
    yearOrType: "PDF · Español",
    fileSize: "28.0 MB",
    description: "Recubrimientos y revestimientos antidesgaste RMWT para equipos mineros e industriales.",
    pdfUrl: "/catalogo_pdfs/(12) Soluciones Anti Desgaste/Brochures RMWT - Soluciones Anti desgaste.pdf",
    pageImages: []
  }
];

export const INITIAL_SPECIALISTS: Specialist[] = [
  { id: 'spec-1',  categoryId: 'lubricacion-industrial',        title: 'Lubricación Industrial',           role: 'Especialista Técnico Bel-Ray',           email: 'lubricacion@marco.com.pe',  phone: '+51 987 654 321' },
  { id: 'spec-2',  categoryId: 'lubricacion-minera',            title: 'Lubricación Minera',                role: 'Especialista Técnico Bel-Ray Minería',    email: 'mineria@marco.com.pe',      phone: '+51 987 654 326' },
  { id: 'spec-3',  categoryId: 'herramientas-hidraulicas',      title: 'Herramientas Hidráulicas',          role: 'Especialista Power Team',                email: 'hidraulica@marco.com.pe',   phone: '+51 987 654 322' },
  { id: 'spec-4',  categoryId: 'transformacion-materiales',     title: 'Transformación de Materiales',      role: 'Especialista Técnico-Comercial',         email: 'procesamiento@marco.com.pe', phone: '+51 987 654 323' },
  { id: 'spec-5',  categoryId: 'filtracion-industrial',         title: 'Filtración Industrial',             role: 'Especialista Lube & Fuel',               email: 'filtracion@marco.com.pe',   phone: '+51 987 654 324' },
  { id: 'spec-6',  categoryId: 'marco-lab',                    title: 'MARCO Lab Tribología',              role: 'Asesor de Análisis de Aceite',           email: 'lab@marco.com.pe',          phone: '+51 987 654 325' },
  { id: 'spec-7',  categoryId: 'mangueras-oleo-hidraulicas',    title: 'Mangueras Hidráulicas',             role: 'Especialista en Conexiones Hidráulicas', email: 'mangueras@marco.com.pe',    phone: '+51 987 654 327' },
  { id: 'spec-8',  categoryId: 'componentes-oleo-hidraulicos',  title: 'Componentes Hidráulicos',           role: 'Especialista en Sistemas Hidráulicos',   email: 'componentes@marco.com.pe',  phone: '+51 987 654 328' },
  { id: 'spec-9',  categoryId: 'transmision-potencia',          title: 'Transmisión de Potencia',           role: 'Especialista Brevini',                   email: 'transmision@marco.com.pe',  phone: '+51 987 654 329' },
  { id: 'spec-10', categoryId: 'soluciones-ingenieria-mineria', title: 'Proyectos Mineros',                 role: 'Ingeniero de Proyectos',                email: 'proyectos@marco.com.pe',    phone: '+51 987 654 330' },
  { id: 'spec-11', categoryId: 'sistemas-lubricacion',          title: 'Sistemas de Lubricación',           role: 'Especialista SKF',                       email: 'sistemas@marco.com.pe',     phone: '+51 987 654 331' },
  { id: 'spec-12', categoryId: 'soluciones-anti-desgaste',      title: 'Soluciones Anti Desgaste',          role: 'Especialista RMWT',                      email: 'antidesgaste@marco.com.pe', phone: '+51 987 654 332' },
];

export interface LocalDataCache {
  categories: Category[];
  brochures: Brochure[];
  specialists: Specialist[];
  settings: KioskSettings;
  stats: { views: number; sessions: number };
  leads: Lead[];
}

export function loadLocalDataCache(): LocalDataCache {
  return {
    categories: INITIAL_CATEGORIES,
    brochures: INITIAL_BROCHURES,
    specialists: INITIAL_SPECIALISTS,
    settings: INITIAL_SETTINGS,
    stats: INITIAL_STATS,
    leads: []
  };
}

export function saveLocalDataCache(_data: Partial<LocalDataCache>): void {
  // Los datos se persisten en SQLite
}

export function resetLocalDataCache(): LocalDataCache {
  return {
    categories: INITIAL_CATEGORIES,
    brochures: INITIAL_BROCHURES,
    specialists: INITIAL_SPECIALISTS,
    settings: INITIAL_SETTINGS,
    stats: INITIAL_STATS,
    leads: []
  };
}
