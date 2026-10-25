import test from 'node:test';
import assert from 'node:assert/strict';
import {cachedExpressionFrame} from '../public/wardrobe-expression-cache.js';
import {readFileSync} from 'node:fs';
import {gitBlobHash} from '../scripts/check-visual-baseline.mjs';
const e={kind:'sad',strength:.8,gesture:.25,blink:0,tear:.1};
test('identical clothing canvas and emotional snapshot share expression image',()=>{
 const base={width:10},image={changed:true};let calls=0;
 const render=()=>{calls++;return image;};
 assert.strictEqual(cachedExpressionFrame(base,'cat','adults',e,5,render),image);
 assert.strictEqual(cachedExpressionFrame(base,'cat','adults',{...e},5,render),image);
 assert.equal(calls,1);
});
test('every visual input change immediately invalidates expression frame',()=>{
 const base={},calls=[];const render=(_base,_id,_stage,a,pad)=>{const result={value:calls.length};calls.push([a,pad]);return result;};
 let previous=cachedExpressionFrame(base,'cat','adults',e,7,render);
 for(const [change,appearance] of [
  ['strength',{...e,strength:.80001}],['gesture',{...e,gesture:.251}],
  ['blink',{...e,blink:.001}],['tear',{...e,tear:.11}],
  ['kind',{...e,kind:'hurt'}]
 ]){
  const next=cachedExpressionFrame(base,'cat','adults',appearance,7,render);
  assert.notStrictEqual(next,previous,change);
  previous=next;
 }
 assert.equal(calls.length,6);
 assert.notStrictEqual(cachedExpressionFrame(base,'cat','adults',e,8,render),previous);
 assert.notStrictEqual(cachedExpressionFrame({},'cat','adults',e,8,render),previous);
});
test('resting emotion bypasses expression generation',()=>{
 const base={};let calls=0;
 assert.strictEqual(cachedExpressionFrame(base,'cat','adults',{...e,strength:0},0,()=>{calls++;}),base);
 assert.equal(calls,0);
});
test('protected renderer only changes expression cache call, never canvas geometry',()=>{
 const renderer=readFileSync(new URL('../public/detailed-renderer.js',import.meta.url),'utf8');
 assert.ok(renderer.includes('cachedExpressionFrame(result.image,id,sheet,appearance,result.pad,expressionFrame)'));
 const hashes=JSON.parse(readFileSync(new URL('./baselines/visual-files.json',import.meta.url),'utf8'));
 assert.equal(gitBlobHash(Buffer.from(renderer)),hashes['public/detailed-renderer.js']);
});
