import test from 'node:test';
import assert from 'node:assert/strict';
import {species,fresh,tick,life} from '../public/game.js';
import {roomMoment,roomMomentPose,roomMoodPreference} from '../public/room-life.js';
import {enrichPose} from '../public/room-enrichment.js';
import {ambientSlot} from '../public/calm-behavior.js';

const now=Date.parse('2026-10-27T12:00:00Z');
const sFor=id=>({id:'motion-'+id,species:id,born:now-8*3600000,health:95,hunger:95,energy:90,happy:70,character:{curiosity:90,playfulness:45},room:{shelf:true,plant:true,toy:true},cozy:{owned:{toybox:true,cushion:true,mirror:true},items:{},preferences:{object:{}}}});
const emotion=(s,kind)=>({...s,emotion:{kind,at:now-1000,until:now+90000,strength:1}});
test('14 species keep one emotion-guided visual route without mutating game state',()=>{
 assert.equal(species.length,14);
 for(const {id} of species){
  const s=sFor(id);
  for(const mood of ['bored','curious','hurt','angry','anxious']){
   const p=emotion(s,mood),before=structuredClone(p);
   const choice=roomMoodPreference(p,['shelf','plant','toybox','mirror','cushion'],1,now);
   assert.ok(choice?.item,id+' '+mood);
   const m={item:choice.item,kind:choice.kind,emotionStyle:choice.mood,auto:true,at:now-14000,until:now+2000,origin:{x:96,feet:130}};
   for(const style of ['classic','detailed']){
    const pose=roomMomentPose(p,m,style,now,false);
    const enriched=enrichPose(p,pose,now,false);
    assert.equal(enriched.enriched.emotionStyle,choice.mood);
    assert.ok(enriched.x>=20&&enriched.x<=172);
    assert.ok(enriched.feet>=80&&enriched.feet<=136);
    assert.ok(enriched.scale>0&&Number.isFinite(enriched.scale));
    const reduced=enrichPose(p,roomMomentPose(p,m,style,now,true),now,true);
    assert.equal(reduced.enriched.mood!==undefined,true);
    assert.equal(reduced.enriched.emotionStyle,undefined);
   }
   assert.deepEqual(p,before);
  }
 }
});
test('comfort reduces animation amplitude but does not change the item route',()=>{
 const s=sFor('bunny'),base={item:'toy',kind:'play',auto:true,at:now-15000,until:now+1000,origin:{x:96,feet:130}};
 const plain=enrichPose(s,roomMomentPose(s,base,'classic',now),now);
 const comfort=enrichPose(s,roomMomentPose(s,{...base,emotionStyle:'comfort'},'classic',now),now);
 assert.equal(comfort.interaction.item,plain.interaction.item);
 assert.equal(comfort.interaction.kind,plain.interaction.kind);
 assert.ok(Number.isFinite(comfort.feet));
 assert.ok(comfort.scale<plain.scale);
});
test('curiosity can continue multi-step exploration without doubling ambient slots',()=>{
 const s=emotion(sFor('monkey'),'curious');let slot=null;
 for(let i=0;i<4500;i++){
  const candidate=ambientSlot(s,now+i*5000);
  if(candidate?.lane==='room'&&candidate.block%5===1){slot=candidate;break;}
 }
 assert.ok(slot);
 s.emotion.at=slot.at-1000;s.emotion.until=slot.until+20000;
 const early=roomMoment(s,slot.at+1000);
 const later=roomMoment(s,slot.at+9000);
 assert.ok(early?.auto&&later?.auto);
 assert.equal(early.emotionStyle,'explore');
 assert.ok(later.at>=early.at);
 assert.ok(later.until<=slot.until);
});
test('older pet saves still animate and tick without emotion fields',()=>{
 for(const {id} of species){
  const s=fresh(id,now-life.teen-10000);s.updated=now;s.routine.enabled=false;delete s.emotion;
  const beforeSpecies=s.species;
  tick(s,now);assert.equal(s.species,beforeSpecies);
  const m={item:'toy',kind:'play',at:now-4000,until:now+1000,auto:true};
  assert.ok(enrichPose(s,roomMomentPose(s,m,'classic',now),now));
 }
});
