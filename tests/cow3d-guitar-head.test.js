import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCow3D,originalCowHeadProfile,drawCow3D} from '../public/lab-cow3d.js';

// Measure actual unrotated mesh coordinates, not a 2D paint trick.
// texPoints preserve the local head surface even when the rig turns.
const headPoints=pose=>buildCow3D({designStyle:'reference',renderMode:'locked',...pose})
 .filter(face=>face.part==='head').flatMap(face=>face.texPoints);
const halfWidth=(vertices,low,high)=>{
 const xs=vertices.filter(v=>v[1]>=low&&v[1]<=high).map(v=>Math.abs(v[0]));
 assert.ok(xs.length>0,`empty head band ${low}..${high}`);
 return Math.max(...xs);
};

test('original Detailed head forms guitar silhouette: smaller brow, maximal cheeks, tapered rounded chin',()=>{
 const vertices=headPoints({yaw:0,headYaw:0});
 const upper=halfWidth(vertices,.25,.50);  // forehead / eyebrows
 const cheeks=halfWidth(vertices,-.31,-.09); // just below eyes
 const chin=halfWidth(vertices,-.55,-.39);
 assert.ok(cheeks>upper*1.28,`wide cheek band must exceed brow: ${cheeks} <= ${upper}`);
 assert.ok(chin<cheeks*.83,`original chin must taper: ${chin} >= ${cheeks}`);
 assert.ok(chin>cheeks*.38,'chin remains rounded, never a sharpened spike');
});

test('profile has continuous wide cheeks, a genuinely narrower upper forehead and lower chin',()=>{
 const ys=[1,.9,.8,.7,.6,.45,.3,0,-.2,-.4,-.55,-.7,-.85,-1];
 const values=ys.map(originalCowHeadProfile);
 assert.ok(values.every(v=>Number.isFinite(v)&&v>.68&&v<1.4));
 assert.ok(originalCowHeadProfile(-.25)>originalCowHeadProfile(.5)*1.3);
 assert.ok(originalCowHeadProfile(-.3)>originalCowHeadProfile(-.7)*1.22);
 // A gaussian deformation is smooth: no polygonal step at anatomical bands.
 for(let y=-.98;y<.98;y+=.01)
  assert.ok(Math.abs(originalCowHeadProfile(y+.01)-originalCowHeadProfile(y))<.035);
});

test('head still really turns as volumetric geometry, while original local silhouette stays fixed',()=>{
 const straight=headPoints({headYaw:0,headPitch:0});
 const angled=headPoints({headYaw:42,headPitch:15});
 assert.deepEqual(straight,angled,'paint and shape defined in head-local coordinates');
 const mesh=pose=>buildCow3D({designStyle:'reference',renderMode:'locked',...pose})
   .filter(f=>f.part==='head')[0].points;
 assert.notDeepEqual(mesh({headYaw:0}),mesh({headYaw:42}));
 assert.notDeepEqual(mesh({headPitch:0}),mesh({headPitch:15}));
 for(const action of ['idle','walk','sleep','wave']){
  const parts=buildCow3D({designStyle:'reference',renderMode:'locked',action});
  assert.ok(parts.every(f=>f.points.every(p=>p.every(Number.isFinite))));
 }
});

test('v6 remains owner-lab-only and does not antialias the Detailed renderer',()=>{
 const data=new Uint8ClampedArray(128*96*4);
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},
 getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}};
 const canvas={style:{},dataset:{},getContext(){return ctx}};
 drawCow3D(canvas,{designStyle:'reference',renderMode:'locked',pixelScale:2});
 assert.equal(canvas.dataset.cow3dRevision,'guitar-head-v6');
 assert.equal(canvas.dataset.cow3dMotion,'rigid-keyframes-8fps');
 assert.equal(canvas.dataset.cow3dOutlinePalette,'reference-adaptive');
 assert.equal(ctx.imageSmoothingEnabled,false);
});
