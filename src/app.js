import { SYMBOLS, MIN_BET, MAX_BET } from './games.js';
import { initialState, loadState, saveState, settleRound, STORAGE_KEY } from './store.js';
import { drawWheel, rotationFor } from './wheel.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const format = new Intl.NumberFormat('pt-BR');
const colors = { red: 'vermelho', black: 'preto', green: 'zero' };
// Acesso tardio: localStorage pode lançar erro em ambientes restritos.
const storage = { getItem: key => window.localStorage.getItem(key), setItem: (key, value) => window.localStorage.setItem(key, value) };
let loaded = loadState(storage);
let state = loaded.state;
let game = 'roulette';
let selectedColor = 'red';
let busy = false;
let rotation = 0;
let persistent = loaded.persistent;
const wheel = $('#wheel');
drawWheel(wheel);

function reportPersistence(ok) { persistent = ok; $('#storage-warning').hidden = ok; }
function setResult(title, description, kind = '') {
  const box = $('#result'); box.className = `result ${kind}`;
  box.querySelector('strong').textContent = title;
  box.querySelector('p').textContent = description;
}
function refreshReturn() {
  const amount = Number($('#bet-amount').value);
  const multiplier = game === 'slots' ? 20 : selectedColor === 'green' ? 36 : 2;
  $('#possible-return').replaceChildren(document.createTextNode(`${Number.isInteger(amount) && amount >= MIN_BET && amount <= MAX_BET ? format.format(amount * multiplier) : '—'} `));
  const unit = document.createElement('small'); unit.textContent = game === 'slots' ? 'fichas (máx.)' : 'fichas'; $('#possible-return').append(unit);
}
function renderState() {
  $('#balance').textContent = format.format(state.balance);
  $('#round-count').textContent = `${state.rounds} ${state.rounds === 1 ? 'rodada' : 'rodadas'} nesta sessão`;
  const list = $('#history-list'); list.replaceChildren();
  if (!state.history.length) {
    const empty = document.createElement('div'); empty.className = 'empty-history';
    const icon = document.createElement('span'); icon.textContent = '◷'; icon.setAttribute('aria-hidden', 'true');
    const text = document.createElement('p'); text.textContent = 'Sua história começa no primeiro giro.'; empty.append(icon, text); list.append(empty);
  }
  state.history.slice(0, 5).forEach(row => {
    const item = document.createElement('div'); item.className = 'history-item';
    const number = document.createElement('span'); number.className = `history-symbol ${row.game === 'roulette' ? row.color : 'slot-symbol'}`;
    number.textContent = row.game === 'roulette' ? String(row.number) : row.reels.map(n => SYMBOLS[n]).join(' ');
    const title = document.createElement('div'); const name = document.createElement('strong'); name.textContent = row.game === 'roulette' ? 'Roleta europeia' : 'Aurora Slots';
    const detail = document.createElement('small'); detail.textContent = `${format.format(row.amount)} fichas${row.game === 'roulette' ? ` · ${colors[row.choice]}` : ''}`; title.append(name, detail);
    const net = document.createElement('span'); net.className = `history-net ${row.net > 0 ? 'positive' : ''}`; net.textContent = `${row.net > 0 ? '+' : '−'}${format.format(Math.abs(row.net))}`;
    const unit = document.createElement('small'); unit.textContent = 'fichas'; net.append(unit); item.append(number, title, net); list.append(item);
  });
}
function setBusy(value) {
  busy = value;
  $$('#bet-form button, #bet-form input, [data-game], #reset-button').forEach(control => { control.disabled = value; });
  $('#play-button').textContent = value ? 'Sorteando…' : game === 'roulette' ? '◉  Girar a roleta' : '✦  Girar os slots';
  $('#table-status').textContent = value ? 'Rodada em andamento' : 'A mesa está pronta';
  $('.table-surface').setAttribute('aria-busy', String(value));
}
function setGame(next) {
  if (busy || next === game) return;
  game = next;
  const roulette = game === 'roulette';
  $$('[data-game]').forEach(button => { const active = button.dataset.game === game; button.classList.toggle('active', active); active ? button.setAttribute('aria-current', 'page') : button.removeAttribute('aria-current'); });
  $('#game-title').replaceChildren(document.createTextNode(roulette ? 'Roleta europeia' : 'Aurora Slots'));
  const period = document.createElement('span'); period.textContent = '.'; $('#game-title').append(period);
  $('#game-description').textContent = roulette ? 'Uma roda. 37 possibilidades. Escolha a sua cor.' : 'Encontre três símbolos iguais para ganhar a rodada.';
  $('#roulette-scene').hidden = !roulette; $('#slots-scene').hidden = roulette; $('#color-fieldset').hidden = !roulette; $('#slots-payouts').hidden = roulette;
  $('#table-tag').textContent = roulette ? 'EUROPEAN ROULETTE' : 'AURORA SLOTS CLUB';
  $('#table-footnote').textContent = roulette ? '0–36 · ZERO ÚNICO' : '4 SÍMBOLOS · 3 CILINDROS';
  $('#amount-label').textContent = roulette ? '2. Defina suas fichas' : 'Defina suas fichas';
  setResult('Boa diversão.', 'Suas fichas são apenas virtuais.'); setBusy(false); refreshReturn();
}

$$('[data-game]').forEach(button => button.addEventListener('click', () => setGame(button.dataset.game)));
$$('[data-color]').forEach(button => button.addEventListener('click', () => {
  if (busy) return; selectedColor = button.dataset.color;
  $$('[data-color]').forEach(option => { const selected = option === button; option.classList.toggle('selected', selected); option.setAttribute('aria-pressed', String(selected)); }); refreshReturn();
}));
function setAmount(amount) { if (!busy) { $('#bet-amount').value = Math.min(MAX_BET, Math.max(MIN_BET, amount)); refreshReturn(); } }
$$('[data-amount]').forEach(button => button.addEventListener('click', () => setAmount(Number(button.dataset.amount))));
$('#decrease').addEventListener('click', () => setAmount((Number($('#bet-amount').value) || MIN_BET) - 10));
$('#increase').addEventListener('click', () => setAmount((Number($('#bet-amount').value) || MIN_BET) + 10));
$('#bet-amount').addEventListener('input', refreshReturn);

// Quando disponível, o Web Locks serializa transações entre abas da mesma origem.
async function withSessionLock(task) { return navigator.locks ? navigator.locks.request(STORAGE_KEY, task) : task(); }
$('#bet-form').addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return;
  const amount = Number($('#bet-amount').value);
  setBusy(true);
  try {
    const round = await withSessionLock(() => {
      if (persistent) { const latest = loadState(storage); if (latest.persistent) state = latest.state; }
      const settled = settleRound(state, game, selectedColor, amount);
      state = settled.state;
      // Salva a rodada antes da animação: recarregar não desfaz um resultado.
      reportPersistence(saveState(storage, state));
      return settled.round;
    });
    renderState();
    setResult('Vamos descobrir…', 'Resultado sorteado. Aguarde a animação.');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (game === 'roulette') {
      rotation = rotationFor(round.number, rotation); wheel.style.transform = `rotate(${rotation}deg)`;
      await new Promise(resolve => setTimeout(resolve, reduced ? 20 : 2300));
    } else {
      $('.reels').classList.add('spinning');
      await new Promise(resolve => setTimeout(resolve, reduced ? 20 : 900));
      round.reels.forEach((symbol, index) => { $(`#reel-${index}`).textContent = SYMBOLS[symbol]; });
      $('.reels').classList.remove('spinning');
    }
    const outcome = game === 'roulette' ? `Saiu ${round.number} (${colors[round.color]}).` : `${round.reels.map(n => SYMBOLS[n]).join(' ')}.`;
    setResult(round.payout ? `+${format.format(round.net)} fichas nesta rodada` : 'Não foi desta vez.', `${outcome} ${round.payout ? `Retorno: ${format.format(round.payout)} fichas.` : 'Cada rodada é um novo sorteio.'}`, round.payout ? 'won' : '');
  } catch (error) { setResult('Confira sua aposta.', error instanceof Error ? error.message : 'Não foi possível concluir a rodada.', 'error'); }
  finally { setBusy(false); }
});

const rouletteRules = ['Escolha vermelho, preto ou zero e aposte de 10 a 500 fichas inteiras.', 'A roleta tem 37 números equiprováveis: 18 vermelhos, 18 pretos e um zero verde.', 'Acertar vermelho ou preto retorna 2× a aposta; acertar zero retorna 36×. Esses valores incluem a aposta original. Se sair zero, as apostas em vermelho e preto perdem.', 'Exemplo: apostar 50 e acertar uma cor retorna 100; o lucro líquido é de 50 fichas. A chance de acerto em vermelho ou preto é 18/37 (48,65%); no zero, 1/37 (2,70%).', 'Retorno teórico médio: 97,30%. Isso é uma média matemática, não uma promessa para a sua sessão.'];
const slotRules = ['Aposte de 10 a 500 fichas. Cada cilindro sorteia um dos quatro símbolos com a mesma chance (25%), de forma independente.', 'Só três símbolos iguais pagam: ★ = 20×, ◆ = 12×, ♠ = 8× e ● = 5×. Todas as outras combinações retornam zero.', 'Existem 64 combinações equiprováveis. Cada trio específico tem chance de 1/64; a chance de algum prêmio é 4/64 (6,25%).', 'Os retornos incluem a aposta original. Retorno teórico médio: 70,3125%. Esta tabela foi criada apenas para a demonstração; não reproduz um jogo comercial.'];
$('#rules-button').addEventListener('click', () => {
  $('#rules-title').textContent = game === 'roulette' ? 'Como jogar roleta' : 'Como jogar slots';
  $('#rules-content').replaceChildren();
  (game === 'roulette' ? rouletteRules : slotRules).forEach(text => { const paragraph = document.createElement('p'); paragraph.textContent = text; $('#rules-content').append(paragraph); });
  $('#rules-dialog').showModal();
});
$('#about-button').addEventListener('click', () => $('#about-dialog').showModal());
$('#reset-button').addEventListener('click', () => { if (!busy) $('#reset-dialog').showModal(); });
$('#confirm-reset').addEventListener('click', async () => {
  if (busy) return; setBusy(true);
  try { await withSessionLock(() => { state = initialState(); reportPersistence(saveState(storage, state)); }); renderState(); setResult('Tudo pronto para recomeçar.', 'Você tem 1.000 fichas fictícias.'); $('#reset-dialog').close(); }
  finally { setBusy(false); }
});
window.addEventListener('storage', event => { if (event.key === STORAGE_KEY || event.key === null) { const latest = loadState(storage); state = latest.state; reportPersistence(latest.persistent); renderState(); } });
reportPersistence(persistent); renderState(); refreshReturn();
