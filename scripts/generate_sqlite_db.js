#!/usr/bin/env node
// Script para generar un archivo SQLite (`data/marco.db`) a partir de `sqlite.sql`.
// Intentará usar el binario `sqlite3` del sistema; si no existe, intentará usar `sql.js`.

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sqlFile = path.join(root, 'sqlite.sql');
const outDir = path.join(root, 'data');
const outDb = path.join(outDir, 'marco.db');

if (!fs.existsSync(sqlFile)) {
  console.error('No se encontró sqlite.sql en la raíz del proyecto.');
  process.exit(1);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

console.log('Generando base de datos SQLite en', outDb);

try {
  // Intentar usar el binario sqlite3 del sistema
  execSync(`sqlite3 "${outDb}" ".read ${sqlFile}"`, { stdio: 'inherit' });
  console.log('Base de datos creada usando sqlite3 del sistema.');
  process.exit(0);
} catch (err) {
  console.warn('No se pudo ejecutar sqlite3 CLI o ocurrió un error. Intentando fallback con sql.js...');
}

(async () => {
  try {
    // Intentar usar sql.js (WASM). Requiere instalar: npm install sql.js
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs({ locateFile: file => require.resolve('sql.js/dist/sql-wasm.wasm') });
    const sqlText = fs.readFileSync(sqlFile, 'utf8');

    const db = new SQL.Database();
    // Ejecutar statements; sql.js no soporta múltiples statements en run con ; por eso separamos.
    const statements = sqlText.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      try {
        db.run(stmt + ';');
      } catch (e) {
        // Ignorar errors de PRAGMA o de CREATE si ya existen
        // pero mostrar para debug
        console.error('Error ejecutando statement (se ignora):', e.message || e);
      }
    }

    const binary = db.export();
    const buffer = Buffer.from(binary);
    fs.writeFileSync(outDb, buffer);
    console.log('Base de datos creada en', outDb, 'usando sql.js');
    process.exit(0);
  } catch (e) {
    console.error('Fallback con sql.js falló. Instalar sqlite3 en el sistema o ejecutar `npm install sql.js` y reintentar.');
    console.error(e && e.message ? e.message : e);
    process.exit(1);
  }
})();
