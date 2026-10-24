import {wardrobeAnatomy} from './detailed-wardrobe.js';
import {emotionSprites} from './emotion-sprite-manifest.js';
import {emotionStage} from './emotion-sprites.js';
const palettes={sweater:['#653946','#a96377','#d68a9c','#efd0c3'],raincoat:['#775524','#d5a63f','#f4cd64','#fff0b5'],pajamas:['#584869','#9380b4','#b8a5d0','#ece1e9']};
function polygon(c,points,color){c.fillStyle=color;c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.closePath();c.fill();}
// Each garment has a fabric silhouette and opaque colours. No body texture is
// blended through it and no rectangular paw cutouts are restored over it.
export function paintFittedClothes(ctx,base,species,age,sheet,worn={},pad=0,sleeping=false){
 const a=wardrobeAnatomy(species,age,sheet),w=base.width,h=base.height,cv=typeof document!=='undefined'?document.createElement('canvas'):null;if(!cv)return;
 cv.width=w;cv.height=h;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
 const m=emotionSprites[species]?.stages[emotionStage(age)],ey=m?m.eyes[2]/m.size[1]:a.eyes,cx=m?(m.eyes[0]+m.eyes[1])/2/m.size[0]*w:a.cx*w;
 const top=Math.round(Math.max(a.top,ey+.19)*h),bottom=Math.round(Math.min(.92,Math.max(.86,a.top+a.height))*h),width=a.width*w,left=cx-width/2,right=cx+width/2,unit=Math.max(1,Math.round(h/85));
 const r=(x,y,ww,hh,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(ww)),Math.max(1,Math.round(hh)));};
 if(!sleeping&&palettes[worn.body]){
  const [dark,mid,light,accent]=palettes[worn.body],shoulder=top+2*unit,hem=bottom-2*unit;
  // Sleeves meet the chest along the shoulder seam and end above bare toes.
  const shirt=[[left+4*unit,top],[right-4*unit,top],[right+3*unit,shoulder+4*unit],[right+unit,hem-3*unit],[right-3*unit,hem],[left+3*unit,hem],[left-unit,hem-3*unit],[left-3*unit,shoulder+4*unit]];
  for(const [fx,fy,fw,fh]of a.hands){const hx=(fx+fw/2)*w,end=Math.min(bottom-3*unit,(fy+fh*.62)*h),half=fw*w*.48,join=Math.max(left+3*unit,Math.min(right-3*unit,hx));
   const sleeve=[[join-3*unit,top+unit],[join+3*unit,top+unit],[hx+half,end-2*unit],[hx+half-unit,end],[hx-half+unit,end],[hx-half,end-2*unit]];
   polygon(c,sleeve,dark);polygon(c,sleeve.map(([x,y])=>[x+(x<hx?unit:-unit),y+(y<top+3*unit?unit:-unit)]),mid);r(hx-half+unit,end-3*unit,half*2-2*unit,unit,light);
  }
  polygon(c,shirt,dark);polygon(c,shirt.map(([x,y])=>[x+(x<cx?unit:-unit),y+(y<top+4*unit?unit:-unit)]),mid);
  r(left+5*unit,top+2*unit,width-10*unit,2*unit,light);
  r(left+4*unit,hem-3*unit,width-8*unit,unit,light);r(left+3*unit,hem-unit,width-6*unit,unit,dark);
  // Closed cuffs, rather than holes exposing the old forearm rectangles.
  r(left,hem-5*unit,5*unit,2*unit,dark);r(right-5*unit,hem-5*unit,5*unit,2*unit,dark);
  r(left+unit,hem-5*unit,3*unit,unit,light);r(right-4*unit,hem-5*unit,3*unit,unit,light);
  if(worn.body==='sweater'){
   r(left+4*unit,top+8*unit,width-8*unit,2*unit,accent);
   for(let x=left+7*unit;x<right-5*unit;x+=6*unit){r(x,top+12*unit,2*unit,unit,light);r(x+unit,top+11*unit,unit,3*unit,light);}
   for(let x=left+4*unit;x<right-3*unit;x+=3*unit)r(x,hem-2*unit,unit,2*unit,dark);
  }else if(worn.body==='raincoat'){
   r(cx-unit,top+3*unit,2*unit,hem-top-4*unit,dark);r(cx,top+3*unit,unit,hem-top-4*unit,light);
   for(let y=top+5*unit;y<hem-3*unit;y+=5*unit)r(cx+3*unit,y,2*unit,2*unit,accent);
   for(const x of [left+6*unit,right-12*unit]){r(x,hem-8*unit,6*unit,5*unit,dark);r(x+unit,hem-7*unit,4*unit,3*unit,mid);}
  }else{
   for(let y=top+6*unit;y<hem-3*unit;y+=6*unit)for(let x=left+6*unit;x<right-5*unit;x+=7*unit){r(x,y,2*unit,2*unit,accent);r(x+unit,y-unit,unit,4*unit,accent);}
   r(cx,top+4*unit,unit,hem-top-7*unit,dark);
  }
  // A stitched neckline, not a gap into the original body.
  r(cx-5*unit,top,10*unit,2*unit,dark);r(cx-4*unit,top+unit,8*unit,unit,accent);
 }
 if(worn.neck){const y=sleeping?h*.83:top+unit,band=width*.78;
  if(worn.neck==='scarf'){r(cx-band/2-1,y-1,band+2,6*unit,'#743f3e');r(cx-band/2,y,band,4*unit,'#ca776f');r(cx-band/2+unit,y+unit,band-2*unit,unit,'#eca699');r(cx+band*.18,y+3*unit,6*unit,10*unit,'#743f3e');r(cx+band*.18+unit,y+4*unit,4*unit,8*unit,'#ca776f');for(let n=0;n<3;n++)r(cx+band*.18+unit+n*unit*1.5,y+12*unit,unit,2*unit,'#e9ab95');}
  if(worn.neck==='bow'){polygon(c,[[cx-9*unit,y-2*unit],[cx-2*unit,y],[cx-2*unit,y+4*unit],[cx-9*unit,y+6*unit]],'#284b68');polygon(c,[[cx+9*unit,y-2*unit],[cx+2*unit,y],[cx+2*unit,y+4*unit],[cx+9*unit,y+6*unit]],'#284b68');r(cx-8*unit,y,5*unit,3*unit,'#609ab2');r(cx+3*unit,y,5*unit,3*unit,'#609ab2');r(cx-2*unit,y,4*unit,5*unit,'#284b68');r(cx-unit,y+unit,2*unit,2*unit,'#96c7ce');}
 }
 // Preserve the clean base silhouette and tail. Every covered pixel is opaque.
 const cloth=c.getImageData(0,0,w,h),mask=base.getContext('2d').getImageData(0,0,w,h).data;
 for(let q=0;q<cloth.data.length;q+=4){cloth.data[q+3]=cloth.data[q+3]>=128&&mask[q+3]>=128?255:0;if(!cloth.data[q+3])cloth.data[q]=cloth.data[q+1]=cloth.data[q+2]=0;}
 c.putImageData(cloth,0,0);ctx.drawImage(cv,pad,pad);
}
