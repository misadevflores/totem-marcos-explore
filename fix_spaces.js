const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\/catalogo_pdfs\/[^'"]+/g, (match) => {
    return match.replace(/ /g, '_');
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed', filePath);
}

fixFile('sqlite.sql');
fixFile('src/data/mockCatalog.ts');
