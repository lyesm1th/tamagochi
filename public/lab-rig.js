// Experimental image-space articulated head. No new art and no persistent state.
import {wardrobeAnatomy} from './detailed-wardrobe.js';
export function rigPoints(species,age,width=128,height=128){
 const a=wardrobeAnatomy(species,age);
 const pivot={x:a.cx*width,y:a.neck*height};
 return {pivot,eyes:{x:a.cx*width,y:a.eyes*height},
  leftHand:a.hands[0]?{x:(a.hands[0][0]+a.hands[0][2]/2)*width,y:(a.hands[0][1]+a.hands[0][3]/2)*height}:null,
  rightHand:a.hands[1]?{x:(a.hands[1][0]+a.hands[1][2]/2)*width,y:(a.hands[1][1]+a.hands[1][3]/2)*height}:null};
}
export function articulatePortrait(source,species,age,{tilt=0,showRig=false}={}){
 const target=document.createElement('canvas');target.width=source.width;target.height=source.height;
 const ctx=target.getContext('2d');ctx.imageSmoothingEnabled=false;
 const p=rigPoints(species,age,source.width,source.height),radians=Math.max(-22,Math.min(22,tilt))*Math.PI/180;
 if(!radians){ctx.drawImage(source,0,0);}
 else{
  // Compositing experiment: upper pixels rotate around the anatomy-derived neck joint.
  // This is deliberately not described as genuine 3D mesh rotation.
  const seam=Math.round(p.pivot.y),overlap=4;
  ctx.drawImage(source,0,seam-overlap,source.width,source.height-(seam-overlap),0,seam-overlap,source.width,source.height-(seam-overlap));
  ctx.save();ctx.translate(Math.round(p.pivot.x),seam);ctx.rotate(radians);
  ctx.drawImage(source,0,0,source.width,seam+overlap,-Math.round(p.pivot.x),-seam,source.width,seam+overlap);
  ctx.restore();
 }
 if(showRig){
  ctx.save();ctx.strokeStyle='#ee547d';ctx.fillStyle='#ee547d';ctx.lineWidth=1;
  const point=q=>{if(!q)return;ctx.fillRect(Math.round(q.x)-2,Math.round(q.y)-2,5,5);};
  ctx.beginPath();ctx.moveTo(p.pivot.x,p.pivot.y);ctx.lineTo(p.eyes.x,p.eyes.y);ctx.stroke();
  for(const q of [p.pivot,p.eyes,p.leftHand,p.rightHand])point(q);
  ctx.restore();
 }
 return target;
}
