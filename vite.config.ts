import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Adiciona a base URL
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    open: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // Adiciona fallback para SPA
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['lucide-react']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['lucide-react']
  },
  define: {
    'process.env': {}
  },
  // Adiciona configuração para lidar com rotas no SPA
  preview: {
    port: 3000,
    strictPort: true
  }
});