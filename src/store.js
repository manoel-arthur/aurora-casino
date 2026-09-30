import { playRound, rouletteOutcome, slotsOutcome, MIN_BET, MAX_BET } from './games.js';

export const STORAGE_KEY = 'aurora-casino:v1';
export function initialState() { return { version: 1, balance: 1000, rounds: 0, history: [] }; }

function validRound(row) {
  if (!row || !['roulette', 'slots'].includes(row.game) || !Number.isInteger(row.amount) || row.amount < MIN_BET || row.amount > MAX_BET || !Number.isFinite(Date.parse(row.at))) return false;
  try {
    const outcome = row.game === 'roulette' ? rouletteOutcome(row.choice, row.amount, row.number) : slotsOutcome(row.amount, row.reels);
    return outcome.payout === row.payout && row.net === row.payout - row.amount && row.multiplier === outcome.multiplier && Number.isSafeInteger(row.balance) && row.balance >= 0 && (row.game !== 'roulette' || row.color === outcome.color);
  } catch { return false; }
}

export function loadState(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return { state: initialState(), persistent: true };
    const saved = JSON.parse(raw);
    if (saved?.version !== 1 || !Number.isSafeInteger(saved.balance) || saved.balance < 0 || !Number.isSafeInteger(saved.rounds) || saved.rounds < 0 || !Array.isArray(saved.history) || saved.history.length > 30 || saved.history.length > saved.rounds || !saved.history.every(validRound)) throw new Error('Dados inválidos');
    return { state: { version: 1, balance: saved.balance, rounds: saved.rounds, history: saved.history }, persistent: true };
  } catch { return { state: initialState(), persistent: false }; }
}

export function saveState(storage, state) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}

// Uma única transição atualiza saldo e histórico. O bloqueio visual evita cliques duplicados.
export function settleRound(state, game, choice, amount, rng, at = new Date().toISOString()) {
  const round = { ...playRound(game, choice, amount, state.balance, rng), at };
  return { state: { version: 1, balance: round.balance, rounds: state.rounds + 1, history: [round, ...state.history].slice(0, 30) }, round };
}
