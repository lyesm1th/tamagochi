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
  const shift=Math.round(Math.sin(a.headYaw*Math.PI/180)*w*.035);
  ctx.save();ctx.beginPath();ctx.ellipse(x,cy,rx,ry,0,0,Math.PI*2);ctx.clip();
  // Keep the underlying source instead of deleting head pixels: no transparent seams.
  ctx.drawImage(mask,0,0,w,h,Math.round(x*(1-k))+shift,0,Math.round(w*k),h);
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
  // Eye strip closes at the eyes anchor, using pixel-art nearest-neighbour sampling.
  const eyeY=Math.round(points.eyes.y),halfW=Math.round(w*.25),x=Math.round(points.eyes.x);
  const y=Math.max(0,eyeY-2),x0=Math.max(0,x-halfW),sw=Math.min(w-x0,halfW*2);
  if(sw>0&&y+4<h){
   const closed=document.createElement('canvas');closed.width=sw;closed.height=4;
   const c=closed.getContext('2d');c.imageSmoothingEnabled=false;
   c.drawImage(out,x0,Math.max(0,y-6),sw,1,0,1,sw,2);
   ctx.drawImage(closed,x0,y);
  }
 }
 if(showJoints){
  ctx.fillStyle='#40e6a1';
  for(const p of [points.pivot,points.eyes,points.leftHand,points.rightHand])
   if(p)ctx.fillRect(Math.round(p.x)-2,Math.round(p.y)-2,5,5);
 }
 return out;
}
