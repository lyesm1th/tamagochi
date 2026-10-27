import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {species} from '../public/game.js';
import {detailedArt} from '../public/detailed-art-manifest.js';
import {wardrobeAssets,repairedSourceAsset} from '../public/wardrobe-sprite-manifest.js';
import {loadWardrobeAssets,dressedBody,maskDressedBody} from '../public/authored-wardrobe.js';
import {isolateSprite} from '../public/sprite-cleanup.js';

const sheetNames=['babies','children','teens','adults'];
const outfits=['sweater','raincoat','pajamas'];
const image=src=>loadImage(new URL('../public'+src,import.meta.url).pathname);
const rgba=cv=>cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;

test('detailed wardrobe preserves original alpha and every transparent gutter across 14 species, 4 stages, 3 outfits',async()=>{
 assert.equal(species.length,14);
 globalThis.document={createElement:()=>createCanvas(1,1)};
 try{
  await loadWardrobeAssets(image);
  let combinations=0;
  for(const sheet of sheetNames){
   const art=detailedArt[sheet],other=detailedArt['new_'+sheet];
   const sources=[await image(art.src),await image(other.src)];
   for(const {id} of species){
    const inBase=Boolean(art.cells[id]);
    const source=inBase?art:other;
    const base=isolateSprite(sources[inBase?0:1],source.cells[id],[192,192],!inBase);
    const original=rgba(base);
    for(const outfit of outfits){
     const dressed=dressedBody(base,id,sheet,outfit);
     const output=rgba(dressed);
     assert.equal(dressed.width,base.width,id+' '+sheet);
     assert.equal(dressed.height,base.height,id+' '+sheet);
     let changed=0;
     for(let i=0;i<original.length;i+=4){
      assert.equal(output[i+3],original[i+3],id+' '+sheet+' '+outfit);
      if(!original[i+3])assert.equal(output[i]+output[i+1]+output[i+2],original[i]+original[i+1]+original[i+2]);
      if(original[i]!==output[i]||original[i+1]!==output[i+1]||original[i+2]!==output[i+2])changed++;
     }
     assert.ok(changed>0,id+' '+sheet+' '+outfit);
     combinations++;
    }
   }
  }
  assert.equal(combinations,168);
 }finally{delete globalThis.document;}
});

test('masking detailed fabric cannot modify source actor or create floating colored pixels',()=>{
 const original=createCanvas(6,5),c=original.getContext('2d');
 c.fillStyle='#4a7a62';c.fillRect(1,1,4,3);
 const before=rgba(original).slice(),dressed=createCanvas(6,5),d=dressed.getContext('2d');
 d.fillStyle='#f0286a';d.fillRect(0,0,6,5);
 const out=rgba(maskDressedBody(original,dressed));
 for(let i=0;i<out.length;i+=4){
  assert.equal(out[i+3],before[i+3]);
  if(!before[i+3])assert.equal(out[i]+out[i+1]+out[i+2],0);
 }
 assert.deepEqual(rgba(original),before);
});
