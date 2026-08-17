#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import initSqlJs from 'sql.js';

const SQL_FILE = 'sqlite.sql';
const OUT_FILE = 'marco-data.sqlite';

function fileExists(p) {
  try { return fs.existsSync(p); } catch { return false; }
}

if (!fileExists(SQL_FILE)) {
  console.error(`Error: input SQL file not found: ${SQL_FILE}`);
  process.exit(2);
}

try {
  // Try to use system sqlite3 if available
  execSync('which sqlite3', { stdio: 'ignore' });
  console.log('Using system sqlite3 to build the .sqlite file...');
  // Use shell redirection to load the SQL dump into a new database file
  execSync(`sqlite3 ${OUT_FILE} < ${SQL_FILE}`, { stdio: 'inherit', shell: true });
  console.log(`Created ${OUT_FILE} using system sqlite3.`);
  process.exit(0);
} catch (e) {
  console.log('System sqlite3 not available — falling back to sql.js (WASM)');
}

(async () => {
  try {
    const sqlText = fs.readFileSync(SQL_FILE, 'utf8');
    const SQL = await initSqlJs();
    const db = new SQL.Database();

    try {
      db.exec(sqlText);
    } catch (err) {
      console.warn('db.exec failed for full dump, attempting to run statements one-by-one:', err.message);
      const statements = sqlText.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
      for (const st of statements) {
        try { db.run(st); } catch (sErr) { /* continue on statement errors */ }
      }
    }

    const data = db.export();
    fs.writeFileSync(OUT_FILE, Buffer.from(data));
    console.log(`Wrote ${OUT_FILE} (${fs.statSync(OUT_FILE).size} bytes)`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to build sqlite file with sql.js fallback:', err);
    process.exit(3);
  }
})();
#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const inFile = process.argv[2] || 'sqlite.sql';
const outFile = process.argv[3] || 'output/database.sqlite';

if (!fs.existsSync(inFile)) {
  console.error(`Input SQL file not found: ${inFile}`);
  process.exit(1);
}

// Ensure output directory exists
const outDir = path.dirname(outFile);
fs.mkdirSync(outDir, { recursive: true });

function trySqlite3() {
  try {
    console.log('Trying system sqlite3...');
    // Use sqlite3's .read command to execute the SQL file
    execSync(`sqlite3 "${outFile}" ".read '${inFile.replace(/'/g, "'\"'\"'")}'"`, {
      stdio: 'inherit',
      shell: true,
    });
    console.log(`Database written to ${outFile} using system sqlite3.`);
    return true;
  } catch (err) {
    console.warn('sqlite3 binary not usable or failed, falling back to sql.js if available.');
    return false;
  }
}

async function trySqlJs() {
  try {
    console.log('Trying sql.js fallback...');
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();
    const sql = fs.readFileSync(inFile, 'utf8');
    const db = new SQL.Database();
    db.run(sql);
    const data = db.export();
    fs.writeFileSync(outFile, Buffer.from(data));
    console.log(`Database written to ${outFile} using sql.js.`);
    return true;
  } catch (err) {
    console.error('sql.js fallback is not available or failed.');
    console.error('Install it with: npm install sql.js');
    console.error('Or install sqlite3 on your system (e.g., apt install sqlite3).');
    return false;
  }
}

(async () => {
  const ok = trySqlite3();
  if (ok) process.exit(0);
  const ok2 = await trySqlJs();
  if (!ok2) process.exit(2);
})();
