import {test} from 'node:test';
import assert from 'node:assert/strict';
import {drawCow3D} from '../public/lab-cow3d.js';

function render(pixelScale){
 const widths=[];
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},
 getImageData(x,y,w,h){widths.push([w,h]);return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}};
 const canvas={style:{},dataset:{},getContext(){return ctx}};
 drawCow3D(canvas,{designStyle:'reference',renderMode:'locked',outlines:'detailed',pixelScale,action:'idle',yaw:0});
 return {canvas,ctx,widths};
}
test('Balanced uses genuine 128x96 2x native pixels, not fractional interpolation',()=>{
 const {canvas,ctx,widths}=render('balanced');
 assert.deepEqual([canvas.width,canvas.height],[128,96]);
 assert.equal(canvas.style.imageRendering,'pixelated');
 assert.equal(ctx.imageSmoothingEnabled,false);
 assert.equal(canvas.dataset.cow3dNativePixelScale,'2');
 assert.equal(canvas.dataset.cow3dPixelScale,'balanced');
 assert.equal(canvas.dataset.cow3dSilhouetteRings,'1');
 assert.equal(canvas.dataset.cow3dModelBoost,'1.065');
 assert.ok(widths.some(([w,h])=>w===128&&h===96));
});
test('Balanced is distinct from classic 2x: original 2x retains two silhouette rings',()=>{
 const {canvas:balanced}=render('balanced');
 const {canvas:normal}=render(2);
 assert.equal(normal.dataset.cow3dSilhouetteRings,'2');
 assert.equal(normal.dataset.cow3dModelBoost,'1');
 assert.equal(normal.dataset.cow3dPixelScale,'2');
 assert.equal(balanced.width,normal.width);
});
test('existing x1, x3 and x4 retain native integer pixel matrices',()=>{
 for(const [scale,w,h] of [[1,256,192],[3,85,64],[4,64,48]]){
  const {canvas}=render(scale);
  assert.deepEqual([canvas.width,canvas.height],[w,h]);
  assert.equal(canvas.dataset.cow3dSilhouetteRings,scale===3?'2':'1');
 }
});
