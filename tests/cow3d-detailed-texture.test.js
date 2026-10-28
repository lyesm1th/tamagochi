import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {detailedCowPixel,cowDetailedTextureReady,loadCowDetailedTexture} from '../public/lab-cow3d-texture.js';
test('owner lab texture uses actual Detailed dog/cow sprite atlas rather than a new illustration',async()=>{
 const code=readFileSync(new URL('../public/lab-cow3d-texture.js',import.meta.url),'utf8');
 assert.match(code,/detailedArt\.adults/);assert.match(code,/atlas\.cells\.dog/);
 assert.equal(cowDetailedTextureReady(),false);
 assert.equal(await loadCowDetailedTexture(),false); // Node has no Image/DOM
 assert.equal(detailedCowPixel('head',[0,0,0],[0,0,1]),null);
});
test('3D geometry remains separate and has no gameplay mode switch',()=>{
 const render=readFileSync(new URL('../public/lab-cow3d.js',import.meta.url),'utf8');
 const mode=readFileSync(new URL('../public/graphics-mode.js',import.meta.url),'utf8');
 assert.match(render,/detailedCowPixel/);
 assert.match(render,/loadCowDetailedTexture\(\)/);
 assert.doesNotMatch(mode,/cow3d/i);
});

test('Detail transfer keeps color local instead of mixing eye black into cow coat',async()=>{
 const {transferCowGrain}=await import('../public/lab-cow3d.js');
 assert.equal(transferCowGrain('#f8e8c9',null),'#f8e8c9');
 const fur=transferCowGrain('#f8e8c9','#100f11');
 assert.ok(parseInt(fur.slice(1,3),16)>220);
 const dark=transferCowGrain('#845039','#ffffff');
 assert.ok(parseInt(dark.slice(1,3),16)<160);
});
