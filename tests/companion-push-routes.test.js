import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {PetRoom} from '../src/worker.js';
import {requestSignature} from '../src/request-receipts.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;

function mockRoom(){
 const map=new Map(),alarms=[];
 const storage={
  get:async key=>map.get(key),put:async(key,value)=>{map.set(key,value);},
  delete:async key=>{map.delete(key);},
  setAlarm:async time=>{alarms.push(time);},
  deleteAlarm:async()=>{alarms.push(null);},
  transaction:async callback=>callback()
 };
 const ctx={storage,blockConcurrencyWhile:async callback=>callback()};
 return {room:new PetRoom(ctx,{}),map,alarms};
}
async function invoke(room,path,token,body={},extras={}){
 const req=new Request('https://pet/internal/widget/'+path,{method:'POST',
 headers:{'X-Widget-Token':token,'X-Companion-Origin':'https://pets.example.org',...extras},
 body:JSON.stringify(body)});
 const response=await room.fetch(req);return {status:response.status,data:await response.json()};
}
test('push subscription persists per-user and is invalidated by another pairing',async()=>{
 const {room,map}=mockRoom();
 const secret='a'.repeat(64),token='123.'+secret;
 map.set('widget-access',{hash:await requestSignature('widget',secret),created:Date.now()});
 const key=await invoke(room,'push-key',token);
 assert.equal(key.status,200);
 assert.equal(typeof key.data.publicKey,'string');
 assert.ok(map.get('push-vapid')?.privateJwk?.d);
 assert.equal(key.data.privateJwk,undefined);
 const subscription={endpoint:'https://web.push.apple.com/test',
  keys:{p256dh:key.data.publicKey,auth:Buffer.alloc(16,4).toString('base64url')}};
 const stored=await invoke(room,'push-subscribe',token,{subscription,timezone:'Europe/Kyiv'});
 assert.equal(stored.status,200);
 assert.equal(map.get('push-reminders')?.enabled,true);
 assert.equal(map.get('push-subscription')?.origin,'https://pets.example.org');
 const bad=await invoke(room,'push-subscribe',token,{subscription:{...subscription,endpoint:'https://127.0.0.1/'}});
 assert.equal(bad.status,400);
 const newPair=await invoke(room,'pair','',{},{'X-Pet-Owner':'123'});
 assert.equal(newPair.status,200);
 assert.match(newPair.data.token,/^123[.][a-f0-9]{64}$/);
 assert.equal(map.has('push-subscription'),false);
 assert.equal(map.get('push-reminders')?.enabled,false);
 const stale=await invoke(room,'push-key',token);
 assert.equal(stale.status,401);
});
test('push management requires valid paired token',async()=>{
 const {room}=mockRoom();
 const bad=await invoke(room,'push-key','555.'+'b'.repeat(64));
 assert.equal(bad.status,401);
});
