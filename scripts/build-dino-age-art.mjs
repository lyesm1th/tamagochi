import {createCanvas,loadImage} from '@napi-rs/canvas';
import sharp from 'sharp';
import fs from 'node:fs';
import {detailedArt} from '../public/detailed-art-manifest.js';
import {isolateSprite} from '../public/sprite-cleanup.js';

// The teenage sprite is the character identity master, not a mesh to distort.
// Adult and elder are separately authored pixel treatments at the same resolution.
// Keep eyes, smile, blush, paws, tail and the silhouette intact.
globalThis.document={createElement:()=>createCanvas(1,1)};
const atlas=detailedArt.teens;
const source=await loadImage(new URL('../public'+atlas.src,import.meta.url).pathname);
const original=isolateSprite(source,atlas.cells.dino,[192,192]);
const W=original.width,H=original.height;
if(W!==192||H!==192)throw Error('Unexpected original dinosaur frame size');
const originalPixels=original.getContext('2d').getImageData(0,0,W,H).data;
const rgb=(d,p)=>[d[p],d[p+1],d[p+2]];
const skin=(d,p)=>d[p+3]===255&&d[p+1]>d[p]*1.08&&d[p+1]>d[p+2]*.96&&d[p]>48&&d[p+1]>95;
const color=(p,r,g,b)=>{p[0]=r;p[1]=g;p[2]=b;};
const clamp=x=>Math.max(0,Math.min(255,Math.round(x)));
const result=[original];
for(const age of ['adult','elder']){
 const cv=createCanvas(W,H),ctx=cv.getContext('2d');ctx.drawImage(original,0,0);
 const data=ctx.getImageData(0,0,W,H),d=data.data;
 let changes=0;
 // Do not edit the character's face. Adult develops a more mature, deeper
 // green along lower body/tail. Elder gets desaturated lower body and
 // restrained silver-green scales. No transforms, skewing or scaling.
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const q=(y*W+x)*4;if(!skin(originalPixels,q))continue;
  // Preserve original face and recognizable expression completely.
  const bodyZone=y>H*.55,tailZone=x>W*.72&&y>H*.43;
  if(!bodyZone&&!tailZone)continue;
  const [r,g,b]=rgb(originalPixels,q);
  let nr=r,ng=g,nb=b;
  if(age==='adult'){
   const factor=(bodyZone?.065:.03)+(tailZone?.025:0);
   nr=clamp(r*(1-factor));ng=clamp(g*(1-factor*.60));nb=clamp(b*(1-factor*.35));
  }else{
   const factor=(bodyZone?.12:.07)+(tailZone?.04:0);
   const gray=(r+g+b)/3;
   nr=clamp(r*(1-factor)+gray*factor*.68+5);
   ng=clamp(g*(1-factor)+gray*factor*.80+3);
   nb=clamp(b*(1-factor)+gray*factor*.76+4);
   // Tiny individual silver scales, not a filter over the whole pet.
   if(x%13===4&&y%17===7&&bodyZone){nr=clamp(nr+18);ng=clamp(ng+18);nb=clamp(nb+13);}
  }
  if(nr!==r||ng!==g||nb!==b){color(d.subarray(q,q+3),nr,ng,nb);changes++;}
 }
 if(changes<200)throw Error(age+' art treatment missed the original dinosaur body');
 ctx.putImageData(data,0,0);result.push(cv);
}
const sheet=createCanvas(W*result.length,H),c=sheet.getContext('2d');
result.forEach((frame,i)=>c.drawImage(frame,i*W,0));
const output=new URL('../public/art/detailed/dino-age-authored.webp',import.meta.url);
fs.writeFileSync(output,await sharp(sheet.toBuffer('image/png')).webp({lossless:true,effort:6}).toBuffer());
console.log('Authored dinosaur stages: original teen, mature body shading, elder silver-green scales; face and alpha preserved');
