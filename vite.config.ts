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
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          auth: ['@auth0/auth0-react'],
          router: ['react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2', 'recharts'],
          maps: ['leaflet', 'react-leaflet'],
          swiper: ['swiper'],
          payments: ['@mercadopago/sdk-react'],
          utils: ['axios', 'zustand', 'emailjs-com'],
        },
      },
    },
    // Configuración para mejor rendimiento en Vercel
    target: 'esnext',
  },
  server: {
    // Solo para desarrollo local
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  // Configuración específica para Vercel
  base: './',
});
