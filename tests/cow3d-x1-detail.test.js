import {test} from 'node:test';
import assert from 'node:assert/strict';
import {drawCow3D,originalCowHeadProfile} from '../public/lab-cow3d.js';
import {readFileSync} from 'node:fs';

test('1x is true 256x192 native raster and keeps sharp pixels',()=>{
 const ctx={fillStyle:'',imageSmoothingEnabled:true,fillRect(){},beginPath(){},ellipse(){},fill(){},
  getImageData(x,y,w,h){assert.equal(w,256);assert.equal(h,192);return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}};
 const canvas={style:{},dataset:{},getContext(){return ctx}};
 assert.ok(drawCow3D(canvas,{designStyle:'reference',renderMode:'locked',pixelScale:1,emotion:'neutral',outlines:'detailed'}));
 assert.equal(canvas.width,256);
 assert.equal(canvas.height,192);
 assert.equal(ctx.imageSmoothingEnabled,false);
 assert.equal(canvas.style.imageRendering,'pixelated');
 assert.equal(canvas.dataset.cow3dPixelScale,'1');
 assert.equal(canvas.dataset.cow3dRevision,'cheeks-x1-v8');
 assert.equal(canvas.dataset.cow3dMotion,'rigid-keyframes-8fps');
});
test('1x default in owner lab, while 2x 3x and 4x still offered',()=>{
 const html=readFileSync(new URL('../public/lab.html',import.meta.url),'utf8');
 assert.match(html,/<option value="1" selected>×1/);
 for(const scale of [2,3,4])assert.match(html,new RegExp('<option value="'+scale+'">'));
 assert.match(html,/lab-cow3d\.js\?v=cheeksx1v8/);
});
test('cheek bump reduced while preserving narrow forehead and compact chin',()=>{
 const cheek=originalCowHeadProfile(-.24);
 const forehead=originalCowHeadProfile(.49);
 const chin=originalCowHeadProfile(-.72);
 assert.ok(cheek>forehead*1.3);
 assert.ok(chin<cheek*.85);
 const previous=y=>(1+.26*Math.exp(-Math.pow((y+.26)/.36,2)))*(1-.24*Math.exp(-Math.pow((y-.49)/.40,2)))*(1-.27*Math.exp(-Math.pow((y+.72)/.26,2)));
 assert.ok(cheek<previous(-.24)*.96,'reduce outermost cheek volume, not merely repaint');
});
