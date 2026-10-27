import test from 'node:test';
import assert from 'node:assert/strict';
import {species,fresh,life} from '../public/game.js';
import {roomFurnitureGesture,roomMomentPose,roomRects} from '../public/room-life.js';
const t=Date.parse('2026-10-27T12:00:00Z');
const kinds=['read','search','sniff','drink','splash','peek','shadow','faces','nest','doze','stretch','dance','roll','play'];
const furniture={read:'shelf',search:'toybox',sniff:'plant',drink:'bowl',splash:'fountain',peek:'tent',shadow:'lamp',faces:'mirror',nest:'cushion',doze:'bed',stretch:'post',dance:'music',roll:'rug',play:'toy'};
test('every species and life stage has safe furniture gestures, preserving legacy sprites',()=>{
 assert.equal(species.length,14);
 for(const {id} of species)for(const age of [life.egg+10000,life.baby+10000,life.child+10000,life.teen+10000,life.teen+2*86400000]){
  const s=fresh(id,t-age),before=structuredClone(s);s.sleeping=false;s.napping=false;
  for(const kind of kinds){
   const moment={item:furniture[kind],kind,at:t-5000,until:t+8000,auto:true,origin:{x:96,feet:130}};
   const a=roomFurnitureGesture(s,moment,t),quiet=roomFurnitureGesture(s,moment,t,true);
   assert.deepEqual(quiet,{x:0,feet:0,scale:1});
   assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.feet)&&a.scale>.96&&a.scale<1.05);
   for(const style of ['classic','detailed']){
    const pose=roomMomentPose(s,moment,style,t,false);
    assert.ok(Number.isFinite(pose.x)&&Number.isFinite(pose.feet)&&Number.isFinite(pose.scale),id+' '+kind);
    assert.ok(pose.x>=20&&pose.x<=172&&pose.feet>=80&&pose.feet<=136);
    assert.equal(pose.interaction.item,furniture[kind]);
    assert.ok(roomRects(s,style)[furniture[kind]]);
   }
  }
  assert.equal(s.species,before.species);
  assert.deepEqual(s.cozy,before.cozy);
 }
});
test('young and senior pets make gentler object motions than adults, with no saved-state mutation',()=>{
 const born=(age)=>({id:'age-motion',species:'frog',born:t-age,energy:95});
 const m={item:'toybox',kind:'search',at:t-5000};
 const baby=roomFurnitureGesture(born(life.egg+10000),m,t);
 const adult=roomFurnitureGesture(born(life.teen+10000),m,t);
 const senior=roomFurnitureGesture(born(life.teen+30*86400000),m,t);
 assert.ok(Math.abs(baby.x)<Math.abs(adult.x));
 assert.ok(Math.abs(senior.x)<Math.abs(adult.x));
});
test('reduced-motion and approach phases never introduce furniture wiggles',()=>{
 const s={id:'approach-pet',species:'cat',born:t-7*86400000};
 const m={item:'shelf',kind:'read',at:t,until:t+14000,origin:{x:44,feet:130},auto:true};
 for(const style of ['classic','detailed']){
  const start=roomMomentPose(s,m,style,t,false);
  assert.equal(start.x,44);assert.equal(start.feet,130);
  const still=roomMomentPose(s,m,style,t+5000,true);
  assert.deepEqual(still,roomMomentPose(s,m,style,t+5000,true));
  const compare=roomMomentPose(s,m,style,t+5000,false);
  assert.equal(still.interaction.acting,true);
  assert.equal(compare.interaction.item,still.interaction.item);
 }
});
