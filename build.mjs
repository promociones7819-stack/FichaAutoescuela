import { mkdir, rm, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const files = [
  'index.html',
  'app.js',
  'data.js',
  'compat.js',
  'styles.css',
  'manifest.webmanifest',
  'sw.js',
  'students-ui.js',
  'ui-simplify.js',
  'vehicle-type.js',
  'pdf-v11.js',
  'history-enhance.js',
  'session-reset.js',
  'class-workflow.js',
  'pdf-enhance.js'
];

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });

for (const file of files) {
  if (existsSync(file)) await copyFile(file, `public/${file}`);
}

console.log('Static assets prepared in ./public');