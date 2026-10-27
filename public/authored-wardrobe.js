import {repairedSources} from './repaired-source-manifest.js';
import {wardrobeSprites,wardrobeLayers,wardrobeAssets,repairedSourceAsset} from './wardrobe-sprite-manifest.js';
import {petAnatomy} from './pet-anatomy.js';
const stages=['babies','children','teens','adults','sleep'],atlases=new Map();let repairedAtlas=null;
export function repairedOriginal(id){if(!repairedAtlas||!repairedSources[id])return null;const rect=repairedSources[id],cv=canvas(rect[2],rect[3]);cv.getContext('2d').drawImage(repairedAtlas,...rect,0,0,rect[2],rect[3]);return cv;}
function loadRaster(src){return new Promise((resolve,reject)=>{const image=new Image(),timer=setTimeout(()=>reject(Error('wardrobe timeout '+src)),20000);image.onload=()=>{clearTimeout(timer);resolve(image);};image.onerror=()=>{clearTimeout(timer);reject(Error('wardrobe '+src));};image.src=src;});}
let loadingWardrobe=null;
export function loadWardrobeAssets(load=loadRaster){
 // Share only the real browser loader's in-flight work. Injected loaders used
 // by QA remain independent, and a failed load can always be retried.
 if(load===loadRaster&&loadingWardrobe)return loadingWardrobe;
 const request=Promise.all([load(repairedSourceAsset),...stages.filter(stage=>wardrobeSprites[stage]).flatMap(stage=>['pajamas','sweater','raincoat'].map(async body=>[stage+':'+body,await load(wardrobeAssets[stage][body])]))]).then(([originals,...sheets])=>{
  repairedAtlas=originals;for(const [stage,image]of sheets)atlases.set(stage,image);
 });
 if(load!==loadRaster)return request;
 loadingWardrobe=request.finally(()=>{loadingWardrobe=null;});
 return loadingWardrobe;
}
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
// Keep atlas-derived fabric inside the actual source silhouette, including
// small juvenile bodies, tails and empty gutters. Original RGB and alpha survive.
export function maskDressedBody(base,dressed){
 const c=dressed.getContext('2d'),b=base.getContext('2d').getImageData(0,0,base.width,base.height);
 const d=c.getImageData(0,0,dressed.width,dressed.height);
 for(let i=0;i<d.data.length;i+=4){
  if(!b.data[i+3]){
   d.data[i]=b.data[i];d.data[i+1]=b.data[i+1];d.data[i+2]=b.data[i+2];
  }
  d.data[i+3]=b.data[i+3];
 }
 c.putImageData(d,0,0);return dressed;
}
export function dressedBody(base,id,stage,body){
 const layer=wardrobeLayers[stage]?.[body]?.[id],atlas=atlases.get(stage+':'+body);if(!layer||!atlas)return base;
 const cv=canvas(base.width,base.height),c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(base,0,0);
 const [x,y,w,h]=layer.cell;c.drawImage(atlas,x,y,w,h,...layer.at,w,h);return maskDressedBody(base,cv);
}
// Hat art comes from the illustrated wardrobe, never a thumbnail-shaped box.
// Its brim sits against the skull; original ears, horns and crests occlude it.
const headFit={dino:[.15,1.90,.12],cat:[.23,1.85,.23],chicken:[.17,2.00,.13],frog:[.09,1.35,.34],corgi:[.26,1.85,.30],bear:[.18,1.85,.18],dog:[.18,1.75,.22],bunny:[.41,1.85,.43],pig:[.20,1.90,.24],sheep:[.17,2.15,.24],fox:[.26,1.90,.31],monkey:[.17,2.10,.16],duck:[.16,1.90,.13],penguin:[.17,1.90,.13]};
export function wearHeadwear(c,base,art,id,stage,head,pad=0){
 const a=petAnatomy[id]?.[stage];if(!a||!head||!art)return;const w=base.width,h=base.height,fit=headFit[id],eyes=a.eyes.map(b=>[(b[0]+b[2])/2,(b[1]+b[3])/2]),cx=(eyes[0][0]+eyes[1][0])/2,gap=eyes[1][0]-eyes[0][0];
 const adult=petAnatomy[id].adults,adultEy=adult.eyes.reduce((v,b)=>v+(b[1]+b[3])/4,0)/adult.size[1],ey=(eyes[0][1]+eyes[1][1])/2,shift=ey/h-adultEy;
 const brim=(fit[0]+shift)*h,ww=gap*fit[1]*(head==='crown'?.80:1),hh=ww*art.height/art.width,xx=cx-ww/2,yy=brim-hh*(head==='panama'?.78:.90);
 c.imageSmoothingEnabled=false;c.drawImage(art,Math.round(pad+xx),Math.round(pad+yy),Math.round(ww),Math.round(hh));
 const d=base.getContext('2d').getImageData(0,0,w,h).data;
 // Per-species apertures leave the actual source anatomy in front of fabric.
 for(let y=0;y<Math.min(h,(fit[2]+shift)*h);y++)for(let x=0;x<w;x++){
  const q=(y*w+x)*4;if(!d[q+3])continue;
  let protrusion=id==='dino'?y<h*(.12+shift):id==='chicken'?y<h*(.14+shift):id==='frog'?a.eyes.some(b=>x>=b[0]-8&&x<=b[2]+8&&y<=b[3]+5):Math.abs(x-cx)>gap*.56;
  if(id==='dog')protrusion=protrusion||y<h*(.11+shift)&&Math.abs(x-cx)>gap*.30;
  if(id==='sheep')protrusion=y<h*(.11+shift)||Math.abs(x-cx)>gap*.75;
  if(protrusion){c.fillStyle=`rgb(${d[q]},${d[q+1]},${d[q+2]})`;c.fillRect(pad+x,pad+y,1,1);}
 }
 const faceTop=Math.max(0,Math.min(...a.eyes.map(b=>b[1]))-2),faceBottom=Math.ceil(a.mouth[1]+a.mouth[3]);c.drawImage(base,0,faceTop,w,faceBottom-faceTop+1,pad,pad+faceTop,w,faceBottom-faceTop+1);
 // Eye pixels are never hidden by a brim, especially the frog's raised eyes.
 for(const b of a.eyes){const x=Math.max(0,b[0]-2),y=Math.max(0,b[1]-2),ww=b[2]-x+3,hh=b[3]-y+3;c.drawImage(base,x,y,ww,hh,pad+x,pad+y,ww,hh);}
}
export function wearNeckwear(c,id,stage,neck,pad,base){
 const a=petAnatomy[id]?.[stage];if(!a||!neck)return;const [w,h]=a.size,eyes=a.eyes,cx=(eyes[0][0]+eyes[0][2]+eyes[1][0]+eyes[1][2])/4,u=Math.max(1,Math.round(h/100));
 const tops={dino:.57,cat:.63,chicken:.61,frog:.55,corgi:.63,bear:.60,dog:.65,bunny:.70,pig:.66,sheep:.66,fox:.69,monkey:.65,duck:.62,penguin:.63},adult=petAnatomy[id].adults,eyeY=eyes.reduce((v,b)=>v+(b[1]+b[3])/4,0)/h,adultY=adult.eyes.reduce((v,b)=>v+(b[1]+b[3])/4,0)/adult.size[1],y=(tops[id]+eyeY-adultY)*h,half=(eyes[1][0]-eyes[0][0])*.65;
 const source=base.getContext('2d').getImageData(0,0,w,h).data;
 const pixel=(x,y,col)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<w&&y>=0&&y<h&&source[(y*w+x)*4+3]){c.fillStyle=col;c.fillRect(pad+x,pad+y,1,1);}};
 if(neck==='scarf'){
 for(let x=-half;x<=half;x++)for(let yy=0;yy<4*u;yy++)pixel(cx+x,y+yy+Math.round((1-(x/half)**2)*2*u),yy===0||yy>=3*u?'#794c4a':'#c68c80');
 for(let x=half*.5;x<half*.5+4*u;x++)for(let yy=5*u;yy<12*u;yy++)pixel(cx+x,y+yy,yy%5===0?'#e7b4a0':'#b77b72');
 }else{
 for(let x=-7*u;x<=7*u;x++)for(let yy=-3*u;yy<=3*u;yy++)if(Math.abs(x)<2*u||Math.abs(x)>2*u&&Math.abs(yy)<Math.abs(x)*.45)pixel(cx+x,y+3*u+yy,Math.abs(x)<2*u?'#435f76':'#88a7b8');
 }
}
