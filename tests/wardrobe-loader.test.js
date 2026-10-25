import test from 'node:test';
import assert from 'node:assert/strict';
import {loadWardrobeAssets} from '../public/authored-wardrobe.js';
import {wardrobeAssets,wardrobeSprites} from '../public/wardrobe-sprite-manifest.js';
const expected=1+['babies','children','teens','adults','sleep'].filter(stage=>wardrobeSprites[stage]).length*3;
test('concurrent wardrobe loads share one set of browser raster requests',async()=>{
 const previous=globalThis.Image;
 let count=0;
 class FakeImage{
  set src(value){this.url=value;count++;queueMicrotask(()=>this.onload?.());}
 }
 globalThis.Image=FakeImage;
 try{
  const a=loadWardrobeAssets(),b=loadWardrobeAssets(),c=loadWardrobeAssets();
  assert.strictEqual(a,b);assert.strictEqual(b,c);
  await Promise.all([a,b,c]);
  assert.equal(count,expected);
  await loadWardrobeAssets();
  assert.equal(count,expected*2,'a later independent refresh remains available');
 }finally{globalThis.Image=previous;}
});
test('failed browser raster loading can be retried',async()=>{
 const previous=globalThis.Image;
 let count=0;
 class FakeImage{
  set src(value){count++;queueMicrotask(()=>this.onerror?.(new Error('unavailable')));}
 }
 globalThis.Image=FakeImage;
 try{
  await assert.rejects(loadWardrobeAssets(),/wardrobe/);
  const first=count;
  await assert.rejects(loadWardrobeAssets(),/wardrobe/);
  assert.equal(count,first*2);
 }finally{globalThis.Image=previous;}
});
test('injected QA loaders retain independent calls',async()=>{
 let calls=0;
 const loader=async src=>{calls++;return {src};};
 await Promise.all([loadWardrobeAssets(loader),loadWardrobeAssets(loader)]);
 assert.equal(calls,expected*2);
});
