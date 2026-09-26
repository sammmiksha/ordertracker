import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/17track': {
        target: 'https://api.17track.net/track/v2.4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/17track/, ''),
      },
    },
  },
});
