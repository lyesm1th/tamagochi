import {test} from 'node:test';import assert from 'node:assert/strict';import {drawCow3D} from '../public/lab-cow3d.js';
test('2.5D cow uses 2x chunky pixels with true low-res rendering',()=>{
 let width=0,height=0;const data=new Uint8ClampedArray(128*96*4);
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},getImageData(x,y,w,h){assert.equal(w,128);assert.equal(h,96);return {data};},putImageData(){}};
 const canvas={style:{},dataset:{},getContext(){return ctx},set width(v){width=v},get width(){return width},set height(v){height=v},get height(){return height}};
 assert.ok(drawCow3D(canvas,{}));assert.equal(width,128);assert.equal(height,96);
 assert.equal(canvas.style.imageRendering,'pixelated');assert.equal(canvas.dataset.cow3dPixelScale,'2');
 assert.equal(ctx.imageSmoothingEnabled,false);
});
