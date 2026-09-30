import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { securityHeaders } from './security.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = `${root}/dist`;
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of ['index.html', 'favicon.svg', 'src']) await cp(`${root}/${path}`, `${output}/${path}`, { recursive: true });
// Compatível com hosts que interpretam _headers. GitHub Pages não o interpreta.
const headers = { ...securityHeaders, 'Strict-Transport-Security': 'max-age=31536000' };
await writeFile(`${output}/_headers`, `/*\n${Object.entries(headers).map(([key, value]) => `  ${key}: ${value}`).join('\n')}\n`);
console.log('Build estático criado em dist/.');
