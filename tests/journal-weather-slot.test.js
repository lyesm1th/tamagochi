import test from 'node:test';
import assert from 'node:assert/strict';
import {ambientSlot} from '../public/calm-behavior.js';
import {journalAmbient} from '../public/life-journal.js';
import {ambient} from '../public/lively.js';
const now=1800000000000;
const pet=id=>({id,species:'cat',born:now-86400000,
 health:98,energy:98,hunger:98,happy:98,lively:{},room:{},cozy:{},world:{},
 journal:{quirk:{id:'hiccup'},courage:{storm:0},drawings:[]}});
test('reusing a weather lane slot preserves every journal ambient answer',()=>{
 for(const id of ['weather-cat','another-cat','third-cat']){
  const s=pet(id);
  for(let t=now;t<now+900000;t+=5000){
   const slot=ambientSlot(s,t);
   assert.deepEqual(journalAmbient(s,t,slot),journalAmbient(s,t),id+':'+t);
  }
 }
});
test('manual gestures keep priority over a supplied unrelated ambient slot',()=>{
 const s=pet('manual');
 s.journal.gesture={kind:'towel',x:77,until:now+3000};
 assert.deepEqual(journalAmbient(s,now,{lane:'habit'}),journalAmbient(s,now));
 s.journal.together=true;
 assert.deepEqual(journalAmbient(s,now,{lane:'habit'}),journalAmbient(s,now));
});
test('explicit null and nonweather slots do not produce weather moments',()=>{
 const s=pet('suppressed');
 assert.equal(journalAmbient(s,now,null),null);
 assert.equal(journalAmbient(s,now,{lane:'habit'}),null);
});
test('integrated ambient still respects manually active gesture and sleep',()=>{
 const s=pet('integrated');
 s.journal.gesture={kind:'towel',x:77,until:now+3000};
 assert.deepEqual(ambient(s,now),journalAmbient(s,now));
 assert.equal(ambient({...s,sleeping:true},now),null);
});
