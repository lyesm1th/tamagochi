import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {detailedArt} from '../public/detailed-art-manifest.js';
import {petAnatomy} from '../public/pet-anatomy.js';
import {wardrobeSprites} from '../public/wardrobe-sprite-manifest.js';
import {isolateSprite} from '../public/sprite-cleanup.js';
import {loadWardrobeAssets,dressedBody,repairedOriginal,wearHeadwear,wearNeckwear} from '../public/authored-wardrobe.js';
import {emotionalAppearance,expressionFrame} from '../public/pet-expression.js';
const load=src=>loadImage(new URL('../public'+src,import.meta.url).pathname),pixels=cv=>cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
async function source(id,stage){if(stage==='adults'){const repaired=repairedOriginal(id);if(repaired)return repaired;}const key=detailedArt[stage].cells[id]?stage:'new_'+stage,a=detailedArt[key];return isolateSprite(await load(a.src),a.cells[id],[192,192],key.startsWith('new_'));}
const documentBefore=globalThis.document;
test('live authored outfits retain the original face for every species, age, fabric, neckwear and hat',async()=>{
 globalThis.document={createElement:()=>createCanvas(1,1)};
 try{
 await loadWardrobeAssets(load);const hats={};for(const head of ['panama','crown']){const a=detailedArt.clothing;hats[head]=isolateSprite(await load(a.src),a.cells[head],[192,192]);}
 let variants=0;
 for(const [id,stages]of Object.entries(petAnatomy))for(const [stage,a]of Object.entries(stages)){
  assert.ok(wardrobeSprites[stage][id]);const base=await source(id,stage),sd=pixels(base),w=base.width,h=base.height;
  for(const body of ['pajamas','raincoat','sweater'])for(const head of ['panama','crown'])for(const neck of [null,'scarf','bow']){
   const cv=createCanvas(w+160,h+160),c=cv.getContext('2d');c.drawImage(dressedBody(base,id,stage,body),80,80);wearNeckwear(c,id,stage,neck,80,base);wearHeadwear(c,base,hats[head],id,stage,head,80);const d=c.getImageData(80,80,w,h).data;
   const left=Math.floor(a.eyes[0][0]),right=Math.ceil(a.eyes[1][2]),top=Math.floor(Math.min(...a.eyes.map(b=>b[1]))),bottom=Math.ceil(a.mouth[1]+a.mouth[3]);
   for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){const q=(y*w+x)*4;if(!sd[q+3])continue;for(let k=0;k<4;k++)assert.equal(d[q+k],sd[q+k],`${id}/${stage}/${body}/${head}/${neck}: face pixel ${x},${y}`);}
   variants++;
  }
 }
 assert.equal(variants,1008);
 }finally{globalThis.document=documentBefore;}
});
test('laughter and blinking use only the existing actor palette; tears start below original eyes',async()=>{
 globalThis.document={createElement:()=>createCanvas(1,1)};
 try{await loadWardrobeAssets(load);
 for(const [id,stages]of Object.entries(petAnatomy))for(const [stage,a]of Object.entries(stages)){
  const base=await source(id,stage),sd=pixels(base),palette=new Set();for(let q=0;q<sd.length;q+=4)palette.add(sd.slice(q,q+4).join(','));
  for(const kind of ['amused','bored']){const cv=expressionFrame(base,id,stage,{kind,strength:.8,gesture:1,blink:kind==='bored'?.7:0,tear:-1}),d=pixels(cv);for(let q=0;q<d.length;q+=4)assert.ok(palette.has(d.slice(q,q+4).join(',')),id+stage+' invented face colour');}
  const sadWithoutTears=expressionFrame(base,id,stage,{kind:'sad',strength:.8,gesture:0,blink:0,tear:-1});
  const cry=expressionFrame(base,id,stage,{kind:'sad',strength:.8,gesture:0,blink:0,tear:.15}),d=pixels(cry),sdWithoutTears=pixels(sadWithoutTears),ey=Math.min(...a.eyes.map(b=>b[3]));let changed=0;
  for(let y=0;y<base.height;y++)for(let x=0;x<base.width;x++){const q=(y*base.width+x)*4;if(d[q]!==sdWithoutTears[q]||d[q+1]!==sdWithoutTears[q+1]||d[q+2]!==sdWithoutTears[q+2]){assert.ok(y>=ey,id+stage+' tear above lower eyelid');changed++;}}
  assert.ok(changed>0,id+stage+' missing tears');
 }
 }finally{globalThis.document=documentBefore;}
});
test('emotional gestures have a long quiet hold and stop while sleeping or in reduced motion',()=>{
 const now=1800000000000,s={born:now-999999,emotion:{kind:'sad',at:now,until:now+90000,strength:.8}};
 assert.ok(emotionalAppearance(s,now+3000).tear>=0);const quiet=emotionalAppearance(s,now+8000);assert.equal(quiet.gesture,0);assert.equal(quiet.tear,-1);assert.equal(quiet.blink,0);
 const reduced=emotionalAppearance(s,now+3000,true);assert.equal(reduced.tear,-1);assert.equal(reduced.gesture,0);assert.equal(emotionalAppearance({...s,sleeping:true},now+3000).strength,0);
});
