import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCow3D} from '../public/lab-cow3d.js';
import {cowPartUV,sampleCowAtlasUV} from '../public/lab-cow3d-texture.js';
import {renderCowMeshPixels} from '../public/lab-cow3d-raster.js';
test('each face has anatomy-space UVs anchored independent of the head yaw',()=>{
 const a=buildCow3D({headYaw:-35}),b=buildCow3D({headYaw:35});
 for(const part of ['head','body']){
  const f=a.find(x=>x.part===part),g=b.find(x=>x.part===part);
  assert.equal(f.uv.length,3);
  assert.deepEqual(f.uv,g.uv);
 }
 assert.deepEqual(cowPartUV('head',[0,0,0]),[.5,.35]);
 assert.equal(sampleCowAtlasUV('head',[.5,.5],[0,0,1]),null);
});
test('z-buffer renderer interpolates UV at each output pixel',()=>{
 const data=new Uint8ClampedArray(8*8*4),ctx={getImageData:()=>({data}),putImageData:()=>{}};
 const face={v:[[0,0,1],[7,0,1],[0,7,1]],normal:[0,0,1],part:'head',ink:'#f8e8c9',uv:[[0,0],[1,0],[0,1]]};
 const sampled=[];
 const r=renderCowMeshPixels(ctx,[face],{width:8,height:8,textureReady:true,uvPigment:(part,uv,normal,base)=>{sampled.push(uv);return '#845039';}});
 assert.ok(r.textured>5);
 assert.ok(new Set(sampled.map(v=>v.map(n=>n.toFixed(2)).join(','))).size>5);
});
