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
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
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
            if (id.includes('axios')) {
              return 'client-utils';
            }
          }
        },
      },
    },
  },
})
