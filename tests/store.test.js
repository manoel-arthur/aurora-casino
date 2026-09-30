import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, loadState, saveState, settleRound, STORAGE_KEY } from '../src/store.js';
const memory = () => { const map=new Map(); return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)}; };

test('sessão nova começa com 1000 fichas e histórico vazio',()=>{assert.deepEqual(loadState(memory()),{state:initialState(),persistent:true});});
test('saldo e histórico são persistidos em uma transação',()=>{const storage=memory();const {state,round}=settleRound(initialState(),'roulette','red',50,()=>1);assert.equal(state.balance,1050);assert.equal(state.rounds,1);assert.equal(state.history[0],round);assert.ok(saveState(storage,state));assert.deepEqual(loadState(storage).state,state);});
test('dados corrompidos ou forjados não quebram a aplicação',()=>{
  for(const raw of ['{','null',JSON.stringify({version:1,balance:-5,rounds:0,history:[]}),JSON.stringify({version:1,balance:1000,rounds:1,history:[{game:'<img src=x onerror=alert(1)>'}]})]) {const storage=memory();storage.setItem(STORAGE_KEY,raw);assert.deepEqual(loadState(storage),{state:initialState(),persistent:false});}
});
test('armazenamento bloqueado permite continuar em memória',()=>{const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};assert.equal(loadState(blocked).persistent,false);assert.equal(saveState(blocked,initialState()),false);});
test('histórico é limitado a 30 e aposta inválida não altera sessão',()=>{let state=initialState();for(let i=0;i<40;i++)state=settleRound(state,'roulette','red',10,()=>1).state;assert.equal(state.rounds,40);assert.equal(state.history.length,30);const snapshot=structuredClone(state);assert.throws(()=>settleRound(state,'roulette','red',-1,()=>1));assert.deepEqual(state,snapshot);});
