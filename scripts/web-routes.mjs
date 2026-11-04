#!/usr/bin/env node
/**
 * Depois do `expo export -p web`: copia o index.html para a pasta de cada tela
 * (dist/tv/index.html, dist/settings/index.html…). Assim um link direto como
 * cronobox.../tv abre em qualquer hospedagem estática, mesmo sem "fallback" para o index.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
if (!existsSync(join(DIST, 'index.html'))) { console.error('Rode antes: npx expo export -p web'); process.exit(1); }

const routes = readdirSync(join(ROOT, 'src/app'))
  .filter((f) => /\.tsx$/.test(f) && !f.startsWith('_') && !f.startsWith('+') && f !== 'index.tsx')
  .map((f) => f.replace(/\.tsx$/, ''));
for (const r of routes) {
  mkdirSync(join(DIST, r), { recursive: true });
  copyFileSync(join(DIST, 'index.html'), join(DIST, r, 'index.html'));
}
console.log(`✔ páginas diretas: ${routes.map((r) => '/' + r).join(', ')}`);
