import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {detailedArt} from '../public/detailed-art-manifest.js';
import {isolateSprite} from '../public/sprite-cleanup.js';
import {DINO_STAGES,DINO_EXPRESSIONS,DINO_POSES,validateDinoAtlas} from '../public/dino-art-contract.js';
globalThis.document={createElement:()=>createCanvas(1,1)};
test('dinosaur authored asset retains exact teen pixels and stage alpha silhouettes',async()=>{
 const source=detailedArt.teens;
 const sheet=await loadImage(new URL('../public'+source.src,import.meta.url).pathname);
 const teen=isolateSprite(sheet,source.cells.dino,[192,192]);
 const file=new URL('../public/art/detailed/dino-age-authored.webp',import.meta.url);
 assert.ok(fs.existsSync(file),'run npm run build:dino first');
 const img=await loadImage(file.pathname);
 assert.equal(img.width,576);assert.equal(img.height,192);
 const c=createCanvas(576,192);const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
 const original=teen.getContext('2d').getImageData(0,0,192,192).data;
 for(let i=0;i<3;i++){
  const stage=ctx.getImageData(i*192,0,192,192).data;
  let differences=0;
  for(let q=0;q<original.length;q+=4){
   assert.equal(stage[q+3],original[q+3],'alpha changed at pixel '+q/4);
   if(i===0)assert.deepEqual(Array.from(stage.slice(q,q+4)),Array.from(original.slice(q,q+4)),'teen altered');
   else if(stage[q]!==original[q]||stage[q+1]!==original[q+1]||stage[q+2]!==original[q+2])differences++;
  }
  if(i)assert.ok(differences>0,'adult/elder must be independently authored');
 }
});
test('all five ages, six expressions and eight poses have stable authoring contracts',()=>{
 assert.equal(DINO_STAGES.length,5);assert.equal(DINO_EXPRESSIONS.length,6);assert.equal(DINO_POSES.length,8);
 assert.ok(validateDinoAtlas({}).length>0,'incomplete artwork must be rejected');
});
