import {test} from 'node:test';import assert from 'node:assert/strict';import {renderCowMeshPixels} from '../public/lab-cow3d-raster.js';import {buildCow3D} from '../public/lab-cow3d.js';
test('near eye pixel wins over far coat even when triangles arrive in reverse order',()=>{
 const data=new Uint8ClampedArray(4*4*4);
 const ctx={getImageData:()=>({data}),putImageData:()=>{}};
 const tri=(z,ink,part)=>({v:[[0,0,z],[4,0,z],[0,4,z]],ink,normal:[0,0,1],part});
 renderCowMeshPixels(ctx,[tri(3,'#251d1a','eye'),tri(1,'#f8e8c9','head')],{width:4,height:4,pigment:()=>{},textureReady:false});
 assert.deepEqual([...data.slice(0,3)],[37,29,26]);
});
test('head turning does not change torso mesh and chibi skull is wider than torso',()=>{
 const a=buildCow3D({headYaw:-35}),b=buildCow3D({headYaw:35});
 const bounds=(faces,id)=>{const p=faces.filter(t=>t.part===id).flatMap(t=>t.points).map(v=>v[0]);return Math.max(...p)-Math.min(...p);};
 assert.deepEqual(a.find(t=>t.part==='body').points,b.find(t=>t.part==='body').points);
 assert.notDeepEqual(a.find(t=>t.part==='head').points,b.find(t=>t.part==='head').points);
 assert.ok(bounds(a,'head')>bounds(a,'body')*1.10,'chibi head must remain larger than torso');
});
