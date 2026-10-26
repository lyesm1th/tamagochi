import test from 'node:test';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {speciesRoomAccent,enrichPose} from '../public/room-enrichment.js';
const kinds=['play','jump','stretch','roll','dance','splash','sniff','search','read','drink','nest'];
test('all currently playable species have finite bounded motion accents',()=>{
 assert.equal(species.length,14);
 for(const pet of species)for(const kind of kinds){
  const a=speciesRoomAccent(pet.id,kind,'rug',1800000000300);
  for(const n of [a.x,a.feet,a.scale])assert.ok(Number.isFinite(n),pet.id);
  assert.ok(Math.abs(a.x)<=4.1&&Math.abs(a.feet)<=5.1&&a.scale>=.98&&a.scale<=1,pet.id);
 }
});
test('all pets move differently, with no accidental fallback aliases',()=>{
 const accents=species.map(s=>speciesRoomAccent(s.id,'play','rug',1800000000300));
 assert.ok(new Set(accents.map(a=>JSON.stringify(a))).size>=10);
 assert.deepEqual(speciesRoomAccent('unknown','play','rug',1800000000300),{x:0,feet:0,scale:1});
});
test('quiet actions and reduced motion do not introduce movement',()=>{
 for(const pet of species){
  assert.deepEqual(speciesRoomAccent(pet.id,'watch','window',1800000000300),{x:0,feet:0,scale:1});
  const state={id:pet.id,species:pet.id,happy:70,energy:90,health:90};
  const pose={x:96,feet:120,scale:.93,interaction:{kind:'play',item:'toy',acting:true}};
  const p=enrichPose(state,pose,1800000000300,true);
  assert.equal(p.x,96);assert.equal(p.feet,120);assert.equal(p.scale,.93);
  assert.equal(pose._enriched,undefined);
 }
});
test('active poses stay within room boundaries without changing source pose',()=>{
 for(const pet of species){
  const state={id:pet.id,species:pet.id,happy:70,energy:90,health:90};
  const pose={x:171,feet:135,scale:.93,interaction:{kind:'sniff',item:'plant',acting:true,at:1800000000000}};
  const out=enrichPose(state,pose,1800000000300,false);
  assert.ok(out.x<=172&&out.x>=20&&out.feet<=136&&out.feet>=80);
  assert.equal(pose.x,171);
 }
});
