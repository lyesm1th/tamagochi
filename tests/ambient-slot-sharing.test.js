import test from 'node:test';
import assert from 'node:assert/strict';
import {ambientSlot} from '../public/calm-behavior.js';
import {chatter} from '../public/pet-chatter.js';
import {ambient} from '../public/lively.js';
const now=1800000000000;
const pet=id=>({id,species:'cat',born:now-86400000,lively:{},room:{},cozy:{},world:{},journal:{},health:98,energy:98,hunger:98,happy:98});
test('reusing an ambient slot preserves chatter schedule, content and IDs',()=>{
 for(const id of ['ambient-cat','another-cat','third-cat']){
  const s=pet(id);
  for(let t=now;t<now+900000;t+=5000){
   const slot=ambientSlot(s,t);
   assert.deepEqual(chatter(s,t,slot),chatter(s,t),id+':'+t);
  }
 }
});
test('explicit non-chatter slots stay silent, including an explicit null',()=>{
 const s=pet('non-chatter');
 assert.equal(chatter(s,now,null),null);
 assert.equal(chatter(s,now,{lane:'habit'}),null);
});
test('manual activity, critical needs and sleep stay silent in integrated ambient behavior',()=>{
 const s=pet('suppressed');
 for(const patch of [{sleeping:true},{dead:true},{vacation:{}},{health:10},{hunger:10},{energy:10},{journal:{together:true}}]){
  for(let t=now;t<now+300000;t+=10000)assert.equal(ambient({...s,...patch},t),null);
 }
});
