import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      allow: ['..']
    },
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://httptechnex.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://httptechnex.onrender.com',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Split heavy vendor code so public-site visitors never download
         * the admin/editor bundle (BlockNote + Mantine) on their critical path.
         *
         *  react-vendor  → React + React-DOM + React-Router (small, stable, cached)
         *  editor        → BlockNote + Mantine (large, admin-only, lazy-loaded)
         *  ui-vendor     → Lucide icons + misc UI libs
         */
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react/') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'react-vendor';
            }
            if (
              id.includes('@blocknote') ||
              id.includes('@mantine')
            ) {
              return 'editor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
          }
        },
      },
    },
  },
})

