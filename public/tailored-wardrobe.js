import {emotionSprites} from './emotion-sprite-manifest.js';
const stageOf=age=>age==='Малюк'?'babies':age==='Дитина'?'children':age==='Підліток'?'teens':'adults';
// Neckline, width factor and hem are measured against each species' original
// illustrated anatomy. Eye landmarks locate the head; they never redraw it.
const cuts={cat:[.65,1,.90],corgi:[.65,1,.90],bear:[.60,.98,.86],dog:[.65,1,.89],frog:[.58,.70,.85],chicken:[.61,1.10,.88],dino:[.57,.90,.85],bunny:[.71,.98,.90],pig:[.66,1.02,.90],sheep:[.65,1.05,.89],fox:[.70,.90,.91],monkey:[.65,1.05,.91],duck:[.63,.98,.90],penguin:[.63,1.05,.91]};
export function tailoredAnatomy(id,age,w,h){
 const sheet=stageOf(age),a=emotionSprites[id]?.stages[sheet],adult=emotionSprites[id]?.stages.adults,cut=cuts[id]||cuts.cat;
 if(!a||!adult)return null;
 const left=a.eyes[0]/a.size[0]*w,right=a.eyes[1]/a.size[0]*w,eye=a.eyes[2]/a.size[1]*h,adultEye=adult.eyes[2]/adult.size[1];
 const cx=(left+right)/2,gap=right-left,top=Math.round((cut[0]+eye/h-adultEye)*h),bottom=Math.round(cut[2]*h),width=gap*cut[1];
 return {cx,left,right,eye,top:Math.min(top,bottom-h*.08),bottom,width,unit:Math.max(1,Math.round(h/140)),species:id,age};
}
const fabric={sweater:['#51343d','#854d60','#b87487','#d99ea9'],raincoat:['#694a24','#b58431','#e4b64e','#f6d57b'],pajamas:['#49405b','#796a95','#a591ba','#cab5d5']};
const arms={dino:[[.12,.64,.17,.12],[.46,.64,.17,.12]],frog:[[.16,.70,.14,.15],[.68,.70,.14,.15]],bear:[[.12,.65,.15,.15],[.72,.65,.15,.15]],cat:[[.25,.80,.12,.13],[.56,.80,.12,.13]],corgi:[[.24,.80,.12,.13],[.60,.80,.12,.13]],bunny:[[.22,.76,.18,.14],[.59,.76,.18,.14]],dog:[[.26,.80,.12,.12],[.63,.80,.12,.12]],pig:[[.23,.80,.14,.13],[.63,.80,.14,.13]],sheep:[[.22,.80,.16,.14],[.62,.80,.16,.14]],fox:[[.18,.80,.13,.14],[.53,.80,.13,.14]],monkey:[[.25,.76,.14,.15],[.58,.76,.14,.15]],duck:[[.14,.67,.18,.15],[.68,.67,.18,.15]],penguin:[[.11,.65,.17,.17],[.73,.65,.17,.17]],chicken:[]};
const blend=(a,b,t)=>a+(b-a)*t;
export function tailoredFabric(base,id,age,worn={}){
 const w=base.width,h=base.height,a=tailoredAnatomy(id,age,w,h);if(!a)return null;
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(w,h),d=pixels.data,src=base.getContext('2d').getImageData(0,0,w,h).data;
 const {cx,top,bottom,width,unit:u}=a,height=bottom-top,pal=fabric[worn.body],points=[];
 const paint=(x,y,color)=>{if(x<0||x>=w||y<0||y>=h)return;const q=(y*w+x)*4;if(src[q+3]<128)return;const rgb=color.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16));d[q]=rgb[0];d[q+1]=rgb[1];d[q+2]=rgb[2];d[q+3]=255;};
 const rowWidth=t=>width*(t<.18?blend(.70,1.08,t/.18):t<.55?blend(1.08,1.30,(t-.18)/.37):blend(1.30,1.13,(t-.55)/.45));
 if(pal)for(let y=top;y<=bottom+2*u;y++){
  const t=Math.max(0,Math.min(1,(y-top)/height)),rw=rowWidth(t),half=rw/2;
  for(let x=Math.ceil(cx-half);x<=Math.floor(cx+half);x++){
   const norm=(x-cx)/half,hem=bottom-Math.round(Math.abs(norm)**2*3*u),collar=top+Math.round((1-Math.min(1,Math.abs(norm)*1.8))*2*u);
   if(y>hem||y<collar)continue;
   let c=pal[Math.abs(norm)>.87?0:norm>.55?1:norm<-.35?3:2];
   if(y<collar+u||y>hem-2*u)c=pal[0];
   if(worn.body==='sweater'){
    const yy=Math.round((y-top)/u),xx=Math.round((x-cx)/u);
    if(yy>4&&yy<height/u-4&&(xx+Math.floor(yy/5)%2*3+300)%7===0&&yy%5<2)c=pal[1];
    if(y>=hem-4*u&&y<hem-2*u)c=pal[Math.round((x-cx)/u)%3===0?0:1];
   }
   if(worn.body==='pajamas'){
    const xx=Math.round((x-cx)/u),yy=Math.round((y-top)/u);
    if(Math.abs(norm)<.75&&yy>4&&(xx+100)%9===0&&yy%8<=1)c='#eadbd9';
    if(Math.abs(x-cx)<u&&y>top+3*u)c=pal[1];
    if(x>=cx+2*u&&x<cx+4*u&&Math.round((y-top)/u)%7===3)c=pal[3];
   }
   if(worn.body==='raincoat'){
    if(Math.abs(x-cx)<u&&y>top+3*u)c=pal[0];
    if(x>cx+2*u&&x<cx+4*u&&Math.round((y-top)/u)%7===3)c='#ffe3a2';
    const pocket=Math.abs(norm)>.38&&Math.abs(norm)<.70&&t>.63&&t<.82;if(pocket&&(t<.67||t>.78||Math.abs(norm)>.65))c=pal[1];
   }
   paint(x,y,c);points.push([x,y]);
  }
 }
 if(pal){
  const ad=emotionSprites[id].stages.adults,shift=(a.eye/h-ad.eyes[2]/ad.size[1])*.7;
  for(const [fx,fy,fw,fh]of arms[id]||[]){const ax=(fx+fw/2)*w,ay=(fy+shift)*h,rx=fw*w*.52,ah=fh*h*.72;
   for(let y=Math.floor(ay);y<ay+ah;y++)for(let x=Math.floor(ax-rx);x<=ax+rx;x++){
    const norm=(x-ax)/rx;if(Math.abs(norm)>1||y<ay+Math.abs(norm)*2*u)continue;
    let c=pal[Math.abs(norm)>.82?0:norm>.35?1:norm<-.3?3:2];if(y>ay+ah-2*u)c=pal[0];paint(x,y,c);
   }
  }
 }
 // A narrow collar follows the neck curve. It doesn't stretch across the arms.
 if(worn.neck){
  const half=width*.38,y0=top+u;
  for(let x=Math.ceil(cx-half);x<=cx+half;x++)for(let y=y0;y<y0+4*u;y++)paint(x,y+Math.round((1-((x-cx)/half)**2)*2*u),y===y0||y===y0+3*u?'#6d3e39':'#c27b6a');
  if(worn.neck==='scarf')for(let y=y0+3*u;y<Math.min(bottom,y0+12*u);y++)for(let x=Math.round(cx+half*.45);x<cx+half*.45+4*u;x++)paint(x,y,x===Math.round(cx+half*.45)?'#6d3e39':y%6===0?'#e1a08c':'#c27b6a');
  if(worn.neck==='bow'){
   // Remove the scarf-coloured collar: the bow has its own small neck band.
   for(let q=0;q<d.length;q+=4)if(d[q]===194&&d[q+1]===123&&d[q+2]===106){d[q]=73;d[q+1]=111;d[q+2]=137;}
   for(let y=-3*u;y<=3*u;y++)for(let x=-8*u;x<=8*u;x++)if(Math.abs(x)<=2*u||Math.abs(x)>=3*u&&Math.abs(y)<=Math.abs(x)*.42)paint(Math.round(cx+x),Math.round(y0+4*u+y),Math.abs(x)<=2*u?'#29495d':'#6097ad');
  }
 }
 ctx.putImageData(pixels,0,0);return {canvas,anatomy:a};
}
// Curved forepaws are in front of the torso, not rectangular copied patches.
// The source's own alpha/outline is used; nothing is cut out of the sprite.
export function restoreForepaws(ctx,base,id,age,pad=0){
 const w=base.width,h=base.height,a=tailoredAnatomy(id,age,w,h);if(!a)return;
 const areas=arms[id]||[];
 const adult=emotionSprites[id].stages.adults,adultEyes=adult.eyes[2]/adult.size[1],currentEyes=a.eye/h,shift=(currentEyes-adultEyes)*.7;
 for(const [x,y,ww,hh]of areas){const px=(x+ww/2)*w,py=Math.min(.96,y+shift+hh*.65)*h,rx=ww*w*.49,ry=hh*h*.40;ctx.save();ctx.beginPath();ctx.ellipse(pad+px,pad+py,rx,ry,0,0,Math.PI*2);ctx.clip();ctx.drawImage(base,pad,pad);ctx.restore();}
}
export function paintSeatedHat(ctx,base,id,age,head,pad=0){
 if(!head)return;const w=base.width,h=base.height,a=tailoredAnatomy(id,age,w,h);if(!a)return;
 const src=base.getContext('2d').getImageData(0,0,w,h).data,{cx,eye,unit:u}=a,half=a.width*(id==='frog'?.45:.68);
 // Seat against the actual cranium between ears/crests, not the atlas top.
 let seat=0;for(let y=0;y<eye;y++){let solid=0,total=0;for(let x=Math.max(0,Math.round(cx-half*.42));x<Math.min(w,cx+half*.42);x++){total++;if(src[(y*w+x)*4+3]>=128)solid++;}if(total&&solid/total>.9){seat=y+3*u;break;}}
 seat=Math.min(eye-9*u,seat);const brimHalf=half,capHalf=half*.70,height=Math.max(8*u,h*.105),left=Math.floor(cx-brimHalf),right=Math.ceil(cx+brimHalf);
 const r=(x,y,ww,hh,col)=>{ctx.fillStyle=col;for(let yy=Math.round(y);yy<Math.round(y)+Math.max(1,Math.round(hh));yy++)for(let xx=Math.round(x);xx<Math.round(x)+Math.max(1,Math.round(ww));xx++){
 const eyeRadius=Math.max(9,h*.075),protectedEye=yy>=eye-eyeRadius&&yy<=eye+eyeRadius&&[a.left,a.right].some(ex=>Math.abs(xx-ex)<=Math.max(9,w*.075));if(!protectedEye)ctx.fillRect(Math.round(pad+xx),Math.round(pad+yy),1,1);
 }};
 if(head==='panama'){
  for(let y=Math.floor(seat-height);y<seat;y++){const t=(y-seat+height)/height,hw=capHalf*(.80+.20*t);r(cx-hw,y,2*hw,1,t<.09?'#6c5635':t>.75?'#8a7044':t<.65?'#d9c28a':'#bea16c');}
  for(let x=left;x<=right;x++){const t=(x-cx)/brimHalf,y=seat+Math.round((1-t*t)*2*u);r(x,y,1,3*u,'#705a38');r(x,y,1,u,'#ead4a0');r(x,y+u,1,u,'#c7ac77');}
 }else if(head==='crown'){
  const width=half*.75;
  for(let x=Math.round(cx-width);x<=cx+width;x++){const t=(x-cx)/width,curve=Math.round((1-t*t)*2*u),band=seat+curve,peak=height*(.68+.32*Math.cos((t+1)*Math.PI*2));r(x,band-peak,1,peak+3*u,'#765229');r(x,band-peak+u,1,Math.max(u,peak-u),'#e9bb48');r(x,band+u,1,u,'#f6d878');}
  r(cx-2*u,seat-u,4*u,3*u,'#ab6874');
 }
 // Foreground ear tips pass through/around the hat instead of being flattened.
 // Only pixels above the cranial seating line can occlude its crown.
 for(let y=0;y<seat-u;y++)for(let x=Math.max(0,left);x<Math.min(w,right);x++)if(Math.abs(x-cx)>capHalf*.80&&src[(y*w+x)*4+3]>=128){const q=(y*w+x)*4; r(x,y,1,1,`rgb(${src[q]},${src[q+1]},${src[q+2]})`);}
}
