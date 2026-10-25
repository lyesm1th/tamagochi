import {validateDinoAtlas,resolveDinoFrame} from './dino-art-contract.js';
// This renderer never modifies anatomy or resamples a frame to fake an expression.
// It is intentionally opt-in until the authored art pack passes visual approval.
let atlas=null,cache=new Map();
export function installDinoAtlas(manifest){
 const errors=validateDinoAtlas(manifest);
 if(errors.length)throw new Error('Dinosaur atlas rejected: '+errors.join('; '));
 atlas=manifest;cache.clear();return true;
}
export function dinoAtlasReady(){return !!atlas;}
export async function preloadDinoAtlas(){
 if(!atlas)return false;
 const sources=new Set(Object.values(atlas.stages).flatMap(s=>Object.values(s.frames).map(f=>f.src)));
 await Promise.all([...sources].map(src=>new Promise((resolve,reject)=>{
  if(cache.has(src))return resolve();
  const img=new Image();img.onload=()=>{cache.set(src,img);resolve();};
  img.onerror=()=>reject(new Error('Dino art unavailable: '+src));img.src=src;
 })));return true;
}
export function paintAuthoredDino(ctx,age,pose,emotion,x,y,{wardrobe}={}){
 if(!atlas)return false;
 const frame=resolveDinoFrame(atlas,age,pose,emotion),image=frame&&cache.get(frame.src);
 if(!image)return false;
 const stage=atlas.stages[{'Малюк':'baby','Дитина':'child','Підліток':'teen','Дорослий':'adult','Старенький':'elder'}[age]||'teen'];
 ctx.save();ctx.imageSmoothingEnabled=false;
 ctx.drawImage(image,frame.x,frame.y,192,192,Math.round(x),Math.round(y),192,192);
 // Clothing art is also authored for each age and uses identical pixel coordinates.
 for(const slot of ['body','neck','head','eyes']){
  const garment=wardrobe?.[slot],overlay=garment&&stage?.wardrobe?.[slot]?.[garment];
  const img=overlay&&cache.get(overlay.src);
  if(img)ctx.drawImage(img,overlay.x,overlay.y,192,192,Math.round(x),Math.round(y),192,192);
 }
 ctx.restore();return true;
}
