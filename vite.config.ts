import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Define global constants for production
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  build: {
    // Optimizaciones para producción
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          auth: ['@auth0/auth0-react'],
          ui: ['@headlessui/react', '@heroicons/react'],
        },
      },
    },
  },
  server: {
    // Solo para desarrollo local
    port: 5173,
  },
  preview: {
    port: 4173,
  },
});
