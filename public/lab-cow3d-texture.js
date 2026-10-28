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
// Local anatomy-space planar UV, anchored to each mesh part rather than the
// camera or the rotating world-space vertices. The source is the real Detailed atlas.
export function cowPartUV(part,point){
 if(part==='head')return [.5+point[0]/2.10,.35-point[1]/2.50];
 if(part==='body')return [.5+point[0]/2.3,.78-(point[1]-1.1)/2.2];
 return [.5+point[0]/2.15,.91-(point[1]-.5)/1.25];
}
export function sampleCowAtlasUV(part,uv,normal){
 if(!texture||normal[2]<.28||!['head','body','leg0','leg1','leg2','leg3'].includes(part))return null;
 const u=Math.max(0,Math.min(1,uv[0])),v=Math.max(0,Math.min(1,uv[1]));
 const x=Math.round(u*(texture.width-1)),y=Math.round(v*(texture.height-1));
 const i=(y*texture.width+x)*4;
 if(texture.data[i+3]<180)return null;
 return '#'+[0,1,2].map(k=>texture.data[i+k].toString(16).padStart(2,'0')).join('');
}
export function detailedCowPixel(part,position,normal){
 return sampleCowAtlasUV(part,cowPartUV(part,position),normal);
}
// A deterministic atlas-to-mesh paint pass. Preserve source pixels as discrete
// pigment families instead of reducing the entire Detailed artwork to brightness.
export function detailedCowPigment(part,position,normal,base){
 return detailedCowPigmentUV(part,cowPartUV(part,position),normal,base);
}
export function detailedCowPigmentUV(part,uv,normal,base){
 const sampled=sampleCowAtlasUV(part,uv,normal);
 if(!sampled)return base;
 const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 const [r,g,b]=rgb(sampled),[br,bg,bb]=rgb(base);
 const warm=r>g*1.05&&g>b*1.06;
 const dark=(r+g+b)/3<123;
 const pink=r>g*1.24&&b>g*.75;
 // Eyes, shadows and outlines in the original atlas must not become coat markings.
 if(dark||pink||!warm)return base;
 const light=(r+g+b)/3;
 // Chunky, hand-picked Detailed coat palette. No continuous brown gradients:
 // preserve a few legible ink/cream/shadow ramps and the original patch map.
 if(light<177&&['head','body'].includes(part))return '#815039';
 if(light<193&&['head','body'].includes(part))return '#9f6749';
 if(light<210)return '#dcc49f';
 if(light<232)return '#f0d8b1';
 return '#f9e9c9';
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
