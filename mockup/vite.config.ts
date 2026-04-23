import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/sar-operations-planner/',
  // @ts-ignore - vitest injects test config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
});
