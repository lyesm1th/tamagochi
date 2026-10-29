import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pet3DSpecies,buildOtherPet3D,paintOtherPetSurface} from '../public/lab-all-pets3d.js';
test('eyes are embedded below head surface on all thirteen species',()=>{
 for(const id of Object.keys(pet3DSpecies)){
  const mesh=buildOtherPet3D({species:id,renderMode:'locked'});
  const eyes=mesh.filter(f=>['eye','eyeWhite','shine'].includes(f.part));
  assert.ok(eyes.length>0,id);
  const maxZ=Math.max(...eyes.flatMap(f=>f.texPoints.map(p=>p[2])));
  assert.ok(maxZ<.51,id+' eye geometry should not project in front of its face: '+maxZ);
  assert.ok(mesh.some(f=>f.part==='head'),id);
 }
});
test('eye color is fused with head material, not floating colored globes',()=>{
 const color=paintOtherPetSurface('cat','head',[.28,.13,.55],[0,0,1],'#b69ad9');
 assert.equal(color,'#272129');
 const shine=paintOtherPetSurface('cat','head',[.256,.174,.55],[0,0,1],'#b69ad9');
 assert.equal(shine,'#fffdf7');
 assert.equal(paintOtherPetSurface('cat','head',[0,.13,.55],[0,0,1],'#b69ad9'),'#b69ad9');
});
test('new silhouettes remain geometrically distinct and retain two legs for bird and dino',()=>{
 for(const id of ['chicken','duck','penguin','dino']){
  const m=buildOtherPet3D({species:id,renderMode:'locked'});
  assert.equal(new Set(m.filter(f=>/^leg[0-9]+$|^thigh[0-9]+$/.test(f.part)).map(f=>f.part)).size,2,id);
 }
 const bunny=buildOtherPet3D({species:'bunny'});
 const fox=buildOtherPet3D({species:'fox'});
 assert.notDeepEqual(bunny.find(f=>f.part==='body').points,fox.find(f=>f.part==='body').points);
});
