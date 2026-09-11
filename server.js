import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'public', 'totem-marco');

const PDFS_DIR = path.join(__dirname, 'public', 'pdfs');
if (!fs.existsSync(PDFS_DIR)) {
  fs.mkdirSync(PDFS_DIR, { recursive: true });
}

const ICONS_DIR = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Sincronizar iconos por defecto desde assets/icons a public/icons
const ASSETS_ICONS_DIR = path.join(__dirname, 'assets', 'icons');
const DEFAULT_ICON_MAP = {
  'lubricacion-industrial': 'Lubricacion Industrial.png',
  'lubricacion-minera': 'Lubricación Minera.png',
  'herramientas-hidraulicas': 'Herramientas HIdráulicas.png',
  'transformacion-materiales': 'Transformación de Materiales.png',
  'filtracion-industrial': 'Filtración Industrial.png',
  'marco-lab': 'Marco Lab.png',
  'mangueras-oleo-hidraulicas': 'Mangueras Oleo Hidráulicas.png',
  'componentes-oleo-hidraulicos': 'Componentes y Sistemas Oleo Hidráulicos.png',
  'transmision-potencia': 'Transmisión de Potencia.png',
  'soluciones-ingenieria-mineria': 'Souciones de Ingeniería para Minería.png',
  'sistemas-lubricacion': 'Sistemas de Lubricación.png',
  'soluciones-anti-desgaste': 'Soluciones Antidesgaste.png',
};

if (fs.existsSync(ASSETS_ICONS_DIR)) {
  for (const [catId, filename] of Object.entries(DEFAULT_ICON_MAP)) {
    const src = path.join(ASSETS_ICONS_DIR, filename);
    if (fs.existsSync(src)) {
      const destNorm = path.join(ICONS_DIR, `${catId}.png`);
      const destOrig = path.join(ICONS_DIR, filename);
      try {
        if (!fs.existsSync(destNorm)) fs.copyFileSync(src, destNorm);
        if (!fs.existsSync(destOrig)) fs.copyFileSync(src, destOrig);
      } catch (e) {
        console.warn(`[ICONS] Error copiando ${filename}:`, e.message);
      }
    }
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use('/pdfs', express.static(PDFS_DIR));
app.use('/icons', express.static(ICONS_DIR));

const CATALOGO_PDFS_DIR = path.join(__dirname, 'catalogo_pdfs');
if (!fs.existsSync(CATALOGO_PDFS_DIR)) {
  fs.mkdirSync(CATALOGO_PDFS_DIR, { recursive: true });
}
app.use('/catalogo_pdfs', (req, res, next) => {
  if (req.path === '/') return next();
  
  const decodedPath = decodeURIComponent(req.path);
  const exactPath = path.join(CATALOGO_PDFS_DIR, decodedPath);
  
  if (!fs.existsSync(exactPath)) {
    // Buscar la ruta de forma insensible a mayúsculas/minúsculas y espacios/guiones bajos
    const parts = decodedPath.split('/').filter(Boolean);
    let currentDir = CATALOGO_PDFS_DIR;
    let valid = true;
    
    for (const part of parts) {
      if (!fs.existsSync(currentDir)) {
        valid = false;
        break;
      }
      const files = fs.readdirSync(currentDir);
      const matchedFile = files.find(f => 
        f.toLowerCase().replace(/ /g, '_') === part.toLowerCase().replace(/ /g, '_')
      );
      
      if (matchedFile) {
        currentDir = path.join(currentDir, matchedFile);
      } else {
        valid = false;
        break;
      }
    }
    
    if (valid) {
      // Reescribir la URL para que coincida exactamente con la ruta física
      req.url = '/' + path.relative(CATALOGO_PDFS_DIR, currentDir).split(path.sep).join('/');
    }
  }
  next();
}, express.static(CATALOGO_PDFS_DIR, {
  setHeaders: (res) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// Servir frontend compilado y assets públicos
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}
const PUBLIC_DIR = path.join(__dirname, 'public');
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
}

let dbType = 'sqlite';
let sqliteDb;
let mysqlPool;

// ── Inicialización de Base de Datos (SQLite Local o MySQL Remoto) ────────────
async function initDatabase() {
  const isMysqlConfigured = 
    process.env.DB_TYPE === 'mysql' || 
    Boolean(process.env.MYSQL_URL) || 
    (process.env.MYSQL_HOST && process.env.MYSQL_DATABASE && process.env.MYSQL_USER && process.env.MYSQL_USER !== '');

  if (isMysqlConfigured) {
    dbType = 'mysql';
    console.log('[DB] Modo Online MySQL detectado. Conectando a base de datos remota...');
    try {
      if (process.env.MYSQL_URL) {
        mysqlPool = mysql.createPool({
          uri: process.env.MYSQL_URL,
          waitForConnections: true,
          connectionLimit: 10,
          ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
        });
      } else {
        mysqlPool = mysql.createPool({
          host: process.env.MYSQL_HOST || 'localhost',
          port: Number(process.env.MYSQL_PORT) || 3306,
          user: process.env.MYSQL_USER || 'root',
          password: process.env.MYSQL_PASSWORD || '',
          database: process.env.MYSQL_DATABASE || 'totem_marco',
          ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        });
      }

      // Verificar y auto-sembrar si la base remota es nueva
      const [tableCheck] = await mysqlPool.query("SHOW TABLES LIKE 'categories'");
      if (tableCheck.length === 0) {
        console.info('[DB] Base de datos MySQL vacía. Creando tablas y sembrando datos iniciales...');
        const sqlFile = path.join(__dirname, 'sqlite.sql');
        if (fs.existsSync(sqlFile)) {
          let sqlContent = fs.readFileSync(sqlFile, 'utf8');
          sqlContent = sqlContent.replace(/AUTOINCREMENT/g, 'AUTO_INCREMENT');
          sqlContent = sqlContent.replace(/BEGIN TRANSACTION;/gi, '');
          sqlContent = sqlContent.replace(/COMMIT;/gi, '');
          
          const statements = sqlContent.split(';').filter(s => s.trim().length > 0);
          for (let s of statements) {
             if (!s.trim().startsWith('--')) {
               await mysqlPool.query(s);
             }
          }
          console.info('[DB] Esquema y catálogo sembrado en MySQL remoto con éxito.');
        }
      } else {
        const [rows] = await mysqlPool.query("SELECT count(*) as count FROM categories");
        console.log(`[DB] Conectado a MySQL remoto con ${rows[0].count} categorías activas.`);
        try {
          await mysqlPool.query("ALTER TABLE categories ADD COLUMN icon_url TEXT");
        } catch {}
      }
      return;
    } catch (err) {
      console.error('[DB ERROR MYSQL] Error conectando a MySQL remoto:', err.message);
      console.warn('[DB] Alternando a modo SQLite local como respaldo de seguridad...');
    }
  }

  // Fallback / Modo por defecto: SQLite local
  dbType = 'sqlite';
  try {
    const publicDir = path.dirname(DB_PATH);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    sqliteDb = new Database(DB_PATH);
    console.log('[DB] Conectado a totem-marco (SQLite local)');
    
    const tableCheck = sqliteDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='categories'").get();
    let categoryCount = 0;
    if (tableCheck) {
      const row = sqliteDb.prepare("SELECT count(*) as count FROM categories").get();
      categoryCount = row ? row.count : 0;
      try {
        sqliteDb.exec("ALTER TABLE categories ADD COLUMN icon_url TEXT;");
      } catch {}
    }

    if (!tableCheck || categoryCount === 0) {
      console.info('[DB] Base de datos vacía. Inicializando con sqlite.sql...');
      const sqlFile = path.join(__dirname, 'sqlite.sql');
      if (fs.existsSync(sqlFile)) {
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        sqliteDb.exec(sqlContent);
        const postCheck = sqliteDb.prepare("SELECT count(*) as count FROM categories").get();
        console.info(`[DB] Datos iniciales de catálogo (${postCheck ? postCheck.count : 12} categorías) sembrados exitosamente.`);
      }
    } else {
      console.log(`[DB] Base de datos SQLite activa con ${categoryCount} categorías.`);
    }
  } catch (err) {
    console.error('[DB ERROR SQLITE]', err.message);
  }
}

initDatabase();

// ── Servicio de Envío de Correos SMTP (Nodemailer) ──────────────────────────
function createMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass || user.trim() === '' || pass.trim() === '') {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Helper para localizar el archivo PDF físico en disco
function findPdfOnDisk(rawUrl, brochureTitle, categoryId) {
  if (!rawUrl) return null;

  let cleanPath = decodeURIComponent(rawUrl).replace(/^[./]+/, '');

  // 1. Probar ruta directa desde raíz
  const directPath = path.join(__dirname, cleanPath);
  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    return directPath;
  }

  // 2. Probar en public/
  const publicPath = path.join(__dirname, 'public', cleanPath);
  if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
    return publicPath;
  }

  // 3. Probar en public/pdfs/
  const baseName = path.basename(cleanPath);
  const pdfsDirMatch = path.join(PDFS_DIR, baseName);
  if (fs.existsSync(pdfsDirMatch) && fs.statSync(pdfsDirMatch).isFile()) {
    return pdfsDirMatch;
  }

  // 4. Probar en catalogo_pdfs/
  const catalogoMatch = path.join(CATALOGO_PDFS_DIR, cleanPath.replace(/^catalogo_pdfs\//, ''));
  if (fs.existsSync(catalogoMatch) && fs.statSync(catalogoMatch).isFile()) {
    return catalogoMatch;
  }

  // 5. Búsqueda en subdirectorios de catalogo_pdfs/
  if (fs.existsSync(CATALOGO_PDFS_DIR)) {
    const subdirs = fs.readdirSync(CATALOGO_PDFS_DIR);
    for (const dir of subdirs) {
      const fullSub = path.join(CATALOGO_PDFS_DIR, dir);
      if (fs.statSync(fullSub).isDirectory()) {
        const candidate = path.join(fullSub, baseName);
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return candidate;
        }
      }
    }
  }

  // 6. Probar en assets/pdf/
  const assetsPdf = path.join(__dirname, 'assets', 'pdf', baseName);
  if (fs.existsSync(assetsPdf) && fs.statSync(assetsPdf).isFile()) {
    return assetsPdf;
  }

  return null;
}

// Generador de plantilla HTML corporativa de MARCO Peruana
function generateEmailHtml({ fullName, brochureTitle, categoryName, company, downloadUrl, hasAttachment }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brochure Técnico MARCO</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #001A3A 0%, #003067 100%); padding: 36px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 1px; text-transform: uppercase;">
                MARCO EXPLORER
              </h1>
              <p style="color: #93c5fd; font-size: 13px; margin: 6px 0 0 0; letter-spacing: 0.5px; font-weight: 600;">
                Soluciones de Ingeniería, Lubricación y Minería
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 30px;">
              <p style="font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">
                Estimado(a) ${fullName || 'Cliente'},
              </p>

              <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Gracias por visitarnos en nuestro tótem interactivo. A continuación te compartimos la información técnica y catálogo que solicitaste:
              </p>

              <!-- Brochure Highlight Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-left: 5px solid #003067; border-radius: 12px; padding: 20px; margin-bottom: 26px; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                <tr>
                  <td>
                    <span style="display: inline-block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #003067; letter-spacing: 0.5px; margin-bottom: 4px;">
                      DOCUMENTO SOLICITADO
                    </span>
                    <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 4px 0 6px 0;">
                      ${brochureTitle}
                    </h3>
                    <p style="font-size: 13px; color: #64748b; margin: 0;">
                      Categoría: <strong style="color: #334155;">${categoryName || 'Soluciones MARCO'}</strong>
                      ${company ? `<br>Empresa: <strong style="color: #334155;">${company}</strong>` : ''}
                    </p>
                  </td>
                </tr>
              </table>

              ${hasAttachment ? `
              <p style="font-size: 14px; line-height: 1.5; color: #059669; font-weight: 700; margin: 0 0 20px 0; padding: 12px 16px; background-color: #ecfdf5; border-radius: 10px; border: 1px solid #a7f3d0;">
                📎 Hemos adjuntado el archivo PDF directamente a este correo electrónico para que puedas consultarlo sin conexión.
              </p>
              ` : ''}

              ${downloadUrl ? `
              <!-- CTA Download Button -->
              <div style="text-align: center; margin: 28px 0 24px 0;">
                <a href="${downloadUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #FF6B00 0%, #EA580C 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35); text-transform: uppercase; letter-spacing: 0.5px;">
                  Abrir / Descargar PDF en línea
                </a>
              </div>
              ` : ''}

              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 24px 0 0 0;">
                Uno de nuestros especialistas técnicos se pondrá en contacto contigo si requieres asesoría personalizada, cotización de equipos o soporte en planta.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 30px; text-align: center;">
              <p style="font-size: 13px; font-weight: 700; color: #003067; margin: 0 0 6px 0;">
                MARCO PERUANA S.A.
              </p>
              <p style="font-size: 12px; color: #64748b; margin: 0 0 10px 0;">
                Av. Elmer Faucett 5270, Callao - Lima, Perú · Tel: +51 1 614-2222
              </p>
              <p style="font-size: 12px; margin: 0;">
                <a href="https://marco.com.pe" target="_blank" style="color: #003067; font-weight: 700; text-decoration: none;">www.marco.com.pe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const dbStatus = (dbType === 'mysql' ? (mysqlPool ? 'connected' : 'disconnected') : (sqliteDb ? 'connected' : 'disconnected'));
  const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  res.json({ 
    status: 'ok', 
    dbType, 
    dbStatus, 
    smtpConfigured,
    message: 'Backend conectado' 
  });
});

// ── Endpoint para Envío de PDFs por Correo Electrónico ─────────────────────────
app.post('/api/send-pdf-email', async (req, res) => {
  try {
    const { 
      email, 
      fullName = 'Cliente', 
      brochureTitle = 'Brochure MARCO', 
      brochureId,
      categoryId, 
      categoryName = 'Soluciones Técnicas',
      pdfUrl, 
      company = '',
      phone = '',
      position = ''
    } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Dirección de correo electrónico inválida.' });
    }

    console.log(`[EMAIL] Solicitud de envío de PDF para: ${email} (${brochureTitle})`);

    // 1. Localizar archivo PDF en disco
    const pdfFilePath = findPdfOnDisk(pdfUrl, brochureTitle, categoryId);
    let hasAttachment = false;
    const attachments = [];

    if (pdfFilePath && fs.existsSync(pdfFilePath)) {
      const stats = fs.statSync(pdfFilePath);
      console.log(`[EMAIL] PDF encontrado en disco: ${pdfFilePath} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
      
      // Adjuntar si el archivo es <= 25MB (estándar seguro SMTP)
      if (stats.size <= 25 * 1024 * 1024) {
        const safeAttachmentName = `${brochureTitle.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g, '_')}.pdf`;
        attachments.push({
          filename: safeAttachmentName,
          path: pdfFilePath,
          contentType: 'application/pdf'
        });
        hasAttachment = true;
      } else {
        console.warn(`[EMAIL] PDF excede 25MB (${(stats.size / (1024 * 1024)).toFixed(2)} MB). Se enviará como enlace de descarga.`);
      }
    } else {
      console.warn(`[EMAIL] Archivo PDF físico no localizado directamente en disco para ${pdfUrl}.`);
    }

    // 2. Construir enlace de descarga directa
    const publicAppUrl = process.env.PUBLIC_APP_URL || '';
    let downloadUrl = '';
    if (pdfUrl) {
      if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
        downloadUrl = pdfUrl;
      } else if (publicAppUrl) {
        downloadUrl = `${publicAppUrl.replace(/\/+$/, '')}/${pdfUrl.replace(/^[./]+/, '')}`;
      }
    }

    // 3. Crear transporter de correo
    const transporter = createMailTransporter();
    if (!transporter) {
      console.warn('[EMAIL] Servicio SMTP no configurado en .env (SMTP_USER / SMTP_PASS vacíos). Simulando despacho exitoso.');
      return res.json({
        success: true,
        mock: true,
        configured: false,
        message: 'Requerimiento registrado. Para envío de correo real, configure SMTP_USER y SMTP_PASS en el archivo .env',
        hasAttachment
      });
    }

    // 4. Armar y enviar correo
    const fromAddress = process.env.SMTP_FROM || `"MARCO Explorer" <${process.env.SMTP_USER}>`;
    const emailSubject = `Brochure Técnico MARCO: ${brochureTitle}`;
    const emailHtml = generateEmailHtml({
      fullName,
      brochureTitle,
      categoryName,
      company,
      downloadUrl,
      hasAttachment
    });

    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: emailSubject,
      html: emailHtml,
      attachments
    });

    console.log(`[EMAIL] Correo enviado exitosamente a ${email}. MessageId: ${info.messageId}`);
    res.json({
      success: true,
      configured: true,
      messageId: info.messageId,
      hasAttachment,
      message: 'PDF enviado exitosamente al correo.'
    });

  } catch (err) {
    console.error('[EMAIL ERROR]', err.message);
    res.status(500).json({ error: 'Error al enviar el correo: ' + err.message });
  }
});

// Endpoint para restaurar catálogo por defecto
app.post('/api/reset-defaults', async (req, res) => {
  try {
    const sqlFile = path.join(__dirname, 'sqlite.sql');
    if (!fs.existsSync(sqlFile)) {
      return res.status(404).json({ error: 'sqlite.sql no encontrado' });
    }
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    if (dbType === 'mysql') {
      let content = sqlContent.replace(/AUTOINCREMENT/g, 'AUTO_INCREMENT');
      content = content.replace(/BEGIN TRANSACTION;/gi, '');
      content = content.replace(/COMMIT;/gi, '');
      const statements = content.split(';').filter(s => s.trim().length > 0);
      for (let s of statements) {
         if (!s.trim().startsWith('--')) {
           await mysqlPool.query(s);
         }
      }
    } else {
      sqliteDb.exec(sqlContent);
    }
    
    console.log(`[DB ${dbType}] Catálogo por defecto re-sembrado via API.`);
    res.json({ success: true, message: 'Catálogo por defecto restaurado con éxito' });
  } catch (err) {
    console.error('[DB ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para subir PDFs directamente al directorio de disco
app.post('/api/upload-pdf', (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!filename || !base64Data) {
      return res.status(400).json({ error: 'Nombre de archivo y contenido requeridos' });
    }
    if (!fs.existsSync(PDFS_DIR)) {
      fs.mkdirSync(PDFS_DIR, { recursive: true });
    }

    const timestamp = Date.now();
    const cleanOriginalName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const safeName = `${timestamp}_${cleanOriginalName}`;
    const filePath = path.join(PDFS_DIR, safeName);

    const base64Clean = base64Data.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    fs.writeFileSync(filePath, buffer);

    console.log('[PDF UPLOAD] Guardado en carpeta:', safeName, `(${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
    const fileUrl = `./pdfs/${safeName}`;
    res.json({ success: true, url: fileUrl, filename: safeName, size: buffer.length });
  } catch (err) {
    console.error('[PDF UPLOAD ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para subir Iconos/Imágenes de categoría directamente al disco
app.post('/api/upload-icon', (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!filename || !base64Data) {
      return res.status(400).json({ error: 'Nombre de archivo y contenido requeridos' });
    }
    if (!fs.existsSync(ICONS_DIR)) {
      fs.mkdirSync(ICONS_DIR, { recursive: true });
    }

    const timestamp = Date.now();
    const cleanOriginalName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const safeName = `${timestamp}_${cleanOriginalName}`;
    const filePath = path.join(ICONS_DIR, safeName);

    const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    fs.writeFileSync(filePath, buffer);

    console.log('[ICON UPLOAD] Guardado en carpeta:', safeName, `(${buffer.length} bytes)`);
    const fileUrl = `./icons/${safeName}`;
    res.json({ success: true, url: fileUrl, filename: safeName, size: buffer.length });
  } catch (err) {
    console.error('[ICON UPLOAD ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Helper para adaptar consultas SQLite a MySQL
function adaptSqlForMysql(sql) {
  if (dbType === 'mysql') {
    return sql.replace(/INSERT\s+OR\s+REPLACE\s+INTO/gi, 'REPLACE INTO');
  }
  return sql;
}

// Sincronizar datos locales hacia la nube
app.post('/api/sync-upload', async (req, res) => {
  try {
    const { leads = [], stats = [] } = req.body;
    
    if (dbType === 'mysql') {
      const connection = await mysqlPool.getConnection();
      try {
        await connection.beginTransaction();
        
        for (const lead of leads) {
          const l = lead;
          const sql = `REPLACE INTO leads (
            id, firstName, lastName, fullName, email, phone, company, position, 
            categoryId, categoryName, brochureId, brochureTitle, 
            requirementType, requirementDetail, source, createdAt, 
            status, authorizedTerms
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          
          await connection.execute(sql, [
            l.id, l.firstName, l.lastName, l.fullName, l.email, l.phone, l.company, l.position,
            l.categoryId, l.categoryName, l.brochureId, l.brochureTitle,
            l.requirementType, l.requirementDetail, l.source, l.createdAt,
            l.status, l.authorizedTerms ? 1 : 0
          ]);
        }

        for (const stat of stats) {
          const sql = `INSERT INTO stats (key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = GREATEST(value, ?)`;
          await connection.execute(sql, [stat.key, stat.value, stat.value]);
        }

        await connection.commit();
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } else {
      const transaction = sqliteDb.transaction(() => {
        for (const lead of leads) {
          const l = lead;
          const sql = `INSERT OR REPLACE INTO leads (
            id, firstName, lastName, fullName, email, phone, company, position, 
            categoryId, categoryName, brochureId, brochureTitle, 
            requirementType, requirementDetail, source, createdAt, 
            status, authorizedTerms
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          
          const stmt = sqliteDb.prepare(sql);
          stmt.run(
            l.id, l.firstName, l.lastName, l.fullName, l.email, l.phone, l.company, l.position,
            l.categoryId, l.categoryName, l.brochureId, l.brochureTitle,
            l.requirementType, l.requirementDetail, l.source, l.createdAt,
            l.status, l.authorizedTerms ? 1 : 0
          );
        }
        
        for (const stat of stats) {
          const sql = `INSERT OR REPLACE INTO stats (key, value) VALUES (?, ?)`;
          const stmt = sqliteDb.prepare(sql);
          stmt.run(stat.key, stat.value);
        }
      });
      transaction();
    }
    
    console.log(`[SYNC] Sincronizados ${leads.length} leads y ${stats.length} stats en ${dbType}`);
    res.json({ success: true, message: 'Sincronización completada' });
  } catch (err) {
    console.error('[SYNC ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Execute SELECT query
app.post('/api/query', async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ error: 'SQL requerido' });

    const adaptedSql = adaptSqlForMysql(sql);
    console.log(`[SQL LOG ${dbType}] QUERY:`, adaptedSql);

    if (dbType === 'mysql') {
      const [rows] = await mysqlPool.query(adaptedSql);
      return res.json({ success: true, data: rows });
    } else {
      const stmt = sqliteDb.prepare(adaptedSql);
      const result = stmt.all();
      return res.json({ success: true, data: result });
    }
  } catch (err) {
    console.error('[SQL ERROR]', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Execute INSERT/UPDATE/DELETE
app.post('/api/execute', async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ error: 'SQL requerido' });

    const adaptedSql = adaptSqlForMysql(sql);
    console.log(`[SQL LOG ${dbType}] EXECUTE:`, adaptedSql);

    if (dbType === 'mysql') {
      const [result] = await mysqlPool.query(adaptedSql);
      console.log('[SQL LOG] Cambios aplicados:', { changes: result.affectedRows, lastInsertRowid: result.insertId });
      return res.json({ 
        success: true, 
        changes: result.affectedRows,
        lastId: result.insertId 
      });
    } else {
      const stmt = sqliteDb.prepare(adaptedSql);
      const info = stmt.run();
      console.log('[SQL LOG] Cambios aplicados:', { changes: info.changes, lastInsertRowid: info.lastInsertRowid });
      return res.json({ 
        success: true, 
        changes: info.changes,
        lastId: info.lastInsertRowid 
      });
    }
  } catch (err) {
    console.error('[SQL ERROR]', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Batch execute multiple statements
app.post('/api/batch', async (req, res) => {
  try {
    const { statements } = req.body;
    if (!Array.isArray(statements)) {
      return res.status(400).json({ error: 'Statements debe ser un array' });
    }

    console.log(`[SQL LOG ${dbType}] BATCH:`, statements.length, 'statements');
    const results = [];

    if (dbType === 'mysql') {
      const connection = await mysqlPool.getConnection();
      try {
        await connection.beginTransaction();
        for (let sql of statements) {
          const adaptedSql = adaptSqlForMysql(sql);
          const [result] = await connection.query(adaptedSql);
          results.push({ sql: adaptedSql, changes: result.affectedRows });
        }
        await connection.commit();
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } else {
      const transaction = sqliteDb.transaction(() => {
        for (let sql of statements) {
          const adaptedSql = adaptSqlForMysql(sql);
          const stmt = sqliteDb.prepare(adaptedSql);
          const info = stmt.run();
          results.push({ sql: adaptedSql, changes: info.changes });
        }
      });
      transaction();
    }
    
    console.log('[SQL LOG] Batch completado:', results.length, 'operaciones');
    res.json({ success: true, results });
  } catch (err) {
    console.error('[SQL ERROR]', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Export database
app.get('/api/export', (req, res) => {
  try {
    const data = fs.readFileSync(DB_PATH);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="totem-marco.sqlite"');
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Import database
app.post('/api/import-db', (req, res) => {
  try {
    if (dbType === 'mysql') {
      return res.status(400).json({ error: 'Importación de SQLite directo no soportada en modo MySQL' });
    }

    const { base64Data } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    console.log('[DB] Importando base de datos...');
    
    if (sqliteDb) {
      sqliteDb.close();
      console.log('[DB] Conexión actual cerrada.');
    }

    const base64Clean = base64Data.replace(/^data:application\/(x-sqlite3|octet-stream);base64,/, '').replace(/^data:.*;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    fs.writeFileSync(DB_PATH, buffer);
    console.log(`[DB] Nuevo archivo guardado en disco (${buffer.length} bytes).`);

    sqliteDb = new Database(DB_PATH);
    console.log('[DB] Conexión re-establecida exitosamente.');

    res.json({ success: true, message: 'Base de datos importada correctamente' });
  } catch (err) {
    console.error('[DB IMPORT ERROR]', err.message);
    try {
      if (dbType === 'sqlite' && (!sqliteDb || !sqliteDb.open)) sqliteDb = new Database(DB_PATH);
    } catch (e) {
      console.error('[DB FATAL]', 'No se pudo recuperar la conexión tras fallo de importación');
    }
    res.status(500).json({ error: err.message });
  }
});

// Fallback SPA para todas las demás rutas
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/pdfs') || req.path.startsWith('/catalogo_pdfs') || req.path.startsWith('/icons')) {
    return next();
  }
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(200).send('Totem MARCO Server running. Build frontend with `npm run build` to see the web interface.');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[DB] Cerrando conexión...');
  if (dbType === 'mysql' && mysqlPool) {
    await mysqlPool.end();
  } else if (sqliteDb) {
    sqliteDb.close();
  }
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Escuchando en http://0.0.0.0:${PORT}`);
  console.log(`[DB PATH] ${DB_PATH} (Modo: ${dbType})`);
});
