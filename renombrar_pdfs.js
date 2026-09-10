const fs = require('fs');
const path = require('path');

const directorios = [
  path.join(__dirname, 'catalogo_pdfs'),
  path.join(__dirname, 'public/catalogo_pdfs'),
  path.join(__dirname, 'android/app/src/main/assets/public/catalogo_pdfs')
];

// 1. Renombrar archivos y carpetas eliminando espacios
function renameFilesInDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    // Si tiene espacios, lo renombramos (reemplazando por _)
    const newItem = item.replace(/ /g, '_');
    const newFullPath = path.join(dirPath, newItem);
    
    if (item !== newItem) {
      fs.renameSync(fullPath, newFullPath);
      console.log(`Renombrado: ${item} -> ${newItem}`);
    }
    
    // Si es directorio, entramos recursivamente
    if (stat.isDirectory()) {
      renameFilesInDirectory(newFullPath);
    }
  }
}

console.log('--- Iniciando renombramiento de archivos PDF ---');
for (const dir of directorios) {
  if (fs.existsSync(dir)) {
    console.log(`Procesando directorio: ${dir}`);
    renameFilesInDirectory(dir);
  }
}

// 2. Actualizar los archivos SQL y TS
function replaceSpacesInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  content = content.replace(/\/catalogo_pdfs\/[^'"]+/g, (match) => {
    const newMatch = match.replace(/ /g, '_');
    if (match !== newMatch) changed = true;
    return newMatch;
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Actualizado archivo con nuevas rutas: ${filePath}`);
  }
}

console.log('\n--- Actualizando referencias en el código ---');
replaceSpacesInFile(path.join(__dirname, 'sqlite.sql'));
replaceSpacesInFile(path.join(__dirname, 'src/data/mockCatalog.ts'));

console.log('\n✅ Proceso completado. ¡Los PDFs ahora no tienen espacios!');
