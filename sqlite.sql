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
  totem_frame_mode INTEGER NOT NULL DEFAULT 0,
  company_name TEXT NOT NULL DEFAULT 'MARCO Peru',
  event_title TEXT NOT NULL DEFAULT 'Expomina 2026'
);

CREATE TABLE IF NOT EXISTS stats (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL
);

-- CATEGORÍAS (12 reales)
INSERT OR REPLACE INTO categories (
  id, code, title, subtitle, color, bg_light, banner_title, banner_description, applications, brochure_count, icon_name
) VALUES
  (
    'lubricacion-industrial', '01', 'Lubricación Industrial',
    'Soluciones especializadas de lubricación para proteger componentes',
    '#8B002A', '#FDF2F4', 'Lubricación Industrial',
    'Soluciones especializadas de lubricación para proteger componentes, reducir el desgaste y mejorar la confiabilidad de equipos y procesos industriales, incluso bajo condiciones exigentes de operación.',
    '["• Reductores y cajas de engranajes: protección frente al desgaste, altas cargas y temperaturas.","• Rodamientos y sistemas de transmisión: lubricación para motores, ventiladores, bombas y equipos rotativos.","• Compresores y sistemas hidráulicos: lubricantes para una operación eficiente, estable y confiable.","• Maquinaria y procesos industriales: soluciones para equipos de producciónsometidos a operación continua y condiciones exigentes."]',
    2, 'Droplets'
  ),
  (
    'lubricacion-minera', '02', 'Lubricación Minera',
    'Soluciones de lubricación de alto desempeño desarrolladas para proteger equipos y componentes críticos',
    '#7C1D1D', '#FEF2F2', 'Lubricación Minera',
    'Soluciones de lubricación de alto desempeño desarrolladas para proteger equipos y componentes críticos, extender su vida útil y mejorar la confiabilidad de las operaciones mineras, incluso bajo condiciones extremas de carga, temperatura, polvo y contaminación.',
    '["• Equipos móviles de mina: lubricación para camiones, palas, cargadores, perforadoras y maquinaria pesada.","• Chancado y molienda: protección de chancadoras, molinos, engranajes abiertos, rodamientos y componentes sometidos a altas cargas.","• Fajas y sistemas de transporte: lubricación de rodamientos, reductores y mecanismos de transmisión.","• Equipos de planta concentradora: soluciones para bombas, motores, celdas de flotación y otros equipos críticos del proceso."]',
    2, 'Droplets'
  ),
  (
    'herramientas-hidraulicas', '03', 'Herramientas Hidráulicas',
    'Soluciones hidráulicas de alta presión para mantenimiento y montaje',
    '#1E2530', '#F1F5F9', 'Herramientas Hidráulicas',
    'Soluciones hidráulicas de alta presión para generar y controlar grandes fuerzas con precisión y seguridad en trabajos de mantenimiento, montaje y reparación de equipos industriales y mineros.',
    '["• Elevación y posicionamiento de cargas: cilindros y gatos hidráulicos para levantar, nivelar y posicionar equipos y componentes pesados.","• Montaje y desmontaje de componentes: herramientas para facilitar trabajos de extracción, separación, empuje y ajuste de piezas.","• Mantenimiento de equipos pesados: soluciones hidráulicas para intervenciones seguras y eficientes en maquinaria y equipos de gran tamaño.","• Torque y tensionado: herramientas hidráulicas para el ajuste y control preciso de uniones empernadas en aplicaciones críticas."]',
    2, 'Wrench'
  ),
  (
    'transformacion-materiales', '04', 'Transformación de Materiales',
    'Soluciones especializadas en trituración, molienda y procesamiento de materiales',
    '#991B1B', '#FEF2F2', 'Transformación de Materiales',
    'Soluciones especializadas en trituración, molienda y procesamiento de materiales, integrando equipos, repuestos y piezas de desgaste diseñados para brindar alto rendimiento y confiabilidad en operaciones exigentes.',
    '["• Trituración y cribado: equipos y componentes para trituradoras de mandíbulas, conos, HSI, VSI y sistemas de clasificación de materiales.","• Piezas de desgaste: repuestos y componentes fabricados en aleaciones especiales para aplicaciones sometidas a abrasión, impacto y altas exigencias operativas.","• Molienda: blindajes, placas y rejillas para molinos, desarrollados de acuerdo con las condiciones específicas de cada operación.","• Manejo de lodos: componentes y repuestos para bombas de lodos, incluyendo carcasas, rodetes y tapas en aleaciones anti-desgaste."]',
    1, 'Boxes'
  ),
  (
    'filtracion-industrial', '05', 'Filtración Industrial',
    'Soluciones para la purificación y control de contaminación en combustibles y aceites',
    '#065F46', '#ECFDF5', 'Filtración Industrial',
    'Soluciones para la purificación y control de contaminación en combustibles y aceites, orientadas a proteger componentes críticos, reducir fallas y mejorar la confiabilidad y disponibilidad de los equipos.',
    '["• Purificación de combustible diésel: separación de agua y partículas contaminantes para proteger motores y sistemas de inyección.","• Aceites hidráulicos: control de contaminación para mantener la confiabilidad y prolongar la vida útil de componentes hidráulicos.","• Equipos y motores diésel: protección de sistemas críticos frente a contaminantes que generan desgaste, fallas y mantenimiento no planificado.","• Grupos electrógenos y sistemas industriales: tratamiento de combustibles y aceites para favorecer una operación continua y confiable."]',
    2, 'Filter'
  ),
  (
    'marco-lab', '06', 'MARCO Lab',
    'Laboratorio de Lubricantes - análisis tribológico',
    '#1E3A8A', '#EFF6FF', 'MARCO Lab',
    'Laboratorio especializado en análisis de lubricantes y monitoreo de condición, orientado a identificar contaminación, desgaste y cambios en las propiedades del lubricante para contribuir a la confiabilidad y disponibilidad de los equipos.',
    '["• Análisis de aceites lubricantes: evaluación de la condición del lubricante para detectar cambios que puedan afectar el desempeño de los equipos.","• Monitoreo de desgaste: identificación de partículas y contaminantes asociados al desgaste de componentes.","• Control de contaminación: medición y conteo de partículas en aceites hidráulicos, lubricantes y combustibles.","• Mantenimiento predictivo: generación de información para apoyar la toma de decisiones, anticipar fallas y optimizar los intervalos de mantenimiento."]',
    2, 'FlaskConical'
  ),
  (
    'mangueras-oleo-hidraulicas', '07', 'Mangueras Oleo Hidráulicas',
    'Aeroquip y mangueras de alta presión',
    '#92400E', '#FFFBEB', 'Mangueras Oleo Hidráulicas',
    'Confiabilidad y resistencia para sistemas hidráulicos de alta exigencia. Soluciones en mangueras y conexiones oleohidráulicas Danfoss, diseñadas para responder a diferentes condiciones de presión, temperatura y resistencia a la abrasión, con alternativas para diversas aplicaciones en minería e industria.',
    '["• Mangueras hidráulicas trenzadas de 1 y 2 hilos.","• Mangueras hidráulicas espirales de 4 hilos.","• Mangueras termoplásticas.","• Mangueras estándar y de alto rendimiento.","• Conexiones y accesorios.","• Soluciones y conjuntos para diferentes requerimientos de sistemas hidráulicos."]',
    2, 'Zap'
  ),
  (
    'componentes-oleo-hidraulicos', '08', 'Componentes y Sistemas Oleo Hidráulicos',
    'Soluciones en componentes oleo hidráulicos y control de movimiento',
    '#3B0764', '#FAF5FF', 'Componentes y Sistemas Oleo Hidráulicos',
    'Soluciones en componentes oleo hidráulicos y control de movimiento para maquinaria y sistemas de minería e industria, con un portafolio multimarca para aplicaciones de media y alta presión.',
    '["• Bombas hidráulicas: bombas de pistones, paletas y otras configuraciones para sistemas industriales y equipos móviles.","• Motores hidráulicos: soluciones de alto torque y baja velocidad para maquinaria minera e industrial.","• Válvulas y control: válvulas modulares, direccionales y soluciones electrohidráulicas para el control preciso de los sistemas.","• Unidades de potencia hidráulica (UPH): diseño e integración de sistemas con bombas, motores, válvulas, tanques, filtración y sistemas de control."]',
    1, 'Settings'
  ),
  (
    'transmision-potencia', '09', 'Transmisión de Potencia',
    'Soluciones para la transmisión, control y gestión de potencia mecánica',
    '#1C4532', '#F0FDF4', 'Transmisión de Potencia',
    'Soluciones para la transmisión, control y gestión de potencia mecánica en equipos industriales y mineros, integrando tecnologías de alto desempeño para aplicaciones sometidas a elevados torques y condiciones exigentes de operación.',
    '["• Reductores y accionamientos: reductores planetarios, helicoidales y cónico-helicoidales para maquinaria y equipos industriales de alta exigencia.","• Acoplamientos: soluciones para la transmisión de potencia entre equipos motrices y accionados en aplicaciones industriales y mineras.","• Sistemas de frenado: frenos industriales para el control y parada segura de equipos y sistemas de movimiento. VULKAN incluye específicamente soluciones de frenado hidráulico para aplicaciones industriales.","• Accionamientos de alto torque: soluciones para aplicaciones que requieren elevada capacidad de transmisión, incluyendo manejo de materiales, minería y equipos industriales de alta potencia."]',
    2, 'Settings'
  ),
  (
    'soluciones-ingenieria-mineria', '10', 'Soluciones de Ingeniería para Minería',
    'Diseñamos y desarrollamos soluciones de ingeniería a medida',
    '#0C4A6E', '#F0F9FF', 'Soluciones de Ingeniería para Minería',
    'Diseñamos y desarrollamos soluciones de ingeniería a medida para optimizar tareas críticas de mantenimiento en operaciones mineras, orientadas a reducir tiempos de intervención, mejorar la seguridad y aumentar la eficiencia operativa.',
    '["• Mantenimiento de molinos: plataformas hidráulicas y soluciones para facilitar trabajos en molinos SAG y de bolas, incluyendo cambio de revestimientos y extracción de pernos.","• Mantenimiento de chancadoras: sistemas especializados para extracción, manipulación y mantenimiento de componentes críticos en chancado primario.","• Izaje y manipulación de componentes: soluciones remotas que permiten reducir maniobras de izaje y la exposición del personal durante trabajos críticos.","• Trabajos de mantenimiento en altura: plataformas y sistemas hidráulicos para facilitar labores de inspección, corte, esmerilado, soldadura y mantenimiento en zonas de difícil acceso."]',
    1, 'Settings'
  ),
  (
    'sistemas-lubricacion', '11', 'Sistemas de Lubricación',
    'Diseño e implementación de sistemas y equipos de lubricación para minería e industria',
    '#7C3AED', '#F5F3FF', 'Sistemas de Lubricación',
    'Diseño e implementación de sistemas y equipos de lubricación para minería e industria, desde soluciones automatizadas hasta proyectos desarrollados a medida, orientados a optimizar el suministro y control de lubricantes en equipos y procesos críticos.',
    '["• Camiones lubricadores: diseño y fabricación de camiones lubricadores para minería subterránea y de superficie, configurados para el almacenamiento, bombeo, filtración y suministro de aceites, grasas, refrigerantes y recuperación de aceite usado.","• Lubricación automática de equipos: sistemas progresivos y soluciones automatizadas para maquinaria móvil, orientados a suministrar lubricante de manera controlada en los diferentes puntos de lubricación.","• Sistemas de lubricación para molinos: soluciones de lubricación con aceite y sistemas de engrase automático para componentes críticos, incluyendo aplicaciones en catalinas de molinos.","• Bahías y estaciones de lubricación: diseño e implementación de instalaciones para almacenamiento, filtración, bombeo, despacho y control del consumo de lubricantes."]',
    2, 'Activity'
  ),
  (
    'soluciones-anti-desgaste', '12', 'Soluciones Anti Desgaste',
    'Soluciones especializadas para proteger equipos y componentes sometidos a abrasión e impacto',
    '#B45309', '#FFFBEB', 'Soluciones Anti Desgaste',
    'Soluciones especializadas para proteger equipos y componentes sometidos a abrasión e impacto, mediante revestimientos, materiales y desarrollos a medida orientados a extender la vida útil y mejorar la disponibilidad de los equipos en minería e industria.',
    '["• Chutes y puntos de transferencia: revestimientos antidesgaste para zonas sometidas a abrasión, impacto y flujo continuo de mineral.","• Chancado y procesamiento de mineral: protección de componentes como Main Frame Liners, Skirt Liners, octógonos de chancado primario y otros elementos expuestos a desgaste severo.","• Equipos de movimiento de tierra: revestimientos y elementos de protección para baldes, palas, cargadores, excavadoras y bulldozers.","• Fabricaciones y revestimientos especiales: diseño de soluciones a medida mediante materiales bimetálicos, fundidos, cerámicos, caucho-cerámicos y elementos de alto impacto."]',
    1, 'Shield'
  );

-- BROCHURES (20 PDFs reales)
INSERT OR REPLACE INTO brochures (
  id, category_id, title, pages, year_or_type, file_size, description, pdf_url, cover_image, page_images
) VALUES
  (
    'b-lu-ind-1', 'lubricacion-industrial', 'Brochure Lubricación Industrial',
    16, 'PDF · Español', '12.3 MB',
    'Catálogo general con soluciones de lubricación para maquinaria pesada de minería y plantas de procesamiento.',
    '/catalogo_pdfs/(01) Lubricación Industrial/Brochure Lubricación.pdf',
    NULL, '[]'
  ),
  (
    'b-lu-ind-2', 'lubricacion-industrial', 'Catálogo General Cogelsa 2026',
    40, 'Edición 2026 · PDF · Español', '6.0 MB',
    'Catálogo completo de productos Cogelsa para lubricación industrial.',
    '/catalogo_pdfs/(01) Lubricación Industrial/CATALOGO-GENERAL-COGELSA-2026_LD.pdf',
    NULL, '[]'
  ),
  (
    'b-lu-min-1', 'lubricacion-minera', 'Brochure Lubricación Minera',
    16, 'PDF · Español', '12.3 MB',
    'Soluciones de lubricación especializadas para el sector minero.',
    '/catalogo_pdfs/(02) Lubricación Minera/Brochure Lubricación.pdf',
    NULL, '[]'
  ),
  (
    'b-lu-min-2', 'lubricacion-minera', 'Bel-Ray Mining Brochure 2025',
    24, 'Edición 2025 · PDF · Inglés', '3.0 MB',
    'Guía especializada de lubricantes Bel-Ray para aplicaciones mineras.',
    '/catalogo_pdfs/(02) Lubricación Minera/Mining-Brochure_BEL RAY 2025.pdf',
    NULL, '[]'
  ),
  (
    'b-hh-1', 'herramientas-hidraulicas', 'Brochure Power Team 2025',
    20, 'Catálogo 2025 · PDF · Español', '6.2 MB',
    'Herramientas hidráulicas de alta presión Power Team: cilindros, bombas y accesorios.',
    '/catalogo_pdfs/(03) Herramientas Hidraulicas/BROCHURE POWER TEAM 2025.pdf',
    NULL, '[]'
  ),
  (
    'b-hh-2', 'herramientas-hidraulicas', 'Catálogo Power Team en Español',
    80, 'Catálogo General · PDF · Español', '64.1 MB',
    'Catálogo completo Power Team: cilindros, bombas electro-hidráulicas y llaves de torque.',
    '/catalogo_pdfs/(03) Herramientas Hidraulicas/CATALOGO EN ESPAÑOL POWER TEAM.pdf',
    NULL, '[]'
  ),
  (
    'b-tm-1', 'transformacion-materiales', 'Brochure Transformación de Materiales',
    16, 'PDF · Español', '15.3 MB',
    'Soluciones para trituración, molienda y clasificación de materiales.',
    '/catalogo_pdfs/(04) Transfomación de Materiales/brochure transformacion de Materiales.pdf',
    NULL, '[]'
  ),
  (
    'b-fi-1', 'filtracion-industrial', 'Brochure Filtración Industrial',
    16, 'PDF · Español', '10.5 MB',
    'Sistemas de filtración Lube & Fuel para purificación de aceites y combustibles.',
    '/catalogo_pdfs/(05) Filtración/Brochure Filtración.pdf',
    NULL, '[]'
  ),
  (
    'b-fi-2', 'filtracion-industrial', 'Schroeder - Hydraulic Lube Catalog',
    60, 'Catálogo Técnico · PDF · Inglés', '50.2 MB',
    'Catálogo técnico completo Schroeder de elementos filtrantes hidráulicos.',
    '/catalogo_pdfs/(05) Filtración/Schoroeder - HydraulicLubeCatalog.pdf',
    NULL, '[]'
  ),
  (
    'b-ml-1', 'marco-lab', 'Marco LAB - Laboratorio de Lubricantes',
    12, 'PDF · Español', '3.8 MB',
    'Servicios del laboratorio Marco LAB: análisis tribológico y diagnóstico de fluidos.',
    '/catalogo_pdfs/(06) Marco LAB - Laboratorio de Lubricantes/Marco LAB.pdf',
    NULL, '[]'
  ),
  (
    'b-ml-2', 'marco-lab', 'PAMAS S40 - Contador de Partículas',
    8, 'Ficha Técnica · PDF · Español', '1.3 MB',
    'Especificaciones técnicas del contador de partículas PAMAS S40 para análisis ISO 4406.',
    '/catalogo_pdfs/(06) Marco LAB - Laboratorio de Lubricantes/PAMAS S40_es.pdf',
    NULL, '[]'
  ),
  (
    'b-moh-1', 'mangueras-oleo-hidraulicas', 'Brochure Lubricación y Mangueras',
    16, 'PDF · Español', '12.3 MB',
    'Soluciones integradas de lubricación y mangueras oleo-hidráulicas.',
    '/catalogo_pdfs/(07) Mangueras Oleo Hidráulicas/Brochure Lubricación y Mangueras.pdf',
    NULL, '[]'
  ),
  (
    'b-moh-2', 'mangueras-oleo-hidraulicas', 'Catálogo de Mangueras Aeroquip',
    50, 'Catálogo General · PDF · Español', '29.0 MB',
    'Catálogo completo Aeroquip de mangueras industriales de alta presión y accesorios.',
    '/catalogo_pdfs/(07) Mangueras Oleo Hidráulicas/Catalogo de Mangueras Aeroquip.pdf',
    NULL, '[]'
  ),
  (
    'b-coh-1', 'componentes-oleo-hidraulicos', 'Brochure Multimarca MARCO',
    40, 'Catálogo Corporativo · PDF · Español', '78.6 MB',
    'Portafolio consolidado de marcas globales representadas por MARCO.',
    '/catalogo_pdfs/(08) Componentes y sistemas Oleo hidráulicos/BROCHURE MULTIMARCA MARCO.pdf',
    NULL, '[]'
  ),
  (
    'b-tp-1', 'transmision-potencia', 'Brevini S270 - Industrial Gearbox',
    20, 'Ficha Técnica · PDF · Inglés', '16.2 MB',
    'Especificaciones técnicas del reductor planetario Brevini S270.',
    '/catalogo_pdfs/(09) Transmisión de Potencia/Brevini-S270-Industrial-Gearbox.pdf',
    NULL, '[]'
  ),
  (
    'b-tp-2', 'transmision-potencia', 'Brochure Multimarca MARCO - Transmisión',
    40, 'Catálogo Corporativo · PDF · Español', '78.6 MB',
    'Soluciones de transmisión de potencia del portafolio multimarca MARCO.',
    '/catalogo_pdfs/(09) Transmisión de Potencia/BROCHURE MULTIMARCA MARCO.pdf',
    NULL, '[]'
  ),
  (
    'b-sim-1', 'soluciones-ingenieria-mineria', 'Brochure Proyectos Mineros',
    24, 'PDF · Español', '68.7 MB',
    'Soluciones de ingeniería integral para operaciones mineras.',
    '/catalogo_pdfs/(10) Soluciones de Ingenieria para Minería/BROCHURE PROYECTOS MINEROS.pdf',
    NULL, '[]'
  ),
  (
    'b-sl-1', 'sistemas-lubricacion', 'Brochures Sistemas de Lubricación',
    20, 'PDF · Español', '3.2 MB',
    'Sistemas automáticos de lubricación centralizada para equipos críticos.',
    '/catalogo_pdfs/(11) Sistemas de Lubricación/Brochures Sistemas de Lubricacion.pdf',
    NULL, '[]'
  ),
  (
    'b-sl-2', 'sistemas-lubricacion', 'SKF - Lubricación Multilínea',
    30, 'Catálogo Técnico · PDF · Español', '5.1 MB',
    'Sistema de lubricación multilínea SKF para lubricación simultánea de múltiples puntos.',
    '/catalogo_pdfs/(11) Sistemas de Lubricación/SKF - Lubricación Multilinea.pdf',
    NULL, '[]'
  ),
  (
    'b-sad-1', 'soluciones-anti-desgaste', 'RMWT - Soluciones Anti Desgaste',
    20, 'PDF · Español', '28.0 MB',
    'Recubrimientos y revestimientos antidesgaste RMWT para equipos mineros e industriales.',
    '/catalogo_pdfs/(12) Soluciones Anti Desgaste/Brochures RMWT - Soluciones Anti desgaste.pdf',
    NULL, '[]'
  );

-- ESPECIALISTAS (12 oficiales)
INSERT OR REPLACE INTO specialists (id, category_id, title, role, email, phone) VALUES
  ('spec-1', 'lubricacion-industrial', 'Lubricación Industrial', 'Especialista Técnico Bel-Ray', 'lubricacion@marco.com.pe', '+51 987 654 321'),
  ('spec-2', 'lubricacion-minera', 'Lubricación Minera', 'Especialista Técnico Bel-Ray Minería', 'mineria@marco.com.pe', '+51 987 654 326'),
  ('spec-3', 'herramientas-hidraulicas', 'Herramientas Hidráulicas', 'Especialista Power Team', 'hidraulica@marco.com.pe', '+51 987 654 322'),
  ('spec-4', 'transformacion-materiales', 'Transformación de Materiales', 'Especialista Técnico-Comercial', 'procesamiento@marco.com.pe', '+51 987 654 323'),
  ('spec-5', 'filtracion-industrial', 'Filtración Industrial', 'Especialista Lube & Fuel', 'filtracion@marco.com.pe', '+51 987 654 324'),
  ('spec-6', 'marco-lab', 'MARCO Lab Tribología', 'Asesor de Análisis de Aceite', 'lab@marco.com.pe', '+51 987 654 325'),
  ('spec-7', 'mangueras-oleo-hidraulicas', 'Mangueras Hidráulicas', 'Especialista en Conexiones Hidráulicas', 'mangueras@marco.com.pe', '+51 987 654 327'),
  ('spec-8', 'componentes-oleo-hidraulicos', 'Componentes Hidráulicos', 'Especialista en Sistemas Hidráulicos', 'componentes@marco.com.pe', '+51 987 654 328'),
  ('spec-9', 'transmision-potencia', 'Transmisión de Potencia', 'Especialista Brevini', 'transmision@marco.com.pe', '+51 987 654 329'),
  ('spec-10', 'soluciones-ingenieria-mineria', 'Proyectos Mineros', 'Ingeniero de Proyectos', 'proyectos@marco.com.pe', '+51 987 654 330'),
  ('spec-11', 'sistemas-lubricacion', 'Sistemas de Lubricación', 'Especialista SKF', 'sistemas@marco.com.pe', '+51 987 654 331'),
  ('spec-12', 'soluciones-anti-desgaste', 'Soluciones Anti Desgaste', 'Especialista RMWT', 'antidesgaste@marco.com.pe', '+51 987 654 332');

-- CONFIGURACIÓN DEL KIOSCO
INSERT OR REPLACE INTO kiosk_settings (id, idle_timeout_seconds, auto_reset_confirmation_seconds, enable_virtual_keyboard, totem_frame_mode, company_name, event_title)
VALUES (1, 35, 20, 1, 0, 'MARCO Peru', 'Expomina 2026');

-- ESTADÍSTICAS INICIALES
INSERT OR IGNORE INTO stats (key, value) VALUES ('brochure_views', 286), ('sessions', 173);
