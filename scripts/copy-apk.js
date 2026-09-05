import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas base
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const apkSourcePath = path.join(rootDir, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

try {
  // 1. Leer la versión del package.json
  const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageData.version || '1.0.0';

  // 2. Definir el nuevo nombre del APK basado en la versión
  const apkTargetName = `Totem-MARCO-Explorer-v${version}.apk`;
  const apkTargetPath = path.join(rootDir, apkTargetName);

  // 3. Verificar si existe el APK compilado
  if (fs.existsSync(apkSourcePath)) {
    // 4. Copiar y renombrar el APK
    fs.copyFileSync(apkSourcePath, apkTargetPath);
    console.log(`\n✅ ÉXITO: El APK ha sido compilado y guardado como: ${apkTargetName}\n`);
  } else {
    console.error(`\n❌ ERROR: No se encontró el APK en ${apkSourcePath}. Asegúrate de que ./gradlew assembleDebug se ejecutó correctamente.\n`);
    process.exit(1);
  }
} catch (error) {
  console.error('\n❌ ERROR: Hubo un problema al copiar y renombrar el APK:', error);
  process.exit(1);
}
