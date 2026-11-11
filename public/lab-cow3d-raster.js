// Owner-only pixel rasterizer: one depth-tested pixel wins, including eyes,
// horns and authentic Detailed pigment. No overpainting across mesh layers.
// Remove isolated one-pixel material flecks without averaging RGB values,
// antialiasing, softening edges, or touching pupils/nostrils/contour pixels.
// The winning *whole* palette color replaces a lone unstable surface pixel.
export function cleanFurSpeckles(pixels,mask,parts,width,height){
 const original=new Uint8ClampedArray(pixels), eligible=new Set(['head','body']);
 let cleaned=0;
 for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
  const i=y*width+x,part=parts[i];if(!mask[i]||!eligible.has(part))continue;
  const adjacent=[i-1,i+1,i-width,i+width,i-width-1,i-width+1,i+width-1,i+width+1];
  if(adjacent.some(j=>!mask[j]||parts[j]!==part))continue;
  const counts=new Map();
  for(const j of adjacent){const off=j*4,key=(original[off]<<16)|(original[off+1]<<8)|original[off+2];
   counts.set(key,(counts.get(key)||0)+1);}
  let major=0,count=0;
  for(const [color,n]of counts)if(n>count){major=color;count=n;}
  if(count<7)continue;
  const p=i*4,old=(original[p]<<16)|(original[p+1]<<8)|original[p+2];
  if(old!==major){pixels[p]=(major>>16)&255;pixels[p+1]=(major>>8)&255;pixels[p+2]=major&255;cleaned++;}
 }
 return cleaned;
}

export function renderCowMeshPixels(ctx,faces,{width,height,pigment,uvPigment,textureReady,outlineWidth=1,protectFeatures=false,stablePalette=false,detailOutlines=false,materialPigment=null,adaptiveOutlines=false}){
 const image=ctx.getImageData(0,0,width,height);
 const pixels=image.data,depth=new Float32Array(width*height).fill(-Infinity);
 let painted=0,textured=0,materialPixels=0;
 const mask=new Uint8Array(width*height),parts=new Array(width*height);
 for(const face of faces){
  const [a,b,c]=face.v;
  const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
  if(Math.abs(den)<.001)continue;
  const minX=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0])));
  const maxX=Math.min(width-1,Math.ceil(Math.max(a[0],b[0],c[0])));
  const minY=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1])));
  const maxY=Math.min(height-1,Math.ceil(Math.max(a[1],b[1],c[1])));
  const normal=face.normal||[0,0,1],sun=Math.max(0,-normal[0]*.43+normal[1]*.71+normal[2]*.52);
  // In the original Detailed style, lighting is defined by the finite palette.
  // Per-triangle moving highlights were causing a boil of bright/dark pixels.
  const shade=stablePalette&&materialPigment?1:
    stablePalette?Math.max(.84,Math.min(1.04,Math.round((.88+sun*.15)*4)/4)):
    Math.max(.82,Math.min(1.08,Math.round((.88+sun*.15)*8)/8));
  const allowTexture=textureReady&&face.uv&&['head','body'].includes(face.part)&&normal[2]>.20;
  const color=face.ink;
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
   const px=x+.5,py=y+.5;
   const l0=((b[1]-c[1])*(px-c[0])+(c[0]-b[0])*(py-c[1]))/den;
   const l1=((c[1]-a[1])*(px-c[0])+(a[0]-c[0])*(py-c[1]))/den;
   const l2=1-l0-l1;
   if(l0<-.0001||l1<-.0001||l2<-.0001)continue;
   const z=l0*a[2]+l1*b[2]+l2*c[2],index=y*width+x;
   if(z<=depth[index])continue;
   let ink=color;
   if(allowTexture){
    const uv=[0,1].map(k=>face.uv[0][k]*l0+face.uv[1][k]*l1+face.uv[2][k]*l2);
    ink=uvPigment(face.part,uv,normal,color);
    if(ink!==color)textured++;
   }
   if(materialPigment&&face.texPoints?.length===3){
    // Local mesh coordinates are evaluated after depth selection, but *before*
    // projection coloring. The same painted patch follows the articulated
    // head and never floats as a screen-space overlay.
    const local=[0,1,2].map(k=>face.texPoints[0][k]*l0+face.texPoints[1][k]*l1+face.texPoints[2][k]*l2);
    const paintedInk=materialPigment(face.part,local,face.normal,ink);
    if(paintedInk!==ink)materialPixels++;
    ink=paintedInk;
   }
   const p=index*4;
   for(let k=0;k<3;k++)pixels[p+k]=Math.round(Math.max(0,Math.min(255,parseInt(ink.slice(1+k*2,3+k*2),16)*shade)));
   pixels[p+3]=255;depth[index]=z;mask[index]=1;parts[index]=face.part;painted++;
  }
 }
 const cleanedPixels=stablePalette&&materialPigment?
  cleanFurSpeckles(pixels,mask,parts,width,height):0;
 // Context-sensitive outline shades are chosen from the unmodified visible
 // pigment, before any contour is painted. Never infer a color from ink
 // written earlier in the same pass, or contour boundaries can flicker.
 const basePigments=adaptiveOutlines?new Uint8ClampedArray(pixels):null;
 // Depth-tested part IDs, not mesh triangle edges, define each ink line.
 // This prevents the wireframe/shimmer effect during articulated rotations.
 let outlined=0,detailOutlined=0,adaptiveDarkOutlined=0;
 const edgeInk=[57,35,31],seamInk=[106,65,52];
 const detailInk=[70,41,35],softDetailInk=[90,57,47];
 // Pigment family from the original Detailed reference: ivory coat needs a
 // warm cocoa line; charcoal patches and hooves need *near-black* ink; pink
 // cheeks and muzzle need a muted berry line rather than dark brown.
 const darkEdge=[205,211,217],warmEdge=[62,41,40],roseEdge=[110,55,68],charcoalSeam=[162,174,187];
 const materialFamily=i=>{
  if(!adaptiveOutlines||i<0)return 'legacy';
  const p=i*4,r=basePigments[p],g=basePigments[p+1],b=basePigments[p+2];
  if((r*.299+g*.587+b*.114)<112)return 'dark';
  if(r>g+25&&Math.abs(g-b)<30&&g>98&&g<215)return 'rose';
  return 'ivory';
 };
 const adaptiveInk=(i,detail=false)=>{
  const kind=materialFamily(i);
  if(kind==='dark')return detail?charcoalSeam:darkEdge;
  if(kind==='rose')return roseEdge;
  if(kind==='ivory')return warmEdge;
  return detail?detailInk:edgeInk;
 };
 const protectedParts=new Set(['eye','sparkle','sparkleSmall','nostril','tear','lid','mouth']);
 const seamParts=new Set(['muzzle','ear','innerEar','horn','hoof0','hoof1','hoof2','hoof3','eyeBorder','cheek','mouth','tailTuft','brow','foreheadMark']);
 // Each detail owns the higher rank. Ink is placed on the neighboring LOWER
 // rank surface, preserving the muzzle, eyes, horns and original detail pixels.
 const rank=part=>{
  if(part==='body')return 1;
  if(part==='head'||part==='tail'||/^leg[0-3]$/.test(part)||/^thigh[0-3]$/.test(part))return 2;
  if(part==='ear'||part==='fringe'||/^(hoof|foot|wing|flipper|hand|arm)[0-3]?$/.test(part))return 3;
  if(['innerEar','muzzle','horn','cheek','eyeBorder','foreheadMark','tailTuft','fringeDetail','backSpine','spike','beak','belly','chest','snoutRim','lowerJaw'].includes(part))return 4;
  if(['muzzleHighlight','fringeLock','brow'].includes(part))return 5;
  return protectedParts.has(part)?6:0;
 };
 const colorPixel=(i,ink)=>{const p=i*4;pixels[p]=ink[0];pixels[p+1]=ink[1];pixels[p+2]=ink[2];pixels[p+3]=255;outlined++;
  if(ink===darkEdge)adaptiveDarkOutlined++;};
 for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
  const i=y*width+x;
  if(!mask[i])continue;
  const adjacent=[i-1,i+1,i-width,i+width];
  const outer=adjacent.some(j=>!mask[j]);
  const protectedFeature=protectFeatures&&protectedParts.has(parts[i]);
  if(outer){if(!protectedFeature)colorPixel(i,adaptiveOutlines?adaptiveInk(i):edgeInk);continue;}
  if(detailOutlines&&!protectedParts.has(parts[i])){
   const currentRank=rank(parts[i]);
   // Only visible anatomy boundaries are inked. Flat coat triangles remain
   // continuous, and there is no per-polygon outlining or temporal dithering.
   const details=adjacent.filter(j=>mask[j]&&parts[j]!==parts[i]&&rank(parts[j])>currentRank&&rank(parts[j])>=3);
   if(details.length){
    colorPixel(i,adaptiveOutlines?adaptiveInk(i,true):
     details.some(j=>rank(parts[j])>=4)?detailInk:softDetailInk);
    detailOutlined++;continue;
   }
  }
  const seam=!detailOutlines&&seamParts.has(parts[i])&&adjacent.some(j=>mask[j]&&parts[j]!==parts[i]);
  if(seam&&!protectedFeature)colorPixel(i,adaptiveOutlines?adaptiveInk(i,true):seamInk);
 }
 // Draw silhouette outside the model without erasing anatomy. Both rings are
 // computed from the original depth mask, not from the already-painted ink.
 const outside=new Uint8Array(width*height),ringMaterial=new Int32Array(width*height).fill(-1);
 for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
  const i=y*width+x;if(mask[i])continue;
  const neighbor=[i-1,i+1,i-width,i+width].find(j=>mask[j]);
  if(neighbor!==undefined){
   outside[i]=1;ringMaterial[i]=neighbor;
   colorPixel(i,adaptiveOutlines?adaptiveInk(neighbor):edgeInk);
  }
 }
 if(outlineWidth>=2){
  for(let y=2;y<height-2;y++)for(let x=2;x<width-2;x++){
   const i=y*width+x;if(mask[i]||outside[i])continue;
   const neighbor=[i-1,i+1,i-width,i+width].find(j=>outside[j]);
   if(neighbor!==undefined)
    colorPixel(i,adaptiveOutlines?adaptiveInk(ringMaterial[neighbor]):edgeInk);
  }
 }
 ctx.putImageData(image,0,0);
 return {painted,textured,outlined,detailOutlined,materialPixels,cleanedPixels,adaptiveDarkOutlined};
}
