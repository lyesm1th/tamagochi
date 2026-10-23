import {wardrobeAnatomy} from './detailed-wardrobe.js';
// Garments are painted onto the body's pixels, rather than shrinking the shop icon.
export function paintFittedClothes(ctx,base,species,age,sheet,worn={},pad=0,sleeping=false){
 const a=wardrobeAnatomy(species,age,sheet),w=base.width,h=base.height;
 const sample=base.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h),out=ctx.getImageData(pad,pad,w,h),d=out.data,src=sample.data;
 const body=sleeping?null:worn.body,neck=worn.neck,cx=a.cx*w,top=a.top*h,bottom=(a.top+a.height)*h,left=(a.cx-a.width/2)*w,right=(a.cx+a.width/2)*w,neckY=(sleeping?.83:a.neck)*h;
 const palettes={sweater:[[108,61,66],[163,98,106],[207,144,147]],raincoat:[[140,105,43],[204,165,66],[235,201,107]],pajamas:[[111,91,145],[161,137,183],[208,184,218]]};
 const colour=(p,palette)=>{const light=(src[p]*.21+src[p+1]*.72+src[p+2]*.07)/255;return palette[light<.4?0:light<.78?1:2];};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
 const p=(y*w+x)*4;if(src[p+3]<128)continue;const edge=x===0||y===0||x===w-1||y===h-1||src[p-4+3]<128||src[p+4+3]<128||src[p-w*4+3]<128||src[p+w*4+3]<128;let col=null;
 if(body&&palettes[body]&&x>=left&&x<=right&&y>=top&&y<bottom&&!edge){col=colour(p,palettes[body]);
  if(body==='sweater'&&((y-Math.round(top))%9<2||Math.abs((x-Math.round(left))%8-4)===(y-Math.round(top))%7))col=palettes.sweater[0];
  if(body==='pajamas'&&x%13<2&&y%12<2)col=[235,217,210];
  if(body==='raincoat'&&Math.abs(x-cx)<1.5)col=palettes.raincoat[0];
  if(body==='raincoat'&&Math.abs(x-cx-5)<1.5&&(y-Math.round(top))%12<3)col=[245,224,151];
  if(y<top+2||y>bottom-3)col=palettes[body][0];if(y<top+Math.max(2,h*.035)&&Math.abs(x-cx)<w*.10*(1-(y-top)/(h*.04)))col=null;
 }
 // A neck band wraps across the shoulders; its tail lies on the body silhouette.
 if(neck&&!edge){const bandWidth=a.width*w,bandTop=neckY-2,bandBottom=neckY+Math.max(4,h*.04),band=x>cx-bandWidth/2&&x<cx+bandWidth/2&&y>=bandTop&&y<bandBottom;
 const tail=neck==='scarf'&&x>cx+bandWidth*.12&&x<cx+bandWidth*.27&&y>=bandBottom&&y<Math.min(h*.94,bandBottom+h*.15);
 if(band||tail){const palette=neck==='bow'?[[41,83,110],[65,128,158],[111,178,198]]:[[148,75,57],[203,120,90],[237,164,123]];col=colour(p,palette);if(y<bandTop+1||y>=bandBottom-1&&band||tail&&(y%7<2))col=palette[0];}
 }
 if(col){d[p]=col[0];d[p+1]=col[1];d[p+2]=col[2];}
 }
 ctx.putImageData(out,pad,pad);
 if(neck==='bow'){const x=pad+cx,y=pad+neckY+2,unit=Math.max(1,Math.round(h/50));ctx.fillStyle='#386f89';for(let row=-2;row<=2;row++){const width=(3-Math.abs(row))*unit;ctx.fillRect(Math.round(x-4*unit),Math.round(y+row*unit),width,unit);ctx.fillRect(Math.round(x+4*unit-width),Math.round(y+row*unit),width,unit);}ctx.fillStyle='#80bbcf';ctx.fillRect(Math.round(x-unit),Math.round(y-unit),unit*2,unit*3);}
}
