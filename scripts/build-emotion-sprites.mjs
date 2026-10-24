import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {detailedArt} from '../public/detailed-art-manifest.js';
import {isolateSprite} from '../public/sprite-cleanup.js';
import {emotionKinds,expressionRecipe} from '../public/emotion-frames.js';
import {landmarks,stages,mouthOffsets} from './emotion-anatomy.mjs';
global.document={createElement:()=>createCanvas(1,1)};
const directory=new URL('../public/art/emotions/',import.meta.url);fs.mkdirSync(directory,{recursive:true});
const manifest={};
// Diffuse only inside authored feature masks on the sprite's own pixels.
// The original silhouette/alpha is restored after drawing every frame.
function clearFeature(pixels,w,h,cx,cy,rx,ry){
 const d=pixels.data,original=new Uint8ClampedArray(d),mask=new Uint8Array(w*h),work=new Float64Array(d.length);
 for(let y=Math.max(1,Math.floor(cy-ry));y<Math.min(h-1,cy+ry+1);y++)for(let x=Math.max(1,Math.floor(cx-rx));x<Math.min(w-1,cx+rx+1);x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1&&d[(y*w+x)*4+3])mask[y*w+x]=1;
 work.set(d);for(let q=0;q<mask.length;q++)if(mask[q])for(let k=0;k<3;k++)work[q*4+k]=work[(q-1)*4+k];
 for(let pass=0;pass<140;pass++)for(let q=0;q<mask.length;q++)if(mask[q])for(let k=0;k<3;k++)work[q*4+k]=(work[(q-1)*4+k]+work[(q+1)*4+k]+work[(q-w)*4+k]+work[(q+w)*4+k])/4;
 for(let q=0;q<mask.length;q++)if(mask[q])for(let k=0;k<3;k++)d[q*4+k]=Math.round(work[q*4+k]);
}
function refineEyes(base,points){
 const w=base.width,h=base.height,d=base.getContext('2d').getImageData(0,0,w,h).data,seen=new Uint8Array(w*h),parts=[];
 for(let q=0;q<w*h;q++){if(seen[q]||d[q*4+3]<128||Math.max(d[q*4],d[q*4+1],d[q*4+2])>=105)continue;const queue=[q];seen[q]=1;let left=w,right=0,top=h,bottom=0;for(let j=0;j<queue.length;j++){const p=queue[j],x=p%w,y=Math.floor(p/w);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);for(const n of [x>0?p-1:-1,x<w-1?p+1:-1,y>0?p-w:-1,y<h-1?p+w:-1])if(n>=0&&!seen[n]&&d[n*4+3]>=128&&Math.max(d[n*4],d[n*4+1],d[n*4+2])<105){seen[n]=1;queue.push(n);}}
  const bw=right-left+1,bh=bottom-top+1;if(queue.length>25&&bw>5&&bh>5&&bw<w*.24&&bh<h*.24&&bw/bh>.5&&bw/bh<1.8)parts.push([(left+right)/2,(top+bottom)/2]);
 }
 const found=points.slice(0,2).map(x=>parts.slice().sort((a,b)=>Math.hypot(a[0]-x,a[1]-points[2])-Math.hypot(b[0]-x,b[1]-points[2]))[0]);if(found.every(p=>p)&&found[0]!==found[1]&&found.every((p,i)=>Math.hypot(p[0]-points[i],p[1]-points[2])<w*.12))return [found[0][0],found[1][0],(found[0][1]+found[1][1])/2];return points;
}
function paint(c,points,kind,frame,id,w,h){
 const recipe=expressionRecipe(kind,frame),u=Math.max(1,Math.round(w/90)),[lx,rx,ey]=points,mx=(lx+rx)/2,my=ey+mouthOffsets[id]*h,ink='#30382f',white='#fff5e3',pink='#d88392';
 const r=(x,y,ww,hh,color=ink)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(ww)),Math.max(1,Math.round(hh)));};
 const line=(x,y,dx,dy,color=ink)=>{const count=Math.max(1,Math.round(Math.max(Math.abs(dx),Math.abs(dy))/u));for(let i=0;i<=count;i++)r(x+dx*i/count,y+dy*i/count,u,u,color);};
 for(const [i,x] of [lx,rx].entries()){
  const dir=i===0?1:-1,wide=recipe.eyes==='wide',y=ey;
  if(['droop','wide','look','side','soft'].includes(recipe.eyes)){
   r(x-4*u,y-5*u,8*u,10*u,white);r(x-5*u,y-3*u,10*u,6*u,white);
   const gaze=recipe.eyes==='look'?u:recipe.eyes==='side'?-u:0,ph=wide?7:recipe.eyes==='droop'?5:7;
   r(x-2*u+gaze,y-(recipe.eyes==='droop'?1:3)*u,4*u,ph*u);r(x-u+gaze,y-2*u,u,2*u,white);
   if(recipe.eyes==='droop')line(x-5*u,y-4*u,10*u,-dir*2*u);
  }else if(recipe.eyes==='slant'){
   r(x-4*u,y-2*u,8*u,5*u,white);r(x-2*u,y,4*u,4*u);line(x-5*u,y-4*u,10*u,dir*4*u);
  }else if(recipe.eyes==='half'){
   r(x-4*u,y,8*u,4*u,white);r(x-u,y,3*u,4*u);line(x-5*u,y-u,10*u,0);
  }else if(recipe.eyes==='arc'){line(x-5*u,y+u,5*u,-4*u);line(x,y-3*u,5*u,4*u);}
  else line(x-4*u,y+u,8*u,0);
  if(recipe.brow==='sad')line(x-5*u,y-9*u,10*u,-dir*3*u);
  if(recipe.brow==='angry')line(x-5*u,y-9*u,10*u,dir*4*u);
  if(recipe.brow==='raised')line(x-4*u,y-(i===0?10:8)*u,8*u,0);
  if(recipe.blush){r(x-7*u,y+7*u,9*u,2*u,pink);r(x-5*u,y+6*u,5*u,u,'#e5acac');}
 }
 const m=recipe.mouth,bill=['chicken','duck','penguin','pig','dog'].includes(id);
 if(!bill&&id!=='frog'&&id!=='dino'){const noseColor=['cat','bunny'].includes(id)?'#ce8d91':ink;r(mx-2*u,my-5*u,4*u,2*u,noseColor);r(mx-u,my-3*u,2*u,u,noseColor);}
 if(id==='dino'){r(mx-4*u,my-6*u,u,u,'#4b7560');r(mx+3*u,my-6*u,u,u,'#4b7560');}
 if(m==='frown'){line(mx-5*u,my+2*u,5*u,-2*u);line(mx,my,5*u,2*u);}
 else if(m==='laugh'||m==='laughWide'||m==='yawn'||m==='oh'){const ww=m==='laughWide'?10:6,hh=m==='laughWide'?7:5;r(mx-ww*u/2,my-2*u,ww*u,hh*u);if(m!=='yawn'&&m!=='oh')r(mx-(ww-2)*u/2,my+(hh-4)*u,(ww-2)*u,2*u,pink);}
 else if(m==='grit'){r(mx-5*u,my-u,10*u,4*u);r(mx-4*u,my,8*u,u,white);}
 else if(m==='flat')line(mx-5*u,my,10*u,0);
 else if(m==='small')line(mx-2*u,my,4*u,u);
 else if(m==='smirk'){line(mx-4*u,my+u,6*u,0);line(mx+2*u,my+u,2*u,-2*u);}
 else if(m==='smile'){line(mx-4*u,my,4*u,2*u);line(mx,my+2*u,4*u,-2*u);}
 if(recipe.tear>=0){const y=ey+7*u+recipe.tear*7*u;r(lx+3*u,y,2*u,5*u,'#6aafca');r(lx+3*u,y,u,2*u,'#d4f0ed');}
}
for(const [id,rows]of Object.entries(landmarks)){
 const bases=[];
 for(const [index,stage]of stages.entries()){
  const key=detailedArt[stage].cells[id]?stage:'new_'+stage,a=detailedArt[key],image=await loadImage(new URL('../public'+a.src,import.meta.url).pathname),base=isolateSprite(image,a.cells[id],[192,192],key.startsWith('new_')),w=base.width,h=base.height,points=refineEyes(base,rows[index].map((v,i)=>v*(i===2?h:w))),[lx,rx,ey]=points,u=Math.max(1,Math.round(w/90));
  const rect=[Math.max(0,Math.floor(lx-14*u)),Math.max(0,Math.floor(ey-14*u)),Math.min(w,Math.ceil(rx+14*u)),Math.min(h,Math.ceil(ey+mouthOffsets[id]*h+12*u))];rect[2]-=rect[0];rect[3]-=rect[1];
  const clean=createCanvas(w,h);clean.getContext('2d').drawImage(base,0,0);const pixels=clean.getContext('2d').getImageData(0,0,w,h);
  for(const x of [lx,rx])clearFeature(pixels,w,h,x,ey,Math.min(14,w*.095),Math.min(15,h*.085));
  const bill=['chicken','duck','penguin','pig','dog'].includes(id);clearFeature(pixels,w,h,(lx+rx)/2,ey+mouthOffsets[id]*h-(bill?0:2*u),bill?Math.min(15,w*.1):id==='frog'?Math.min(23,w*.16):Math.min(18,w*.13),bill?3:8*u);
  clean.getContext('2d').putImageData(pixels,0,0);bases.push({base,clean,w,h,points,rect});
 }
 const cw=Math.max(...bases.map(b=>b.rect[2]))+4,ch=Math.max(...bases.map(b=>b.rect[3]))+4,atlas=createCanvas(cw*emotionKinds.length,ch*16),ac=atlas.getContext('2d'),cells={};
 for(const [stageIndex,b]of bases.entries()){
  const {w,h,base,clean,points,rect}=b,cellsForStage={};
  for(const [kindIndex,kind]of emotionKinds.entries())for(let frame=0;frame<4;frame++){
   const cv=createCanvas(w,h),c=cv.getContext('2d');c.drawImage(clean,0,0);paint(c,points,kind,frame,id,w,h);
   const p=c.getImageData(0,0,w,h),alpha=base.getContext('2d').getImageData(0,0,w,h).data;for(let q=0;q<p.data.length;q+=4){p.data[q+3]=alpha[q+3];if(!alpha[q+3])p.data[q]=p.data[q+1]=p.data[q+2]=0;}c.putImageData(p,0,0);
   const x=kindIndex*cw+2,y=(stageIndex*4+frame)*ch+2;ac.drawImage(cv,...rect,x,y,rect[2],rect[3]);cellsForStage[kind+':'+frame]=[x,y,rect[2],rect[3]];
  }
  cells[stages[stageIndex]]={box:rect,size:[w,h],eyes:points,cells:cellsForStage};
 }
 const bytes=await sharp(atlas.toBuffer('image/png')).webp({lossless:true,effort:6}).toBuffer(),hash=createHash('sha256').update(bytes).digest('hex').slice(0,12),name=id+'.'+hash+'.webp';fs.writeFileSync(new URL(name,directory),bytes);manifest[id]={src:'/art/emotions/'+name,width:atlas.width,height:atlas.height,stages:cells};
}
const used=new Set(Object.values(manifest).map(a=>path.basename(a.src)));for(const file of fs.readdirSync(directory))if(/\.(png|webp)$/.test(file)&&!used.has(file))fs.unlinkSync(new URL(file,directory));
fs.writeFileSync(new URL('../public/emotion-sprite-manifest.js',import.meta.url),'// Generated by scripts/build-emotion-sprites.mjs\nexport const emotionSprites='+JSON.stringify(manifest)+';\n');
console.log('Generated transparent expression atlases:',Object.keys(manifest).length,'species × 4 ages × 13 emotions × 4 frames');
