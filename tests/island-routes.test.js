import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {PetRoom} from '../src/worker.js';
import {requestSignature} from '../src/request-receipts.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const key='hlk_'+'Z'.repeat(32),secret='a'.repeat(64),token='433054048.'+secret;
const origin='https://pixel-pets.example.workers.dev';
function room(){
 const map=new Map(),pending=[];
 const storage={get:async k=>map.get(k),put:async(k,v)=>{map.set(k,v)},delete:async k=>{map.delete(k)},setAlarm:async()=>{},deleteAlarm:async()=>{}};
 const ctx={storage,blockConcurrencyWhile:fn=>fn(),waitUntil:p=>pending.push(p)};
 return {pet:new PetRoom(ctx,{}),map,pending};
}
async function send(pet,path,body={},auth=token){
 const res=await pet.fetch(new Request('https://pet/internal/widget/island/'+path,{method:'POST',headers:{'X-Widget-Token':auth,'X-Companion-Origin':origin},body:JSON.stringify(body)}));
 return {status:res.status,data:await res.json()};
}
test('native Dynamic Island bridge connects only to authenticated Telegram pet; secret stays private',async()=>{
 const r=room(),original=globalThis.fetch;
 await r.map.set('widget-access',{hash:await requestSignature('widget',secret),created:Date.now()});
 await r.map.set('pet',{name:'Чуча',species:'dog',born:Date.now()-10*86400000,hunger:96,clean:97,happy:23,energy:78,health:96,updated:Date.now()});
 const calls=[];
 try{
  globalThis.fetch=async(url,options)=>{
   calls.push({url,options});
   return Response.json({state:'ongoing'},{status:options.method==='POST'?201:200});
  };
  assert.equal((await send(r.pet,'status',{},'433054048.'+'b'.repeat(64))).status,401);
  const result=await send(r.pet,'connect',{key});assert.equal(result.status,200);
  assert.equal(result.data.enabled,true);
  const status=await send(r.pet,'status');assert.equal(status.data.enabled,true);
  assert.equal(status.data.key,undefined);
  assert.equal(r.map.get('island-bridge').key,key);
  assert.deepEqual(calls.map(c=>c.options.method),['GET','POST','PATCH']);
  const stop=await send(r.pet,'disconnect');assert.equal(stop.status,200);
  assert.equal(r.map.has('island-bridge'),false);
 }finally{globalThis.fetch=original}
});
