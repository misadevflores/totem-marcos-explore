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



-- CATEGORÍAS (12 reales)
INSERT OR IGNORE INTO categories (
  id, code, title, subtitle, color, bg_light, banner_title, banner_description, applications, brochure_count, icon_name
) VALUES
  (
    'lubricacion-industrial', '01', 'Lubricación Industrial', 'Bel-Ray y soluciones para industria pesada',
    '#8B002A', '#FDF2F4', 'BEL-RAY',
    'Lubricantes de alto desempeño para minería, industria y aplicaciones severas con máxima protección térmica y antidesgaste.',
    '["Motores diésel de alta potencia y transmisiones","Sistemas hidráulicos de maquinaria de mina","Reductores, engranajes abiertos y mandos finales","Grasas complejas de sulfonato de calcio y litio"]',
    2, 'Droplets'
  ),
  (
    'lubricacion-minera', '02', 'Lubricación Minera', 'Soluciones Bel-Ray de alto rendimiento para minería',
    '#7C1D1D', '#FEF2F2', 'BEL-RAY MINERÍA',
    'Lubricantes especializados para condiciones extremas de minería subterránea y de superficie.',
    '["Lubricación de equipos de mina subterránea","Aceites para transmisiones de camiones mineros","Grasas EP para cargadores frontales y excavadoras","Lubricación de sistemas de izaje y transporte"]',
    2, 'Droplets'
  ),
  (
    'herramientas-hidraulicas', '03', 'Herramientas Hidráulicas', 'Power Team y equipos de alta presión para mantenimiento crítico',
    '#1E2530', '#F1F5F9', 'POWER TEAM',
    'Cilindros, bombas, llaves de torque e hidráulica de alta presión (hasta 10,000 PSI) con certificación internacional.',
    '["Cilindros de simple y doble efecto de alto tonelaje","Bombas electrohidráulicas y neumáticas portátiles","Llaves de torque hidráulicas y tensionadores de pernos","Extractores mecánicos e hidráulicos de rodamientos"]',
    2, 'Wrench'
  ),
  (
    'transformacion-materiales', '04', 'Transformación de Materiales', 'Trituración, molienda, clasificación y revestimientos',
    '#991B1B', '#FEF2F2', 'PROCESAMIENTO & TRITURACIÓN',
    'Equipos y repuestos de alto impacto para plantas concentradoras, chancado y manejo de minerales.',
    '["Revestimientos de chancadoras de quijada y cónicas","Mallas de clasificación metálicas y en poliuretano","Componentes para molinos SAG y de bolas","Sistemas de transportadores y limpiadores de faja"]',
    1, 'Boxes'
  ),
  (
    'filtracion-industrial', '05', 'Filtración Industrial', 'Sistemas Lube & Fuel y consumibles de alta eficiencia',
    '#065F46', '#ECFDF5', 'FILTRACIÓN LUBE & FUEL',
    'Purificación y remoción de partículas de polvo, agua y barnices en fluidos industriales.',
    '["Carros de filtración de aceite hidráulico dializado","Coalescedores para eliminación de agua libre en diésel","Filtros de aire de alto flujo para entornos polvorientos","Elementos filtrantes absolutos micro-glass"]',
    2, 'Filter'
  ),
  (
    'marco-lab', '06', 'MARCO Lab', 'Laboratorio de Lubricantes - análisis tribológico',
    '#1E3A8A', '#EFF6FF', 'MARCO LAB TRIBOLOGÍA',
    'Laboratorio para diagnóstico preventivo de fluidos, conteo de partículas ISO y espectrometría de desgaste.',
    '["Análisis elemental FTIR para detección de contaminantes","Conteo automático de partículas según Norma ISO 4406","Viscosidad cinemática a 40°C y 100°C","Interpretación técnica por tribólogos senior"]',
    2, 'FlaskConical'
  ),
  (
    'mangueras-oleo-hidraulicas', '07', 'Mangueras Oleo Hidráulicas', 'Aeroquip y mangueras de alta presión',
    '#92400E', '#FFFBEB', 'MANGUERAS AEROQUIP',
    'Mangueras y accesorios de alta presión certificados para sistemas oleohidráulicos industriales y mineros.',
    '["Mangueras SAE 100R1, R2, R12 y R15 de alta presión","Accesorios y conectores de acero inoxidable","Ensamblaje y prueba hidráulica in situ","Mangueras termoplásticas para entornos agresivos"]',
    2, 'Zap'
  ),
  (
    'componentes-oleo-hidraulicos', '08', 'Componentes y Sistemas Oleo Hidráulicos', 'Componentes hidráulicos y multimarca MARCO',
    '#3B0764', '#FAF5FF', 'HIDRÁULICA MULTIMARCA',
    'Portafolio integral de componentes hidráulicos, válvulas, bombas y motores para sistemas industriales y mineros.',
    '["Válvulas direccionales, proporcionales y de presión","Bombas de pistones y engranajes industriales","Motores hidráulicos de alto par","Unidades de potencia hidráulica a medida"]',
    1, 'Settings'
  ),
  (
    'transmision-potencia', '09', 'Transmisión de Potencia', 'Brevini y soluciones de transmisión industrial',
    '#1C4532', '#F0FDF4', 'TRANSMISIÓN BREVINI',
    'Reductores planetarios, acopladores y soluciones de transmisión de potencia de alta eficiencia.',
    '["Reductores planetarios y helicoidales de alta relación","Acopladores hidráulicos y mecánicos de par constante","Variadores de velocidad para cintas transportadoras","Sistemas de transmisión para molinos y chancadoras"]',
    2, 'Settings'
  ),
  (
    'soluciones-ingenieria-mineria', '10', 'Soluciones de Ingeniería para Minería', 'Proyectos mineros y soluciones de ingeniería integral',
    '#0C4A6E', '#F0F9FF', 'PROYECTOS MINEROS',
    'Soluciones de ingeniería especializadas para operaciones mineras de gran escala.',
    '["Diseño de sistemas de lubricación centralizada","Ingeniería de sistemas hidráulicos para maquinaria pesada","Proyectos de mejora de confiabilidad y mantenimiento predictivo","Consultoría técnica para optimización de procesos mineros"]',
    1, 'Settings'
  ),
  (
    'sistemas-lubricacion', '11', 'Sistemas de Lubricación', 'SKF y sistemas automáticos de lubricación centralizada',
    '#7C3AED', '#F5F3FF', 'SISTEMAS SKF',
    'Sistemas automáticos de lubricación monopunto, multipunto y centralizada para equipos críticos.',
    '["Sistemas de lubricación multipunto SKF VOGEL","Lubricadores automáticos para rodamientos y guías","Centrales de lubricación para maquinaria pesada","Sistemas de monitoreo y alarma de lubricación"]',
    2, 'Activity'
  ),
  (
    'soluciones-anti-desgaste', '12', 'Soluciones Anti Desgaste', 'RMWT y recubrimientos antidesgaste para equipos críticos',
    '#B45309', '#FFFBEB', 'ANTI DESGASTE RMWT',
    'Recubrimientos, revestimientos y soluciones antidesgaste de alto rendimiento para equipos mineros e industriales.',
    '["Recubrimientos poliuretánicos para tolvas y chutes","Revestimientos cerámicos para alta abrasión","Placas bimetálicas y de cromo para desgaste extremo","Soldadura dura y reparación de equipos desgastados"]',
    1, 'Shield'
  );

-- BROCHURES (20 PDFs reales)
INSERT OR IGNORE INTO brochures (
  id, category_id, title, pages, year_or_type, file_size, description, pdf_url, cover_image, page_images
) VALUES
  (
    'b-coh-1', 'componentes-oleo-hidraulicos', 'Brochure Multimarca MARCO',
    40, 'Catálogo Corporativo · PDF · Español', '9.8 MB',
    'Portafolio consolidado de marcas globales representadas por MARCO.',
    '/catalogo_pdfs/(08) Componentes y sistemas Oleo hidráulicos/BROCHURE MULTIMARCA MARCO.pdf',
    NULL, '[]'
  ),
  (
    'b-fi-1', 'filtracion-industrial', 'Brochure Filtración Industrial',
    16, 'PDF · Español', '6.0 MB',
    'Sistemas de filtración Lube & Fuel para purificación de aceites y combustibles.',
    '/catalogo_pdfs/(05) Filtración/Brochure Filtración.pdf',
    NULL, '[]'
  ),
  (
    'b-fi-2', 'filtracion-industrial', 'Schroeder - Hydraulic Lube Catalog',
    60, 'Catálogo Técnico · PDF · Inglés', '12.0 MB',
    'Catálogo técnico completo Schroeder de elementos filtrantes hidráulicos.',
    '/catalogo_pdfs/(05) Filtración/Schoroeder - HydraulicLubeCatalog.pdf',
    NULL, '[]'
  ),
  (
    'b-hh-1', 'herramientas-hidraulicas', 'Brochure Power Team 2025',
    20, 'Catálogo 2025 · PDF · Español', '8.0 MB',
    'Herramientas hidráulicas de alta presión Power Team: cilindros, bombas y accesorios.',
    '/catalogo_pdfs/(03) Herramientas Hidraulicas/BROCHURE POWER TEAM 2025.pdf',
    NULL, '[]'
  ),
  (
    'b-hh-2', 'herramientas-hidraulicas', 'Catálogo Power Team en Español',
    80, 'Catálogo General · PDF · Español', '15.0 MB',
    'Catálogo completo Power Team: cilindros, bombas electro-hidráulicas y llaves de torque.',
    '/catalogo_pdfs/(03) Herramientas Hidraulicas/CATALOGO EN ESPAÑOL POWER TEAM.pdf',
    NULL, '[]'
  ),
  (
    'b-lu-ind-1', 'lubricacion-industrial', 'Brochure Lubricación Industrial',
    16, 'PDF · Español', '11.7 MB',
    'Catálogo general con soluciones de lubricación para maquinaria pesada de minería y plantas de procesamiento.',
    '/catalogo_pdfs/(01) Lubricación Industrial/Brochure Lubricación.pdf',
    NULL, '[]'
  ),
  (
    'b-lu-ind-2', 'lubricacion-industrial', 'Catálogo General Cogelsa 2026',
    40, 'Edición 2026 · PDF · Español', '5.7 MB',
    'Catálogo completo de productos Cogelsa para lubricación industrial.',
    '/catalogo_pdfs/(01) Lubricación Industrial/CATALOGO-GENERAL-COGELSA-2026_LD.pdf',
    NULL, '[]'
  ),
  (
    'b-lu-min-1', 'lubricacion-minera', 'Brochure Lubricación Minera',
    16, 'PDF · Español', '11.7 MB',
    'Soluciones de lubricación especializadas para el sector minero.',
    '/catalogo_pdfs/(02) Lubricación Minera/Brochure Lubricación.pdf',
    NULL, '[]'
  ),
  (
    'b-lu-min-2', 'lubricacion-minera', 'Bel-Ray Mining Brochure 2025',
    24, 'Edición 2025 · PDF · Inglés', '8.5 MB',
    'Guía especializada de lubricantes Bel-Ray para aplicaciones mineras.',
    '/catalogo_pdfs/(02) Lubricación Minera/Mining-Brochure_BEL RAY 2025.pdf',
    NULL, '[]'
  ),
  (
    'b-moh-1', 'mangueras-oleo-hidraulicas', 'Brochure Lubricación y Mangueras',
    16, 'PDF · Español', '7.0 MB',
    'Soluciones integradas de lubricación y mangueras oleo-hidráulicas.',
    '/catalogo_pdfs/(07) Mangueras Oleo Hidráulicas/Brochure Lubricación y Mangueras.pdf',
    NULL, '[]'
  ),
  (
    'b-moh-2', 'mangueras-oleo-hidraulicas', 'Catálogo de Mangueras Aeroquip',
    50, 'Catálogo General · PDF · Español', '10.0 MB',
    'Catálogo completo Aeroquip de mangueras industriales de alta presión y accesorios.',
    '/catalogo_pdfs/(07) Mangueras Oleo Hidráulicas/Catalogo de Mangueras Aeroquip.pdf',
    NULL, '[]'
  ),
  (
    'b-ml-1', 'marco-lab', 'Marco LAB - Laboratorio de Lubricantes',
    12, 'PDF · Español', '5.0 MB',
    'Servicios del laboratorio Marco LAB: análisis tribológico y diagnóstico de fluidos.',
    '/catalogo_pdfs/(06) Marco LAB - Laboratorio de Lubricantes/Marco LAB.pdf',
    NULL, '[]'
  ),
  (
    'b-ml-2', 'marco-lab', 'PAMAS S40 - Contador de Partículas',
    8, 'Ficha Técnica · PDF · Español', '3.0 MB',
    'Especificaciones técnicas del contador de partículas PAMAS S40 para análisis ISO 4406.',
    '/catalogo_pdfs/(06) Marco LAB - Laboratorio de Lubricantes/PAMAS S40_es.pdf',
    NULL, '[]'
  ),
  (
    'b-sl-1', 'sistemas-lubricacion', 'Brochures Sistemas de Lubricación',
    20, 'PDF · Español', '7.0 MB',
    'Sistemas automáticos de lubricación centralizada para equipos críticos.',
    '/catalogo_pdfs/(11) Sistemas de Lubricación/Brochures Sistemas de Lubricacion.pdf',
    NULL, '[]'
  ),
  (
    'b-sl-2', 'sistemas-lubricacion', 'SKF - Lubricación Multilínea',
    30, 'Catálogo Técnico · PDF · Español', '9.0 MB',
    'Sistema de lubricación multilínea SKF para lubricación simultánea de múltiples puntos.',
    '/catalogo_pdfs/(11) Sistemas de Lubricación/SKF - Lubricación Multilinea.pdf',
    NULL, '[]'
  ),
  (
    'b-sad-1', 'soluciones-anti-desgaste', 'RMWT - Soluciones Anti Desgaste',
    20, 'PDF · Español', '7.0 MB',
    'Recubrimientos y revestimientos antidesgaste RMWT para equipos mineros e industriales.',
    '/catalogo_pdfs/(12) Soluciones Anti Desgaste/Brochures RMWT - Soluciones Anti desgaste.pdf',
    NULL, '[]'
  ),
  (
    'b-sim-1', 'soluciones-ingenieria-mineria', 'Brochure Proyectos Mineros',
    24, 'PDF · Español', '8.0 MB',
    'Soluciones de ingeniería integral para operaciones mineras.',
    '/catalogo_pdfs/(10) Soluciones de Ingenieria para Minería/BROCHURE PROYECTOS MINEROS.pdf',
    NULL, '[]'
  ),
  (
    'b-tm-1', 'transformacion-materiales', 'Brochure Transformación de Materiales',
    16, 'PDF · Español', '6.0 MB',
    'Soluciones para trituración, molienda y clasificación de materiales.',
    '/catalogo_pdfs/(04) Transfomación de Materiales/brochure transformacion de Materiales.pdf',
    NULL, '[]'
  ),
  (
    'b-tp-1', 'transmision-potencia', 'Brevini S270 - Industrial Gearbox',
    20, 'Ficha Técnica · PDF · Inglés', '5.0 MB',
    'Especificaciones técnicas del reductor planetario Brevini S270.',
    '/catalogo_pdfs/(09) Transmisión de Potencia/Brevini-S270-Industrial-Gearbox.pdf',
    NULL, '[]'
  ),
  (
    'b-tp-2', 'transmision-potencia', 'Brochure Multimarca MARCO - Transmisión',
    40, 'Catálogo Corporativo · PDF · Español', '9.8 MB',
    'Soluciones de transmisión de potencia del portafolio multimarca MARCO.',
    '/catalogo_pdfs/(09) Transmisión de Potencia/BROCHURE MULTIMARCA MARCO.pdf',
    NULL, '[]'
  );

-- ESPECIALISTAS
INSERT OR IGNORE INTO specialists (id, category_id, title, role, email, phone) VALUES
  ('spec-1', 'lubricacion-industrial', 'Lubricación Industrial', 'Especialista Técnico Bel-Ray', 'lubricacion@marco.com.pe', '+51 987 654 321'),
  ('spec-10', 'soluciones-ingenieria-mineria', 'Proyectos Mineros', 'Ingeniero de Proyectos', 'proyectos@marco.com.pe', '+51 987 654 330'),
  ('spec-11', 'sistemas-lubricacion', 'Sistemas de Lubricación', 'Especialista SKF', 'sistemas@marco.com.pe', '+51 987 654 331'),
  ('spec-12', 'soluciones-anti-desgaste', 'Soluciones Anti Desgaste', 'Especialista RMWT', 'antidesgaste@marco.com.pe', '+51 987 654 332'),
  ('spec-2', 'lubricacion-minera', 'Lubricación Minera', 'Especialista Técnico Bel-Ray Minería', 'mineria@marco.com.pe', '+51 987 654 326'),
  ('spec-3', 'herramientas-hidraulicas', 'Herramientas Hidráulicas', 'Especialista Power Team', 'hidraulica@marco.com.pe', '+51 987 654 322'),
  ('spec-4', 'transformacion-materiales', 'Transformación de Materiales', 'Especialista Técnico-Comercial', 'procesamiento@marco.com.pe', '+51 987 654 323'),
  ('spec-5', 'filtracion-industrial', 'Filtración Industrial', 'Especialista Lube & Fuel', 'filtracion@marco.com.pe', '+51 987 654 324'),
  ('spec-6', 'marco-lab', 'MARCO Lab Tribología', 'Asesor de Análisis de Aceite', 'lab@marco.com.pe', '+51 987 654 325'),
  ('spec-7', 'mangueras-oleo-hidraulicas', 'Mangueras Hidráulicas', 'Especialista en Conexiones Hidráulicas', 'mangueras@marco.com.pe', '+51 987 654 327'),
  ('spec-8', 'componentes-oleo-hidraulicos', 'Componentes Hidráulicos', 'Especialista en Sistemas Hidráulicos', 'componentes@marco.com.pe', '+51 987 654 328'),
  ('spec-9', 'transmision-potencia', 'Transmisión de Potencia', 'Especialista Brevini', 'transmision@marco.com.pe', '+51 987 654 329');


-- CONFIGURACIÓN DEL KIOSCO
INSERT OR IGNORE INTO kiosk_settings (id, idle_timeout_seconds, auto_reset_confirmation_seconds, enable_virtual_keyboard, totem_frame_mode, company_name, event_title)
VALUES (1, 35, 20, 1, 1, 'MARCO Peru', 'Expomina 2026');

-- ESTADÍSTICAS INICIALES
INSERT OR IGNORE INTO stats (key, value) VALUES ('brochure_views', 0), ('sessions', 0);
