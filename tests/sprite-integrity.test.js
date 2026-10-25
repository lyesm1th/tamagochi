import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {emotionSprites} from '../public/emotion-sprite-manifest.js';
import {detailedArt} from '../public/detailed-art-manifest.js';
import {isolateSprite} from '../public/sprite-cleanup.js';
import {paintFittedClothes} from './legacy-art/fitted-clothes.js';
import {emotionFrame,expressionRecipe,emotionKinds} from '../public/emotion-frames.js';
const ages=['Малюк','Дитина','Підліток','Дорослий'];
const load=src=>loadImage(new URL('../public'+src,import.meta.url).pathname);
test('all 2912 face frames preserve the source silhouette, transparent gutters and clean RGB',async()=>{
 globalThis.document={createElement:()=>createCanvas(1,1)};let frames=0;
 try{for(const [id,asset]of Object.entries(emotionSprites)){
  const image=await load(asset.src),cv=createCanvas(image.width,image.height),ctx=cv.getContext('2d');ctx.drawImage(image,0,0);
  for(const [sheet,stage]of Object.entries(asset.stages)){
   const a=detailedArt[sheet].cells[id]?detailedArt[sheet]:detailedArt['new_'+sheet],base=isolateSprite(await load(a.src),a.cells[id],[192,192],!detailedArt[sheet].cells[id]),data=base.getContext('2d').getImageData(0,0,base.width,base.height).data;
   assert.deepEqual(stage.size,[base.width,base.height]);
   for(const [key,cell]of Object.entries(stage.cells)){
    const p=ctx.getImageData(...cell).data,[ox,oy,w,h]=stage.box;assert.equal(w,cell[2]);assert.equal(h,cell[3]);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const q=(y*w+x)*4,src=((oy+y)*base.width+ox+x)*4;assert.equal(p[q+3],data[src+3],id+sheet+key);if(!p[q+3])assert.equal(p[q]+p[q+1]+p[q+2],0);}
    const gutter=ctx.getImageData(cell[0]-1,cell[1]-1,cell[2]+2,cell[3]+2).data,gw=cell[2]+2,gh=cell[3]+2;for(let x=0;x<gw;x++){assert.equal(gutter[x*4+3],0);assert.equal(gutter[((gh-1)*gw+x)*4+3],0);}for(let y=0;y<gh;y++){assert.equal(gutter[(y*gw)*4+3],0);assert.equal(gutter[(y*gw+gw-1)*4+3],0);}frames++;
   }
  }
 }assert.equal(frames,2912);}finally{delete globalThis.document;}
});
test('fabric pixels are opaque and never create alpha holes or spill outside any pet silhouette',async()=>{
 globalThis.document={createElement:()=>createCanvas(1,1)};let variants=0;
 try{for(const [id,asset]of Object.entries(emotionSprites))for(const [i,[sheet,stage]]of Object.entries(asset.stages).entries()){
  const a=detailedArt[sheet].cells[id]?detailedArt[sheet]:detailedArt['new_'+sheet],base=isolateSprite(await load(a.src),a.cells[id],[192,192],!detailedArt[sheet].cells[id]),original=base.getContext('2d').getImageData(0,0,base.width,base.height).data;
  for(const body of ['sweater','raincoat','pajamas'])for(const neck of [null,'scarf','bow']){
   const cv=createCanvas(base.width,base.height),c=cv.getContext('2d');c.drawImage(base,0,0);paintFittedClothes(c,base,id,ages[i],sheet,{body,neck});const d=c.getImageData(0,0,cv.width,cv.height).data;let changed=0;
   for(let q=0;q<d.length;q+=4){assert.equal(d[q+3],original[q+3]);if(d[q]!==original[q]||d[q+1]!==original[q+1]||d[q+2]!==original[q+2]){assert.equal(d[q+3],255);changed++;}}
   assert.ok(changed>20,id+sheet+body);variants++;
  }
 }assert.equal(variants,504);}finally{delete globalThis.document;}
});
test('expression motion settles, reduced motion holds, and each emotion has four valid frames',()=>{
 const e={at:1000,strength:.9};assert.equal(emotionFrame(e,1000),0);assert.equal(emotionFrame(e,1400),1);assert.equal(emotionFrame(e,1800),2);assert.equal(emotionFrame(e,13900),3);assert.equal(emotionFrame(e,5000),0);assert.equal(emotionFrame(e,1400,true),0);for(const kind of emotionKinds)for(let f=0;f<4;f++)assert.ok(expressionRecipe(kind,f));
});
