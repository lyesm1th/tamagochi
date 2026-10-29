import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pet3DSpecies,pet3DSpeciesIds,buildOtherPet3D} from '../public/lab-all-pets3d.js';
import {drawCow3D} from '../public/lab-cow3d.js';
import {species} from '../public/game.js';

const ids=species.map(s=>s.id);
test('all real species appear in owner 3D lab, including cow as the approved reference',()=>{
 assert.deepEqual([...pet3DSpeciesIds].sort(),[...ids].sort());
 assert.equal(Object.keys(pet3DSpecies).length,ids.length-1);
 const html=readFileSync(new URL('../public/lab.html',import.meta.url),'utf8');
 for(const id of ids)assert.match(html,new RegExp('<option value="'+id+'"'));
 assert.match(html,/option value="balanced" selected/);
});
test('each pet is independently sculpted and has animal-specific head anatomy',()=>{
 const specials={chicken:'comb',cat:'ear',corgi:'ear',frog:'eyeBump',bear:'ear',
 dino:'spike',bunny:'ear',pig:'ear',sheep:'wool',fox:'ear',
 monkey:'ear',duck:'wing',penguin:'flipper'};
 const dimensions=new Set();
 for(const id of Object.keys(pet3DSpecies)){
  const mesh=buildOtherPet3D({species:id,renderMode:'locked',action:'idle',time:0});
  const parts=new Set(mesh.map(f=>f.part));
  assert.ok(parts.has('head')&&parts.has('body')&&parts.has('eye')&&parts.has('muzzle')||parts.has('beak'),id);
  assert.ok(parts.has(specials[id]),id+' expected '+specials[id]);
  const config=pet3DSpecies[id];
  dimensions.add(JSON.stringify([...config.head,...config.body]));
  assert.ok(mesh.length>1500,id+' is not a real triangle mesh');
  assert.ok(mesh.every(f=>f.points.every(p=>p.every(Number.isFinite))),id);
 }
 assert.equal(dimensions.size,Object.keys(pet3DSpecies).length,'none of the 13 species shares the same head/body geometry');
});
test('head turning, short animation keyframes, and rigid sleep preserve each species',()=>{
 for(const id of Object.keys(pet3DSpecies)){
  const base=buildOtherPet3D({species:id,renderMode:'locked',time:0});
  const later=buildOtherPet3D({species:id,renderMode:'locked',time:3750});
  assert.deepEqual(base,later,id+' idle should never shimmer');
  const turn=buildOtherPet3D({species:id,headYaw:35,renderMode:'locked'});
  const part=(mesh,name)=>mesh.find(f=>f.part===name).points;
  assert.notDeepEqual(part(base,'head'),part(turn,'head'),id+' head must turn');
  assert.deepEqual(part(base,'body'),part(turn,'body'),id+' torso must stay still');
  const asleep=buildOtherPet3D({species:id,action:'sleep',renderMode:'locked'});
  assert.ok(asleep.every(f=>f.points.every(p=>p.every(Number.isFinite))),id+' sleep');
 }
});
test('Balanced renders all pets in native x2 with crisp outlines, no data saves',()=>{
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},
  getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}};
 const canvas={style:{},dataset:{},getContext(){return ctx}};
 for(const id of Object.keys(pet3DSpecies)){
  assert.ok(drawCow3D(canvas,{species:id,designStyle:'reference',renderMode:'locked',pixelScale:'balanced',outlines:'detailed'})>1000,id);
  assert.deepEqual([canvas.width,canvas.height],[128,96],id);
  assert.equal(canvas.dataset.cow3dSpecies,id);
  assert.equal(canvas.dataset.cow3dPixelScale,'balanced');
  assert.equal(canvas.dataset.cow3dSilhouetteRings,'1');
  assert.equal(canvas.dataset.cow3dRevision,'species-sculpt-v13');
  assert.equal(ctx.imageSmoothingEnabled,false);
 }
});
