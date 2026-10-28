import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderCowMeshPixels} from '../public/lab-cow3d-raster.js';
import {drawCow3D} from '../public/lab-cow3d.js';

function rect(x0,y0,x1,y1,part,ink,z=1){
 const p=(x,y)=>[x,y,z];
 return [
  {v:[p(x0,y0),p(x1,y0),p(x1,y1)],part,ink,normal:[0,0,1]},
  {v:[p(x0,y0),p(x1,y1),p(x0,y1)],part,ink,normal:[0,0,1]}
 ];
}
function sample(detailOutlines){
 const width=24,height=24,data=new Uint8ClampedArray(width*height*4);
 const faces=[
  ...rect(3,3,19,20,'head','#f8e8c9',1),
  ...rect(8,8,14,16,'muzzle','#ed9b9b',2),
  ...rect(10,9,12,12,'eye','#251d1a',3)
 ];
 const result=renderCowMeshPixels({getImageData:()=>({data}),putImageData(){}},faces,{
  width,height,textureReady:false,protectFeatures:true,detailOutlines,stablePalette:true,outlineWidth:1
 });
 const color=(x,y)=>[...data.slice((y*width+x)*4,(y*width+x)*4+3)];
 return {color,result};
}
test('Detailed ink creates visible borders on head next to muzzle without losing pink muzzle',()=>{
 const plain=sample(false),detailed=sample(true);
 assert.deepEqual(plain.color(7,13),[248,232,201]);
 assert.deepEqual(detailed.color(7,13),[70,41,35]);
 assert.deepEqual(detailed.color(11,14),[237,155,155]);
 assert.ok(detailed.result.detailOutlined>0);
 assert.equal(plain.result.detailOutlined,0);
});
test('eye pigments are not painted over by Detailed ink',()=>{
 const detailed=sample(true);
 assert.deepEqual(detailed.color(10,10),[37,29,26]);
 assert.deepEqual(detailed.color(9,10),[70,41,35]);
 assert.deepEqual(detailed.color(2,10),[57,35,31]);
 assert.deepEqual(detailed.color(0,10),[0,0,0]);
});
test('outlines reflect depth-tested visible parts, not hidden mesh triangles',()=>{
 const width=24,height=24,data=new Uint8ClampedArray(width*height*4);
 const behind=rect(7,7,12,13,'horn','#ecd5a2',0);
 const front=rect(3,3,19,20,'head','#f8e8c9',2);
 const result=renderCowMeshPixels({getImageData:()=>({data}),putImageData(){}},[...behind,...front],{
  width,height,textureReady:false,protectFeatures:true,detailOutlines:true,stablePalette:true
 });
 assert.equal(result.detailOutlined,0);
 assert.deepEqual([...data.slice((10*width+7)*4,(10*width+7)*4+3)],[248,232,201]);
});
test('owner lab offers inked 3x Pixel-Locked rendering without smoothing',()=>{
 const data=new Uint8ClampedArray(85*64*4);
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},
  getImageData(){return {data};},putImageData(){}};
 const canvas={style:{},dataset:{},getContext(){return ctx}};
 drawCow3D(canvas,{pixelScale:3,renderMode:'locked',outlines:'detailed',yaw:-16,headYaw:8});
 assert.equal(canvas.dataset.cow3dOutlineStyle,'detailed');
 assert.ok(Number(canvas.dataset.cow3dDetailOutlinePixels)>0);
 assert.equal(ctx.imageSmoothingEnabled,false);
 drawCow3D(canvas,{pixelScale:3,renderMode:'locked',outlines:'soft'});
 assert.equal(canvas.dataset.cow3dOutlineStyle,'soft');
 assert.equal(canvas.dataset.cow3dDetailOutlinePixels,'0');
});
