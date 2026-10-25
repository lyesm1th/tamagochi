import test from 'node:test';
import assert from 'node:assert/strict';
import {getRecent,storeRecent} from '../public/wardrobe-cache.js';
import {readFileSync} from 'node:fs';
import {gitBlobHash} from '../scripts/check-visual-baseline.mjs';
test('recently used outfit stays cached, oldest unused one is evicted',()=>{
 const cache=new Map(),a={pixels:1},b={pixels:2},c={pixels:3};
 storeRecent(cache,'a',a,2);storeRecent(cache,'b',b,2);
 assert.strictEqual(getRecent(cache,'a'),a);
 storeRecent(cache,'c',c,2);
 assert.equal(cache.has('b'),false);
 assert.strictEqual(getRecent(cache,'a'),a);
 assert.strictEqual(getRecent(cache,'c'),c);
});
test('cache retains original object and stable 128 entry capacity',()=>{
 const cache=new Map(),first={x:1};
 storeRecent(cache,'outfit-0',first,128);
 for(let i=1;i<128;i++)storeRecent(cache,'outfit-'+i,{x:i},128);
 assert.strictEqual(getRecent(cache,'outfit-0'),first);
 storeRecent(cache,'outfit-128',{x:128},128);
 assert.equal(cache.size,128);
 assert.equal(cache.has('outfit-1'),false);
 assert.strictEqual(getRecent(cache,'outfit-0'),first);
});
test('overwriting existing outfit refreshes its recency',()=>{
 const m=new Map();storeRecent(m,'same',1,2);storeRecent(m,'other',2,2);
 storeRecent(m,'same',3,2);storeRecent(m,'third',4,2);
 assert.equal(m.get('same'),3);assert.equal(m.has('other'),false);
});
test('renderer uses stable dressed sprite keys and LRU without geometry changes',()=>{
 const source=readFileSync(new URL('../public/detailed-renderer.js',import.meta.url),'utf8');
 assert.ok(source.includes("key=JSON.stringify([id,age,sheet,sleep,...['body','neck','head','eyes'].map(slot=>wearing[slot])])"));
 assert.ok(source.includes('getRecent(dressedSprites,key)'));
 assert.ok(source.includes('storeRecent(dressedSprites,key,result,128)'));
 const baseline=JSON.parse(readFileSync(new URL('./baselines/visual-files.json',import.meta.url),'utf8'));
 assert.equal(gitBlobHash(readFileSync(new URL('../public/detailed-renderer.js',import.meta.url))),baseline['public/detailed-renderer.js']);
});
