import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCow3D,drawCow3D,detailedCowColors} from '../public/lab-cow3d.js';
import {originalCowPigments,paintOriginalCowSurface} from '../public/lab-cow3d-paint.js';

const part=(mesh,id)=>mesh.filter(tri=>tri.part===id);
const span=(mesh,id,axis)=>{const p=part(mesh,id).flatMap(f=>f.points.map(v=>v[axis]));return Math.max(...p)-Math.min(...p);};
const maxZ=(mesh,id)=>Math.max(...part(mesh,id).flatMap(f=>f.points.map(p=>p[2])));

test('reference now matches the actual black-and-ivory Detailed atlas, not the cream 3D preview',()=>{
 const reference=buildCow3D({designStyle:'reference',emotion:'neutral'});
 const cream=buildCow3D({designStyle:'cream',emotion:'sad'});
 const legacy=buildCow3D({designStyle:'legacy'});
 assert.ok(part(reference,'head').some(f=>f.ink===originalCowPigments.coat));
 assert.ok(part(reference,'ear').some(f=>f.ink===originalCowPigments.patch));
 assert.ok(part(reference,'muzzle').some(f=>f.ink===originalCowPigments.muzzle));
 assert.ok(part(reference,'blush').some(f=>f.ink===originalCowPigments.blush));
 assert.ok(part(reference,'tailTuft').some(f=>f.ink===originalCowPigments.patch));
 assert.ok(part(reference,'hoof0').some(f=>f.ink===originalCowPigments.hoof));
 assert.ok(part(reference,'eye').some(f=>f.ink===originalCowPigments.eye));
 assert.equal(part(reference,'cheekMark').length,0);
 assert.equal(part(reference,'foreheadMark').length,0);
 assert.ok(part(cream,'head').some(f=>f.ink===detailedCowColors.coat));
 assert.ok(part(cream,'cheekMark').length>0);
 assert.ok(part(legacy,'foreheadMark').length>0);
 assert.equal(part(reference,'tear').length,0,'original smiling cow has no tears by default');
});

test('reference cow has wider muzzle, visible dark nostrils and an articulated pink face',()=>{
 const reference=buildCow3D({designStyle:'reference'}),legacy=buildCow3D({designStyle:'legacy'});
 const cream=buildCow3D({designStyle:'cream'});
 assert.ok(span(reference,'muzzle',0)<span(cream,'muzzle',0)*.90,'original sprite has smaller pink snout than old cream 3D');
 assert.ok(maxZ(reference,'nostril')>maxZ(legacy,'nostril')+.04);
 assert.ok(part(reference,'nostril').every(f=>f.ink===originalCowPigments.ink||f.ink==='#412e2a'||f.ink==='#372420'));
 const a=buildCow3D({designStyle:'reference',headYaw:-35});
 const b=buildCow3D({designStyle:'reference',headYaw:35});
 assert.notDeepEqual(part(a,'muzzle')[0].points,part(b,'muzzle')[0].points);
 assert.deepEqual(part(a,'body')[0].points,part(b,'body')[0].points);
});

test('reference frown is real volumetric geometry and facial emotions stay distinct',()=>{
 const sad=buildCow3D({designStyle:'reference',emotion:'sad'});
 const happy=buildCow3D({designStyle:'reference',emotion:'happy'});
 const neutral=buildCow3D({designStyle:'reference',emotion:'neutral'});
 const first=part(sad,'mouth').length/5;
 assert.ok(Number.isInteger(first)&&first>10);
 const yAt=(mesh,n)=>mesh.filter(f=>f.part==='mouth')[n*first].points[0][1];
 assert.ok(yAt(sad,2)>yAt(sad,0),'sad mouth centre above edges');
 assert.ok(yAt(happy,2)<yAt(happy,0),'happy mouth centre below edges');
 assert.notDeepEqual(part(neutral,'mouth')[0].points,part(happy,'mouth')[0].points);
 assert.equal(part(neutral,'tear').length,0);
 assert.ok(part(sad,'tear').length>0);
});

test('reference keeps proper side horns, hooves and lying-down anatomy across rotations',()=>{
 for(const yaw of [-180,-90,-30,0,30,90,180]){
  const pose={designStyle:'reference',yaw,headYaw:25,action:'sleep',emotion:'sad'};
  const mesh=buildCow3D(pose),names=new Set(mesh.map(f=>f.part));
  for(const id of ['head','body','horn','ear','innerEar','muzzle','nostril','lid','hoof0','hoof1','hoof2','hoof3'])
   assert.ok(names.has(id),id);
  assert.ok(mesh.every(f=>f.points.every(p=>p.every(Number.isFinite))));
 }
});

test('owner-only lab selects frontal, smiling black-and-white reference design',()=>{
 const html=readFileSync(new URL('../public/lab.html',import.meta.url),'utf8');
 assert.match(html,/id="cow3d-design"/);
 assert.match(html,/value="reference" selected/);
 assert.match(html,/value="neutral" selected/);
 assert.match(html,/id="cow3d-yaw"[^>]*value="0"/);
 assert.match(html,/src="\/lab-cow3d\.js\?v=allpetsv10" data-revision="all-species-3d-v10"/);
});

test('3D reference view exposes version and integer pixel scale without smoothing',()=>{
 const data=new Uint8ClampedArray(85*64*4);
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},
  getImageData(){return {data};},putImageData(){}};
 const canvas={style:{},dataset:{},getContext(){return ctx}};
 drawCow3D(canvas,{pixelScale:3,designStyle:'reference',renderMode:'locked',emotion:'sad',outlines:'detailed'});
 assert.equal(canvas.dataset.cow3dDesign,'reference');
 assert.equal(canvas.dataset.cow3dRevision,'all-species-3d-v10');
 assert.equal(canvas.dataset.cow3dMaterial,'original-detailed-surface');
 assert.equal(canvas.dataset.cow3dTextured,'false');
 assert.equal(canvas.style.width,'765px');
 assert.equal(ctx.imageSmoothingEnabled,false);
 drawCow3D(canvas,{pixelScale:3,designStyle:'cream',renderMode:'locked'});
 assert.equal(canvas.dataset.cow3dDesign,'cream');
 drawCow3D(canvas,{pixelScale:3,designStyle:'legacy',renderMode:'locked'});
 assert.equal(canvas.dataset.cow3dDesign,'legacy');
});
