import {test} from 'node:test';
import assert from 'node:assert/strict';
test('graphics choice persists on this device and restores across module loads',async()=>{
 const old=globalThis.localStorage,values=new Map();globalThis.localStorage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 try{const a=await import('../public/graphics-mode.js?first');assert.equal(a.graphicsMode,'classic');a.setGraphicsMode('detailed');const b=await import('../public/graphics-mode.js?reload');assert.equal(b.graphicsMode,'detailed');b.setGraphicsMode('unknown');assert.equal(b.graphicsMode,'classic');assert.equal(values.get('hamagochi-graphics'),'classic');}finally{globalThis.localStorage=old;}
});
test('blocked device storage still permits switching graphics',async()=>{const old=globalThis.localStorage;globalThis.localStorage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};try{const a=await import('../public/graphics-mode.js?blocked');assert.equal(a.graphicsMode,'classic');assert.equal(a.setGraphicsMode('detailed'),'detailed');assert.equal(a.setGraphicsMode('classic'),'classic');}finally{globalThis.localStorage=old;}});
