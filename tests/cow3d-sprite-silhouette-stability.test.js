import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCow3D,pixelLockedPose,drawCow3D} from '../public/lab-cow3d.js';
import {cleanFurSpeckles,renderCowMeshPixels} from '../public/lab-cow3d-raster.js';

const vertices=(mesh,part)=>mesh.filter(f=>f.part===part).flatMap(f=>f.points);
const limits=(pts,axis)=>[Math.min(...pts.map(p=>p[axis])),Math.max(...pts.map(p=>p[axis]))];
const width=(mesh,part)=>{const [min,max]=limits(vertices(mesh,part),0);return max-min;};
const height=(mesh,part)=>{const [min,max]=limits(vertices(mesh,part),1);return max-min;};

test('the green reference has a compact head approximately the torso width with broad lower cheeks',()=>{
 const original=buildCow3D({designStyle:'reference',action:'idle',renderMode:'locked'});
 const cream=buildCow3D({designStyle:'cream',action:'idle',renderMode:'locked'});
 assert.ok(width(original,'head')>width(original,'body')*.93,'head must remain full but not oversized');
 assert.ok(width(original,'head')<width(cream,'head')*1.10,'green contour narrows the old over-wide head');
 assert.ok(width(original,'body')<width(cream,'body')*.96,'torso must be narrower than the old cream mesh');
 assert.ok(height(original,'leg0')<height(original,'body')*.60);
 const outer=(id)=>Math.max(...vertices(original,id).map(p=>Math.abs(p[0])));
 assert.ok(outer('ear')>outer('head')*1.12,'ears must visibly extend beyond the narrower cheeks');
 assert.ok(vertices(original,'head').length>500&&vertices(original,'body').length>500);
});

test('locked idle keeps all model vertices absolutely still across animation time',()=>{
 const first=buildCow3D({designStyle:'reference',renderMode:'locked',action:'idle',time:0});
 const later=buildCow3D({designStyle:'reference',renderMode:'locked',action:'idle',time:2500});
 assert.deepEqual(first,later,'no animated breathing, bobbing, or roaming speckle triangles');
});

test('locked movement uses discrete footfall silhouettes rather than every-frame sine deformation',()=>{
 const a=pixelLockedPose({renderMode:'locked',action:'walk',time:12,headYaw:7,yaw:10});
 const b=pixelLockedPose({renderMode:'locked',action:'walk',time:42,headYaw:8,yaw:11});
 assert.deepEqual(a,b,'sub-frame input must not change the 3D pose');
 const first=buildCow3D(a),held=buildCow3D(b);
 assert.deepEqual(first,held);
 const stepped=buildCow3D(pixelLockedPose({renderMode:'locked',action:'walk',time:250,headYaw:7,yaw:10}));
 assert.notDeepEqual(vertices(first,'leg0'),vertices(stepped,'leg0'));
 assert.deepEqual(vertices(first,'body'),vertices(stepped,'body'));
});

test('material pixel cleaner removes lone contrasting RGB flecks without blurring 3D edges',()=>{
 const w=7,h=7,n=w*h,pixels=new Uint8ClampedArray(n*4);
 const mask=new Uint8Array(n).fill(1),parts=new Array(n).fill('head');
 for(let i=0;i<n;i++){pixels[i*4]=250;pixels[i*4+1]=239;pixels[i*4+2]=219;pixels[i*4+3]=255;}
 const stray=(3*w+3)*4;pixels[stray]=50;pixels[stray+1]=48;pixels[stray+2]=57;
 assert.equal(cleanFurSpeckles(pixels,mask,parts,w,h),1);
 assert.deepEqual([...pixels.slice(stray,stray+3)],[250,239,219]);
 // Eyes and edge pixels are never filled/softened by the cleaner.
 parts[3*w+3]='eye';pixels[stray]=14;pixels[stray+1]=12;pixels[stray+2]=17;
 assert.equal(cleanFurSpeckles(pixels,mask,parts,w,h),0);
 assert.deepEqual([...pixels.slice(stray,stray+3)],[14,12,17]);
});

test('original locked render uses exact flat palette and leaves previous cream renderer selectable',()=>{
 const data=new Uint8ClampedArray(85*64*4);
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},
   getImageData(){return {data};},putImageData(){}};
 const canvas={style:{},dataset:{},getContext(){return ctx}};
 drawCow3D(canvas,{designStyle:'reference',renderMode:'locked',pixelScale:3,time:250});
 assert.equal(canvas.dataset.cow3dRevision,'species-sculpt-v12');
 assert.equal(canvas.dataset.cow3dMotion,'rigid-keyframes-8fps');
 assert.equal(canvas.dataset.cow3dDesign,'reference');
 assert.equal(ctx.imageSmoothingEnabled,false);
 drawCow3D(canvas,{designStyle:'cream',renderMode:'classic',pixelScale:3,time:250});
 assert.equal(canvas.dataset.cow3dDesign,'cream');
 assert.equal(canvas.dataset.cow3dMotion,'continuous');
});
