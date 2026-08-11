import { Category, Brochure, Specialist } from '../types';
import brochureMultimarcaPdf from '../../assets/pdf/BROCHURE MULTIMARCA MARCO.pdf';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'lubricacion-industrial',
    code: 'LU',
    title: 'Lubricación Industrial',
    subtitle: 'Bel-Ray y soluciones especializadas para minería e industria pesada',
    color: '#8B002A',
    bgLight: '#FDF2F4',
    bannerTitle: 'BEL-RAY',
    bannerDescription: 'Lubricantes de alto desempeño para minería, industria y aplicaciones severas con máxima protección térmica y antidesgaste.',
    applications: [
      'Motores diésel de alta potencia y transmisiones',
      'Sistemas hidráulicos de maquinaria de mina',
      'Reductores, engranajes abiertos y mandos finales',
      'Grasas complejas de sulfonato de calcio y litio'
    ],
    brochureCount: 4,
    iconName: 'Droplets'
  },
  {
    id: 'herramientas-hidraulicas',
    code: 'HH',
    title: 'Herramientas Hidráulicas',
    subtitle: 'Power Team y equipos de alta presión para mantenimiento crítico',
    color: '#1E2530',
    bgLight: '#F1F5F9',
    bannerTitle: 'POWER TEAM',
    bannerDescription: 'Cilindros, bombas, llaves de torque e hidráulica de alta presión (hasta 10,000 PSI) con certificación internacional.',
    applications: [
      'Cilindros de simple y doble efecto de alto tonelaje',
      'Bombas electrohidráulicas y neumáticas portátiles',
      'Llaves de torque hidráulicas y tensionadores de pernos',
      'Extractores mecánicos e hidráulicos de rodamientos'
    ],
    brochureCount: 3,
    iconName: 'Wrench'
  },
  {
    id: 'transformacion-materiales',
    code: 'TM',
    title: 'Transformación de Materiales',
    subtitle: 'Trituración, molienda, clasificación y revestimientos antidesgaste',
    color: '#991B1B',
    bgLight: '#FEF2F2',
    bannerTitle: 'PROCESAMIENTO & TRITURACIÓN',
    bannerDescription: 'Equipos y repuestos de alto impacto para plantas concentradoras, chancado secundario/terciario y manejo de minerales.',
    applications: [
      'Revestimientos de chancadoras de quijada y cónicas',
      'Mallas de clasificación metálicas y en poliuretano',
      'Componentes para molinos SAG y de bolas',
      'Sistemas de transportadores y limpiadores de faja'
    ],
    brochureCount: 3,
    iconName: 'Boxes'
  },
  {
    id: 'filtracion-industrial',
    code: 'FI',
    title: 'Filtración Industrial',
    subtitle: 'Sistemas Lube & Fuel y consumibles de alta eficiencia',
    color: '#065F46',
    bgLight: '#ECFDF5',
    bannerTitle: 'FILTRACIÓN LUBE & FUEL',
    bannerDescription: 'Purificación y remoción de partículas de polvo, agua y barnices en fluidos industriales de gran volumen.',
    applications: [
      'Carros de filtración de aceite hidráulico dializado',
      'Coalescedores para eliminación de agua libre en diésel',
      'Filtros de aire de alto flujo para entornos polvorientos',
      'Elementos filtrantes absolutos micro-glass (Beta > 1000)'
    ],
    brochureCount: 3,
    iconName: 'Filter'
  },
  {
    id: 'marco-lab',
    code: 'ML',
    title: 'MARCO Lab',
    subtitle: 'Análisis de aceite, diagnóstico tribológico y monitoreo de condición',
    color: '#1E3A8A',
    bgLight: '#EFF6FF',
    bannerTitle: 'MARCO LAB TRIBOLOGÍA',
    bannerDescription: 'Laboratorio acreditado para diagnóstico preventivo de fluidos, conteo de partículas ISO y espectrometría de desgaste.',
    applications: [
      'Análisis elemental FTIR para detección de contaminantes',
      'Conteo automático de partículas según Norma ISO 4406',
      'Viscosidad cinemática a 40°C y 100°C',
      'Interpretación técnica por tribólogos senior'
    ],
    brochureCount: 2,
    iconName: 'FlaskConical'
  },
  {
    id: 'brochure-multimarca',
    code: 'MM',
    title: 'Brochure Multimarca',
    subtitle: 'Portafolio general de marcas representadas y cobertura integral MARCO',
    color: '#3B0764',
    bgLight: '#FAF5FF',
    bannerTitle: 'CATÁLOGO CORPORATIVO MARCO',
    bannerDescription: 'Compendio integral con todas nuestras soluciones integradas para los sectores minero, energético e industrial.',
    applications: [
      'Resumen de soluciones por sector de minería de superficie y subterránea',
      'Red de sucursales y centros de servicio técnico a nivel nacional',
      'Programas de capacitación y soporte en campo 24/7',
      'Marcas globales en representación exclusiva'
    ],
    brochureCount: 2,
    iconName: 'BookOpen'
  }
];

export const INITIAL_BROCHURES: Brochure[] = [
  // Lubricación Industrial
  {
    id: 'b-lu-1',
    categoryId: 'lubricacion-industrial',
    title: 'Brochure Lubricación Industrial',
    pages: 16,
    yearOrType: 'Actualizado 2026 · PDF · Español',
    fileSize: '4.2 MB',
    description: 'Catálogo general con soluciones de lubricación para maquinaria pesada de minería y plantas de procesamiento.',
    pageImages: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'b-lu-2',
    categoryId: 'lubricacion-industrial',
    title: 'Catálogo Bel-Ray Minería',
    pages: 24,
    yearOrType: 'Edición 2026 · PDF · Español',
    fileSize: '6.8 MB',
    description: 'Guía especializada de grasas de alto rendimiento, fluidos sintéticos y lubricantes de engranajes abiertos.',
    pageImages: [
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'b-lu-3',
    categoryId: 'lubricacion-industrial',
    title: 'Soluciones para Engranajes Abiertos',
    pages: 8,
    yearOrType: 'Ficha técnica de aplicación',
    fileSize: '2.1 MB',
    description: 'Manual de aplicación de lubricantes sintéticos no solventes para molinos de bolas y coronas operando a altas cargas.',
    pageImages: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'b-lu-4',
    categoryId: 'lubricacion-industrial',
    title: 'Guía de Grasas Especiales Bel-Ray',
    pages: 12,
    yearOrType: 'Aplicaciones severas e extrema presión',
    fileSize: '3.5 MB',
    description: 'Especificaciones de resistencia al lavado por agua, estabilidad al cizallamiento y bombeabilidad a bajas temperaturas.',
    pageImages: [
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // Herramientas Hidráulicas
  {
    id: 'b-hh-1',
    categoryId: 'herramientas-hidraulicas',
    title: 'Catálogo Power Team 10,000 PSI',
    pages: 32,
    yearOrType: 'Catálogo General 2026',
    fileSize: '8.4 MB',
    description: 'Cilindros de simple y doble efecto, bombas de alta presión, válvulas direccionales y accesorios de seguridad.',
    pageImages: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'b-hh-2',
    categoryId: 'herramientas-hidraulicas',
    title: 'Llaves de Torque y Tensionadores',
    pages: 16,
    yearOrType: 'Manual de Ajuste de Pernos',
    fileSize: '4.0 MB',
    description: 'Herramientas para embridados de alta precisión en tuberías críticas, intercambiadores y estructuras mineras.',
    pageImages: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'b-hh-3',
    categoryId: 'herramientas-hidraulicas',
    title: 'Extractores Hidráulicos y Prensas',
    pages: 10,
    yearOrType: 'Mantenimiento de Rodamientos',
    fileSize: '2.9 MB',
    description: 'Kits mecánicos e hidráulicos de desmontaje de rodamientos de grandes dimensiones.',
    pageImages: [
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // Transformación de Materiales
  {
    id: 'b-tm-1',
    categoryId: 'transformacion-materiales',
    title: 'Revestimientos Antidesgaste para Trituración',
    pages: 20,
    yearOrType: 'Guía de Selección de Aceros',
    fileSize: '5.1 MB',
    description: 'Manejo de abrasión en chancadoras primarias de quijadas, giratorias y chancadoras cónicas de alto tonelaje.',
    pageImages: [
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'b-tm-2',
    categoryId: 'transformacion-materiales',
    title: 'Mallas y Clasificación de Mineral',
    pages: 14,
    yearOrType: 'Poliuretano y Caucho Industrial',
    fileSize: '3.8 MB',
    description: 'Soluciones de alto rendimiento para zarandas vibratorias y separación granulométrica eficiente.',
    pageImages: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // Filtración Industrial
  {
    id: 'b-fi-1',
    categoryId: 'filtracion-industrial',
    title: 'Sistemas de Filtración de Flota y Planta',
    pages: 18,
    yearOrType: 'Tecnología Micro-Glass 2026',
    fileSize: '4.5 MB',
    description: 'Purificación continua de combustible diésel y aceite hidráulico para prevenir desgaste en inyectores y bombas.',
    pageImages: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'b-fi-2',
    categoryId: 'filtracion-industrial',
    title: 'Carros Dializadores Portátiles',
    pages: 8,
    yearOrType: 'Ficha Técnica Mantenimiento Proactivo',
    fileSize: '2.0 MB',
    description: 'Equipos móviles para acondicionamiento y limpieza de aceite en tanques en funcionamiento.',
    pageImages: [
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // MARCO Lab
  {
    id: 'b-ml-1',
    categoryId: 'marco-lab',
    title: 'Servicios de Diagnóstico Tribológico MARCO Lab',
    pages: 12,
    yearOrType: 'Acreditación ISO 17025',
    fileSize: '3.2 MB',
    description: 'Programas de análisis de aceite usado para predicción de fallas en componentes críticos de minería.',
    pageImages: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // Brochure Multimarca
  {
    id: 'b-mm-1',
    categoryId: 'brochure-multimarca',
    title: 'Catálogo General Representadas MARCO 2026',
    pdfUrl: brochureMultimarcaPdf,
    pages: 40,
    yearOrType: 'Visión General de Negocios',
    fileSize: '9.8 MB',
    description: 'Portafolio consolidado de marcas globales representadas, red de talleres y servicios de posventa.',
    pageImages: [
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

export const INITIAL_SPECIALISTS: Specialist[] = [
  {
    id: 'spec-1',
    categoryId: 'lubricacion-industrial',
    title: 'Lubricación y Confiabilidad',
    role: 'Especialista Técnico Bel-Ray',
    email: 'lubricacion@marco.com.pe',
    phone: '+51 987 654 321'
  },
  {
    id: 'spec-2',
    categoryId: 'herramientas-hidraulicas',
    title: 'Herramientas Hidráulicas',
    role: 'Especialista Power Team',
    email: 'hidraulica@marco.com.pe',
    phone: '+51 987 654 322'
  },
  {
    id: 'spec-3',
    categoryId: 'transformacion-materiales',
    title: 'Transformación de Materiales',
    role: 'Especialista Técnico-Comercial',
    email: 'procesamiento@marco.com.pe',
    phone: '+51 987 654 323'
  },
  {
    id: 'spec-4',
    categoryId: 'filtracion-industrial',
    title: 'Filtración Industrial',
    role: 'Especialista de la Línea Lube & Fuel',
    email: 'filtracion@marco.com.pe',
    phone: '+51 987 654 324'
  },
  {
    id: 'spec-5',
    categoryId: 'marco-lab',
    title: 'MARCO Lab Tribología',
    role: 'Asesor de Análisis de Aceite & Monitoreo',
    email: 'lab@marco.com.pe',
    phone: '+51 987 654 325'
  }
];
