import test from 'node:test';
import assert from 'node:assert/strict';
import {emotionOf,feel} from '../public/emotions.js';
import {emotionLine,emotionLineFor} from '../public/emotion-dialogue.js';
import {chatter} from '../public/pet-chatter.js';
import {ambientSlot} from '../public/calm-behavior.js';
const base=1800000000000;
const pet=species=>({id:'stable-'+species,species,born:base-86400000,hunger:95,energy:95,health:95,happy:95,journal:{},cozy:{},world:{}});
test('chatter and legacy dialogue agree on the same emotional snapshot',()=>{
 for(const species of ['cat','dino','frog','penguin']){
  const s=pet(species);feel(s,'amused','Гра',base,.85,3600000);
  let slots=0;
  for(let t=base+1000;t<base+600000;t+=1000){
   if(ambientSlot(s,t)?.lane!=='chatter')continue;
   const bit=chatter(s,t),emotion=emotionOf(s,t);
   assert.equal(emotionLineFor(s,emotion),emotionLine(s,t));
   assert.equal(bit?.kind,'thought');
   assert.equal(bit?.text,emotionLineFor(s,emotion));
   slots++;
  }
  assert.ok(slots>0,species);
 }
});
test('quiet pet, sleep and critical needs retain suppression',()=>{
 const s=pet('cat');feel(s,'sad','Сум',base,.9,3600000);
 for(const patch of [{sleeping:true},{napping:true},{dead:true},{vacation:{}},{health:5},{hunger:5},{happy:5}]){
  for(let t=base;t<base+300000;t+=5000)assert.equal(chatter({...s,...patch},t),null);
 }
});
