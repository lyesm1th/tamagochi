import {test} from 'node:test';import assert from 'node:assert/strict';import {drawCow3D} from '../public/lab-cow3d.js';
test('2.5D cow uses 2x chunky pixels with true low-res rendering',()=>{
 let width=0,height=0;const data=new Uint8ClampedArray(128*96*4);
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},getImageData(x,y,w,h){assert.equal(w,128);assert.equal(h,96);return {data};},putImageData(){}};
 const canvas={style:{},dataset:{},getContext(){return ctx},set width(v){width=v},get width(){return width},set height(v){height=v},get height(){return height}};
 assert.ok(drawCow3D(canvas,{}));assert.equal(width,128);assert.equal(height,96);
 assert.equal(canvas.style.imageRendering,'pixelated');assert.equal(canvas.dataset.cow3dPixelScale,'2');
 assert.equal(ctx.imageSmoothingEnabled,false);
});

test('owner lab supports deliberately chunky 4x pixel art without smoothing',()=>{
 const data=new Uint8ClampedArray(64*48*4);
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},getImageData(x,y,w,h){assert.equal(w,64);assert.equal(h,48);return {data};},putImageData(){}};
 const canvas={style:{},dataset:{},getContext(){return ctx}};
 assert.ok(drawCow3D(canvas,{pixelScale:4,headYaw:25,yaw:30}));
 assert.equal(canvas.width,64);assert.equal(canvas.height,48);
 assert.equal(canvas.dataset.cow3dPixelScale,'4');
 assert.equal(ctx.imageSmoothingEnabled,false);
});

test('intermediate 3x pixel mode preserves the full stage aspect ratio and no smoothing',()=>{
 const data=new Uint8ClampedArray(85*64*4);
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},
  getImageData(x,y,w,h){assert.equal(w,85);assert.equal(h,64);return {data};},putImageData(){}};
 const canvas={style:{},dataset:{},getContext(){return ctx}};
 assert.ok(drawCow3D(canvas,{pixelScale:3,headYaw:15}));
 assert.equal(canvas.width,85);assert.equal(canvas.height,64);
 assert.equal(canvas.dataset.cow3dPixelScale,'3');
 assert.equal(ctx.imageSmoothingEnabled,false);
});
