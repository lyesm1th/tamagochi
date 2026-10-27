import test from 'node:test';
import assert from 'node:assert/strict';
import {species,fresh,life,tick} from '../public/game.js';
import {roomMomentPose,drawRoomResponse} from '../public/room-life.js';
import {enrichPose} from '../public/room-enrichment.js';

const now=Date.parse('2026-10-27T12:30:00Z');
const draw=(s,style,emotionStyle,reduced=false)=>{
 const m={item:'toy',kind:'play',auto:true,at:now-9000,until:now+5000,emotionStyle};
 const pose=enrichPose(s,roomMomentPose(s,m,style,now,reduced),now,reduced),ops=[];
 const c={canvas:{width:style==='classic'?192:384},fillRect(...args){assert.ok(args.every(Number.isFinite));ops.push(args);},fillText(...args){ops.push(args);}};
 drawRoomResponse(c,s,pose,now,reduced);
 return {pose,ops};
};
test('all fourteen playable pets support emotive room cues in both graphic modes',()=>{
 assert.equal(species.length,14);
 for(const {id} of species){
  const s=fresh(id,now-life.teen-3600000);s.sleeping=false;s.napping=false;
  const before=structuredClone(s);
  for(const style of ['classic','detailed']){
   const regular=draw(s,style,null),comfort=draw(s,style,'comfort'),explore=draw(s,style,'explore'),tired=draw(s,style,'tired');
   assert.equal(comfort.ops.length,regular.ops.length+2,id+' comfort');
   assert.equal(explore.ops.length,regular.ops.length+2,id+' explore');
   assert.ok(tired.ops.length>regular.ops.length,id+' tired');
   for(const o of [regular,comfort,explore,tired]){
    assert.ok(Number.isFinite(o.pose.x)&&Number.isFinite(o.pose.feet)&&Number.isFinite(o.pose.scale));
   }
  }
  assert.deepEqual(s,before);
 }
});
test('reduced motion remains predictable without new animation timers',()=>{
 const s=fresh('frog',now-life.teen-3600000);s.sleeping=false;s.napping=false;
 for(const style of ['classic','detailed'])for(const mood of ['comfort','explore','tired']){
  const a=draw(s,style,mood,true),b=draw(s,style,mood,true);
  assert.deepEqual(a.ops,b.ops);
  assert.equal(a.pose.interaction.emotionStyle,mood);
 }
});
test('old saves and every pet age remain compatible',()=>{
 for(const {id} of species){
  for(const elapsed of [life.egg+10000,life.baby+10000,life.child+10000,life.teen+10000]){
   const s=fresh(id,now-elapsed);s.updated=now;s.routine.enabled=false;delete s.emotion;delete s.living?.roomExperience;
   tick(s,now);
   assert.equal(s.species,id);
   assert.ok(Number.isFinite(draw(s,'classic','comfort').pose.scale));
  }
 }
});
