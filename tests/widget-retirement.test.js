import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import worker,{PetRoom} from '../src/worker.js';
import {requestSignature} from '../src/request-receipts.js';
import {fresh} from '../public/game.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;

// Verify retired routes and legacy widget APIs through the public Worker.
const owner='777',secret='a'.repeat(64),token=owner+'.'+secret;
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
 data.set('pet',{...fresh('dog',Date.now()),born:Date.now()-10*86400000,updated:Date.now(),name:'Чуча',hunger:50,happy:60,energy:78,clean:97,lastAction:0});
 const call=async(path,body={},bearer=token)=>{
  const response=await worker.fetch(new Request(origin+'/api/widget/'+path,{method:'POST',headers:{
   Authorization:'Bearer '+bearer,'Content-Type':'application/json'
  },body:JSON.stringify(body)}),env);
  return {status:response.status,data:await response.json()};
 };
 return {call,data};
};
test('legacy widget state and push key remain available; retired credentials are removed',async()=>{
 const {call,data}=await createHarness();
 data.set('island-bridge',{enabled:true,key:'retired'});data.set('island-care-last',123);
 const state=await call('state');assert.equal(state.status,200);assert.equal(state.data.pet.name,'Чуча');
 assert.equal(data.has('island-bridge'),false);assert.equal(data.has('island-care-last'),false);
 const push=await call('push-key');assert.equal(push.status,200);assert.match(push.data.publicKey,/^[A-Za-z0-9_-]+$/);
 for(const path of ['island/connect','island/status','island/sync','island/disconnect','island/diagnostics'])assert.equal((await call(path)).status,404);
});
