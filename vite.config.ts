import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* The production bundle is served from a subpath (GitHub Pages), the dev server
   from the root; `preview` follows the bundle so what it serves is what ships.
   Nothing in the app names an absolute path — `source.ts` builds the content
   URLs from `import.meta.env.BASE_URL` — so both bases work unchanged. */
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/gundelik-app/' : '/',
  plugins: [react()],
  server: { host: true },
  build: { target: 'es2020' },
}));
