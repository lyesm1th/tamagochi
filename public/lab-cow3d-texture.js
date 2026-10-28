// Owner lab only: transfer the *actual* Detailed cow sprite palette and pixel placements
// to volumetric surfaces. Geometry remains 3D; source art is never used as a billboard.
import {detailedArt} from './detailed-art-manifest.js';
let texture=null,loading=null;
export function cowDetailedTextureReady(){return !!texture;}
export function loadCowDetailedTexture(){
 if(texture)return Promise.resolve(true);
 if(loading)return loading;
 if(typeof Image==='undefined'||typeof document==='undefined')return Promise.resolve(false);
 loading=new Promise(resolve=>{
  const atlas=detailedArt.adults,rect=atlas.cells.dog,image=new Image();
  image.onload=()=>{
   const canvas=document.createElement('canvas');canvas.width=rect[2];canvas.height=rect[3];
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,...rect,0,0,rect[2],rect[3]);
   const {data}=ctx.getImageData(0,0,rect[2],rect[3]);
   texture={data,width:rect[2],height:rect[3]};resolve(true);
  };
  image.onerror=()=>resolve(false);
  image.src=atlas.src;
 });
 return loading;
}
export function detailedCowPixel(part,position,normal){
 if(!texture)return null;
 // Only front-facing geometry uses the original front-view painting.
 // The flank and back retain procedural 3D coat, not stretched face pixels.
 if(normal[2]<.35||!['head','body','leg0','leg1','leg2','leg3'].includes(part))return null;
 let u,v;
 if(part==='head'){
  u=.5+position[0]/2.10;
  v=.35-position[1]/2.50;
 }else if(part==='body'){
  u=.5+position[0]/2.3;
  v=.78-(position[1]-1.1)/2.2;
 }else{
  u=.5+position[0]/2.15;
  v=.91-(position[1]-.5)/1.25;
 }
 const x=Math.max(0,Math.min(texture.width-1,Math.round(u*(texture.width-1))));
 const y=Math.max(0,Math.min(texture.height-1,Math.round(v*(texture.height-1))));
 // Median-sized pixel blocks keep the sprite grain visible on the curved polygon mesh.
 const i=(y*texture.width+x)*4,alpha=texture.data[i+3];
 if(alpha<180)return null;
 const [r,g,b]=[texture.data[i],texture.data[i+1],texture.data[i+2]];
 // Ignore nearly neutral transparent-mat artefacts, preserving the authentic palette.
 return '#'+[r,g,b].map(n=>n.toString(16).padStart(2,'0')).join('');
}

// A deterministic atlas-to-mesh paint pass. Preserve source pixels as discrete
// pigment families instead of reducing the entire Detailed artwork to brightness.
export function detailedCowPigment(part,position,normal,base){
 const sampled=detailedCowPixel(part,position,normal);
 if(!sampled)return base;
 const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 const [r,g,b]=rgb(sampled),[br,bg,bb]=rgb(base);
 const warm=r>g*1.05&&g>b*1.06;
 const dark=(r+g+b)/3<123;
 const pink=r>g*1.24&&b>g*.75;
 // Eyes, shadows and outlines in the original atlas must not become coat markings.
 if(dark||pink||!warm)return base;
 const light=(r+g+b)/3;
 // Apply actual warm pigment where the artwork has strong brown coat markings.
 if(light<185 && ['head','body'].includes(part))return '#906342';
 const delta=Math.max(-20,Math.min(18,Math.round((light-208)*.35)));
 return '#'+[br,bg,bb].map(v=>Math.max(0,Math.min(255,v+delta)).toString(16).padStart(2,'0')).join('');
}
export function drawCowDetailedReference(canvas){
 if(!canvas||!texture)return false;
 const c=canvas.getContext('2d');
 canvas.width=256;canvas.height=192;
 c.clearRect(0,0,256,192);c.imageSmoothingEnabled=false;
 c.fillStyle='#e8dfcc';c.fillRect(0,0,256,192);
 const scale=Math.min(150/texture.width,155/texture.height);
 const w=Math.round(texture.width*scale),h=Math.round(texture.height*scale);
 const raw=document.createElement('canvas');raw.width=texture.width;raw.height=texture.height;
 raw.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(texture.data),texture.width,texture.height),0,0);
 c.drawImage(raw,Math.round((256-w)/2),Math.round(176-h),w,h);
 canvas.dataset.cowDetailedReference='true';
 return true;
}
