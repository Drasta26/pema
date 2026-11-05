import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

// Stamp each build into the service worker's cache name, so every release
// installs a new worker and the app can offer "New version available".
function stampServiceWorker(): Plugin {
  return {
    name: 'stamp-service-worker',
    apply: 'build',
    closeBundle() {
      const file = path.resolve(__dirname, 'dist/sw.js');
      if (!fs.existsSync(file)) return;
      const stamped = fs.readFileSync(file, 'utf8').replace("'pema-v1'", `'pema-${Date.now()}'`);
      fs.writeFileSync(file, stamped);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), stampServiceWorker()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
