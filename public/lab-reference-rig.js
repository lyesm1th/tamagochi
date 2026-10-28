// First anatomical reference rig: preserves original Detailed pixels and keeps edits in owner lab.
// Independent overlays are intentionally approximate until hand-authored masks exist.
export const referenceSpecies='cat';
export const referenceJoints=Object.freeze(['head','leftHand','rightHand']);
export function referencePose({head=0,leftHand=0,rightHand=0}={}){
 const clamp=(x)=>Math.max(-30,Math.min(30,Number(x)||0));
 return {head:clamp(head),leftHand:clamp(leftHand),rightHand:clamp(rightHand)};
}
export function drawReferenceRig(source,points,pose={},showJoints=false){
 const out=document.createElement('canvas');out.width=source.width;out.height=source.height;
 const ctx=out.getContext('2d');ctx.imageSmoothingEnabled=false;
 ctx.drawImage(source,0,0);
 const angles=referencePose(pose);
 for(const [name,rect] of [['leftHand',points.leftHand],['rightHand',points.rightHand]]){
  if(!rect||!angles[name])continue;
  // Crop from original source. This is a non-destructive overlay, not a reconstructed hidden surface.
  const radius=Math.max(6,Math.round(source.width*.095)),x=Math.round(rect.x),y=Math.round(rect.y);
  const sx=Math.max(0,x-radius),sy=Math.max(0,y-radius),w=Math.min(radius*2,source.width-sx),h=Math.min(radius*2,source.height-sy);
  ctx.save();ctx.translate(x,y);ctx.rotate(angles[name]*Math.PI/180);
  ctx.drawImage(source,sx,sy,w,h,sx-x,sy-y,w,h);ctx.restore();
 }
 if(showJoints){
  ctx.fillStyle='#40e6a1';for(const p of [points.pivot,points.eyes,points.leftHand,points.rightHand]){
   if(p)ctx.fillRect(Math.round(p.x)-2,Math.round(p.y)-2,5,5);
  }
 }
 return out;
}
