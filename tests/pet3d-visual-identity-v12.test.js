import {test} from 'node:test';import assert from 'node:assert/strict';
import {buildOtherPet3D} from '../public/lab-all-pets3d.js';
const mesh=id=>buildOtherPet3D({species:id,renderMode:'locked',action:'idle'});
const parts=id=>new Set(mesh(id).map(t=>t.part));
const count=(id,part)=>mesh(id).filter(t=>t.part===part).length;
test('v12: cat has a curved slender tail, corgi low torso and visible stub',()=>{
 assert.ok(parts('cat').has('catTail')&&parts('cat').has('catTailTip'));
 assert.ok(parts('corgi').has('tailStub')&&parts('corgi').has('chest'));
 assert.ok(!parts('corgi').has('catTail'));
});
test('v12: rabbit and frog are not bird anatomy, monkey has arms and curled tail',()=>{
 for(const id of ['frog','bunny','monkey'])assert.ok(!parts(id).has('wing'),id);
 assert.ok(parts('frog').has('belly')&&parts('frog').has('eyeBump'));
 assert.ok(parts('bunny').has('chest')&&parts('bunny').has('tailPom'));
 assert.ok(parts('monkey').has('monkeyTail')&&parts('monkey').has('hand'));
});
test('v12: bear, pig, fox and dinosaur actually contain raised facial landmarks',()=>{
 for(const id of ['bear','pig','fox','dino']){
  const p=parts(id);
  assert.ok(p.has('eye')&&p.has('eyeWhite')&&p.has('mouth'),id);
 }
 assert.ok(parts('bear').has('noseBridge'));
 assert.ok(parts('pig').has('snoutRim')&&parts('pig').has('curlyTail'));
 assert.ok(parts('fox').has('chinFur')&&parts('fox').has('foxTail'));
 assert.ok(parts('dino').has('lowerJaw')&&parts('dino').has('noseTip'));
});
test('v12: sheep has an actual coat of 3D wool and penguin has proper bib and flippers',()=>{
 assert.ok(count('sheep','wool')>1000,'wool covers the body and forehead');
 for(const part of ['head','beak','belly','flipper','flipperTip','eye'])assert.ok(parts('penguin').has(part),part);
 assert.ok(!parts('penguin').has('hoof0'));
});
test('v12: corrected geometry remains stable at rest and retains articulated head turning',()=>{
 for(const id of ['cat','corgi','frog','bear','dino','bunny','pig','sheep','fox','monkey','duck','penguin']){
  const a=mesh(id),b=buildOtherPet3D({species:id,renderMode:'locked',action:'idle',time:1875});
  assert.deepEqual(a,b,id);
  const t=buildOtherPet3D({species:id,renderMode:'locked',headYaw:36});
  assert.notDeepEqual(a.find(f=>f.part==='head').points,t.find(f=>f.part==='head').points,id);
  assert.ok(a.every(f=>f.points.every(p=>p.every(Number.isFinite))),id);
 }
});
