// Shared age treatment for both classic and detailed actor canvases.
// The source sprite and its silhouette are never changed or replaced.
export function applySeniorPatina(canvas,age){
 if(age!=='Старенький'||!canvas)return false;
 const c=canvas.getContext('2d'),image=c.getImageData(0,0,canvas.width,canvas.height),d=image.data;
 for(let i=0;i<d.length;i+=4){
  if(!d[i+3])continue;
  const shade=d[i]*.299+d[i+1]*.587+d[i+2]*.114;
  d[i]=Math.min(255,Math.round(d[i]*.48+shade*.52+2));
  d[i+1]=Math.min(255,Math.round(d[i+1]*.48+shade*.52+2));
  d[i+2]=Math.min(255,Math.round(d[i+2]*.48+shade*.52+2));
 }
 c.putImageData(image,0,0);
 return true;
}
