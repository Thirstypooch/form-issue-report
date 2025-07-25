import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), vueDevTools(),],
  resolve: {
    alias: {
      '@': './src'
    },
  },
  server: { // Add this server block
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Assuming your Deno backend runs on port 8000
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api prefix when forwarding
      }
    }
  }
});
