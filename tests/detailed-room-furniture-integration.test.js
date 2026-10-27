import test from 'node:test';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {roomRects} from '../public/room-life.js';
import {detailedInteractionTarget,drawDetailedFurnitureReaction,drawDetailedInteractionFeedback} from '../public/detailed-renderer.js';

const now=Date.parse('2026-10-27T12:00:00Z');
const cases=[['shelf','read'],['toybox','search'],['plant','sniff'],['fountain','splash'],['bowl','drink'],['bed','doze'],['cushion','nest'],['mirror','faces']];
const pet=id=>({id:'detailed-'+id,species:id,room:Object.fromEntries(cases.map(([item])=>[item,true])),cozy:{owned:{}}});
function recorder(){const ops=[];return {canvas:{width:384,height:288},ops,fillRect(...args){assert.ok(args.every(Number.isFinite));ops.push(args);}};}
test('detailed furniture reactions use the true 2x native room coordinates for every pet',()=>{
 assert.equal(species.length,14);
 for(const {id} of species){
  const s=pet(id),before=structuredClone(s);
  for(const [item,kind] of cases){
   const a={item,kind,acting:true},point=detailedInteractionTarget(s,a);
   const rect=roomRects(s,'detailed')[item];
   assert.ok(point,id+' '+item);
   assert.equal(point.x,(rect[0]+rect[2]/2)*2);
   assert.equal(point.y,(rect[1]+rect[3]*.55)*2);
   const c=recorder();
   assert.equal(drawDetailedFurnitureReaction(c,s,{interaction:a},now),true,id+' '+item);
   assert.ok(c.ops.length>0,id+' '+item);
   for(const [x,y] of c.ops){
    assert.ok(x>=point.x-point.w/2-12&&x<=point.x+point.w/2+12,id+' '+item);
    assert.ok(y>=point.y-point.h/2-26&&y<=point.y+point.h/2+26,id+' '+item);
   }
   const beforeReduced=recorder(),afterReduced=recorder();
   drawDetailedFurnitureReaction(beforeReduced,s,{interaction:a},now,true);
   drawDetailedFurnitureReaction(afterReduced,s,{interaction:a},now+3600,true);
   assert.deepEqual(beforeReduced.ops,afterReduced.ops);
  }
  assert.deepEqual(s,before);
 }
});
test('only present furniture reacts, with no invented actions or duplicate passes',()=>{
 const s=pet('cat'),c=recorder(),action={item:'shelf',kind:'read',acting:true};
 assert.equal(drawDetailedFurnitureReaction(c,s,{interaction:{...action,acting:false}},now),false);
 assert.equal(drawDetailedFurnitureReaction(c,s,{interaction:{...action,item:'missing'}},now),false);
 assert.equal(drawDetailedFurnitureReaction(c,s,{interaction:{...action,kind:'unknown'}},now),false);
 assert.equal(detailedInteractionTarget({...s,room:{},cozy:{owned:{}}},action),null);
 assert.deepEqual(c.ops,[]);
});
test('native effects remain compatible with all five life-stage poses and manual actions',()=>{
 for(const {id} of species){
  const s=pet(id);
  for(const kind of ['read','search','sniff','splash','drink','doze','nest','faces']){
   const item=cases.find(([,type])=>type===kind)[0];
   const pose={x:90,feet:120,interaction:{item,kind,acting:true,manual:true}};
   const c=recorder();
   assert.equal(drawDetailedFurnitureReaction(c,s,pose,now),true);
   assert.ok(c.ops.length);
  }
 }
});
