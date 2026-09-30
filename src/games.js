// As regras são funções puras: a interface não decide os pagamentos.
export const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
export const WHEEL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
export const SYMBOLS = ['★', '◆', '♠', '●'];
export const SLOT_MULTIPLIERS = [20, 12, 8, 5];
export const MIN_BET = 10;
export const MAX_BET = 500;

// Rejeição evita o viés de módulo quando o limite não divide 2^32.
export function randomInt(max, cryptoSource = globalThis.crypto) {
  if (!Number.isInteger(max) || max < 1 || max > 2 ** 32) throw new RangeError('Limite aleatório inválido.');
  const limit = Math.floor(2 ** 32 / max) * max;
  const bytes = new Uint32Array(1);
  do { cryptoSource.getRandomValues(bytes); } while (bytes[0] >= limit);
  return bytes[0] % max;
}

export function colorOf(number) {
  if (!Number.isInteger(number) || number < 0 || number > 36) throw new RangeError('Número de roleta inválido.');
  return number === 0 ? 'green' : RED_NUMBERS.has(number) ? 'red' : 'black';
}

export function validateBet(amount, balance) {
  if (!Number.isSafeInteger(amount) || amount < MIN_BET || amount > MAX_BET) throw new Error(`Escolha um valor inteiro entre ${MIN_BET} e ${MAX_BET} fichas.`);
  if (!Number.isSafeInteger(balance) || balance < amount) throw new Error('Fichas insuficientes. Diminua a aposta ou reinicie a demo.');
}

export function rouletteOutcome(color, amount, number) {
  if (!['red', 'black', 'green'].includes(color)) throw new Error('Escolha uma cor válida.');
  const resultColor = colorOf(number);
  const multiplier = resultColor === color ? (color === 'green' ? 36 : 2) : 0;
  return { number, color: resultColor, payout: amount * multiplier, multiplier };
}

export function slotsOutcome(amount, reels) {
  if (!Array.isArray(reels) || reels.length !== 3 || reels.some(n => !Number.isInteger(n) || n < 0 || n >= SYMBOLS.length)) throw new Error('Símbolos inválidos.');
  const multiplier = reels.every(n => n === reels[0]) ? SLOT_MULTIPLIERS[reels[0]] : 0;
  return { reels: [...reels], payout: amount * multiplier, multiplier };
}

export function playRound(game, choice, amount, balance, rng = randomInt) {
  validateBet(amount, balance);
  if (!['roulette', 'slots'].includes(game)) throw new Error('Jogo inválido.');
  const result = game === 'roulette' ? rouletteOutcome(choice, amount, rng(37)) : slotsOutcome(amount, [rng(4), rng(4), rng(4)]);
  const nextBalance = balance - amount + result.payout;
  if (!Number.isSafeInteger(nextBalance)) throw new Error('O saldo atingiu o limite da demonstração. Reinicie a demo.');
  return { game, choice: game === 'roulette' ? choice : null, amount, ...result, net: result.payout - amount, balance: nextBalance };
}
