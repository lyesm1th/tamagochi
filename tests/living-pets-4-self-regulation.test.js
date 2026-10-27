import test from 'node:test';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {roomMoodPreference,roomMoment,roomNeedPriority} from '../public/room-life.js';
import {ambientSlot} from '../public/calm-behavior.js';
const t=Date.parse('2026-10-27T11:00:00Z');
const inventory=['cushion','bed','tent','rug','shelf','plant','toybox','mirror','toy','laser','music'];
const comfort=new Set(['cushion','bed','tent','rug']);
const explore=new Set(['shelf','plant','toybox','mirror']);
const make=id=>({id:'self-reg-'+id,species:id,born:t-10000000,energy:85,hunger:90,health:95,happy:68,
  character:{curiosity:90,playfulness:55,stubbornness:70,affection:65,independence:40},
  room:{bed:true,plant:true,shelf:true,mirror:true,toy:true},
  cozy:{owned:{cushion:true,tent:true,rug:true,toybox:true,laser:true,music:true},items:{},preferences:{object:{}}}});
test('all 14 pets self-regulate anxiety, anger, hurt and annoyance through comfort',()=>{
 assert.equal(species.length,14);
 for(const {id} of species)for(const emotion of ['angry','annoyed','hurt','anxious']){
  const s=make(id);s.emotion={kind:emotion,at:t-1000,until:t+60000,strength:.8};
  const before=structuredClone(s),out=roomMoodPreference(s,inventory,1,t);
  assert.equal(out?.mood,'comfort',id+' '+emotion);
  assert.ok(comfort.has(out.item),id+' '+emotion);
  assert.equal(out.kind,out.item==='bed'?'doze':'nest');
  assert.deepEqual(s,before);
 }
});
test('all 14 pets explore instead of endlessly replaying fun when bored or curious',()=>{
 for(const {id} of species)for(const emotion of ['bored','curious']){
  const s=make(id);s.emotion={kind:emotion,at:t-1000,until:t+60000,strength:.8};
  const out=roomMoodPreference(s,inventory,1,t);
  assert.equal(out?.mood,'explore',id);
  assert.ok(explore.has(out.item),id);
  assert.ok(['read','sniff','search','faces'].includes(out.kind),id);
 }
});
test('existing need, ownership and dislike rules still override emotional preferences',()=>{
 for(const {id} of species){
  const s=make(id);s.emotion={kind:'bored',at:t-1000,until:t+60000,strength:.8};
  assert.equal(roomMoodPreference(s,[],1,t),null);
  assert.equal(roomMoodPreference(s,['toy'],1,t),null);
  assert.equal(roomMoodPreference(s,inventory,0,t),null);
  s.cozy.preferences.object.annoy='shelf';
  assert.notEqual(roomMoodPreference(s,['shelf','plant'],1,t)?.item,'shelf');
  assert.equal(roomNeedPriority({...s,energy:55},['bed','toy']),'bed');
  assert.equal(roomNeedPriority({...s,hunger:55},['bowl','toy']),'bowl');
 }
});
test('real room slots prefer exploring and retain manual override and saved-state stability',()=>{
 const s=make('monkey');s.emotion={kind:'bored',at:t-1000,until:t+10000000,strength:.8};
 let active=null;
 for(let i=0;i<2200;i++){
  const slot=ambientSlot(s,t+i*5000);
  if(slot?.lane==='room'&&slot.block%5===1){active=slot;break;}
 }
 assert.ok(active);
 const now=active.at+500;
 s.emotion.at=now-1000;s.emotion.until=now+60000;
 const before=structuredClone(s),m=roomMoment(s,now);
 assert.ok(m?.auto);
 assert.ok(explore.has(m.item));
 assert.deepEqual(s,before);
 s.living={motion:{item:'toy',kind:'use',at:now,until:now+7000}};
 assert.equal(roomMoment(s,now)?.manual,true);
});
