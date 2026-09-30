import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { securityHeaders } from './security.mjs';
import { handleProviderRequest } from '../server/provider-http.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
const allowed = new Set(['/index.html', '/favicon.svg', '/src/styles.css', '/src/app.js', '/src/games.js', '/src/store.js', '/src/wheel.js']);

export function createServer() {
  return http.createServer(async (request, response) => {
    for (const [name, value] of Object.entries(securityHeaders)) response.setHeader(name, value);
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch { response.writeHead(400); response.end('Pedido inválido'); return; }
    if (await handleProviderRequest(request, response, pathname)) return;
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return; }
    const file = pathname === '/' ? '/index.html' : pathname;
    // Lista explícita: nunca serve .git, .env, testes ou outros arquivos locais.
    if (!allowed.has(file)) { response.writeHead(404); response.end('Não encontrado'); return; }
    try {
      const content = await readFile(resolve(root, `.${file}`));
      response.setHeader('Content-Type', types[file.slice(file.lastIndexOf('.'))]);
      response.writeHead(200); response.end(request.method === 'HEAD' ? undefined : content);
    } catch { response.writeHead(500); response.end('Não foi possível abrir a página.'); }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const option = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
  const port = Number(option('--port') || process.env.PORT || 4173);
  const host = option('--host') || process.env.HOST || '127.0.0.1';
  const server = createServer();
  server.on('error', error => { console.error(`Não foi possível iniciar o servidor: ${error.message}`); process.exitCode = 1; });
  server.listen(port, host, () => console.log(`Aurora Casino: http://${host}:${port}`));
}
