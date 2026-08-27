import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'public', 'totem-marco');

const PDFS_DIR = path.join(__dirname, 'public', 'pdfs');
if (!fs.existsSync(PDFS_DIR)) {
  fs.mkdirSync(PDFS_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use('/pdfs', express.static(PDFS_DIR));

// Servir PDFs del catálogo directamente desde la carpeta catalogo_pdfs
const CATALOGO_PDFS_DIR = path.join(__dirname, 'catalogo_pdfs');
app.use('/catalogo_pdfs', express.static(CATALOGO_PDFS_DIR, {
  setHeaders: (res) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// Initialize database with auto-seeding for clean installations
let db;
try {
  const publicDir = path.dirname(DB_PATH);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  db = new Database(DB_PATH);
  console.log('[DB] Conectado a totem-marco');
  console.log('[PDFS] Directorio de PDFs:', PDFS_DIR);

  // Verificar si la base de datos necesita esquema / datos iniciales
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='categories'").get();
  let categoryCount = 0;
  if (tableCheck) {
    const row = db.prepare("SELECT count(*) as count FROM categories").get();
    categoryCount = row ? row.count : 0;
  }

  if (!tableCheck || categoryCount === 0) {
    console.info('[DB] Base de datos vacía o recién creada. Inicializando con sqlite.sql...');
    const sqlFile = path.join(__dirname, 'sqlite.sql');
    if (fs.existsSync(sqlFile)) {
      const sqlContent = fs.readFileSync(sqlFile, 'utf8');
      db.exec(sqlContent);
      const postCheck = db.prepare("SELECT count(*) as count FROM categories").get();
      console.info(`[DB] Datos iniciales de catálogo (${postCheck ? postCheck.count : 12} categorías) sembrados exitosamente.`);
    } else {
      console.warn('[DB WARNING] No se encontró sqlite.sql para poblar la base de datos.');
    }
  } else {
    console.log(`[DB] Base de datos activa y validada con ${categoryCount} categorías registradas.`);
  }
} catch (err) {
  console.error('[DB ERROR]', err.message);
  process.exit(1);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend conectado' });
});

// Endpoint para restaurar catálogo por defecto
app.post('/api/reset-defaults', (req, res) => {
  try {
    const sqlFile = path.join(__dirname, 'sqlite.sql');
    if (!fs.existsSync(sqlFile)) {
      return res.status(404).json({ error: 'sqlite.sql no encontrado' });
    }
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    db.exec(sqlContent);
    console.log('[DB] Catálogo por defecto re-sembrado via API.');
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

// Execute SELECT query
app.post('/api/query', (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ error: 'SQL requerido' });

    console.log('[SQL LOG] QUERY:', sql);
    const stmt = db.prepare(sql);
    const result = stmt.all();
    
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[SQL ERROR]', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Execute INSERT/UPDATE/DELETE
app.post('/api/execute', (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ error: 'SQL requerido' });

    console.log('[SQL LOG] EXECUTE:', sql);
    const stmt = db.prepare(sql);
    const info = stmt.run();
    
    console.log('[SQL LOG] Cambios aplicados:', { changes: info.changes, lastInsertRowid: info.lastInsertRowid });
    res.json({ 
      success: true, 
      changes: info.changes,
      lastId: info.lastInsertRowid 
    });
  } catch (err) {
    console.error('[SQL ERROR]', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Batch execute multiple statements
app.post('/api/batch', (req, res) => {
  try {
    const { statements } = req.body;
    if (!Array.isArray(statements)) {
      return res.status(400).json({ error: 'Statements debe ser un array' });
    }

    console.log('[SQL LOG] BATCH:', statements.length, 'statements');
    const results = [];
    const transaction = db.transaction(() => {
      for (const sql of statements) {
        const stmt = db.prepare(sql);
        const info = stmt.run();
        results.push({ sql, changes: info.changes });
      }
    });

    transaction();
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
    const { base64Data } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    console.log('[DB] Importando base de datos...');
    
    // Close current connection
    if (db) {
      db.close();
      console.log('[DB] Conexión actual cerrada.');
    }

    // Write new file
    const base64Clean = base64Data.replace(/^data:application\/(x-sqlite3|octet-stream);base64,/, '').replace(/^data:.*;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    fs.writeFileSync(DB_PATH, buffer);
    console.log(`[DB] Nuevo archivo guardado en disco (${buffer.length} bytes).`);

    // Re-instantiate connection
    db = new Database(DB_PATH);
    console.log('[DB] Conexión re-establecida exitosamente.');

    res.json({ success: true, message: 'Base de datos importada correctamente' });
  } catch (err) {
    console.error('[DB IMPORT ERROR]', err.message);
    // Intentar reconectar si falló a mitad de camino
    try {
      if (!db || !db.open) db = new Database(DB_PATH);
    } catch (e) {
      console.error('[DB FATAL]', 'No se pudo recuperar la conexión tras fallo de importación');
    }
    res.status(500).json({ error: err.message });
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[DB] Cerrando conexión...');
  db.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`[SERVER] Escuchando en http://localhost:${PORT}`);
  console.log(`[DB PATH] ${DB_PATH}`);
});
