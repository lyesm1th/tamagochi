import test from 'node:test';
import assert from 'node:assert/strict';
import {species, fresh, tick, life} from '../public/game.js';
import {roomMoment, roomSequenceStep, roomMomentPose, roomOwned} from '../public/room-life.js';
import {ambientSlot} from '../public/calm-behavior.js';

const at=Date.parse('2026-10-27T08:00:00Z');
const slot={at,until:at+14000};
const makePet=(speciesId)=>({
 id:'habit-audit-'+speciesId,species:speciesId,born:at-8*3600000,
 hunger:92,health:93,energy:91,happy:88,
 room:{toy:true,bed:true},
 cozy:{owned:{rug:true,cushion:true},items:{},preferences:{object:{}}},
 living:{roomExperience:{items:{rug:{score:4,count:5,lastAt:at}},lastEvent:'previous'}}
});

test('rituals follow a learned safe destination for all fourteen species',()=>{
 assert.equal(species.length,14);
 for(const {id} of species){
  const s=makePet(id),before=structuredClone(s);
  const first=roomSequenceStep(s,['toy','rug','cushion'],'toy',slot,at+8000);
  assert.deepEqual(first,{item:'rug',originItem:'toy',at:at+7000},id);
  assert.equal(roomSequenceStep(s,['toy','rug','cushion'],'toy',slot,at+5000),null,id);
  assert.deepEqual(s,before,id);
 }
});

test('disliked, broken, unavailable, and explicitly loved room objects cannot be bypassed by habit',()=>{
 for(const {id} of species){
  const s=makePet(id);
  s.cozy.preferences.object.annoy='rug';
  assert.equal(roomSequenceStep(s,['toy','rug','cushion'],'toy',slot,at+8000)?.item,'cushion',id);
  s.cozy.preferences.object={love:'toy'};
  assert.equal(roomSequenceStep(s,['toy','rug','cushion'],'toy',slot,at+8000),null,id);
  s.cozy.preferences.object={};
  assert.equal(roomSequenceStep(s,['toy','cushion'],'toy',slot,at+8000)?.item,'cushion',id);
 }
});

test('original quiet-room scheduler remains bounded and old save compatibility holds',()=>{
 for(const {id} of species){
  const s=makePet(id);delete s.living;
  assert.equal(roomSequenceStep(s,['toy','rug'],'toy',slot,at+8000)?.item,'rug',id);
  s.sleeping=true;
  assert.equal(roomMoment(s,at+8000),null,id);
  s.sleeping=false;s.dead=true;
  assert.equal(roomMoment(s,at+8000),null,id);
 }
});

test('manual controls preempt room rituals and older saves still tick safely',()=>{
 for(const {id} of species){
  const s=fresh(id,at-life.teen-3600000);
  s.updated=at;s.routine.enabled=false;s.hunger=s.energy=s.health=95;
  s.living?.roomExperience&&(delete s.living.roomExperience);
  const source=structuredClone(s);
  tick(s,at);
  assert.equal(s.dead,false,id);
  assert.equal(s.species,id);
  assert.equal(source.species,s.species);
 }
 const s=makePet('penguin');
 s.living.motion={item:'toy',kind:'use',at,until:at+9000};
 const manual=roomMoment(s,at+8000);
 assert.equal(manual?.manual,true);
 assert.equal(manual?.item,'toy');
});

test('the same personal ritual works in classic and detailed pose coordinates',()=>{
 const s=makePet('sheep');
 const follow=roomSequenceStep(s,['toy','rug','cushion'],'toy',slot,at+8000);
 const moment={...follow,kind:'roll',auto:true,until:slot.until};
 for(const style of ['classic','detailed']){
  const p=roomMomentPose(s,moment,style,at+8000,false);
  assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.feet));
  assert.equal(p.interaction.approaching,true);
  assert.equal(p.interaction.originItem,'toy');
  const end=roomMomentPose(s,moment,style,at+11000,false);
  assert.equal(end.interaction.acting,true);
 }
});
