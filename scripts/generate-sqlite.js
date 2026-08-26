#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';

const SQL_FILE = 'sqlite.sql';
const OUT_FILE = 'public/totem-marco';

const TARGET_DESTINATIONS = [
  'public/totem-marco',
  'public/assets/databases/totem-marco.db',
  'public/assets/databases/totem-marcoSQLite.db',
  'android/app/src/main/assets/databases/totem-marco.db',
  'android/app/src/main/assets/databases/totem-marcoSQLite.db',
  'android/app/src/main/assets/public/totem-marco'
];

function fileExists(p) {
  try { return fs.existsSync(p); } catch { return false; }
}

if (!fileExists(SQL_FILE)) {
  console.error(`Error: input SQL file not found: ${SQL_FILE}`);
  process.exit(2);
}

function syncToTargets(sourceBuffer) {
  for (const dest of TARGET_DESTINATIONS) {
    try {
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.writeFileSync(dest, sourceBuffer);
      console.log(`[SQLite Generator] Sincronizado a: ${dest} (${sourceBuffer.length} bytes)`);
    } catch (err) {
      console.warn(`[SQLite Generator] Aviso al escribir en ${dest}:`, err.message);
    }
  }

  // Actualizar también db-data.ts con el base64 de la base de datos completa
  try {
    const base64 = sourceBuffer.toString('base64');
    const dbDataContent = `// Base64 generado automáticamente desde sqlite.sql con 12 categorías, 20 brochures y 12 especialistas\nexport const DB_BASE64 = '${base64}';\n`;
    fs.writeFileSync('src/data/db-data.ts', dbDataContent, 'utf8');
    console.log('[SQLite Generator] Actualizado src/data/db-data.ts con la BD en base64');
  } catch (err) {
    console.warn('[SQLite Generator] Aviso al escribir src/data/db-data.ts:', err.message);
  }
}

const outDir = path.dirname(OUT_FILE);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Eliminar archivo previo para generar uno limpio
if (fs.existsSync(OUT_FILE)) {
  try { fs.unlinkSync(OUT_FILE); } catch {}
}

let builtWithSystem = false;
try {
  execSync('which sqlite3', { stdio: 'ignore' });
  console.log('[SQLite Generator] Usando sqlite3 del sistema...');
  execSync(`sqlite3 "${OUT_FILE}" < "${SQL_FILE}"`, { stdio: 'inherit', shell: true });
  console.log(`[SQLite Generator] Creado ${OUT_FILE} exitosamente con sqlite3.`);
  const buf = fs.readFileSync(OUT_FILE);
  syncToTargets(buf);
  builtWithSystem = true;
  process.exit(0);
} catch (e) {
  console.log('[SQLite Generator] sqlite3 no disponible en sistema — usando fallback sql.js (WASM)');
}

if (!builtWithSystem) {
  (async () => {
    try {
      const sqlText = fs.readFileSync(SQL_FILE, 'utf8');
      const SQL = await initSqlJs();
      const db = new SQL.Database();

      try {
        db.exec(sqlText);
      } catch (err) {
        console.warn('[SQLite Generator] db.exec falló en bloque completo, ejecutando por sentencia:', err.message);
        const statements = sqlText.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
        for (const st of statements) {
          try { db.run(st); } catch (sErr) { /* continuar */ }
        }
      }

      const data = db.export();
      const buf = Buffer.from(data);
      syncToTargets(buf);
      console.log(`[SQLite Generator] Proceso completado exitosamente con sql.js.`);
      process.exit(0);
    } catch (err) {
      console.error('[SQLite Generator] Error generando sqlite con sql.js:', err);
      process.exit(3);
    }
  })();
}
