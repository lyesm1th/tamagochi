// Owner-only anatomical experiment. Uses original Detailed pixels; no saves or gameplay mutations.
export const referenceSpecies='cat';
export const referenceJoints=Object.freeze(['head','leftHand','rightHand','eyes']);
export function referencePose({head=0,headYaw=0,leftHand=0,rightHand=0,blink=false}={}){
 const clamp=(x)=>Math.max(-30,Math.min(30,Number(x)||0));
 return {head:clamp(head),headYaw:clamp(headYaw),leftHand:clamp(leftHand),rightHand:clamp(rightHand),blink:!!blink};
}
export function drawReferenceRig(source,points,pose={},showJoints=false){
 const out=document.createElement('canvas');out.width=source.width;out.height=source.height;
 const ctx=out.getContext('2d');ctx.imageSmoothingEnabled=false;
 const a=referencePose(pose),w=source.width,h=source.height;
 // Preserve the original art underneath; only the isolated head strip is transformed.
 ctx.drawImage(source,0,0);
 const seam=Math.max(1,Math.min(h-1,Math.round(points.pivot.y)));
 if(a.headYaw){
  // Rounded alpha cutout localizes the motion to the head, preserving the original body,
  // garments and room outside the silhouette. True unseen side textures remain future art.
  const x=Math.round(points.pivot.x),ey=Math.round(points.eyes?.y??seam*.55);
  const rx=Math.round(w*.34),ry=Math.max(10,Math.round(seam*.53));
  const cy=Math.round((ey+seam)/2)-Math.round(ry*.15);
  const mask=document.createElement('canvas');mask.width=w;mask.height=h;
  const mc=mask.getContext('2d');mc.imageSmoothingEnabled=false;
  mc.save();mc.beginPath();mc.ellipse(x,cy,rx,ry,0,0,Math.PI*2);
  mc.clip();mc.drawImage(source,0,0);mc.restore();
  const k=1-.22*Math.abs(a.headYaw)/30;
  // Reconstruct a modest side silhouette from the existing eye-side pixel strip.
  // This provides a synthetic cheek volume, not a claimed authentic unseen view.
  const cheek=document.createElement('canvas');cheek.width=Math.max(2,Math.round(rx*.22));cheek.height=Math.max(2,Math.round(ry*.7));
  const cc=cheek.getContext('2d');cc.imageSmoothingEnabled=false;
  const fromX=a.headYaw>0?Math.max(0,x-rx):Math.min(w-cheek.width,x+rx-cheek.width);
  cc.drawImage(source,fromX,Math.max(0,cy-Math.round(ry*.35)),cheek.width,cheek.height,0,0,cheek.width,cheek.height);
  const shift=Math.round(Math.sin(a.headYaw*Math.PI/180)*w*.035);
  ctx.save();ctx.beginPath();ctx.ellipse(x,cy,rx,ry,0,0,Math.PI*2);ctx.clip();
  // Keep the underlying source instead of deleting head pixels: no transparent seams.
  ctx.drawImage(mask,0,0,w,h,Math.round(x*(1-k))+shift,0,Math.round(w*k),h);
  const sideX=a.headYaw>0?x+Math.round(rx*k*.80):x-Math.round(rx*k*.95);
  ctx.drawImage(cheek,sideX,Math.round(cy-ry*.35),Math.max(2,Math.round(cheek.width*Math.abs(a.headYaw)/30)),cheek.height);
  ctx.restore();
 }
 for(const name of ['leftHand','rightHand']){
  const p=points[name];if(!p||!a[name])continue;
  const radius=Math.max(5,Math.round(w*.08)),x=Math.round(p.x),y=Math.round(p.y);
  const sx=Math.max(0,x-radius),sy=Math.max(0,y-radius),sw=Math.min(radius*2,w-sx),sh=Math.min(radius*2,h-sy);
  // Round masked paw cutout instead of rotating a rectangular block of torso pixels.
  const paw=document.createElement('canvas');paw.width=sw;paw.height=sh;
  const pc=paw.getContext('2d');pc.imageSmoothingEnabled=false;
  pc.save();pc.beginPath();pc.ellipse(sw/2,sh/2,sw*.49,sh*.49,0,0,Math.PI*2);pc.clip();
  pc.drawImage(source,sx,sy,sw,sh,0,0,sw,sh);pc.restore();
  ctx.save();ctx.translate(x,y);ctx.rotate(a[name]*Math.PI/180);
  ctx.drawImage(paw,sx-x,sy-y);ctx.restore();
 }
 if(a.blink&&points.eyes){
  // Two discrete pixel eyelids instead of stretching an entire face-width strip.
  const eye=points.eyes,cy=Math.round(eye.y),center=Math.round(eye.x);
  const offset=Math.max(5,Math.round(w*.105)),ew=Math.max(3,Math.round(w*.085));
  for(const x of [center-offset,center+offset]){
   const left=Math.max(0,Math.round(x-ew/2)),top=Math.max(0,cy-3);
   const width=Math.min(ew,w-left),height=Math.min(6,h-top);
   if(width<=0||height<=0)continue;
   const eyelid=document.createElement('canvas');eyelid.width=width;eyelid.height=height;
   const ec=eyelid.getContext('2d');ec.imageSmoothingEnabled=false;
   // Nearby brow fur supplies authentic palette pixels for the closed-lid region.
   ec.drawImage(out,left,Math.max(0,top-4),width,1,0,0,width,height);
   ctx.drawImage(eyelid,left,top);
   // Dark narrow crease in the original pixel-art palette.
   ctx.save();ctx.globalAlpha=.7;ctx.fillStyle='#59453d';
   ctx.fillRect(left+1,cy,Math.max(1,width-2),1);ctx.restore();
  }
 }
 if(showJoints){
  ctx.fillStyle='#40e6a1';
  for(const p of [points.pivot,points.eyes,points.leftHand,points.rightHand])
   if(p)ctx.fillRect(Math.round(p.x)-2,Math.round(p.y)-2,5,5);
 }
 return out;
}
