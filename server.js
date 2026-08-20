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

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize database
let db;
try {
  db = new Database(DB_PATH);
  console.log('[DB] Conectado a totem-marco');
} catch (err) {
  console.error('[DB ERROR]', err.message);
  process.exit(1);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend conectado' });
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
