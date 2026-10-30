import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildOtherPet3D,pet3DSpecies} from '../public/lab-all-pets3d.js';

test('all thirteen species remain independently sculpted and renderable',()=>{
 for(const species of Object.keys(pet3DSpecies)){
  const mesh=buildOtherPet3D({species,renderMode:'locked'});
  assert.ok(mesh.length>100,species);
  assert.ok(mesh.some(f=>f.part==='head'),species);
  assert.ok(mesh.some(f=>f.part==='body'),species);
 }
});
test('dinosaur has an elongated reptile muzzle, two arms and a long counterweight tail',()=>{
 const m=buildOtherPet3D({species:'dino',renderMode:'locked'});
 const tip=m.filter(f=>f.part==='noseTip').flatMap(f=>f.points);
 assert.ok(Math.max(...tip.map(p=>p[2]))>1.1);
 assert.ok(m.some(f=>f.part==='dinoNostril'));
 assert.ok(m.some(f=>f.part==='backSpine'));
 assert.ok(m.some(f=>f.part==='tail'));
 assert.equal(new Set(m.filter(f=>f.part==='arm').map(f=>Math.sign(f.points[0][0]))).size,2);
});
test('dark fur uses light outline and light fur uses dark outline',()=>{
 const src=readFileSync(new URL('../public/lab-cow3d-raster.js',import.meta.url),'utf8');
 assert.match(src,/darkEdge=\[205,211,217\]/);
 assert.match(src,/warmEdge=\[62,41,40\]/);
 assert.match(src,/if\(kind==='dark'\)return detail\?charcoalSeam:darkEdge/);
});
test('3D species are smaller than the original cow reference',()=>{
 const src=readFileSync(new URL('../public/lab-cow3d.js',import.meta.url),'utf8');
 assert.match(src,/other\?\.82:1/);
});
