import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import worker,{PetRoom} from '../src/worker.js';
import {requestSignature} from '../src/request-receipts.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;

// Exercise the real public /api/widget/island/... route through the Worker,
// including Durable Object routing and scoped token authorization.
const owner='777',secret='a'.repeat(64),token=owner+'.'+secret,key='hlk_'+'Z'.repeat(32);
const origin='https://pixel-pets.example.workers.dev';
const createHarness=async()=>{
 const data=new Map();
 const ctx={storage:{
   get:async k=>data.get(k),put:async(k,v)=>{data.set(k,v);},delete:async k=>{data.delete(k);},
   setAlarm:async()=>{},deleteAlarm:async()=>{}
 },blockConcurrencyWhile:fn=>fn(),waitUntil:()=>{}};
 const room=new PetRoom(ctx,{});
 const env={PETS:{idFromName:name=>name,get:id=>{assert.equal(id,owner);return room;}},ASSETS:{fetch:()=>Response.json({error:'unexpected asset'})}};
 data.set('widget-access',{hash:await requestSignature('widget',secret),created:Date.now()});
 data.set('pet',{name:'Чуча',species:'dog',born:Date.now()-10*86400000,
  hunger:96,clean:97,happy:23,energy:78,health:96,updated:Date.now()});
 const call=async(path,body={},bearer=token)=>{
  const response=await worker.fetch(new Request(origin+'/api/widget/'+path,{method:'POST',headers:{
   Authorization:'Bearer '+bearer,'Content-Type':'application/json'
  },body:JSON.stringify(body)}),env);
  return {status:response.status,data:await response.json()};
 };
 return {call,data};
};
test('public Worker preserves nested island/status route into pet room',async()=>{
 const {call}=await createHarness();
 const status=await call('island/status');
 assert.equal(status.status,200);
 assert.deepEqual({enabled:status.data.enabled,provider:status.data.provider},{enabled:false,provider:'PushWard'});
 assert.equal((await call('island/status',{},owner+'.'+'b'.repeat(64))).status,401);
 assert.equal((await call('totally-unknown')).status,404);
});
test('public island/connect → status → disconnect reaches PushWard provider with real scoped routing',async()=>{
 const {call,data}=await createHarness();
 const original=globalThis.fetch,calls=[];
 try{
  globalThis.fetch=async(url,options)=>{
   calls.push({url,method:options.method,body:options.body});
   return Response.json({ok:true},{status:options.method==='POST'?201:200});
  };
  const connected=await call('island/connect',{key});
  assert.equal(connected.status,200,JSON.stringify(connected));
  assert.equal(connected.data.enabled,true);
  assert.equal((await call('island/status')).data.enabled,true);
  assert.deepEqual(calls.map(x=>x.method),['GET','POST','PATCH']);
  assert.ok(data.get('island-bridge').key===key);
  const ended=await call('island/disconnect');
  assert.equal(ended.status,200);
  assert.equal((await call('island/status')).data.enabled,false);
  assert.equal(data.has('island-bridge'),false);
 }finally{globalThis.fetch=original;}
});
test('legacy flat widget routes remain available',async()=>{
 const {call}=await createHarness();
 const state=await call('state');
 assert.equal(state.status,200);
 assert.equal(state.data.pet.name,'Чуча');
 const push=await call('push-key');
 assert.equal(push.status,200);
 assert.match(push.data.publicKey,/^[A-Za-z0-9_-]+$/);
});

test('health diagnostics route is authenticated and does not disclose API or pairing secrets',async()=>{
 const {call}=await createHarness(),original=globalThis.fetch;
 try{
  globalThis.fetch=async()=>Response.json({status:'ok'});
  const health=await call('island/diagnostics');
  assert.equal(health.status,200);assert.equal(health.data.connection.ok,true);
  assert.ok(!JSON.stringify(health).includes(key));
  assert.ok(!JSON.stringify(health).includes(secret));
  assert.equal((await call('island/diagnostics',{},owner+'.'+'b'.repeat(64))).status,401);
  globalThis.fetch=async()=>{throw new TypeError('connection failed')};
  const failed=await call('island/connect',{key});
  assert.equal(failed.status,503);
  assert.equal(failed.data.stage,'authentication');
  assert.equal(failed.data.reason,'network');
  assert.ok(!JSON.stringify(failed).includes(key));
 }finally{globalThis.fetch=original}
});
