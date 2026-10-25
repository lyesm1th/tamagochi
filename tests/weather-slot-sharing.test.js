import test from 'node:test';
import assert from 'node:assert/strict';
import {journalAmbient} from '../public/life-journal.js';
import {ambientSlot} from '../public/calm-behavior.js';
import {ambient} from '../public/lively.js';

const now=1800000000000;
const pet=id=>({id,species:'frog',born:now-86400000,lively:{},room:{},cozy:{},world:{},journal:{quirk:{id:'hiccup'},courage:{storm:0}},health:95,energy:95,hunger:95,happy:95});

test('precomputed weather slots preserve journal responses across weather windows',()=>{
 for(const id of ['journal-weather-a','journal-weather-b','journal-weather-c']){
  const s=pet(id);
  let seen=0;
  for(let t=now;t<now+6*3600000;t+=15000){
   const slot=ambientSlot(s,t);
   const original=journalAmbient(s,t);
   const shared=journalAmbient(s,t,slot);
   assert.deepEqual(shared,original,id+':'+t);
   if(slot?.lane==='weather')seen++;
  }
  assert.ok(seen>0,id);
 }
});
test('explicitly nonweather slot does not create weather reactions',()=>{
 const s=pet('journal-nonweather');
 assert.equal(journalAmbient(s,now,{lane:'habit'}),null);
 assert.equal(journalAmbient(s,now,null),null);
});
test('manual journal gestures preserve priority over automatic weather',()=>{
 const s=pet('manual-journal');
 s.journal.gesture={kind:'lamp',until:now+4000,x:88};
 const answer=journalAmbient(s,now,{lane:'room'});
 assert.equal(answer?.kind,'lamp');
 assert.deepEqual(answer,journalAmbient(s,now));
});
test('ambient behavior remains silent during manual together mode and sleep',()=>{
 const s=pet('journal-suppressed');
 assert.equal(ambient({...s,sleeping:true},now),null);
 assert.equal(ambient({...s,journal:{...s.journal,together:true}},now),null);
});
