import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pixelLockedPose,buildCow3D,drawCow3D} from '../public/lab-cow3d.js';
import {renderCowMeshPixels} from '../public/lab-cow3d-raster.js';

test('locked poses hold small sub-frame movements without changing geometry',()=>{
 const a=pixelLockedPose({renderMode:'locked',yaw:12.3,headYaw:9.1,headPitch:5,time:1210});
 const b=pixelLockedPose({renderMode:'locked',yaw:13.1,headYaw:10.3,headPitch:5.2,time:1230});
 assert.equal(a.yaw,b.yaw);assert.equal(a.headYaw,b.headYaw);
 assert.equal(a.headPitch,b.headPitch);assert.equal(a.time,b.time);
 assert.deepEqual(buildCow3D(a),buildCow3D(b));
});

test('classic mode preserves continuous rotation and precise animation time',()=>{
 const pose={renderMode:'classic',yaw:11.2,headYaw:6.4,headPitch:2.6,time:1234};
 assert.deepEqual(pixelLockedPose(pose),pose);
});

test('locked pose works across full 360-degree rotation and keeps the facial rig',()=>{
 for(let yaw=-180;yaw<=180;yaw+=24){
  const locked=pixelLockedPose({renderMode:'locked',yaw,headYaw:35,emotion:'sad',time:500});
  const mesh=buildCow3D(locked);
  assert.ok(mesh.some(f=>f.part==='eye'));
  assert.ok(mesh.some(f=>f.part==='tear'));
  assert.ok(mesh.some(f=>f.part==='body'));
 }
});

test('render mode switch exposes metadata without filtering or smoothing',()=>{
 const data=new Uint8ClampedArray(85*64*4);
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},
  getImageData(){return {data};},putImageData(){}};
 const canvas={style:{},dataset:{},getContext(){return ctx}};
 drawCow3D(canvas,{pixelScale:3,renderMode:'locked',time:121});
 assert.equal(canvas.dataset.cow3dRenderMode,'locked');
 assert.equal(canvas.width,85);assert.equal(canvas.height,64);
 assert.equal(ctx.imageSmoothingEnabled,false);
 drawCow3D(canvas,{pixelScale:3,renderMode:'classic',time:121});
 assert.equal(canvas.dataset.cow3dRenderMode,'classic');
});

test('protected facial pigments are not replaced by generic dark seam ink',()=>{
 const width=12,height=12;
 const paint=protectFeatures=>{
  const data=new Uint8ClampedArray(width*height*4);
  const faces=[{v:[[3,3,4],[8,3,4],[3,8,4]],ink:'#fff9ef',normal:[0,0,1],part:'sparkle'}];
  renderCowMeshPixels({getImageData:()=>({data}),putImageData(){}},faces,{width,height,protectFeatures,textureReady:false});
  return [...data.slice((4*width+4)*4,(4*width+4)*4+3)];
 };
 assert.deepEqual(paint(true),[255,249,239]);
 assert.deepEqual(paint(false),[255,249,239]); // the interior is preserved in both paths
});
