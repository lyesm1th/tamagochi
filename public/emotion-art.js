import {emotionOf} from './emotions.js';
import {wardrobeAnatomy} from './detailed-wardrobe.js';
// Face coordinates are in the same local sprite space as clothing and body.
export function faceAnchors(species,age,box=null){
 if(box){const a=wardrobeAnatomy(species,age);const gap={frog:.31,bunny:.19,dino:.17,fox:.19}[species]||.20;return {eyes:[a.cx-gap,a.cx+gap].map(x=>[box.x+x*box.w,box.y+a.eyes*box.h]),mouth:[box.x+a.cx*box.w,box.y+(a.eyes+.11)*box.h],unit:Math.max(1,box.h/65)};}
 const wide=age==='Малюк'?.42:age==='Дитина'?.65:age==='Підліток'?.75:1,sy=age==='Малюк'?.36:age==='Дитина'?.60:age==='Підліток'?.84:1,oy=age==='Малюк'?52:age==='Дитина'?32:age==='Підліток'?12:0;
 const pts=species==='frog'?[[50,36],[78,36]]:[[54,49],[74,49]];
 return {eyes:pts.map(([x,y])=>[64+(x-64)*wide,oy+y*sy]),mouth:[64,oy+63*sy],unit:Math.max(.65,wide)};
}
export function drawEmotion(c,s,age,box=null,now=Date.now(),reduced=false){
 const e=emotionOf(s,now);if(!e.strength||age==='Яєчко')return;
 const {eyes,mouth,unit:u}=faceAnchors(s.species,age,box),ink='#35483e';c.save();
 const r=(x,y,w,h,col=ink)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
 const line=(x,y,dx,dy)=>{const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))));for(let n=0;n<=steps;n++)r(x+dx*n/steps,y+dy*n/steps,u,u);};
 // Eyebrows sit immediately above anatomical eyes; headwear and eyewear stay intact.
 for(const [i,[x,y]] of eyes.entries()){
  const dir=i===0?1:-1;
  if(!s.cozy?.wearing?.eyes){
   const fallback={cat:'#b8a0d2',frog:'#c7d796',dog:'#f7f3df',chicken:'#efd06e',bear:'#bb9477',bunny:'#e7bdca',corgi:'#dea36c',dino:'#8db7a0'}[s.species]||s.color||'#e8ecc3';
   // Replace only dark eye pixels; preserve fur shading and light eye surrounds.
   if(box&&c.getImageData){const left=Math.max(0,Math.round(x-4*u)),top=Math.max(0,Math.round(y-4*u)),w=Math.ceil(9*u),h=Math.ceil(9*u),im=c.getImageData(left,top,w,h),d=im.data;for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const q=(yy*w+xx)*4;if(d[q]+d[q+1]+d[q+2]<390){let best=null;for(let radius=1;radius<w&&!best;radius++)for(const nx of [xx-radius,xx+radius])if(nx>=0&&nx<w){const k=(yy*w+nx)*4;if(d[k]+d[k+1]+d[k+2]>540){best=[d[k],d[k+1],d[k+2]];break;}}if(best){d[q]=best[0];d[q+1]=best[1];d[q+2]=best[2];}}}c.putImageData(im,left,top);}
   else r(x-4*u,y-4*u,9*u,9*u,fallback);
   if(['sad','hurt','anxious','curious','surprised'].includes(e.kind)){r(x-2*u,y-2*u,4*u,6*u);r(x-2*u,y-2*u,u,2*u,'#f7f3df');}
   if(['angry','annoyed','bored'].includes(e.kind)){r(x-3*u,y,6*u,2*u);r(x+dir*u,y+u,2*u,2*u);}
  }
  if(['sad','hurt','anxious'].includes(e.kind))line(x-3*u,y-6*u,6*u,-dir*2*u);
  if(['angry','annoyed'].includes(e.kind))line(x-3*u,y-6*u,6*u,dir*3*u);
  if(['curious','surprised'].includes(e.kind))line(x-3*u,y-(i?8:6)*u,6*u,0);
  if(['amused','content','grateful','proud','shy'].includes(e.kind)){line(x-3*u,y,3*u,-2*u);line(x,y-2*u,3*u,2*u);}
  if(e.kind==='bored')line(x-3*u,y-1*u,6*u,0);
  if(['shy','grateful'].includes(e.kind))r(x-4*u,y+5*u,7*u,2*u,'#dc9aa4');
 }
 if(['sad','hurt'].includes(e.kind)&&e.strength>.65&&!reduced){const phase=((now-(e.at||0))%7000)/7000;if(phase<.32){const [x,y]=eyes[0];r(x+2*u,y+4*u+phase*20*u,2*u,3*u,'#77b5cf');r(x+2*u,y+4*u+phase*20*u,u,u,'#c4e5ec');}}
 const [mx,my]=mouth;
 if(box&&!['frog','chicken','duck','penguin','pig','dog'].includes(s.species)&&c.getImageData){const left=Math.max(0,Math.round(mx-5*u)),top=Math.max(0,Math.round(my)),w=Math.ceil(11*u),h=Math.ceil(6*u),im=c.getImageData(left,top,w,h),d=im.data;for(let q=0;q<d.length;q+=4)if(d[q]+d[q+1]+d[q+2]<440||d[q]>d[q+1]*1.2&&d[q]>d[q+2]*1.1){d[q]=250;d[q+1]=237;d[q+2]=221;}c.putImageData(im,left,top);}
 if(e.kind==='amused'){r(mx-3*u,my,6*u,4*u);r(mx-2*u,my+3*u,4*u,u,'#d6929c');}
 if(e.kind==='surprised'||e.kind==='anxious'){c.strokeStyle=ink;c.lineWidth=u;c.strokeRect(mx-2*u,my,4*u,4*u);}
 if(e.kind==='sad'||e.kind==='hurt'){line(mx-4*u,my+2*u,4*u,-2*u);line(mx,my,4*u,2*u);}
 if(e.kind==='angry'||e.kind==='annoyed'||e.kind==='bored')line(mx-4*u,my,8*u,0);
 c.restore();
}
