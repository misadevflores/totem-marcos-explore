import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
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

const CATALOGO_PDFS_DIR = path.join(__dirname, 'catalogo_pdfs');
if (!fs.existsSync(CATALOGO_PDFS_DIR)) {
  fs.mkdirSync(CATALOGO_PDFS_DIR, { recursive: true });
}
app.use('/catalogo_pdfs', express.static(CATALOGO_PDFS_DIR, {
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

async function initDatabase() {
  if (process.env.MYSQL_URL) {
    dbType = 'mysql';
    console.log('[DB] Inicializando conexión a MySQL...');
    mysqlPool = mysql.createPool(process.env.MYSQL_URL);
    
    try {
      const [tableCheck] = await mysqlPool.query("SHOW TABLES LIKE 'categories'");
      if (tableCheck.length === 0) {
        console.info('[DB] Base de datos MySQL vacía. Ejecutando esquema inicial...');
        const sqlFile = path.join(__dirname, 'sqlite.sql');
        if (fs.existsSync(sqlFile)) {
          let sqlContent = fs.readFileSync(sqlFile, 'utf8');
          // Adaptar esquema SQLite básico a MySQL
          sqlContent = sqlContent.replace(/AUTOINCREMENT/g, 'AUTO_INCREMENT');
          // Quitar instrucciones de SQLite
          sqlContent = sqlContent.replace(/BEGIN TRANSACTION;/gi, '');
          sqlContent = sqlContent.replace(/COMMIT;/gi, '');
          
          const statements = sqlContent.split(';').filter(s => s.trim().length > 0);
          for (let s of statements) {
             if (!s.trim().startsWith('--')) {
               await mysqlPool.query(s);
             }
          }
          console.info('[DB] Mapeo y ejecución de esquema inicial en MySQL completado.');
        }
      } else {
        const [rows] = await mysqlPool.query("SELECT count(*) as count FROM categories");
        console.log(`[DB] MySQL activo con ${rows[0].count} categorías.`);
      }
    } catch (err) {
      console.error('[DB ERROR MYSQL]', err.message);
    }
  } else {
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
}

initDatabase();

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = (dbType === 'mysql' ? (mysqlPool ? 'connected' : 'disconnected') : (sqliteDb ? 'connected' : 'disconnected'));
  res.json({ status: 'ok', dbType, dbStatus, message: 'Backend conectado' });
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

// Helper para adaptar consultas SQLite a MySQL
function adaptSqlForMysql(sql) {
  if (dbType === 'mysql') {
    // Reemplazar INSERT OR REPLACE INTO por REPLACE INTO
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
        
        // Sincronizar leads
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

        // Sincronizar stats
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
    
    // Close current connection
    if (sqliteDb) {
      sqliteDb.close();
      console.log('[DB] Conexión actual cerrada.');
    }

    // Write new file
    const base64Clean = base64Data.replace(/^data:application\/(x-sqlite3|octet-stream);base64,/, '').replace(/^data:.*;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    fs.writeFileSync(DB_PATH, buffer);
    console.log(`[DB] Nuevo archivo guardado en disco (${buffer.length} bytes).`);

    // Re-instantiate connection
    sqliteDb = new Database(DB_PATH);
    console.log('[DB] Conexión re-establecida exitosamente.');

    res.json({ success: true, message: 'Base de datos importada correctamente' });
  } catch (err) {
    console.error('[DB IMPORT ERROR]', err.message);
    // Intentar reconectar si falló a mitad de camino
    try {
      if (dbType === 'sqlite' && (!sqliteDb || !sqliteDb.open)) sqliteDb = new Database(DB_PATH);
    } catch (e) {
      console.error('[DB FATAL]', 'No se pudo recuperar la conexión tras fallo de importación');
    }
    res.status(500).json({ error: err.message });
  }
});

// Fallback SPA para todas las demás rutas (permite recargar páginas en React Router / cliente)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/pdfs') || req.path.startsWith('/catalogo_pdfs')) {
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

