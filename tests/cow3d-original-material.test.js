import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paintOriginalCowSurface,originalCowPigments as ink} from '../public/lab-cow3d-paint.js';
import {renderCowMeshPixels} from '../public/lab-cow3d-raster.js';
import {buildCow3D} from '../public/lab-cow3d.js';

test('original black crown, ivory forehead, black flanks and ivory chest are distinct areas',()=>{
 const p=(part,x,y,z)=>paintOriginalCowSurface(part,[x,y,z],[0,0,1],ink.coat);
 assert.equal(p('head',-.55,.25,.48),ink.patch);
 assert.equal(p('head',.57,.32,.45),ink.patch);
 assert.equal(p('head',.04,.24,.53),ink.coat);
 assert.equal(p('head',0,.64,.40),ink.coat,'ivory forelock must stay open');
 assert.equal(p('body',-.78,.85,.28),ink.patch);
 assert.equal(p('body',.76,1.00,.21),ink.patch);
 assert.equal(p('body',0,1.05,.45),ink.coat);
 assert.equal(p('eye',-.55,.25,.48),ink.coat,'coat paint never replaces pupils or face sprites');
});

test('material paint is per-pixel and mesh-local rather than floating triangles',()=>{
 const width=24,height=24,data=new Uint8ClampedArray(width*height*4);
 const point=(x,y)=>[x,y,2],local=(x,y)=>[(x-12)/12,(12-y)/12,.5];
 const corners=[[2,2],[22,2],[22,22],[2,22]];
 const faces=[[0,1,2],[0,2,3]].map(ids=>({
  v:ids.map(id=>point(...corners[id])),
  texPoints:ids.map(id=>local(...corners[id])),
  normal:[0,0,1],ink:ink.coat,part:'head'
 }));
 const result=renderCowMeshPixels({getImageData:()=>({data}),putImageData(){}},faces,{
  width,height,textureReady:false,materialPigment:paintOriginalCowSurface,
  stablePalette:true,protectFeatures:true,detailOutlines:true
 });
 const pixel=(x,y)=>[...data.slice((y*width+x)*4,(y*width+x)*4+3)];
 const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 assert.deepEqual(pixel(6,10),rgb(ink.patch),'dark left-side hair maps to screen through local coordinates');
 assert.deepEqual(pixel(12,11),rgb(ink.coat),'central cream face remains visible');
 assert.ok(result.materialPixels>10);
});

test('full 3D original cow retains real features and a side-visible tail in all actions',()=>{
 for(const action of ['idle','walk','turn','wave','blink','sleep']){
  const mesh=buildCow3D({designStyle:'reference',action,emotion:'neutral',time:800});
  const names=new Set(mesh.map(f=>f.part));
  for(const part of ['head','body','ear','innerEar','horn','blush','muzzle','mouth',
   'eyeBorder','tail','tailTuft','hoof0','hoof1','hoof2','hoof3'])assert.ok(names.has(part),part);
  const tail=mesh.filter(f=>f.part==='tailTuft').flatMap(f=>f.points);
  const other=mesh.filter(f=>f.part==='body').flatMap(f=>f.points);
  assert.ok(Math.min(...tail.map(v=>v[0]))<Math.min(...other.map(v=>v[0])),'tuft should sit outside left flank');
  assert.ok(mesh.every(f=>f.points.every(p=>p.every(Number.isFinite))));
 }
});
