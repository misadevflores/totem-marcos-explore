import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  // Capacitor carga desde file:// → necesita rutas relativas ('./')
  // Vercel / web normal → necesita rutas absolutas ('/')
  const isCapacitor = process.env.VITE_BUILD_TARGET === 'capacitor';

  return {
    // Rutas relativas para Capacitor (file://), absolutas para web/Vercel
    base: isCapacitor ? './' : '/',

    plugins: [
      react(),
      tailwindcss(),
      // Copia el WASM de sql.js al output
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/sql.js/dist/sql-wasm.wasm',
            dest: '.',
          },
          ...(isCapacitor ? [{
            src: 'catalogo_pdfs',
            dest: '.'
          }] : [])
        ],
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    build: {
      assetsInlineLimit: 0,
      target: 'es2020',
      minify: 'esbuild',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/pdfjs-dist')) {
              return 'vendor-pdfjs';
            }
            if (id.includes('node_modules/xlsx')) {
              return 'vendor-xlsx';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
          },
        },
      },
    },

    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: [
          '**/public/totem-marco**',
          '**/totem-marco**',
          '**/public/pdfs/**',
          '**/pdfs/**',
          '**/*.sqlite**',
          '**/*-journal**',
          '**/*-wal**',
          '**/*-shm**',
        ],
      },
    },
  };
});
