// Build isolated canvas sprites once, never resample neighboring atlas cells.
export function isolateSprite(image,rect,grid){
 const [rx,ry,rw,rh]=rect,[gw,gh]=grid||[image.width,image.height],cx=Math.floor((rx+rw/2)/gw),cy=Math.floor((ry+rh/2)/gh);
 const x=Math.max(rx,Math.ceil(cx*gw)),y=Math.max(ry,Math.ceil(cy*gh)),w=Math.min(rx+rw,Math.floor((cx+1)*gw))-x,h=Math.min(ry+rh,Math.floor((cy+1)*gh))-y;
 const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d',{willReadFrequently:true});c.drawImage(image,x,y,w,h,0,0,w,h);
 const pixels=c.getImageData(0,0,w,h),d=pixels.data;
 // Furniture atlases contain bright red/green edge specks absent from the art palette.
 if(!grid)for(let p=0;p<d.length;p+=4)if(d[p]>180&&d[p+1]<60&&d[p+2]<70||d[p+1]>180&&d[p]<60&&d[p+2]<80)d[p+3]=0;
 const seen=new Uint8Array(w*h),parts=[];
 for(let p=0;p<seen.length;p++){if(seen[p]||d[p*4+3]<96)continue;const queue=[p];seen[p]=1;let left=w,top=h,right=0,bottom=0;for(let i=0;i<queue.length;i++){const q=queue[i],xx=q%w,yy=Math.floor(q/w);left=Math.min(left,xx);right=Math.max(right,xx);top=Math.min(top,yy);bottom=Math.max(bottom,yy);for(const n of [xx>0?q-1:-1,xx<w-1?q+1:-1,yy>0?q-w:-1,yy<h-1?q+w:-1])if(n>=0&&!seen[n]&&d[n*4+3]>=96){seen[n]=1;queue.push(n);}}parts.push({queue,left,top,right,bottom});}
 parts.sort((a,b)=>b.queue.length-a.queue.length);const main=parts[0];if(!main)return cv;const keep=new Uint8Array(w*h);let left=w,top=h,right=0,bottom=0;
 for(const p of parts){const gap=Math.max(main.left-p.right,p.left-main.right,main.top-p.bottom,p.top-main.bottom,0);if(p!==main&&(p.queue.length<Math.max(12,main.queue.length*.008)||gap>6))continue;for(const q of p.queue)keep[q]=1;left=Math.min(left,p.left);top=Math.min(top,p.top);right=Math.max(right,p.right);bottom=Math.max(bottom,p.bottom);}
 for(let p=0;p<keep.length;p++)d[p*4+3]=keep[p]?255:0;c.putImageData(pixels,0,0);
 const out=document.createElement('canvas');out.width=right-left+1;out.height=bottom-top+1;out.getContext('2d').drawImage(cv,left,top,out.width,out.height,0,0,out.width,out.height);return out;
}
