import test from 'node:test';
import assert from 'node:assert/strict';
import {species,fresh,tick,life} from '../public/game.js';
import {recordRoomExperience,roomExperienceChoice} from '../public/room-experience.js';
import {roomMoment,roomActivityFinale} from '../public/room-life.js';
import {ambientSlot} from '../public/calm-behavior.js';

const start=Date.parse('2026-10-26T12:00:00Z');
const makePet=id=>({id:'room-experience-'+id,species:id,born:start-life.teen-3600000,
 hunger:95,energy:95,health:95,happy:95,room:{laser:true,toy:true},
 cozy:{items:{},preferences:{object:{}}}});
const finale=(item,at=start,kind='play')=>({auto:true,item,kind,at,until:at+14000});

test('all 14 pets learn from a room outcome once, with bounded non-economic memory',()=>{
 assert.equal(species.length,14);
 for(const {id} of species){
  const s=makePet(id);const before=structuredClone(s),m=finale('laser');
  assert.equal(recordRoomExperience(s,m,'caught',start+13000),true,id);
  assert.equal(recordRoomExperience(s,m,'caught',start+13000),false,id);
  assert.equal(s.living.roomExperience.items.laser.score,1,id);
  assert.equal(s.living.roomExperience.items.laser.count,1,id);
  assert.equal(s.happy,before.happy);assert.equal(s.energy,before.energy);
  assert.equal(s.coins,before.coins);assert.equal(s.cozy.items.laser,undefined);
  assert.equal(recordRoomExperience(s,finale('laser',start+150000),'miss',start+163000),true,id);
  assert.equal(s.living.roomExperience.items.laser.score,0,id);
 }
});

test('success, missed laser and quiet rest remain capped, and only finished autonomous scenes count',()=>{
 const s=makePet('monkey'),m=finale('laser');
 for(let i=0;i<12;i++)recordRoomExperience(s,finale('laser',start+i*150000),'caught',start+i*150000+13000);
 assert.equal(s.living.roomExperience.items.laser.score,4);
 for(let i=12;i<24;i++)recordRoomExperience(s,finale('laser',start+i*150000),'miss',start+i*150000+13000);
 assert.equal(s.living.roomExperience.items.laser.score,-4);
 const before=structuredClone(s);
 assert.equal(recordRoomExperience(s,m,'caught',start+12000),false);
 assert.equal(recordRoomExperience(s,{...m,auto:false},'caught',start+13000),false);
 assert.equal(recordRoomExperience(s,m,'unknown',start+13000),false);
 assert.equal(recordRoomExperience(s,m,'caught',start+14000),false);
 assert.deepEqual(s,before);
});

test('learned choices are occasional and require at least two positive experiences',()=>{
 for(const {id} of species){
  const s=makePet(id);
  assert.equal(roomExperienceChoice(s,['laser','toy'],2),null);
  recordRoomExperience(s,finale('laser'), 'caught',start+13000);
  assert.equal(roomExperienceChoice(s,['laser','toy'],2),null);
  recordRoomExperience(s,finale('laser',start+150000),'caught',start+163000);
  assert.equal(roomExperienceChoice(s,['laser','toy'],2),'laser');
  for(const n of [0,1,3,4,5,6])assert.equal(roomExperienceChoice(s,['laser','toy'],n),null);
  assert.equal(roomExperienceChoice(s,['toy'],2),null);
  assert.equal(roomExperienceChoice(s,[],2),null);
 }
});

test('experience does not bypass existing explicit liked or disliked items',()=>{
 const s=makePet('fox');
 s.living={roomExperience:{items:{laser:{score:4,count:4,lastAt:start}},lastEvent:'prior'}};
 let selected=null;
 for(let i=0;i<4000;i++){
  const slot=ambientSlot(s,start+i*5000);
  if(slot?.lane!=='room'||slot.block%7!==2||slot.block%3===0||slot.block%5===1)continue;
  selected=slot;break;
 }
 assert.ok(selected,'eligible room slot must exist');
 assert.equal(roomMoment(s,selected.at+1000)?.item,'laser');
 s.cozy.preferences.object={love:'toy'};
 assert.equal(roomMoment(s,selected.at+1000)?.item,'toy');
 s.cozy.preferences.object={annoy:'laser'};
 assert.notEqual(roomMoment(s,selected.at+1000)?.item,'laser');
});

test('a live tick records the room finale only once, including after a save reload',()=>{
 const s=fresh('penguin',start-life.teen-3600000);
 s.updated=start;s.born=start-life.teen-3600000;s.room={laser:true};
 s.playroom.toys={};s.cozy.owned={};s.cozy.stored={};s.hunger=s.energy=s.health=s.happy=95;
 s.routine.enabled=false;s.lastAction=0;
 let slot=null;
 for(let i=0;i<1500;i++){
  const candidate=ambientSlot(s,start+i*5000);
  if(candidate?.lane==='room'&&candidate.at>start+10000){slot=candidate;break;}
 }
 assert.ok(slot,'a quiet room slot should be found');
 const now=slot.until-1000;
 const before=roomMoment(s,now);assert.equal(before?.item,'laser');
 const expected=roomActivityFinale(s,before,now);
 assert.ok(['caught','miss'].includes(expected));
 tick(s,now);
 assert.equal(s.living.roomExperience?.items?.laser?.count,1);
 const snapshot=structuredClone(s);
 tick(s,now);
 assert.deepEqual(s,snapshot);
 const persisted=structuredClone(s);
 tick(persisted,now);
 assert.deepEqual(persisted,snapshot);
});

test('offline catch-up skips invented activity outcomes',()=>{
 const s=fresh('duck',start-life.teen-3600000);
 s.updated=start-45*60000;s.routine.enabled=false;
 s.hunger=s.energy=s.health=s.happy=95;
 tick(s,start);
 assert.equal(s.living?.roomExperience,undefined);
});
