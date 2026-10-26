import test from 'node:test';
import assert from 'node:assert/strict';
import {roomSequenceStep,roomMoment,roomMomentPose,roomRects} from '../public/room-life.js';
import {ambientSlot} from '../public/calm-behavior.js';

const slot={at:1800000000000,until:1800000014000};
const pet=(character={playfulness:85,curiosity:25})=>({
 id:'room-chain-pet',species:'dino',born:slot.at-1000000,
 energy:95,hunger:95,health:100,happy:95,character,
 room:{toy:true,rug:true},cozy:{owned:{},items:{},preferences:{object:{love:'toy'}}}
});

test('a related follow-up occupies only the second half of an existing quiet slot',()=>{
 const s=pet(),items=['toy','rug','cushion'];
 assert.equal(roomSequenceStep(s,items,'toy',slot,slot.at+6999),null);
 assert.deepEqual(roomSequenceStep(s,items,'toy',slot,slot.at+7000),{item:'rug',at:slot.at+7000,originItem:'toy'});
 assert.equal(roomSequenceStep(s,items,'toy',slot,slot.until),null);
 assert.equal(roomSequenceStep(s,items,'toy',{at:slot.at,until:slot.at+6000},slot.at+5000),null);
 assert.equal(roomSequenceStep(s,items,'bed',slot,slot.at+8000),null);
});

test('personality, missing furnishings, and disliked objects affect follow-up safely',()=>{
 const s=pet({playfulness:15,curiosity:95}),items=['music','mirror','cushion'];
 assert.equal(roomSequenceStep(s,items,'music',slot,slot.at+8000).item,'cushion');
 assert.equal(roomSequenceStep(s,['music','mirror'],'music',slot,slot.at+8000).item,'mirror');
 s.cozy.preferences.object.annoy='cushion';
 assert.equal(roomSequenceStep(s,items,'music',slot,slot.at+8000).item,'mirror');
 assert.equal(roomSequenceStep(s,['music','cushion'],'music',slot,slot.at+8000),null);
});

test('second activity starts at the previous furnishing in both render modes',()=>{
 const s=pet(),items=['music','mirror'];
 const m={...roomSequenceStep(s,items,'music',slot,slot.at+7000),kind:'faces',auto:true,until:slot.until,origin:{x:96,feet:130}};
 for(const style of ['classic','detailed']){
  const [rx,,width]=roomRects(s,style).music;
  const p=roomMomentPose(s,m,style,m.at,false);
  assert.equal(p.x,rx+width/2);
  assert.equal(p.interaction.approaching,true);
  assert.equal(roomMomentPose(s,m,style,m.at+2500,false).interaction.acting,true);
 }
});

test('real room slots may play two actions, without adding autonomous slots',()=>{
 const s=pet();let found=false;
 for(let now=slot.at;now<slot.at+40*150000;now+=5000){
  const active=ambientSlot(s,now);
  if(active?.lane!=='room'||now>active.at+1000)continue;
  const first=roomMoment(s,active.at+1000),second=roomMoment(s,active.at+8000);
  if(first?.item==='toy'&&second?.item==='rug'){
   assert.equal(first.at,active.at);
   assert.equal(second.at,active.at+7000);
   assert.equal(second.originItem,'toy');
   found=true;break;
  }
 }
 assert.ok(found,'expected a deterministic toy-to-rug sequence in one of the room slots');
});

test('manual room animations take precedence over the autonomous sequence',()=>{
 const s=pet();s.living={motion:{item:'toy',kind:'use',at:slot.at,until:slot.until}};
 const m=roomMoment(s,slot.at+8000);
 assert.equal(m?.manual,true);
 assert.equal(m?.kind,'play');
});
