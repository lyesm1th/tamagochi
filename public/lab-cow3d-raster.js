// Owner-only pixel rasterizer: one depth-tested pixel wins, including eyes,
// horns and authentic Detailed pigment. No overpainting across mesh layers.
export function renderCowMeshPixels(ctx,faces,{width,height,pigment,textureReady}){
 const image=ctx.getImageData(0,0,width,height);
 const pixels=image.data,depth=new Float32Array(width*height).fill(-Infinity);
 let painted=0,textured=0;
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
  const allowTexture=textureReady&&face.texPoints&&['head','body'].includes(face.part)&&normal[2]>.20;
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
    const pos=[0,1,2].map(k=>face.texPoints[0][k]*l0+face.texPoints[1][k]*l1+face.texPoints[2][k]*l2);
    ink=pigment(face.part,pos,normal,color);
    if(ink!==color)textured++;
   }
   const p=index*4;
   for(let k=0;k<3;k++)pixels[p+k]=Math.round(Math.max(0,Math.min(255,parseInt(ink.slice(1+k*2,3+k*2),16)*shade)));
   pixels[p+3]=255;depth[index]=z;painted++;
  }
 }
 ctx.putImageData(image,0,0);
 return {painted,textured};
}
