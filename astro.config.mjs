import { defineConfig } from 'astro/config';

export default defineConfig({
  // Output estático (padrão) — gera HTML puro
  output: 'static',

  // View Transitions habilitadas
  prefetch: true,

  // Build otimizado
  build: {
    // 'always' → injeta o CSS inline no <head>, elimina o request render-blocking
    inlineStylesheets: 'always',
  },

  // Dev server
  server: {
    port: 4321,
  },
});
