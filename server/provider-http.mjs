import { listProviders, createDemoSession, ProviderError } from './providers.mjs';

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

export async function handleProviderRequest(request, response, pathname) {
  if (!['/api/providers', '/api/demo-sessions'].includes(pathname)) return false;
  if (pathname === '/api/providers' && request.method === 'GET') { json(response, 200, { providers: listProviders() }); return true; }
  if (pathname !== '/api/demo-sessions' || request.method !== 'POST') { json(response, 405, { error: 'METHOD_NOT_ALLOWED' }); return true; }
  // A rota não lança jogos enquanto o adaptador estiver ausente.
  // Restringimos origem e corpo já no contrato inicial.
  const expectedOrigin = `http://${request.headers.host}`;
  if (request.headers.origin !== expectedOrigin || request.headers['sec-fetch-site'] === 'cross-site') { json(response, 403, { error: 'ORIGIN_NOT_ALLOWED' }); request.resume(); return true; }
  if (request.headers['content-type']?.split(';')[0].trim() !== 'application/json') { json(response, 415, { error: 'JSON_REQUIRED' }); request.resume(); return true; }
  if (Number(request.headers['content-length']) > 2048) { json(response, 413, { error: 'BODY_TOO_LARGE' }); request.resume(); return true; }
  try {
    const chunks = []; let length = 0;
    for await (const chunk of request) {
      length += chunk.length;
      if (length > 2048) { json(response, 413, { error: 'BODY_TOO_LARGE' }); request.resume(); return true; }
      chunks.push(chunk);
    }
    let input;
    try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new ProviderError('INVALID_JSON', 400, 'JSON inválido.'); }
    const session = await createDemoSession(input);
    json(response, 200, session);
  } catch (error) {
    if (!response.writableEnded) json(response, error instanceof ProviderError ? error.status : 500, { error: error instanceof ProviderError ? error.code : 'INTERNAL_ERROR', message: error instanceof ProviderError ? error.message : 'Não foi possível iniciar a demonstração.' });
  }
  return true;
}
