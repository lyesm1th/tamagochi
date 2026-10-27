// Local comparison only; neither captures nor QA metrics leave the browser.
import {frameDifference} from './lab-frames.js';
export function compareLabCanvases(detailed,pixel,output){
 const w=384,h=288;
 const source=document.createElement('canvas');source.width=w;source.height=h;
 const a=source.getContext('2d',{willReadFrequently:true});
 a.drawImage(detailed,0,0,w,h);
 const sourcePixels=a.getImageData(0,0,w,h);
 a.clearRect(0,0,w,h);a.drawImage(pixel,0,0,w,h);
 const pixelPixels=a.getImageData(0,0,w,h);
 const diff=frameDifference(sourcePixels.data,pixelPixels.data);
 output.width=w;output.height=h;
 const c=output.getContext('2d');const frame=c.createImageData(w,h);frame.data.set(diff.pixels);c.putImageData(frame,0,0);
 return {changed:diff.changed,total:w*h,percentage:Math.round(diff.changed/(w*h)*10000)/100};
}
export function mountLab25DCompare(root=document){
 const control=root.getElementById('pixel25d-compare');if(!control)return;
 control.addEventListener('click',()=>{
  try{
   const result=compareLabCanvases(root.getElementById('scene'),root.getElementById('pixel25d-stage'),root.getElementById('pixel25d-diff'));
   root.getElementById('pixel25d-diff-view').hidden=false;
   root.getElementById('pixel25d-diff-status').textContent=`Detailed vs Pixel 2.5D: ${result.changed} / ${result.total} changed pixels (${result.percentage}%). Differences are diagnostics, not quality scores.`;
  }catch(error){root.getElementById('pixel25d-diff-status').textContent='Comparison unavailable: '+error.message;}
 });
}
if(typeof document!=='undefined'&&document.getElementById('pixel25d-compare'))mountLab25DCompare();
