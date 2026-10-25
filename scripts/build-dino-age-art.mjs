import {createCanvas,loadImage} from '@napi-rs/canvas';
import sharp from 'sharp';
import fs from 'node:fs';
import {detailedArt} from '../public/detailed-art-manifest.js';
import {isolateSprite} from '../public/sprite-cleanup.js';
// Use the actual teenage dinosaur as the identity anchor. No resize, affine
// transformation, squashing or silhouette substitution is permitted.
const atlas=detailedArt.teens;
const image=await loadImage(new URL('../public'+atlas.src,import.meta.url).pathname);
globalThis.document={createElement:()=>createCanvas(1,1)};
const base=isolateSprite(image,atlas.cells.dino,[192,192]);
const w=base.width,h=base.height;
const source=base.getContext('2d').getImageData(0,0,w,h);
const pixels=source.data;
const at=(x,y)=>Math.max(0,Math.min(w-1,Math.round(x)))+Math.max(0,Math.min(h-1,Math.round(y)))*w;
const original=(x,y)=>{const q=at(x,y)*4;return [pixels[q],pixels[q+1],pixels[q+2],pixels[q+3]];};
const draw=(ctx,x,y,size,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),size,size);};
const isSkin=(x,y)=>{const [r,g,b,a]=original(x,y);return a===255&&g>r*1.08&&g>b*.92&&r>45&&g>95;};
function create(stage){
 const c=createCanvas(w,h),ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(base,0,0);
 // Features are deliberately tiny, painted only over opaque green skin.
 // Mature stages keep the original glossy eyes, mouth, cheeks and full silhouette.
 if(stage==='adult'){
  for(const [x,y] of [[w*.58,h*.27],[w*.61,h*.29],[w*.64,h*.32],[w*.67,h*.36]])
   if(isSkin(x,y))draw(ctx,x,y,2,'#a1d8b8');
 }else if(stage==='elder'){
  for(const [x,y] of [[w*.20,h*.32],[w*.23,h*.31],[w*.62,h*.29],[w*.65,h*.32],[w*.67,h*.36]])
   if(isSkin(x,y))draw(ctx,x,y,2,'#c5dbc0');
  for(const [x,y] of [[w*.26,h*.52],[w*.30,h*.54],[w*.39,h*.53]])
   if(isSkin(x,y))draw(ctx,x,y,1,'#d0d8bb');
 }
 const result=ctx.getImageData(0,0,w,h).data;
 for(let q=0;q<result.length;q+=4)if(result[q+3]!==pixels[q+3])throw Error('Dinosaur silhouette modified');
 return c;
}
const output=createCanvas(w*3,h),out=output.getContext('2d');
for(const [i,stage] of ['teen','adult','elder'].entries())out.drawImage(stage==='teen'?base:create(stage),i*w,0);
const file=new URL('../public/art/detailed/dino-age-authored.webp',import.meta.url);
fs.writeFileSync(file,await sharp(output.toBuffer('image/png')).webp({lossless:true}).toBuffer());
console.log('Dinosaur art generated: original teen preserved, adult/elder authored pixel accents, alpha invariant');
