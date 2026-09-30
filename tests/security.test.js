import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from '../scripts/server.mjs';

test('servidor restringe arquivos, métodos e aplica cabeçalhos',async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  try {
    const response=await fetch(base);assert.equal(response.status,200);assert.match(response.headers.get('content-security-policy'),/script-src 'self'/);assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.equal(response.headers.get('x-frame-options'),'DENY');
    for(const path of ['/.env','/.git/config','/package.json','/tests/games.test.js','/%2e%2e%2fpackage.json']) assert.equal((await fetch(base+path)).status,404,path);
    assert.equal((await fetch(base,{method:'POST',body:'anything'})).status,405);
    assert.equal((await fetch(base+'/%invalid')).status,400);
    assert.equal((await fetch(base+'/src/app.js')).headers.get('content-type'),'text/javascript; charset=utf-8');
  } finally {await new Promise(resolve=>server.close(resolve));}
});
test('interface não contém sinks comuns de execução de HTML ou JavaScript',async()=>{
  const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
  assert.doesNotMatch(app,/innerHTML|outerHTML|insertAdjacentHTML|document\.write|\beval\s*\(|new Function/);
});
