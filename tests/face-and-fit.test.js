import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {detailedArt} from '../public/detailed-art-manifest.js';
import {emotionSprites} from '../public/emotion-sprite-manifest.js';
import {isolateSprite} from '../public/sprite-cleanup.js';
import {paintFittedClothes} from './legacy-art/fitted-clothes.js';
import {paintSeatedHat} from './legacy-art/tailored-wardrobe.js';
import {pixelEmotion} from '../public/emotion-art.js';
const ages=['Малюк','Дитина','Підліток','Дорослий'];
test('clothes and seated hats preserve the original illustrated eyes and mouth in all 56 forms',async()=>{
 globalThis.document={createElement:()=>createCanvas(1,1)};let checked=0;
 try{for(const [id,a]of Object.entries(emotionSprites))for(const [i,[stage,m]]of Object.entries(a.stages).entries()){
  const s=detailedArt[stage].cells[id]?detailedArt[stage]:detailedArt['new_'+stage],base=isolateSprite(await loadImage(new URL('../public'+s.src,import.meta.url).pathname),s.cells[id],[192,192],!detailedArt[stage].cells[id]),w=base.width,h=base.height,src=base.getContext('2d').getImageData(0,0,w,h).data;
  for(const body of ['sweater','raincoat','pajamas'])for(const head of [null,'panama','crown']){
   const pad=Math.ceil(h*.25),cv=createCanvas(w+pad*2,h+pad*2),c=cv.getContext('2d');c.drawImage(base,pad,pad);paintFittedClothes(c,base,id,ages[i],stage,{body},pad);paintSeatedHat(c,base,id,ages[i],head,pad);const d=c.getImageData(pad,pad,w,h).data,[left,right,ey]=m.eyes;
   for(let y=Math.ceil(ey-h*.06);y<=ey+h*.06;y++)for(let x=0;x<w;x++)if([left,right].some(ex=>Math.abs(x-ex)<w*.06))for(let k=0;k<4;k++)assert.equal(d[(y*w+x)*4+k],src[(y*w+x)*4+k],id+stage+body+head+' eye changed');
   const mx=(left+right)/2;for(let y=Math.ceil(ey+h*.07);y<=Math.min(h-1,ey+h*.15);y++)for(let x=Math.max(0,Math.ceil(mx-w*.06));x<Math.min(w,mx+w*.06);x++)for(let k=0;k<4;k++)assert.equal(d[(y*w+x)*4+k],src[(y*w+x)*4+k],id+stage+body+head+' mouth changed');
   checked++;
  }
 }assert.equal(checked,504);}finally{delete globalThis.document;}
});
test('emotions cannot replace the classic face',()=>{
 for(const kind of ['sad','angry','amused','annoyed','bored'])assert.equal(pixelEmotion({emotion:{kind,at:0,until:Infinity,strength:1}}),null);

});
