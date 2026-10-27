import test from 'node:test';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {labPet,labMoment,labAges} from '../public/lab-state.js';
import {frameDifference} from '../public/lab-frames.js';
import {roomMomentPose,itemMoves} from '../public/room-life.js';
import {detailedPhysicalPlacement} from '../public/detailed-renderer.js';
const now=Date.parse('2026-10-27T12:00:00Z');
test('QA fixtures cover every species, stage, item, layout and unavailable state without shared saves',()=>{
 for(const {id} of species)for(const age of labAges)for(const item of Object.keys(itemMoves))for(const layout of [0,1,2]){
  const options={species:id,age,item,layout,variant:'1',condition:'intact'},pet=labPet(options,now),moment=labMoment(options,now);
  assert.equal(pet.species,id);assert.equal(pet.portraitStage,age);assert.equal(pet.playroom.decor.layout,layout);
  assert.equal(roomMomentPose(pet,moment,'detailed',now+600).interaction.approaching,true);
  const pose=roomMomentPose(pet,moment,'detailed',now+3000),physical=detailedPhysicalPlacement(pet,pose,now+3000);
  assert.ok(Number.isFinite(physical.x)&&Number.isFinite(physical.feet));
  for(const condition of ['broken','stored'])assert.equal(labMoment({...options,condition},now),null);
 }
 const a=labPet({item:'bed',variant:2},now),b=labPet({},now);a.cozy.wearing.body='sweater';assert.deepEqual(b.cozy.wearing,{});
 assert.equal(labMoment({item:'unknown'},now),null);
 assert.equal(labPet({item:'bed',variant:999},now).living.furniture.bed,0);
});
test('frame comparison includes alpha, reports changed pixels and rejects incompatible frames',()=>{
 const a=new Uint8ClampedArray([1,2,3,255,4,5,6,0]);
 assert.equal(frameDifference(a,a).changed,0);
 const b=a.slice();b[7]=255;const result=frameDifference(a,b);assert.equal(result.changed,1);assert.deepEqual(Array.from(result.pixels.slice(4)),[255,0,100,255]);
 assert.throws(()=>frameDifference(a,new Uint8ClampedArray(4)),RangeError);
});
