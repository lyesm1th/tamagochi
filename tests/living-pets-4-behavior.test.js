import test from 'node:test';
import assert from 'node:assert/strict';
import {species,fresh,tick,life} from '../public/game.js';
import {roomBehaviorChoice,roomMoment,roomMomentPose,drawRoomResponse,roomNeedPriority} from '../public/room-life.js';
import {roomHabitOf} from '../public/room-experience.js';
import {ambientSlot} from '../public/calm-behavior.js';

const at=Date.parse('2026-10-27T09:00:00Z');
const all=['shelf','plant','cushion','rug','toybox','toy','laser'];
function pet(id,discipline=85){return {
 id:'living4-'+id,species:id,born:at-8*3600000,
 discipline,health:95,hunger:95,energy:94,happy:65,
 room:{toy:true,plant:true,shelf:true},cozy:{owned:{cushion:true,rug:true,toybox:true,laser:true},items:{},preferences:{object:{}}},
 character:{playfulness:80},behaviorMemory:{habits:{tidy:{repaired:2,defiant:0},requests:{repaired:2,defiant:0}}}
};}

test('manners shape autonomous preferences for every playable species without mutating pet data',()=>{
 assert.equal(species.length,14);
 for(const {id} of species){
  const well=pet(id),before=structuredClone(well);
  const choice=roomBehaviorChoice(well,all,3);
  assert.equal(choice?.style,'careful',id);
  assert.ok(['shelf','plant','cushion','rug'].includes(choice.item),id);
  assert.deepEqual(well,before);
  const unruly=pet(id,20);
  unruly.behaviorMemory.habits.requests={defiant:4,repaired:0};
  assert.equal(roomBehaviorChoice(unruly,all,3)?.style,'restless',id);
  assert.ok(['toybox','toy','laser','rug'].includes(roomBehaviorChoice(unruly,all,3).item));
 }
});
test('explicit boundaries and repaired/defiant memories moderate behavior decisions',()=>{
 for(const {id} of species){
  const s=pet(id);
  assert.equal(roomBehaviorChoice(s,all,2),null);
  assert.equal(roomBehaviorChoice(s,['bed'],3),null);
  s.cozy.preferences.object.annoy='shelf';
  assert.notEqual(roomBehaviorChoice(s,all,3)?.item,'shelf');
  s.behaviorMemory.habits.tidy={repaired:0,defiant:15};
  assert.equal(roomBehaviorChoice(s,all,3),null);
  s.discipline=20;
  s.behaviorMemory.habits.requests={defiant:3,repaired:0};
  assert.equal(roomBehaviorChoice(s,all,3)?.style,'restless');
  assert.equal(roomNeedPriority({...s,energy:50},['bed','toy']),'bed');
  assert.equal(roomNeedPriority({...s,hunger:50},['bowl','toy']),'bowl');
 }
});
test('behavior signals act only in existing room slots, honoring loved items, moods, and manual actions',()=>{
 const s=pet('monkey');let candidate;
 for(let i=0;i<5500;i++){
  const slot=ambientSlot(s,at+i*5000);
  if(slot?.lane==='room'&&slot.block%11===3&&slot.block%3!==0&&slot.block%5!==1){candidate=slot;break;}
 }
 assert.ok(candidate);
 const now=candidate.at+1000,prior=structuredClone(s),m=roomMoment(s,now);
 assert.equal(m?.auto,true);
 assert.equal(m?.behaviorStyle,'careful');
 assert.deepEqual(s,prior);
 s.cozy.preferences.object.love='toy';
 assert.equal(roomMoment(s,now)?.item,'toy');
 s.cozy.preferences.object={};
 s.energy=50;
 assert.notEqual(roomMoment(s,now)?.behaviorStyle,'careful');
 s.energy=95;
 s.living={motion:{kind:'use',item:'toy',at:now,until:now+12000}};
 assert.equal(roomMoment(s,now)?.manual,true);
 s.dead=true;assert.equal(roomMoment(s,now),null);
});
test('both drawing modes safely render optional behavior details and honor reduced motion',()=>{
 const s=pet('duck');const now=at+13000;
 for(const style of ['classic','detailed']){
  const m={item:'toy',kind:'play',auto:true,at,until:at+14000,behaviorStyle:'careful'};
  const p=roomMomentPose(s,m,style,now,false),p2=roomMomentPose(s,m,style,now,true);
  assert.equal(p.interaction.behaviorStyle,'careful');
  const draw=(pose,reduced)=>{const rectangles=[];const c={canvas:{width:style==='classic'?192:384},fillRect(...args){assert.ok(args.every(Number.isFinite));rectangles.push(args);},fillText(){}};drawRoomResponse(c,s,pose,now,reduced);return rectangles;};
  assert.ok(draw(p,false).length>draw({...p,interaction:{...p.interaction,behaviorStyle:null}},false).length);
  assert.deepEqual(draw(p2,true),draw({...p2,interaction:{...p2.interaction,behaviorStyle:null}},true));
 }
});
test('old saves can tick without a behavior memory, including all 14 species',()=>{
 for(const {id} of species){
  const s=fresh(id,at-life.teen-60000);s.updated=at;s.routine.enabled=false;
  delete s.behaviorMemory;delete s.living.roomExperience;
  const old=structuredClone(s);
  assert.equal(roomBehaviorChoice(s,all,3),null);
  tick(s,at);
  assert.equal(s.species,old.species);
 }
});
