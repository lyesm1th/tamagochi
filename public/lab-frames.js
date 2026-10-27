// Pure RGBA comparison; captured frames remain local to the private lab.
export function frameDifference(a,b){
 if(a.length!==b.length||a.length%4)throw new RangeError('Frame sizes must match');
 const pixels=new Uint8ClampedArray(a.length);let changed=0;
 for(let i=0;i<a.length;i+=4){const delta=Math.max(...[0,1,2,3].map(k=>Math.abs(a[i+k]-b[i+k])));if(delta)changed++;pixels[i]=delta?255:0;pixels[i+1]=delta?0:Math.round(b[i+1]*.2);pixels[i+2]=delta?100:0;pixels[i+3]=255;}
 return {changed,pixels};
}
