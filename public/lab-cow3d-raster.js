// Owner-only pixel rasterizer: one depth-tested pixel wins, including eyes,
// horns and authentic Detailed pigment. No overpainting across mesh layers.
export function renderCowMeshPixels(ctx,faces,{width,height,pigment,uvPigment,textureReady,outlineWidth=1}){
 const image=ctx.getImageData(0,0,width,height);
 const pixels=image.data,depth=new Float32Array(width*height).fill(-Infinity);
 let painted=0,textured=0;
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
  const shade=Math.max(.82,Math.min(1.08,Math.round((.88+sun*.15)*8)/8));
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
   const p=index*4;
   for(let k=0;k<3;k++)pixels[p+k]=Math.round(Math.max(0,Math.min(255,parseInt(ink.slice(1+k*2,3+k*2),16)*shade)));
   pixels[p+3]=255;depth[index]=z;mask[index]=1;parts[index]=face.part;painted++;
  }
 }
 // Pixel-art contour: outer ink and restrained contact seams, drawn from the
 // final depth-tested visible part IDs, not polygon edges (no triangle grid).
 let outlined=0;
 const edgeInk=[57,35,31],seamInk=[106,65,52];
 const seamParts=new Set(['muzzle','ear','innerEar','horn','hoof0','hoof1','hoof2','hoof3','eyeBorder','cheek','mouth','tailTuft']);
 for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
  const i=y*width+x;
  if(!mask[i])continue;
  const adjacent=[i-1,i+1,i-width,i+width];
  const outer=adjacent.some(j=>!mask[j]);
  const seam=!outer&&seamParts.has(parts[i])&&adjacent.some(j=>mask[j]&&parts[j]!==parts[i]);
  if(!outer&&!seam)continue;
  const ink=outer?edgeInk:seamInk;
  const p=i*4;
  pixels[p]=ink[0];pixels[p+1]=ink[1];pixels[p+2]=ink[2];
  outlined++;
 }
 // Fill one-pixel exterior ring only where background is visible. This keeps
 // the silhouette crisp without enlarging or hiding facial details.
 for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
  const i=y*width+x;if(mask[i])continue;
  if(![i-1,i+1,i-width,i+width].some(j=>mask[j]))continue;
  const p=i*4;pixels[p]=edgeInk[0];pixels[p+1]=edgeInk[1];pixels[p+2]=edgeInk[2];pixels[p+3]=255;outlined++;
 }
 // At ×2 add a second *external* contour ring. Never paint over the
 // source geometry or face: eyes and the silhouette remain readable.
 if(outlineWidth>=2){
  const outside=new Uint8Array(width*height);
  for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
   const i=y*width+x;if(mask[i])continue;
   if([i-1,i+1,i-width,i+width].some(j=>mask[j]))outside[i]=1;
  }
  for(let y=2;y<height-2;y++)for(let x=2;x<width-2;x++){
   const i=y*width+x;if(mask[i]||outside[i])continue;
   if(![i-1,i+1,i-width,i+width].some(j=>outside[j]))continue;
   const p=i*4;pixels[p]=edgeInk[0];pixels[p+1]=edgeInk[1];pixels[p+2]=edgeInk[2];pixels[p+3]=255;outlined++;
  }
 }
 ctx.putImageData(image,0,0);
 return {painted,textured,outlined};
}
