import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {newIslandCareToken,careButtons} from '../src/island-care.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const origin='https://pixel-pets.example.workers.dev';
test('Care button tokens are random and scoped to one server endpoint',()=>{
 const a=newIslandCareToken(),b=newIslandCareToken();
 assert.match(a,/^[a-f0-9]{64}$/);
 assert.notEqual(a,b);
 const controls=careButtons(origin,'777',a,{sleeping:false,mood:{clean:85}});
 assert.equal(controls.primary.title,'🍗 Годувати');
 assert.equal(controls.secondary.title,'❤️ Погладити');
 for(const button of [controls.primary,controls.secondary]){
  assert.equal(button.url,origin+'/api/island/care/777');
  assert.equal(button.method,'POST');
  assert.equal(button.foreground,false);
  assert.equal(button.headers['X-Pet-Care-Key'],a);
  assert.ok(['feed','pet'].includes(JSON.parse(button.body).action));
  assert.ok(!JSON.stringify(button).includes('hlk_'));
 }
});
test('Care buttons use context and reject invalid identity, token, origin',()=>{
 const secret='a'.repeat(64);
 assert.equal(careButtons(origin,'777',secret,{sleeping:true,mood:{clean:90}}).primary.title,'☀️ Розбудити');
 assert.equal(careButtons(origin,'777',secret,{sleeping:false,mood:{clean:20}}).primary.title,'🧹 Прибрати');
 assert.throws(()=>careButtons('http://localhost','777',secret,{}));
 assert.throws(()=>careButtons(origin,'../../admin',secret,{}));
 assert.throws(()=>careButtons(origin,'777','short',{}));
});
