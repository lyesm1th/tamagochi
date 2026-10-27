import test from 'node:test';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {roomExperienceAvoidance,recordRoomExperience} from '../public/room-experience.js';
import {roomMoment,roomNeedPriority} from '../public/room-life.js';
import {ambientSlot} from '../public/calm-behavior.js';
const at=Date.parse('2026-10-27T10:00:00Z');
const pet=id=>({id:'avoid-'+id,species:id,born:at-10000000,health:90,happy:65,hunger:95,energy:90,
 room:{laser:true,toy:true},cozy:{items:{},preferences:{object:{}}},living:{roomExperience:{items:{laser:{score:-3,count:4,lastAt:at}},lastEvent:'prior'}}});
test('negative experiences never permanently block availability or change saved data for any of 14 pets',()=>{
 assert.equal(species.length,14);
 for(const {id} of species){
  const s=pet(id),snapshot=structuredClone(s);
  assert.deepEqual(roomExperienceAvoidance(s,['laser','toy']),['laser'],id);
  assert.deepEqual(roomExperienceAvoidance(s,['toy']),[],id);
  assert.deepEqual(s,snapshot);
  assert.equal(roomNeedPriority({...s,energy:45},['bed','laser']),'bed');
  assert.equal(roomNeedPriority({...s,hunger:45},['bowl','laser']),'bowl');
 }
});
test('neutral autonomous room choices avoid frustrating games when alternatives exist',()=>{
 for(const {id} of species){
  const s=pet(id);
  let count=0;
  for(let i=0;i<2400;i++){
   const slot=ambientSlot(s,at+i*5000);
   if(slot?.lane!=='room'||slot.block%3===0||slot.block%5===1||slot.block%11===3)continue;
   const m=roomMoment(s,slot.at+100);
   if(!m||m.originItem)continue;
   assert.notEqual(m.item,'laser',id);
   count++;
  }
  assert.ok(count>0,id);
 }
});
test('when all available items have setbacks, pet can still use the room',()=>{
 const s=pet('cat');
 s.room={laser:true};s.living.roomExperience.items.laser.score=-4;
 for(let i=0;i<1600;i++){
  const slot=ambientSlot(s,at+i*5000);
  if(slot?.lane!=='room')continue;
  const m=roomMoment(s,slot.at+100);
  assert.equal(m?.item,'laser');
  return;
 }
 assert.fail('expected a room slot');
});
test('new positive experiences can reverse avoidance without a reset',()=>{
 for(const {id} of species){
  const s=pet(id);
  for(let i=0;i<4;i++){
   const when=at+i*150000,scene={item:'laser',kind:'play',auto:true,at:when,until:when+14000};
   assert.equal(recordRoomExperience(s,scene,'caught',when+13000),true);
  }
  assert.equal(s.living.roomExperience.items.laser.score,1);
  assert.deepEqual(roomExperienceAvoidance(s,['laser','toy']),[]);
 }
});
test('manual interactions and explicit likes remain higher priority than neutral avoidance',()=>{
 const s=pet('penguin');
 let slot;
 for(let i=0;i<1200;i++){
  const found=ambientSlot(s,at+i*5000);
  if(found?.lane==='room'&&found.block%3!==0){slot=found;break;}
 }
 assert.ok(slot);
 const now=slot.at+100;
 s.cozy.preferences.object.love='laser';
 assert.equal(roomMoment(s,now)?.item,'laser');
 s.cozy.preferences.object={};
 s.living.motion={item:'laser',kind:'use',at:now,until:now+6000};
 assert.equal(roomMoment(s,now)?.manual,true);
});
