import test from 'node:test';import assert from 'node:assert/strict';
import {species,fresh,life} from '../public/game.js';
import {roomRects,drawFurnitureFeedback,roomMomentPose,drawRoomResponse} from '../public/room-life.js';
const at=Date.parse('2026-10-27T12:00:00Z');
const cases=[['shelf','read'],['toybox','search'],['plant','sniff'],['bowl','drink'],['fountain','splash'],['bed','doze'],['cushion','nest'],['music','dance'],['mirror','faces']];
const draw=(s,style,m,atTime=at,reduced=false)=>{
 const marks=[];const c={canvas:{width:style==='classic'?192:384},fillRect(...v){assert.ok(v.every(Number.isFinite));marks.push(v);},fillText(){}};
 drawFurnitureFeedback(c,s,m,atTime,reduced);return marks;
};
test('all 14 pets show grounded furniture feedback in both render styles',()=>{
 assert.equal(species.length,14);
 for(const {id} of species){
  const s=fresh(id,at-life.teen-3600000),before=structuredClone(s);
  for(const style of ['classic','detailed'])for(const [item,kind] of cases){
   const m={item,kind,at:at-6000,acting:true};
   const marks=draw(s,style,m);
   assert.ok(marks.length,id+' '+style+' '+item);
   const [x,y,w,h]=roomRects(s,style)[item];
   assert.ok(marks.some(a=>a[0]>=x-2&&a[0]<=x+w+4&&a[1]>=y-12&&a[1]<=y+h+3),item);
   assert.deepEqual(draw(s,style,{...m,acting:false}),[]);
   assert.deepEqual(draw(s,style,m,at,true),draw(s,style,m,at,true));
  }
  assert.deepEqual(s,before,id);
 }
});
test('no furniture changes occur for missing items, inactive states or unrelated gestures',()=>{
 const s={id:'x',species:'cat',born:at-500000};
 for(const kind of ['repair','outfit','watch','gentle']){
  assert.deepEqual(draw(s,'classic',{item:'window',kind,acting:true}),[]);
 }
 assert.deepEqual(draw(s,'classic',{item:'missing',kind:'search',acting:true}),[]);
 assert.deepEqual(draw(s,'classic',null),[]);
});
test('furniture decoration appears in the existing room response, with no fresh animation schedule',()=>{
 const s={id:'test',species:'penguin',born:at-5000000};
 for(const style of ['classic','detailed'])for(const [item,kind] of cases){
  const m={item,kind,at:at-6000,until:at+10000,auto:true};
  const p=roomMomentPose(s,m,style,at);
  const base=draw(s,style,p.interaction);
  const marks=[];const c={canvas:{width:style==='classic'?192:384},fillRect(...v){marks.push(v);},fillText(){}};
  drawRoomResponse(c,s,p,at);
  assert.ok(marks.length>=base.length,item);
 }
});
