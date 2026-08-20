import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(() => {
  return {
    // Rutas relativas — obligatorio para Capacitor (carga desde file://)
    base: './',

    plugins: [
      react(),
      tailwindcss(),
      // Copia el WASM de sql.js al output para que Capacitor lo encuentre
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/sql.js/dist/sql-wasm.wasm',
            dest: '.',
          },
        ],
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    build: {
      // Evita que archivos grandes como el WASM sean inlineados incorrectamente
      assetsInlineLimit: 0,
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
