import test from 'node:test';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {roomMoodPreference,roomMoment,roomNeedPriority} from '../public/room-life.js';
import {ambientSlot} from '../public/calm-behavior.js';

const time=Date.parse('2026-10-25T12:00:00Z');
const allItems=['bed','cushion','tent','rug','toy','laser','music','toybox'];
const playItems=new Set(['toy','laser','music','rug','toybox']);
const cozyItems=new Set(['bed','cushion','tent','rug']);
const pet=(id)=>({
 id:'mood-room-'+id,species:id,born:time-9000000,energy:92,hunger:95,health:95,happy:95,
 room:{bed:true,toy:true},
 cozy:{owned:{cushion:true,tent:true,rug:true,laser:true,music:true,toybox:true},items:{},preferences:{object:{}}}
});

test('all fourteen species respond to playful, sad and tired room moods',()=>{
 assert.equal(species.length,14);
 for(const {id} of species){
  const s=pet(id);
  const energetic=roomMoodPreference(s,allItems,1,time);
  assert.equal(energetic?.mood,'play',id);
  assert.ok(playItems.has(energetic?.item),id);
  const sad=roomMoodPreference({...s,happy:28},allItems,1,time);
  assert.equal(sad?.mood,'comfort',id);
  assert.ok(cozyItems.has(sad?.item),id);
  assert.equal(sad.kind,'nest',id==='dog'?'cow':'other');
  const tired=roomMoodPreference({...s,energy:50},allItems,1,time);
  assert.equal(tired?.mood,'tired',id);
  assert.ok(cozyItems.has(tired?.item),id);
  assert.equal(tired.kind,tired.item==='bed'?'doze':'nest',id);
 }
});

test('mood slots cannot synchronize out of reach of the four ambient lanes',()=>{
 const s=pet('fox');
 assert.equal(roomMoodPreference(s,allItems,0,time),null);
 for(const block of [1,6,11,16]){
  assert.equal(roomMoodPreference(s,allItems,block,time)?.mood,'play');
 }
 for(const block of [2,3,4,5])assert.equal(roomMoodPreference(s,allItems,block,time),null);
});

test('unowned, disliked or missing furniture falls back without mutating pet data',()=>{
 for(const {id} of species){
  const s=pet(id),before=structuredClone(s);
  assert.equal(roomMoodPreference(s,[],1,time),null);
  assert.equal(roomMoodPreference(s,['plant','shelf'],1,time),null);
  s.cozy.preferences.object.annoy='toy';
  assert.equal(roomMoodPreference(s,['toy'],1,time),null);
  assert.ok(roomMoodPreference(s,['laser'],1,time)?.item==='laser');
  const after=structuredClone(s);
  roomMoodPreference(s,allItems,1,time);
  assert.deepEqual(s,after);
  assert.notDeepEqual(after,before);
  assert.equal(roomNeedPriority({...s,energy:52},['bed','toy']),'bed');
  assert.equal(roomNeedPriority({...s,hunger:52},['bowl','toy']),'bowl');
 }
});

test('real room moments respect mood, player priority and urgent rest',()=>{
 const s=pet('penguin');
 let active;
 // Every five lane cycles should include a mood-eligible quiet room slot.
 for(let i=0;i<2800;i++){
  const slot=ambientSlot(s,time+i*2500);
  if(slot?.lane==='room'&&slot.block%5===1){active=slot;break;}
 }
 assert.ok(active,'a mood-eligible room slot must exist');
 const now=active.at+1000;
 const before=structuredClone(s);
 const m=roomMoment(s,now),expectation=roomMoodPreference(s,allItems,active.block,now);
 assert.ok(m?.auto);
 assert.equal(m.item,expectation.item);
 assert.equal(m.kind,expectation.kind);
 assert.deepEqual(s,before);
 const sad=structuredClone(s);sad.happy=20;
 const comfort=roomMoment(sad,now);
 assert.equal(comfort?.kind,'nest');
 assert.ok(cozyItems.has(comfort.item));
 const tired=structuredClone(s);tired.energy=50;
 assert.equal(roomMoment(tired,now)?.item,'bed');
 assert.equal(roomMoment(tired,now)?.kind,'doze');
 const manual=structuredClone(s);manual.living={motion:{item:'toy',kind:'use',at:now,until:now+8000}};
 assert.equal(roomMoment(manual,now)?.manual,true);
 assert.equal(roomMoment(manual,now)?.item,'toy');
});

test('unknown species have safe need-based behavior without forcing an unavailable mood item',()=>{
 const s=pet('unknown');s.happy=50;
 assert.equal(roomMoodPreference(s,[],1,time),null);
 assert.equal(roomNeedPriority(s,['mirror']),null);
});
