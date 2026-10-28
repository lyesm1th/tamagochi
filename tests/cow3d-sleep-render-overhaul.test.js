import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCow3D,drawCow3D} from '../public/lab-cow3d.js';
const vertices=(mesh,part)=>mesh.filter(f=>f.part===part).flatMap(f=>f.points);
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const extent=(points,axis)=>Math.max(...points.map(p=>p[axis]))-Math.min(...points.map(p=>p[axis]));
test('sleep reclines the whole cow rigidly without vertically crushing its head',()=>{
 const awake=buildCow3D({action:'idle',time:0}),sleep=buildCow3D({action:'sleep',time:0});
 for(const part of ['head','muzzle','body','ear','leg0','horn']){
  const a=vertices(awake,part),b=vertices(sleep,part);
  assert.equal(a.length,b.length,part);
  for(const [i,j] of [[0,1],[3,10],[40,80]])if(j<a.length)assert.ok(Math.abs(distance(a[i],a[j])-distance(b[i],b[j]))<1e-8,part);
 }
 assert.ok(extent(vertices(sleep,'head'),0)>extent(vertices(awake,'head'),0)*.25);
 const ground=Math.min(...sleep.flatMap(f=>f.points.map(p=>p[1])));
 assert.ok(Math.abs(ground-.08)<.000001);
 assert.ok(sleep.some(f=>f.part==='lid'));
 assert.ok(!sleep.some(f=>f.part==='eye'));
});
test('sleeping is clearly distinct from standing while remaining volumetric',()=>{
 const awake=buildCow3D({action:'idle',time:0}),sleep=buildCow3D({action:'sleep',time:0});
 assert.notDeepEqual(vertices(awake,'head'),vertices(sleep,'head'));
 assert.ok(extent(vertices(sleep,'body'),0)>extent(vertices(awake,'body'),0)*.4);
});
test('locked mode uses stable pigment without atlas-dependent per-frame texture',()=>{
 const data=new Uint8ClampedArray(85*64*4);
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},getImageData(){return {data};},putImageData(){}};
 const canvas={style:{},dataset:{},getContext(){return ctx}};
 drawCow3D(canvas,{pixelScale:3,renderMode:'locked',action:'sleep'});
 assert.equal(canvas.dataset.cow3dSleeping,'true');
 assert.equal(canvas.dataset.cow3dTextured,'false');
 assert.equal(canvas.dataset.cow3dRenderMode,'locked');
 assert.equal(ctx.imageSmoothingEnabled,false);
});
