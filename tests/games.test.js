import test from 'node:test';
import assert from 'node:assert/strict';
import { colorOf, WHEEL_ORDER, rouletteOutcome, slotsOutcome, validateBet, playRound, randomInt } from '../src/games.js';
import { rotationFor } from '../src/wheel.js';

test('roleta contém exatamente 37 casas e distribuição correta', () => {
  assert.deepEqual([...WHEEL_ORDER].sort((a,b) => a-b), Array.from({length:37},(_,i)=>i));
  const counts = WHEEL_ORDER.reduce((acc, n) => { acc[colorOf(n)]++; return acc; }, {red:0,black:0,green:0});
  assert.deepEqual(counts, {red:18,black:18,green:1});
});
test('roleta paga total e não confunde retorno com lucro', () => {
  const win = playRound('roulette','red',50,1000,()=>1);
  assert.equal(win.payout,100); assert.equal(win.net,50); assert.equal(win.balance,1050);
  const loss = playRound('roulette','red',50,1000,()=>0);
  assert.equal(loss.payout,0); assert.equal(loss.balance,950);
  assert.equal(rouletteOutcome('green',10,0).payout,360);
});
test('todas as cores têm retorno teórico 36/37', () => {
  for (const color of ['red','black','green']) assert.equal(WHEEL_ORDER.reduce((sum,n)=>sum+rouletteOutcome(color,1,n).payout,0),36);
});
test('64 combinações de slots têm quatro prêmios e soma 45', () => {
  let total=0,winners=0;
  for(let a=0;a<4;a++) for(let b=0;b<4;b++) for(let c=0;c<4;c++) { const result=slotsOutcome(1,[a,b,c]); total+=result.payout; if(result.payout) winners++; }
  assert.equal(winners,4); assert.equal(total,45);
});
test('validação rejeita números inválidos, decimais e saldo insuficiente', () => {
  for(const invalid of [NaN,Infinity,-10,0,9,501,10.5,'50',null]) assert.throws(()=>validateBet(invalid,1000));
  assert.throws(()=>validateBet(100,99)); assert.throws(()=>validateBet(10,NaN));
  assert.doesNotThrow(()=>validateBet(10,10)); assert.doesNotThrow(()=>validateBet(500,1000));
});
test('jogos, cores, casas e símbolos desconhecidos são rejeitados', () => {
  assert.throws(()=>playRound('fake','red',10,100));
  assert.throws(()=>rouletteOutcome('<script>',10,1));
  assert.throws(()=>rouletteOutcome('red',10,37));
  assert.throws(()=>slotsOutcome(10,[0,0,4])); assert.throws(()=>slotsOutcome(10,[0,0]));
});
test('proteção contra overflow de saldo', () => {
  assert.throws(()=>playRound('roulette','green',500,Number.MAX_SAFE_INTEGER,()=>0));
});
test('randomInt rejeita cauda enviesada e devolve valor no intervalo', () => {
  let calls=0; const source={getRandomValues(array){array[0]=calls++===0?4294967295:36;return array;}};
  assert.equal(randomInt(37,source),36); assert.equal(calls,2);
  for(const max of [0,-1,1.2,2**32+1]) assert.throws(()=>randomInt(max));
  for(let i=0;i<100;i++) { const n=randomInt(37); assert.ok(n>=0&&n<37); }
});
test('animação sempre alinha a casa sorteada com o ponteiro', () => {
  let rotation=0;
  WHEEL_ORDER.forEach((number,index)=>{ const next=rotationFor(number,rotation); assert.ok(next>=rotation+1800); const remainder=(next+index*360/37)%360; assert.ok(Math.min(remainder,360-remainder)<1e-8); rotation=next; });
});
