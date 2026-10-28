import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCow3D} from '../public/lab-cow3d.js';

const part=(mesh,name)=>mesh.filter(f=>f.part===name).flatMap(f=>f.points);

test('independent head pitch changes facial position without moving torso',()=>{
 const level=buildCow3D({headPitch:0}),tilted=buildCow3D({headPitch:22});
 assert.notDeepEqual(part(level,'muzzle'),part(tilted,'muzzle'));
 assert.deepEqual(part(level,'body'),part(tilted,'body'));
 assert.deepEqual(part(level,'leg0'),part(tilted,'leg0'));
});

test('emotions use true head geometry and keep body and original facial parts',()=>{
 const neutral=buildCow3D({emotion:'neutral'}),happy=buildCow3D({emotion:'happy'}),
 sad=buildCow3D({emotion:'sad'}),angry=buildCow3D({emotion:'angry'});
 for(const mesh of [neutral,happy,sad,angry]){
  assert.ok(part(mesh,'eye').length>0);
  assert.ok(part(mesh,'muzzle').length>0);
  assert.deepEqual(part(mesh,'body'),part(neutral,'body'));
 }
 assert.notDeepEqual(part(neutral,'mouth'),part(happy,'mouth'));
 assert.ok(part(sad,'tear').length>0);
 assert.ok(part(angry,'brow').length>0);
 assert.deepEqual(part(neutral,'tear'),[]);
});

test('emotion parts are attached to the turning volumetric head',()=>{
 const left=buildCow3D({headYaw:-35,emotion:'sad'}),right=buildCow3D({headYaw:35,emotion:'sad'});
 assert.notDeepEqual(part(left,'tear'),part(right,'tear'));
 assert.deepEqual(part(left,'body'),part(right,'body'));
});
