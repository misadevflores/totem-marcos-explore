#!/usr/bin/env node
/**
 * scripts/upload-pdfs-to-blob.js
 *
 * Sube todos los PDFs de catalogo_pdfs/ a Vercel Blob y actualiza la BD SQLite
 * con las nuevas URLs públicas.
 *
 * USO:
 *   1. Configura BLOB_READ_WRITE_TOKEN en tu .env.local:
 *      BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxx
 *
 *   2. Ejecuta:
 *      npm run upload-pdfs
 *
 *   3. Las URLs de la BD se actualizan automáticamente en public/totem-marco
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname, basename } from 'path';
import { put } from '@vercel/blob';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = join(__dirname, '..');
const CATALOG    = join(ROOT, 'catalogo_pdfs');
const DB_PATH    = join(ROOT, 'public', 'totem-marco');

// ── Cargar .env.local ───────────────────────────────────────────────────────
const envPath = join(ROOT, '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && !k.startsWith('#')) process.env[k.trim()] = v.join('=').trim();
  }
} catch { /* .env.local no existe, usar env del sistema */ }

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN no está configurado.');
  console.error('   Agrégalo a .env.local: BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...');
  process.exit(1);
}

// ── Colectar todos los PDFs ─────────────────────────────────────────────────
function walkPdfs(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkPdfs(full, results);
    } else if (extname(entry).toLowerCase() === '.pdf') {
      results.push(full);
    }
  }
  return results;
}

const pdfs = walkPdfs(CATALOG);
console.log(`\n📂 Encontrados ${pdfs.length} PDFs en catalogo_pdfs/\n`);

// ── Subir a Vercel Blob ─────────────────────────────────────────────────────
const db        = new Database(DB_PATH);
const urlMap    = new Map();
let   uploaded  = 0;
let   skipped   = 0;

for (const pdfPath of pdfs) {
  const relPath   = '/' + relative(ROOT, pdfPath).replace(/\\/g, '/'); // /catalogo_pdfs/...
  const blobName  = 'catalogo/' + relative(CATALOG, pdfPath).replace(/\\/g, '/');

  // Verificar si ya está en la BD con una URL de Blob
  const row = db.prepare('SELECT pdf_url FROM brochures WHERE pdf_url = ?').get(relPath);
  if (!row) {
    console.log(`⏭  Sin match en BD para: ${relPath}`);
    skipped++;
    continue;
  }

  process.stdout.write(`⬆  ${basename(pdfPath)} ... `);
  try {
    const fileBuffer = readFileSync(pdfPath);
    const blob = await put(blobName, fileBuffer, {
      access: 'public',
      contentType: 'application/pdf',
    });
    urlMap.set(relPath, blob.url);
    console.log(`✅ ${blob.url}`);
    uploaded++;
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }
}

// ── Actualizar BD con las nuevas URLs ───────────────────────────────────────
if (urlMap.size > 0) {
  console.log(`\n🗄  Actualizando ${urlMap.size} URLs en la BD...`);
  const update = db.prepare('UPDATE brochures SET pdf_url = ? WHERE pdf_url = ?');
  const updateAll = db.transaction(() => {
    for (const [oldUrl, newUrl] of urlMap) {
      const result = update.run(newUrl, oldUrl);
      console.log(`   ${oldUrl.split('/').pop()} → ${newUrl}`);
    }
  });
  updateAll();
  console.log('✅ BD actualizada correctamente.');
  console.log('\n⚠️  También copia la BD actualizada al build de Android:');
  console.log('   cp public/totem-marco android/app/src/main/assets/public/totem-marco');
}

db.close();

console.log(`\n📊 Resumen: ${uploaded} subidos, ${skipped} sin match en BD.`);
if (urlMap.size > 0) {
  console.log('\n🚀 Próximo paso: haz commit y despliega en Vercel:');
  console.log('   git add public/totem-marco && git commit -m "chore: update PDF URLs to Vercel Blob" && git push');
}
