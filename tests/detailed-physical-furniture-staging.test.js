import test from 'node:test';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {roomRects} from '../public/room-life.js';
import {detailedPhysicalPlacement,drawDetailedForegroundOcclusion} from '../public/detailed-renderer.js';
const time=Date.parse('2026-10-27T13:00:00Z');
const interactions=[['bed','jump'],['bed','doze'],['tent','peek'],['cushion','nest'],['rug','roll'],['bowl','drink'],['fountain','splash'],['shelf','read'],['mirror','faces'],['plant','sniff'],['post','stretch'],['toybox','search']];
const make=id=>({id:'physical-'+id,species:id,room:Object.fromEntries(interactions.map(([item])=>[item,true])),cozy:{owned:{},items:{},stored:{}}});
test('all fourteen pets interact at the furniture contact point in the detailed scene',()=>{
 assert.equal(species.length,14);
 for(const {id} of species){
  const s=make(id),prior=structuredClone(s);
  for(const [item,kind] of interactions){
   const active={x:96,feet:128,scale:1,interaction:{item,kind,acting:true,at:time-5000}};
   const out=detailedPhysicalPlacement(s,active,time,true);
   const [rx,ry,rw,rh]=roomRects(s,'detailed')[item].map(x=>x*2);
   assert.ok(out.x>=rx&&out.x<=rx+rw,id+' '+item);
   assert.ok(out.feet>=ry&&out.feet<=Math.min(288,ry+rh+16),id+' '+item);
   assert.ok(out.scale>0&&out.scale<=1);
   const second=detailedPhysicalPlacement(s,active,time+3500,true);
   assert.deepEqual(out,second,id+' reduced motion '+item);
   if(['bed','tent','cushion','bowl','fountain'].includes(item))assert.ok(out.occlusion,id+' '+item);
   const approach={...active,interaction:{...active.interaction,acting:false,approaching:true}};
   const waiting=detailedPhysicalPlacement(s,approach,time);
   assert.deepEqual(waiting,{x:192,feet:256,scale:1,occlusion:null,kind},id+' approach');
  }
  assert.deepEqual(s,prior,id);
 }
});
test('forefront masks only physical contact furniture, and ignores removed or broken objects',()=>{
 const s=make('cat');
 for(const [item,kind] of interactions){
  const placement=detailedPhysicalPlacement(s,{x:96,feet:128,interaction:{item,kind,acting:true,at:time}},time);
  if(!placement.occlusion)continue;
  const ops=[];const c={save(){ops.push('save')},restore(){ops.push('restore')},beginPath(){},rect(...v){assert.ok(v.every(Number.isFinite))},clip(){},drawImage(){}};
  // Source atlases can be unavailable in the light-weight unit test; an occlusion
  // still restores a bounded clipped layer, not the full furniture body.
  assert.equal(drawDetailedForegroundOcclusion(c,s,placement),true);
  assert.ok(ops.includes('save')&&ops.includes('restore'));
  s.cozy.stored[item]=true;
  assert.equal(drawDetailedForegroundOcclusion(c,s,placement),false);
  delete s.cozy.stored[item];s.cozy.items[item]={wear:0};
  assert.equal(drawDetailedForegroundOcclusion(c,s,placement),false);
  delete s.cozy.items[item];
 }
});
test('missing items, idle moments, and manual approaches never relocate the actor',()=>{
 const s=make('penguin');
 const idle=detailedPhysicalPlacement(s,{x:82,feet:117},time);
 assert.deepEqual(idle,{x:164,feet:234,scale:1,occlusion:null,kind:null});
 for(const [item,kind] of interactions){
  s.cozy.stored[item]=true;
  const result=detailedPhysicalPlacement(s,{x:82,feet:117,interaction:{item,kind,acting:true}},time);
  assert.deepEqual(result.x,164);
  assert.deepEqual(result.occlusion,null);
  delete s.cozy.stored[item];
 }
});
