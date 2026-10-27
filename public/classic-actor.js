import {drawPetArt} from './pixel-art.js';
import {drawYoungPet} from './young-pets.js';
import {emotionalAppearance,withEmotionalPose} from './pet-expression.js';
import {faceAnchors} from './emotion-art.js';
import {applySeniorPatina} from './age-appearance.js';

// Keep classic garments within the actual source silhouette at every age.
// Headwear and glasses are intentionally separate silhouette accessories.
export function clipWardrobeToSprite(canvas,source){
 const c=canvas.getContext('2d'),d=c.getImageData(0,0,canvas.width,canvas.height);
 for(let q=0;q<d.data.length;q+=4)if(source.data[q+3]===0){
  d.data[q]=source.data[q];d.data[q+1]=source.data[q+1];d.data[q+2]=source.data[q+2];d.data[q+3]=0;
 }
 c.putImageData(d,0,0);
}
const cloth={pajamas:['#574563','#9b84b4','#d3beda'],sweater:['#653c4b','#ad6c81','#d89ca7'],raincoat:['#795625','#dbaf4f','#f2d17e']};
export function drawClassicActor(ctx,id,age,color,frame,s,reduced=false){
 const cv=document.createElement('canvas');cv.width=128;cv.height=100;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
 const expression=emotionalAppearance(s,Date.now(),reduced),faceFrame=expression.blink>.3?0:frame;
 const original={...s,cozy:{...s?.cozy,wearing:{}},suppressEmotion:true},young=['Малюк','Дитина','Підліток'].includes(age);
 if(young)drawYoungPet(c,id,age,color,faceFrame,s?.sleeping||s?.napping,reduced,original);else drawPetArt(c,id,faceFrame,original,reduced);
 const earlyWear=s?.cozy?.wearing||{},earlyEmotion=expression;if(!Object.values(earlyWear).some(Boolean)&&earlyEmotion.tear<0){applySeniorPatina(cv,age);withEmotionalPose(ctx,earlyEmotion,64,84,()=>ctx.drawImage(cv,0,0),reduced);return;}
 const source=c.getImageData(0,0,128,100),wear=earlyWear,sy=age==='Малюк'?.36:age==='Дитина'?.60:age==='Підліток'?.84:1,sx=age==='Малюк'?.42:age==='Дитина'?.65:age==='Підліток'?.75:1,oy=age==='Малюк'?52:age==='Дитина'?32:age==='Підліток'?12:0;
 const p=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(64+(x-64)*sx),Math.round(oy+y*sy),Math.max(1,Math.round(w*sx)),Math.max(1,Math.round(h*sy)));};
 if(cloth[wear.body]){
 const [dark,mid,light]=cloth[wear.body],top=id==='frog'?65:['dog','pig','bunny'].includes(id)?70:69;
 // The shirt follows the source torso. It ends before the original paws.
 p(48,top,32,8,dark);p(49,top+1,30,5,mid);p(51,top+6,26,1,light);
 p(44,top+1,6,5,dark);p(78,top+1,6,5,dark);p(45,top+1,4,3,mid);p(79,top+1,4,3,mid);p(45,top+4,4,1,light);p(79,top+4,4,1,light);
 p(56,top,16,1,light);p(59,top+1,10,1,light);
 if(wear.body==='pajamas'){p(63,top+2,1,4,dark);for(const x of [53,58,69,74])p(x,top+3,1,1,light);p(65,top+3,1,1,light);p(65,top+5,1,1,light);}
 if(wear.body==='sweater'){p(50,top+3,28,1,light);for(let x=52;x<78;x+=4)p(x,top+5,1,1,dark);}
 if(wear.body==='raincoat'){p(63,top+2,2,5,dark);p(52,top+4,5,2,dark);p(71,top+4,5,2,dark);p(66,top+3,1,1,light);p(66,top+5,1,1,light);}
 }
 // Restore every original pixel outside the torso/sleeves. Clothes cannot
 // extend into tails or the room, and all face pixels remain source artwork.
 const d=c.getImageData(0,0,128,100),top=id==='frog'?65:['dog','pig','bunny'].includes(id)?70:69;
 for(let y=0;y<100;y++)for(let x=0;x<128;x++){const q=(y*128+x)*4;if(source.data[q+3]===0||y<Math.round(oy+top*sy)||y>=Math.round(oy+77*sy))for(let k=0;k<4;k++)d.data[q+k]=source.data[q+k];}
 c.putImageData(d,0,0);
 const neckTop=id==='frog'?65:['dog','pig','bunny'].includes(id)?70:69;
 if(wear.neck==='scarf'){p(51,neckTop,26,2,'#c88d83');p(72,neckTop+2,3,6,'#af746f');}if(wear.neck==='bow'){p(57,neckTop,5,3,'#88a7b8');p(66,neckTop,5,3,'#88a7b8');p(62,neckTop+1,4,2,'#435f76');}
 clipWardrobeToSprite(cv,source);
 const asleep=s?.sleeping||s?.napping;
 if(!asleep&&wear.head){const seat=id==='frog'?29:id==='bunny'?36:37;
 if(wear.head==='panama'){p(52,seat-10,24,9,'#7b6645');p(54,seat-9,20,6,'#d5bd85');p(49,seat-1,30,3,'#7b6645');p(50,seat-1,28,1,'#ead6a0');}
 if(wear.head==='crown'){p(52,seat-4,24,6,'#a47d3c');p(53,seat-3,22,3,'#e7c262');for(const x of [52,62,72])p(x,seat-9,4,6,'#e7c262');}
 const after=c.getImageData(0,0,128,100),cx=64,earY=id==='bunny'?36:id==='frog'?43:id==='chicken'?39:38;
 for(let y=0;y<Math.round(oy+earY*sy);y++)for(let x=0;x<128;x++){
  const q=(y*128+x)*4;if(!source.data[q+3])continue;const nx=(x-64)/sx+64,ny=(y-oy)/sy;
  const protrudes=id==='frog'?nx<59||nx>69:id==='chicken'?ny<34:id==='dino'?nx>79:Math.abs(nx-cx)>10;
  if(protrudes)for(let k=0;k<4;k++)after.data[q+k]=source.data[q+k];
 }c.putImageData(after,0,0);
 }
 const a=faceAnchors(id,age),e=expression;
 if(!asleep&&wear.eyes==='glasses'){const [left,right]=a.eyes;for(const [x,y]of [left,right]){c.strokeStyle='#3e5a50';c.lineWidth=1;c.strokeRect(Math.round(x-5*sx),Math.round(y-4*sy),Math.max(4,Math.round(11*sx)),Math.max(3,Math.round(9*sy)));}c.fillStyle='#3e5a50';c.fillRect(Math.round(left[0]+5*sx),Math.round(left[1]),Math.max(1,Math.round(right[0]-left[0]-10*sx)),1);}
 if(e.tear>=0){c.globalAlpha=Math.min(1,(1-e.tear)*4)*e.strength;for(const [x,y]of a.eyes){c.fillStyle='#70b5c9';c.fillRect(Math.round(x),Math.round(y+4*sy+e.tear*7*sy),1,Math.max(1,Math.round(3*sy)));}c.globalAlpha=1;}
 applySeniorPatina(cv,age);
 withEmotionalPose(ctx,e,64,oy+84*sy,()=>ctx.drawImage(cv,0,0),reduced);
}
