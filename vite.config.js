import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],

  base:
    command === 'build'
      ? '/between-us-and-the-page/'
      : '/',

  server: {
    port: 5173,
  },
}));