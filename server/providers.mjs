/**
 * Registro de fornecedores. Não contém endpoints inventados nem credenciais.
 * Para implementar um adaptador, use a documentação entregue pelo fornecedor.
 * Não registrar um adaptador deve sempre impedir o lançamento de sessões.
 */
const providers = Object.freeze([
  Object.freeze({ id: 'pg-soft', name: 'PG Soft', status: 'not_configured', mode: 'demo', officialUrl: 'https://www.pgsoft.com/demo' }),
  Object.freeze({ id: 'pragmatic-play', name: 'Pragmatic Play', status: 'not_configured', mode: 'demo', officialUrl: 'https://www.pragmaticplay.com/en/games/?type=demo' }),
]);

export function listProviders() { return providers.map(provider => ({ ...provider })); }

export class ProviderError extends Error {
  constructor(code, status, message) { super(message); this.name = 'ProviderError'; this.code = code; this.status = status; }
}

/**
 * Contrato interno Aurora, NÃO uma especificação da PG/Pragmatic.
 * Um futuro adaptador implementará listDemoGames() e createDemoSession({gameId}).
 * O retorno de uma sessão deverá ser validado: HTTPS, domínio autorizado,
 * expiração curta e ausência de credenciais de operador na URL pública.
 */
export async function createDemoSession(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(key => !['providerId', 'gameId', 'mode'].includes(key))) {
    throw new ProviderError('INVALID_REQUEST', 400, 'Pedido de sessão inválido.');
  }
  if (input.mode !== 'demo') throw new ProviderError('DEMO_ONLY', 400, 'Este projeto aceita somente demonstrações.');
  if (typeof input.gameId !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(input.gameId)) throw new ProviderError('INVALID_GAME', 400, 'Identificador de jogo inválido.');
  const provider = providers.find(item => item.id === input.providerId);
  if (!provider) throw new ProviderError('UNKNOWN_PROVIDER', 404, 'Fornecedor não encontrado.');
  // Falha fechada: nunca desviar para uma API alternativa ou lançar dinheiro real.
  throw new ProviderError('PROVIDER_NOT_CONFIGURED', 503, 'Acesso de teste e documentação oficial ainda não configurados.');
}
