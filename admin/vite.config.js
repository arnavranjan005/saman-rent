import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Phase 10 admin dashboard. Port 5173 avoids the API (3001) and Metro (8081).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
  preview: {
    port: 5173,
    host: '127.0.0.1',
  },
});
