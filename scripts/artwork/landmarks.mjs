import fs from 'node:fs';
import {loadImage,createCanvas} from '@napi-rs/canvas';
import {emotionSprites} from '../../public/emotion-sprite-manifest.js';
import {mouthOffsets} from '../../scripts/emotion-anatomy.mjs';
const out={};
for(const [id,entry]of Object.entries(emotionSprites)){
 out[id]={};
 for(const [stage,m]of Object.entries(entry.stages)){
  const base=await loadImage(`tmp/visual-repair/${id}-${stage}.png`),cv=createCanvas(base.width,base.height),c=cv.getContext('2d');c.drawImage(base,0,0);const d=c.getImageData(0,0,cv.width,cv.height).data,w=cv.width,h=cv.height;
  const eyes=m.eyes.slice(0,2).map(ex=>{const ey=m.eyes[2],r=w*.09;let l=w,t=h,rr=0,b=0;
   for(let y=Math.max(0,Math.floor(ey-r));y<Math.min(h,ey+r);y++)for(let x=Math.max(0,Math.floor(ex-r));x<Math.min(w,ex+r);x++){const q=(y*w+x)*4;if(d[q+3]&&Math.max(d[q],d[q+1],d[q+2])<100){l=Math.min(l,x);rr=Math.max(rr,x);t=Math.min(t,y);b=Math.max(b,y);}}
   return [l,t,rr,b];
  });
  out[id][stage]={size:[w,h],eyes,mouth:[(m.eyes[0]+m.eyes[1])/2,m.eyes[2]+mouthOffsets[id]*h,Math.min(16,w*.11),Math.min(8,h*.045)]};
 }
}
fs.writeFileSync('public/pet-anatomy.js','// Landmarks on the unchanged source sprites. No replacement facial artwork.\nexport const petAnatomy='+JSON.stringify(out)+';\n');
