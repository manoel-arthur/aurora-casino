import test from 'node:test';
import assert from 'node:assert/strict';
import { listProviders, createDemoSession } from '../server/providers.mjs';
import { createServer } from '../scripts/server.mjs';

test('fornecedores não configurados nunca lançam uma sessão',async()=>{
  assert.equal(listProviders().length,2);
  for(const provider of listProviders()) { assert.equal(provider.status,'not_configured'); await assert.rejects(createDemoSession({providerId:provider.id,gameId:'example',mode:'demo'}),{code:'PROVIDER_NOT_CONFIGURED'}); }
});
test('contrato rejeita modo real, URL, fornecedor desconhecido e campos extras',async()=>{
  const base={providerId:'pg-soft',gameId:'example',mode:'demo'};
  await assert.rejects(createDemoSession({...base,mode:'real'}),{code:'DEMO_ONLY'});
  await assert.rejects(createDemoSession({...base,gameId:'https://evil.example/'}),{code:'INVALID_GAME'});
  await assert.rejects(createDemoSession({...base,providerId:'unknown'}),{code:'UNKNOWN_PROVIDER'});
  await assert.rejects(createDemoSession({...base,url:'http://127.0.0.1'}),{code:'INVALID_REQUEST'});
});
test('rotas de integração validam origem, tamanho, JSON e indisponibilidade',async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  try {
    const listing=await fetch(origin+'/api/providers');assert.equal(listing.status,200);assert.equal((await listing.json()).providers[0].status,'not_configured');
    const post=(body,headers={})=>fetch(origin+'/api/demo-sessions',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body});
    assert.equal((await post('{}',{Origin:'https://evil.example'})).status,403);
    assert.equal((await post('{}',{'Content-Type':'text/plain'})).status,415);
    assert.equal((await post('x'.repeat(3000))).status,413);
    assert.equal((await post('{')).status,400);
    const response=await post(JSON.stringify({providerId:'pg-soft',gameId:'example',mode:'demo'}));assert.equal(response.status,503);assert.equal((await response.json()).error,'PROVIDER_NOT_CONFIGURED');
    assert.equal((await fetch(origin+'/server/providers.mjs')).status,404);
  } finally {await new Promise(resolve=>server.close(resolve));}
});
