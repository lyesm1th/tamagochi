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
