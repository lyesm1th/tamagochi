import test from 'node:test';import assert from 'node:assert/strict';
import {createCanvas,Image} from '@napi-rs/canvas';import {fileURLToPath} from 'node:url';
import {species} from '../public/game.js';import {loadDetailedAssets} from '../public/detailed-renderer.js';
import {detailedMatrixActor,visualVariants} from '../scripts/render-visual-evolution-matrix.mjs';
test('runtime wardrobe gallery leaves transparent margins around every species, age and outfit',async()=>{
 const previous={document:globalThis.document,Image:globalThis.Image};
 class LocalImage extends Image{set src(src){super.src=fileURLToPath(new URL('../public'+src,import.meta.url));}}
 globalThis.document={createElement:()=>createCanvas(1,1)};globalThis.Image=LocalImage;
 try{assert.equal(await loadDetailedAssets(),true);
  for(const {id}of species)for(const age of ['Малюк','Дитина','Підліток','Дорослий','Старенький'])for(const {wearing}of visualVariants){
   const c=detailedMatrixActor(id,wearing,age),data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
   for(let i=0;i<c.width;i++)for(const pixel of [i,(c.height-1)*c.width+i,i*c.width,i*c.width+c.width-1])assert.equal(data[pixel*4+3],0,id+' '+age+' '+JSON.stringify(wearing)+' clipped at camera edge pixel '+pixel);
  }
 }finally{globalThis.document=previous.document;globalThis.Image=previous.Image;}
});
