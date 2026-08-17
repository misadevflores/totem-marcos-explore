PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
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
);

CREATE TABLE IF NOT EXISTS brochures (
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
);

CREATE TABLE IF NOT EXISTS specialists (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leads (
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
  status TEXT NOT NULL DEFAULT 'Nuevo' CHECK(status IN ('Nuevo', 'Asignado', 'Contactado')),
  source TEXT NOT NULL CHECK(source IN ('Brochure', 'No Encontró', 'Especialista Directo', 'Biblioteca'))
);

CREATE TABLE IF NOT EXISTS kiosk_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  idle_timeout_seconds INTEGER NOT NULL DEFAULT 35,
  auto_reset_confirmation_seconds INTEGER NOT NULL DEFAULT 20,
  enable_virtual_keyboard INTEGER NOT NULL DEFAULT 1,
  totem_frame_mode INTEGER NOT NULL DEFAULT 1,
  company_name TEXT NOT NULL DEFAULT 'MARCO Peru',
  event_title TEXT NOT NULL DEFAULT 'Expomina 2026'
);

CREATE TABLE IF NOT EXISTS stats (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL
);

INSERT OR IGNORE INTO categories (
  id, code, title, subtitle, color, bg_light, banner_title, banner_description, applications, brochure_count, icon_name
) VALUES
  (
    'lubricacion-industrial',
    'LU',
    'Lubricación Industrial',
    'Bel-Ray y soluciones especializadas para minería e industria pesada',
    '#8B002A',
    '#FDF2F4',
    'BEL-RAY',
    'Lubricantes de alto desempeño para minería, industria y aplicaciones severas con máxima protección térmica y antidesgaste.',
    '["Motores diésel de alta potencia y transmisiones","Sistemas hidráulicos de maquinaria de mina","Reductores, engranajes abiertos y mandos finales","Grasas complejas de sulfonato de calcio y litio"]',
    4,
    'Droplets'
  ),
  (
    'herramientas-hidraulicas',
    'HH',
    'Herramientas Hidráulicas',
    'Power Team y equipos de alta presión para mantenimiento crítico',
    '#1E2530',
    '#F1F5F9',
    'POWER TEAM',
    'Cilindros, bombas, llaves de torque e hidráulica de alta presión (hasta 10,000 PSI) con certificación internacional.',
    '["Cilindros de simple y doble efecto de alto tonelaje","Bombas electrohidráulicas y neumáticas portátiles","Llaves de torque hidráulicas y tensionadores de pernos","Extractores mecánicos e hidráulicos de rodamientos"]',
    3,
    'Wrench'
  ),
  (
    'transformacion-materiales',
    'TM',
    'Transformación de Materiales',
    'Trituración, molienda, clasificación y revestimientos antidesgaste',
    '#991B1B',
    '#FEF2F2',
    'PROCESAMIENTO & TRITURACIÓN',
    'Equipos y repuestos de alto impacto para plantas concentradoras, chancado secundario/terciario y manejo de minerales.',
    '["Revestimientos de chancadoras de quijada y cónicas","Mallas de clasificación metálicas y en poliuretano","Componentes para molinos SAG y de bolas","Sistemas de transportadores y limpiadores de faja"]',
    3,
    'Boxes'
  ),
  (
    'filtracion-industrial',
    'FI',
    'Filtración Industrial',
    'Sistemas Lube & Fuel y consumibles de alta eficiencia',
    '#065F46',
    '#ECFDF5',
    'FILTRACIÓN LUBE & FUEL',
    'Purificación y remoción de partículas de polvo, agua y barnices en fluidos industriales de gran volumen.',
    '["Carros de filtración de aceite hidráulico dializado","Coalescedores para eliminación de agua libre en diésel","Filtros de aire de alto flujo para entornos polvorientos","Elementos filtrantes absolutos micro-glass (Beta > 1000)"]',
    3,
    'Filter'
  ),
  (
    'marco-lab',
    'ML',
    'MARCO Lab',
    'Análisis de aceite, diagnóstico tribológico y monitoreo de condición',
    '#1E3A8A',
    '#EFF6FF',
    'MARCO LAB TRIBOLOGÍA',
    'Laboratorio acreditado para diagnóstico preventivo de fluidos, conteo de partículas ISO y espectrometría de desgaste.',
    '["Análisis elemental FTIR para detección de contaminantes","Conteo automático de partículas según Norma ISO 4406","Viscosidad cinemática a 40°C y 100°C","Interpretación técnica por tribólogos senior"]',
    2,
    'FlaskConical'
  ),
  (
    'brochure-multimarca',
    'MM',
    'Brochure Multimarca',
    'Portafolio general de marcas representadas y cobertura integral MARCO',
    '#3B0764',
    '#FAF5FF',
    'CATÁLOGO CORPORATIVO MARCO',
    'Compendio integral con todas nuestras soluciones integradas para los sectores minero, energético e industrial.',
    '["Resumen de soluciones por sector de minería de superficie y subterránea","Red de sucursales y centros de servicio técnico a nivel nacional","Programas de capacitación y soporte en campo 24/7","Marcas globales en representación exclusiva"]',
    2,
    'BookOpen'
  );

INSERT OR IGNORE INTO brochures (
  id, category_id, title, pages, year_or_type, file_size, description, pdf_url, cover_image, page_images
) VALUES
  (
    'b-lu-1',
    'lubricacion-industrial',
    'Brochure Lubricación Industrial',
    16,
    'Actualizado 2026 · PDF · Español',
    '4.2 MB',
    'Catálogo general con soluciones de lubricación para maquinaria pesada de minería y plantas de procesamiento.',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"]'
  ),
  (
    'b-lu-2',
    'lubricacion-industrial',
    'Catálogo Bel-Ray Minería',
    24,
    'Edición 2026 · PDF · Español',
    '6.8 MB',
    'Guía especializada de grasas de alto rendimiento, fluidos sintéticos y lubricantes de engranajes abiertos.',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"]'
  ),
  (
    'b-lu-3',
    'lubricacion-industrial',
    'Soluciones para Engranajes Abiertos',
    8,
    'Ficha técnica de aplicación',
    '2.1 MB',
    'Manual de aplicación de lubricantes sintéticos no solventes para molinos de bolas y coronas operando a altas cargas.',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80"]'
  ),
  (
    'b-lu-4',
    'lubricacion-industrial',
    'Guía de Grasas Especiales Bel-Ray',
    12,
    'Aplicaciones severas e extrema presión',
    '3.5 MB',
    'Especificaciones de resistencia al lavado por agua, estabilidad al cizallamiento y bombeabilidad a bajas temperaturas.',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"]'
  ),
  (
    'b-hh-1',
    'herramientas-hidraulicas',
    'Catálogo Power Team 10,000 PSI',
    32,
    'Catálogo General 2026',
    '8.4 MB',
    'Cilindros de simple y doble efecto, bombas de alta presión, válvulas direccionales y accesorios de seguridad.',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"]'
  ),
  (
    'b-hh-2',
    'herramientas-hidraulicas',
    'Llaves de Torque y Tensionadores',
    16,
    'Manual de Ajuste de Pernos',
    '4.0 MB',
    'Herramientas para embridados de alta precisión en tuberías críticas, intercambiadores y estructuras mineras.',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"]'
  ),
  (
    'b-hh-3',
    'herramientas-hidraulicas',
    'Extractores Hidráulicos y Prensas',
    10,
    'Mantenimiento de Rodamientos',
    '2.9 MB',
    'Kits mecánicos e hidráulicos de desmontaje de rodamientos de grandes dimensiones.',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"]'
  ),
  (
    'b-tm-1',
    'transformacion-materiales',
    'Revestimientos Antidesgaste para Trituración',
    20,
    'Guía de Selección de Aceros',
    '5.1 MB',
    'Manejo de abrasión en chancadoras primarias de quijadas, giratorias y chancadoras cónicas de alto tonelaje.',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80"]'
  ),
  (
    'b-tm-2',
    'transformacion-materiales',
    'Mallas y Clasificación de Mineral',
    14,
    'Poliuretano y Caucho Industrial',
    '3.8 MB',
    'Soluciones de alto rendimiento para zarandas vibratorias y separación granulométrica eficiente.',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80"]'
  ),
  (
    'b-fi-1',
    'filtracion-industrial',
    'Sistemas de Filtración de Flota y Planta',
    18,
    'Tecnología Micro-Glass 2026',
    '4.5 MB',
    'Purificación continua de combustible diésel y aceite hidráulico para prevenir desgaste en inyectores y bombas.',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"]'
  ),
  (
    'b-fi-2',
    'filtracion-industrial',
    'Carros Dializadores Portátiles',
    8,
    'Ficha Técnica Mantenimiento Proactivo',
    '2.0 MB',
    'Equipos móviles para acondicionamiento y limpieza de aceite en tanques en funcionamiento.',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"]'
  ),
  (
    'b-ml-1',
    'marco-lab',
    'Servicios de Diagnóstico Tribológico MARCO Lab',
    12,
    'Acreditación ISO 17025',
    '3.2 MB',
    'Programas de análisis de aceite usado para predicción de fallas en componentes críticos de minería.',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"]'
  ),
  (
    'b-mm-1',
    'brochure-multimarca',
    'Catálogo General Representadas MARCO 2026',
    40,
    'Visión General de Negocios',
    '9.8 MB',
    'Portafolio consolidado de marcas globales representadas, red de talleres y servicios de posventa.',
    '/assets/pdf/BROCHURE MULTIMARCA MARCO.pdf',
    NULL,
    '["https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80"]'
  );

INSERT OR IGNORE INTO specialists (
  id, category_id, title, role, email, phone
) VALUES
  ('spec-1', 'lubricacion-industrial', 'Lubricación y Confiabilidad', 'Especialista Técnico Bel-Ray', 'lubricacion@marco.com.pe', '+51 987 654 321'),
  ('spec-2', 'herramientas-hidraulicas', 'Herramientas Hidráulicas', 'Especialista Power Team', 'hidraulica@marco.com.pe', '+51 987 654 322'),
  ('spec-3', 'transformacion-materiales', 'Transformación de Materiales', 'Especialista Técnico-Comercial', 'procesamiento@marco.com.pe', '+51 987 654 323'),
  ('spec-4', 'filtracion-industrial', 'Filtración Industrial', 'Especialista de la Línea Lube & Fuel', 'filtracion@marco.com.pe', '+51 987 654 324'),
  ('spec-5', 'marco-lab', 'MARCO Lab Tribología', 'Asesor de Análisis de Aceite & Monitoreo', 'lab@marco.com.pe', '+51 987 654 325');

INSERT OR IGNORE INTO leads (
  id, created_at, full_name, company, email, phone, position, category_id, category_name, brochure_id, brochure_title, authorized_terms, status, source
) VALUES
  (
    'lead-101',
    datetime('now', '-30 minutes'),
    'Carlos Mendoza',
    'Compañía Minera Andina',
    'cmendoza@mineraandina.pe',
    '+51 998 123 456',
    'Jefe de Mantenimiento',
    'lubricacion-industrial',
    'Lubricación Industrial',
    'b-lu-1',
    'Brochure Lubricación Industrial',
    1,
    'Nuevo',
    'Brochure'
  ),
  (
    'lead-102',
    datetime('now', '-120 minutes'),
    'Ana Paredes',
    'Servicios Mineros SAC',
    'aparedes@serviciosmineros.pe',
    '+51 987 654 321',
    'Ingeniera de Procesos',
    'filtracion-industrial',
    'Filtración Industrial',
    'b-fi-1',
    'Sistemas de Filtración de Flota y Planta',
    1,
    'Asignado',
    'Brochure'
  ),
  (
    'lead-103',
    datetime('now', '-240 minutes'),
    'José Ramírez',
    'Mina Sur Operating',
    'jramirez@minasur.pe',
    '+51 954 112 334',
    'Superintendente Mecánico',
    'herramientas-hidraulicas',
    'Herramientas Hidráulicas',
    NULL,
    NULL,
    1,
    'Contactado',
    'Especialista Directo'
  ),
  (
    'lead-104',
    datetime('now', '-360 minutes'),
    'Lucía Torres',
    'Industrial Perú Corp',
    'ltorres@industrialperu.com',
    '+51 912 887 665',
    'Jefe de Laboratorio',
    'marco-lab',
    'MARCO Lab',
    NULL,
    NULL,
    1,
    'Nuevo',
    'No Encontró'
  );

INSERT OR IGNORE INTO kiosk_settings (id, idle_timeout_seconds, auto_reset_confirmation_seconds, enable_virtual_keyboard, totem_frame_mode, company_name, event_title)
VALUES (1, 35, 20, 1, 1, 'MARCO Peru', 'Expomina 2026');

INSERT OR IGNORE INTO stats (key, value) VALUES
  ('brochure_views', 286),
  ('sessions', 173);
