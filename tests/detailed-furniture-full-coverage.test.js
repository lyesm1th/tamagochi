import test from 'node:test';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {roomRects} from '../public/room-life.js';
import {detailedInteractionTarget,drawDetailedFurnitureReaction} from '../public/detailed-renderer.js';
const now=Date.parse('2026-10-27T13:00:00Z');
const modes=[['bed','jump'],['tent','peek'],['lamp','shadow'],['post','stretch'],['rug','roll'],['music','dance'],['window','watch'],['toy','play'],['laser','play'],['shelf','read'],['toybox','search'],['plant','sniff'],['fountain','splash'],['bowl','drink'],['cushion','nest'],['mirror','faces']];
const pet=id=>({id:'detailed-furniture-'+id,species:id,room:Object.fromEntries(modes.map(([item])=>[item,true])),cozy:{owned:{},items:{},stored:{}}});
function draw(s,a,reduced=false,time=now){const ops=[];const c={canvas:{width:384,height:288},fillRect(...vals){assert.ok(vals.every(Number.isFinite));ops.push(vals);}};const painted=drawDetailedFurnitureReaction(c,s,{interaction:a},time,reduced);return {painted,ops};}
test('all 14 species animate a complete range of detailed furniture actions',()=>{
 assert.equal(species.length,14);
 for(const {id} of species){
  const s=pet(id),snapshot=structuredClone(s);
  for(const [item,kind] of modes){
   const action={item,kind,acting:true},r=draw(s,action);
   assert.equal(r.painted,true,id+' '+item);
   assert.ok(r.ops.length,id+' '+kind);
   const target=detailedInteractionTarget(s,action);
   const [x,y,w,h]=roomRects(s,'detailed')[item];
   assert.equal(target.x,(x+w/2)*2);
   assert.equal(target.y,(y+h*.55)*2);
   assert.deepEqual(draw(s,action,true,now).ops,draw(s,action,true,now+4000).ops);
  }
  assert.deepEqual(s,snapshot);
 }
});
test('stored, broken and absent furniture never emits phantom detailed effects',()=>{
 const s=pet('monkey');
 for(const [item,kind] of modes){
  s.cozy.stored[item]=true;
  assert.equal(draw(s,{item,kind,acting:true}).painted,false,'stored '+item);
  delete s.cozy.stored[item];
  s.cozy.items[item]={wear:0};
  assert.equal(draw(s,{item,kind,acting:true}).painted,false,'broken '+item);
  delete s.cozy.items[item];
  delete s.room[item];delete s.cozy.owned[item];
  if(!['window'].includes(item)&&!['box'].includes(item))assert.equal(draw(s,{item,kind,acting:true}).painted,false,'absent '+item);
  s.room[item]=true;
 }
});
test('approach and inactive scenes never duplicate reactions',()=>{
 const s=pet('penguin');
 for(const [item,kind] of modes){
  assert.equal(draw(s,{item,kind,acting:false}).painted,false);
  assert.equal(draw(s,{item,kind,approaching:true,acting:false}).painted,false);
  assert.equal(draw(s,{item,kind,acting:true},true).painted,true);
 }
});
