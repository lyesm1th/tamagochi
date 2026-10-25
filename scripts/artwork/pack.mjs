import fs from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {wardrobeSprites as stored} from '../../public/wardrobe-sprite-manifest.js';
const full=Object.fromEntries(Object.entries(stored).map(([stage,cells])=>[stage,Object.fromEntries(Object.entries(cells).map(([id,rect],i)=>[id,rect.length===2?[i%4*(stage==='sleep'?192:224),Math.floor(i/4)*(stage==='sleep'?192:224),...rect]:rect]))]));
const master=name=>fs.existsSync('public/art/wardrobe/'+name)?'public/art/wardrobe/'+name:'tmp/visual-repair/masters/'+name;
const forms={},layers={},assets={},directory='public/art/wardrobe';let before=0,after=0,maxHeight=0;
for(const [stage,cells]of Object.entries(full)){
 forms[stage]={};layers[stage]={};assets[stage]={};
 for(const body of ['pajamas','sweater','raincoat']){
  const file=master(`${stage}-${body}.webp`),image=await loadImage(file),atlas=createCanvas(768,384),ac=atlas.getContext('2d');layers[stage][body]={};before+=fs.statSync(file).size;
  for(const [i,[id,rect]]of Object.entries(cells).entries()){
   const [,,w,h]=rect,base=await loadImage(`tmp/visual-repair/${id}-${stage}.png`),cv=createCanvas(w,h),c=cv.getContext('2d');c.drawImage(image,...rect,0,0,w,h);const d=c.getImageData(0,0,w,h),original=createCanvas(w,h),oc=original.getContext('2d');oc.drawImage(base,0,0);if(id==='cat'&&stage==='sleep')oc.clearRect(0,0,12,h);if(id==='monkey')oc.clearRect(0,Math.floor(h*.62),Math.ceil(w*.12),h);const src=oc.getImageData(0,0,w,h).data;let l=w,r=0,t=h,b=0,erase=0;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const q=(y*w+x)*4,same=d.data[q]===src[q]&&d.data[q+1]===src[q+1]&&d.data[q+2]===src[q+2]&&d.data[q+3]===src[q+3];
    if(!d.data[q+3]&&src[q+3])erase++;
    if(same||!d.data[q+3]){d.data[q]=d.data[q+1]=d.data[q+2]=d.data[q+3]=0;}else{l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
   }
   if(erase)throw Error(`${id}/${stage}/${body}: needs alpha erasure ${erase}`);
   c.putImageData(d,0,0);const ww=r-l+1,hh=b-t+1;maxHeight=Math.max(maxHeight,hh);if(ww>192||hh>96)throw Error(`cloth too large ${id} ${ww}x${hh}`);
   const x=i%4*192,y=Math.floor(i/4)*96;ac.drawImage(cv,l,t,ww,hh,x,y,ww,hh);layers[stage][body][id]={cell:[x,y,ww,hh],at:[l,t]};forms[stage][id]=[w,h];
  }
  const bytes=await sharp(atlas.toBuffer('image/png')).webp({lossless:true,effort:6}).toBuffer(),hash=createHash('sha256').update(bytes).digest('hex').slice(0,12),name=`${stage}-${body}.${hash}.webp`;fs.writeFileSync(`${directory}/${name}`,bytes);assets[stage][body]='/art/wardrobe/'+name;after+=bytes.length;
 }
}
const original=fs.readFileSync(master('originals-adults.webp')),hash=createHash('sha256').update(original).digest('hex').slice(0,12),name=`originals-adults.${hash}.webp`;fs.writeFileSync(`${directory}/${name}`,original);
fs.writeFileSync('public/wardrobe-sprite-manifest.js','// Packed authored cloth, baked with the unchanged original actor before scene rendering.\nexport const wardrobeSprites='+JSON.stringify(forms)+';\nexport const wardrobeLayers='+JSON.stringify(layers)+';\nexport const wardrobeAssets='+JSON.stringify(assets)+';\nexport const repairedSourceAsset='+JSON.stringify('/art/wardrobe/'+name)+';\n');
console.log(JSON.stringify({before,after,maxHeight,forms:Object.values(forms).reduce((n,a)=>n+Object.keys(a).length,0)}));
