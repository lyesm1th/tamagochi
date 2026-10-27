import test from 'node:test';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {roomMoment,roomMomentPose} from '../public/room-life.js';
import {enrichPose} from '../public/room-enrichment.js';
import {ambientSlot} from '../public/calm-behavior.js';
const at=Date.parse('2026-10-27T13:00:00Z');
const pet=id=>({id:'continuity-'+id,species:id,born:at-9*3600000,energy:90,hunger:94,health:95,happy:65,
 character:{curiosity:90,playfulness:42},room:{shelf:true,plant:true,mirror:true,toy:true},cozy:{owned:{cushion:true,toybox:true,rug:true},items:{},preferences:{object:{}}}});
function findRoom(s,accept){
 for(let i=0;i<5200;i++){
  const slot=ambientSlot(s,at+i*5000);
  if(slot?.lane==='room'&&accept(slot))return slot;
 }
 return null;
}
test('emotion guidance survives multi-stop autonomous exploration for all 14 species',()=>{
 assert.equal(species.length,14);
 for(const {id} of species){
  const s=pet(id),slot=findRoom(s,q=>q.block%5===1);
  assert.ok(slot,id);
  s.emotion={kind:'curious',at:slot.at-1000,until:slot.until+60000,strength:.8};
  const before=structuredClone(s);
  const start=roomMoment(s,slot.at+1500),end=roomMoment(s,slot.at+9500);
  assert.ok(start?.auto&&end?.auto,id);
  assert.equal(start.emotionStyle,'explore',id);
  assert.equal(end.emotionStyle,'explore',id);
  assert.equal(end.until,slot.until,id);
  if(end.originItem)assert.equal(end.originItem,start.item,id);
  for(const style of ['classic','detailed']){
   const pose=enrichPose(s,roomMomentPose(s,end,style,slot.at+12000),slot.at+12000,false);
   assert.equal(pose.interaction.emotionStyle,'explore');
   assert.ok(Number.isFinite(pose.scale));
  }
  assert.deepEqual(s,before,id);
 }
});
test('careful educational motivation persists through a second item without overriding urgency',()=>{
 const s=pet('sheep');s.discipline=90;s.behaviorMemory={habits:{tidy:{repaired:2,defiant:0},requests:{repaired:2,defiant:0}}};
 const slot=findRoom(s,q=>q.block%11===3&&q.block%3!==0&&q.block%5!==1);
 assert.ok(slot);
 const first=roomMoment(s,slot.at+1000),second=roomMoment(s,slot.at+9000);
 assert.equal(first.behaviorStyle,'careful');
 assert.equal(second.behaviorStyle,'careful');
 s.energy=50;s.room.bed=true;
 assert.equal(roomMoment(s,slot.at+1000)?.item,'bed');
 assert.notEqual(roomMoment(s,slot.at+1000)?.behaviorStyle,'careful');
});
test('manual room interactions do not inherit stale autonomous motivation',()=>{
 const s=pet('penguin'),slot=findRoom(s,q=>q.block%5===1);
 assert.ok(slot);
 const now=slot.at+1200;
 s.living={motion:{item:'toy',kind:'use',at:now-1000,until:now+4000}};
 const m=roomMoment(s,now);
 assert.equal(m.manual,true);
 assert.equal(m.emotionStyle,undefined);
 assert.equal(m.behaviorStyle,undefined);
});
