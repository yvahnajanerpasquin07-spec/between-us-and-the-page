import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  base: '/between-us-and-the-page/',

  server: {
    port: 5173,
  },
});
