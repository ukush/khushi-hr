import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config: lightweight dev server and fast HMR for React + TS
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
