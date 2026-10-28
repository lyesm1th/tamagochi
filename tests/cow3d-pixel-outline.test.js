import {test} from 'node:test';import assert from 'node:assert/strict';import {renderCowMeshPixels} from '../public/lab-cow3d-raster.js';
test('silhouette receives a dark crisp outline without filling the empty background',()=>{
 const width=12,height=12,data=new Uint8ClampedArray(width*height*4);
 const ctx={getImageData:()=>({data}),putImageData:()=>{}};
 const face={v:[[3,3,1],[9,3,1],[3,9,1]],normal:[0,0,1],ink:'#f8e8c9',part:'head'};
 const result=renderCowMeshPixels(ctx,[face],{width,height,textureReady:false});
 assert.ok(result.outlined>0);
 const color=(x,y)=>[...data.slice((y*width+x)*4,(y*width+x)*4+3)];
 assert.deepEqual(color(0,0),[0,0,0]);
 assert.deepEqual(color(2,4),[57,35,31]);
 assert.deepEqual(color(4,4),[248,232,201]);
});

test('thicker 2x outline expands outward without hiding interior facial colors',()=>{
 const width=20,height=20;
 const draw=outlineWidth=>{
  const data=new Uint8ClampedArray(width*height*4);
  const ctx={getImageData:()=>({data}),putImageData:()=>{}};
  const face={v:[[5,5,1],[15,5,1],[5,15,1]],normal:[0,0,1],ink:'#f8e8c9',part:'head'};
  renderCowMeshPixels(ctx,[face],{width,height,textureReady:false,outlineWidth});
  return (x,y)=>[...data.slice((y*width+x)*4,(y*width+x)*4+3)];
 };
 const thin=draw(1),thick=draw(2);
 assert.deepEqual(thin(3,8),[0,0,0]);
 assert.deepEqual(thick(3,8),[57,35,31]);
 assert.deepEqual(thin(7,7),thick(7,7));
 assert.deepEqual(thick(1,8),[0,0,0]);
});
