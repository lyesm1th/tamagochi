import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderCowMeshPixels} from '../public/lab-cow3d-raster.js';
import {buildCow3D,originalCowHeadProfile,drawCow3D} from '../public/lab-cow3d.js';

const rgb=(x,y,w,data)=>[...data.slice((y*w+x)*4,(y*w+x)*4+3)];
const quad=(color,part='head')=>{
 const p=(x,y)=>[x,y,2];
 return [
  {v:[p(5,4),p(13,4),p(13,14)],normal:[0,0,1],ink:color,part},
  {v:[p(5,4),p(13,14),p(5,14)],normal:[0,0,1],ink:color,part}
 ];
};
function render(color,{adaptiveOutlines=true,outlineWidth=2,part='head'}={}){
 const w=20,h=20,data=new Uint8ClampedArray(w*h*4);
 const ctx={getImageData:()=>({data}),putImageData(){}};
 const result=renderCowMeshPixels(ctx,quad(color,part),{width:w,height:h,
  stablePalette:true,outlineWidth,adaptiveOutlines,textureReady:false,protectFeatures:true});
 return {result,pixel:(x,y)=>rgb(x,y,w,data)};
}

test('reference charcoal patch receives darker and visibly separate outer ink across both pixel rings',()=>{
 const dark=render('#39353e'),old=render('#39353e',{adaptiveOutlines:false});
 assert.deepEqual(dark.pixel(4,8),[18,17,25]);
 assert.deepEqual(dark.pixel(3,8),[18,17,25]);
 assert.deepEqual(dark.pixel(9,8),[57,53,62]);
 assert.deepEqual(old.pixel(4,8),[57,35,31]);
 const contrast=(a,b)=>a.reduce((sum,c,i)=>sum+Math.abs(c-b[i]),0);
 assert.ok(contrast(dark.pixel(4,8),dark.pixel(9,8))>contrast(old.pixel(4,8),old.pixel(9,8))*1.7);
 assert.ok(dark.result.adaptiveDarkOutlined>0);
});

test('ivory edge uses cocoa while pink nose edge uses a muted berry, not near-black',()=>{
 const ivory=render('#faefdb'),muzzle=render('#f1b5aa',{part:'muzzle'});
 assert.deepEqual(ivory.pixel(4,8),[62,41,40]);
 assert.deepEqual(ivory.pixel(3,8),[62,41,40]);
 assert.deepEqual(muzzle.pixel(4,8),[110,55,68]);
 assert.deepEqual(muzzle.pixel(9,8),[241,181,170]);
 assert.notDeepEqual(ivory.pixel(4,8),muzzle.pixel(4,8));
 assert.deepEqual(muzzle.pixel(0,8),[0,0,0]);
});

test('the face silhouette has a softer forehead arch and continuous cheek-to-chin profile',()=>{
 const ys=[.95,.80,.60,.30,0,-.20,-.45,-.65,-.85];
 for(const y of ys){
  const p=originalCowHeadProfile(y);
  assert.ok(Number.isFinite(p)&&p>.84&&p<1.25);
 }
 assert.ok(originalCowHeadProfile(.80)>.89,'forehead no longer pinched');
 assert.ok(originalCowHeadProfile(-.20)>originalCowHeadProfile(0),'softly rounded lower cheeks');
 assert.ok(originalCowHeadProfile(-.65)>1.02,'chin transitions smoothly instead of collapsing into a V');
 const mesh=buildCow3D({designStyle:'reference',renderMode:'locked'});
 const head=mesh.filter(t=>t.part==='head'),verts=head.flatMap(t=>t.points);
 assert.ok(head.length>500&&verts.every(v=>v.every(Number.isFinite)));
});

test('reference shader flag is private to original Sprite-Locked, never affects legacy or cream',()=>{
 const data=new Uint8ClampedArray(128*96*4);
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},
  getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}};
 const c={style:{},dataset:{},getContext(){return ctx}};
 drawCow3D(c,{designStyle:'reference',renderMode:'locked',pixelScale:2});
 assert.equal(c.dataset.cow3dRevision,'head-palette-v5');
 assert.equal(c.dataset.cow3dOutlinePalette,'reference-adaptive');
 assert.equal(ctx.imageSmoothingEnabled,false);
 drawCow3D(c,{designStyle:'cream',renderMode:'locked',pixelScale:2});
 assert.equal(c.dataset.cow3dOutlinePalette,'classic');
 drawCow3D(c,{designStyle:'reference',renderMode:'classic',pixelScale:2});
 assert.equal(c.dataset.cow3dOutlinePalette,'classic');
});
