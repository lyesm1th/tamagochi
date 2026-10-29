import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildOtherPet3D,pet3DSpecies,pet3DTopology} from '../public/lab-all-pets3d.js';
import {drawCow3D} from '../public/lab-cow3d.js';

const parts=id=>new Set(buildOtherPet3D({species:id,renderMode:'locked'}).map(t=>t.part));
const unique=(prefix,p)=>[...p].filter(name=>new RegExp('^'+prefix+'[0-9]+$').test(name));
test('two-legged birds have exactly two legs and toes, plus proper wings',()=>{
 for(const id of ['chicken','duck']){
  const p=parts(id);
  assert.equal(pet3DTopology[id],'birdBiped');
  assert.deepEqual(unique('leg',p).sort(),['leg0','leg1']);
  assert.deepEqual(unique('foot',p).sort(),['foot0','foot1']);
  assert.equal(unique('hoof',p).length,0);
  assert.ok(p.has('wing')&&p.has('beak')&&p.has('tailFeather'));
  assert.ok(p.has('toe0')&&p.has('toe1'));
 }
});
test('penguin has exactly two short legs, distinct flippers, upright torso, never cow paws or a wing',()=>{
 const p=parts('penguin');
 assert.equal(pet3DTopology.penguin,'penguinBiped');
 assert.deepEqual(unique('leg',p).sort(),['leg0','leg1']);
 assert.deepEqual(unique('foot',p).sort(),['foot0','foot1']);
 assert.equal(unique('hoof',p).length,0);
 assert.ok(p.has('flipper')&&p.has('flipperTip')&&p.has('belly')&&p.has('beak'));
 assert.ok(!p.has('wing')&&!p.has('arm'));
 const mesh=buildOtherPet3D({species:'penguin'});
 const xs=mesh.filter(t=>t.part==='body').flatMap(f=>f.points);
 const span=axis=>Math.max(...xs.map(p=>p[axis]))-Math.min(...xs.map(p=>p[axis]));
 assert.ok(span(1)>span(0)*1.25,'vertical penguin torso must be taller than wide');
});
test('dinosaur has two powerful legs and TWO tiny arms plus claws and balancing tail',()=>{
 const p=parts('dino');
 assert.equal(pet3DTopology.dino,'dinoBiped');
 assert.deepEqual(unique('thigh',p).sort(),['thigh0','thigh1']);
 assert.deepEqual(unique('shin',p).sort(),['shin0','shin1']);
 assert.deepEqual(unique('foot',p).sort(),['foot0','foot1']);
 assert.equal(unique('hoof',p).length,0);
 for(const part of ['arm','hand','claw','tail','backSpine','muzzle','noseTip'])assert.ok(p.has(part),part);
});
test('farm and pet quadrupeds retain four limbs, while toy pets and frog have two plus hands',()=>{
 for(const id of ['pig','sheep','cat','corgi','fox']){
  const p=parts(id);
  assert.deepEqual(unique('leg',p).sort(),['leg0','leg1','leg2','leg3'],id);
  assert.deepEqual(unique('hoof',p).sort(),['hoof0','hoof1','hoof2','hoof3'],id);
 }
 for(const id of ['bear','monkey','bunny','frog']){
  const p=parts(id);
  assert.deepEqual(unique('leg',p).sort(),['leg0','leg1'],id);
  assert.ok(p.has('arm')&&p.has('hand'),id);
  assert.equal(unique('hoof',p).length,2,id);
 }
});
test('all species preserve head-only turning, locked idle, rigid sleep and balanced crisp pixels',()=>{
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},
  getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}};
 const canvas={style:{},dataset:{},getContext(){return ctx}};
 for(const id of Object.keys(pet3DSpecies)){
  const a=buildOtherPet3D({species:id,renderMode:'locked',action:'idle',time:0});
  assert.deepEqual(a,buildOtherPet3D({species:id,renderMode:'locked',action:'idle',time:2125}),id);
  const turn=buildOtherPet3D({species:id,renderMode:'locked',headYaw:40});
  assert.notDeepEqual(a.find(t=>t.part==='head').points,turn.find(t=>t.part==='head').points);
  assert.deepEqual(a.find(t=>t.part==='body').points,turn.find(t=>t.part==='body').points);
  const sleep=buildOtherPet3D({species:id,renderMode:'locked',action:'sleep'});
  assert.ok(sleep.every(t=>t.points.every(p=>p.every(Number.isFinite))),id);
  drawCow3D(canvas,{species:id,designStyle:'reference',renderMode:'locked',pixelScale:'balanced'});
  assert.equal(canvas.dataset.cow3dSpecies,id);
  assert.equal(canvas.dataset.cow3dSilhouetteRings,'1');
  assert.equal(ctx.imageSmoothingEnabled,false);
 }
});
