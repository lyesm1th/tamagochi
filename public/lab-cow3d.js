// Real volumetric procedural cow mesh for the OWNER-ONLY laboratory.
// Mesh surfaces are 3D triangles with perspective projection, depth ordering and indexed pixel shading.
// No billboard sprites or paid dependencies; intentionally isolated from gameplay.
import {renderCowMeshPixels} from './lab-cow3d-raster.js';
import {loadCowDetailedTexture,detailedCowPixel,cowDetailedTextureReady,drawCowDetailedReference,detailedCowPigment,cowPartUV,detailedCowPigmentUV} from './lab-cow3d-texture.js';
export const cow3DParts=Object.freeze(['body','head','muzzle','ears','horns','eyes','four legs','tail']);
const palette={cream:'#f8e8c9',white:'#fff1da',brown:'#845039',dark:'#482b25',pink:'#ed9b9b',rose:'#bf6c75',hoof:'#50362d',horn:'#ecd5a2',eye:'#251d1a',shine:'#fff9ef'};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// World-space textile-like pixel noise, stable under head turns and body animation.
const hash3=(x,y,z)=>{const n=Math.sin(Math.floor(x*17)*127.1+Math.floor(y*17)*311.7+Math.floor(z*17)*74.7)*43758.5453;return n-Math.floor(n);};
const cowPatch=(n,c)=>{const ell=(x,y,z,rx,ry,rz)=>((c[0]-x)/rx)**2+((c[1]-y)/ry)**2+((c[2]-z)/rz)**2<1;
 return ell(-.43,1.27,.34,.30,.37,.35)||ell(.51,1.05,-.20,.37,.29,.30)||ell(-.18,1.54,-.38,.32,.27,.28);
};
const furTone=(ink,c)=>{if(!c)return ink;
 const grain=hash3(...c),d=grain>.975?5:grain<.025?-5:0;
 if(!d)return ink;
 const hex=ink.replace('#','');const rgb=[0,2,4].map(k=>clamp(parseInt(hex.slice(k,k+2),16)+d,0,255).toString(16).padStart(2,'0'));
 return '#'+rgb.join('');
};
const rad=n=>n*Math.PI/180;
const vadd=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const spin=(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return [p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c];};
// Preserve anatomy-specific painted color; the real Detailed atlas contributes only
// small local brightness variations. Its eyes/outline pixels must never become fur.
export function transferCowGrain(base,sampled){
 if(!sampled)return base;
 const parse=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 const a=parse(base),b=parse(sampled);
 const l=(x)=>x[0]*.299+x[1]*.587+x[2]*.114;
 const adjustment=clamp((l(b)-145)*.12,-13,13);
 return '#'+a.map(n=>Math.round(clamp(n+adjustment,0,255)).toString(16).padStart(2,'0')).join('');
}
function sphere(parts,c,r,color,opts={}){
 const rows=opts.rows||20,cols=opts.cols||32;
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const point=(u,v)=>{const ph=v*Math.PI,th=u*Math.PI*2;
   const localY=Math.cos(ph);
   // Anatomically sculpted skull instead of a generic ellipsoid:
   // broad cheek mass below the eyes, slimmer forehead and round jaw.
   const contour=opts.shape==='skull'?1+.34*Math.exp(-Math.pow((localY+.30)/.38,2))-.16*Math.exp(-Math.pow((localY-.77)/.26,2)):1;
   const faceDepth=opts.shape==='skull'?.10*Math.exp(-Math.pow((localY+.20)/.48,2)):0;
   return [c[0]+r[0]*contour*Math.sin(ph)*Math.cos(th),c[1]+r[1]*Math.cos(ph),c[2]+(r[2]+faceDepth)*Math.sin(ph)*Math.sin(th)];};
  const pts=[point(i/cols,j/rows),point((i+1)/cols,j/rows),point((i+1)/cols,(j+1)/rows),point(i/cols,(j+1)/rows)];
  for(const tri of [[0,1,2],[0,2,3]]){
   const p=tri.map(k=>pts[k]);
   const center=p.reduce((a,q)=>vadd(a,q),[0,0,0]).map(x=>x/3);
   const n=[(center[0]-c[0])/r[0],(center[1]-c[1])/r[1],(center[2]-c[2])/r[2]];
   let ink=color;
   if(opts.patch&&opts.patch(n,center))ink=opts.patchColor||palette.brown;
   // Pigment is now sampled only by per-pixel UV rasterizer, never baked as flat triangle colors.
   parts.push({points:p,texPoints:p,uv:p.map(q=>cowPartUV(opts.part||'body',q)),normal:n,ink:opts.part==='eye'||opts.part==='sparkle'?ink:furTone(ink,center),part:opts.part||'body'});
  }
 }
}
function cylinder(parts,start,end,r1,r2,color,part='tail'){
 const n=9;for(let i=0;i<n;i++){
  const a=i*Math.PI*2/n,b=(i+1)*Math.PI*2/n;
  const ring=(c,r,t)=>[c[0]+Math.cos(t)*r,c[1],c[2]+Math.sin(t)*r];
  const p=[ring(start,r1,a),ring(start,r1,b),ring(end,r2,b),ring(end,r2,a)];
  const normal=[Math.cos((a+b)/2),0,Math.sin((a+b)/2)];
  parts.push({points:[p[0],p[1],p[2]],normal,ink:color,part},{points:[p[0],p[2],p[3]],normal,ink:color,part});
 }
}
export function buildCow3D(pose={}){
 const tris=[],t=Number(pose.time)||0,headYaw=rad(clamp(pose.headYaw??0,-55,55)),headBob=Math.sin(t*.002)*.025;
 const walk=pose.action==='walk',wave=pose.action==='wave',sleep=pose.action==='sleep';
 const breath=1+Math.sin(t*.0025)*.018;
 sphere(tris,[0,1.07,-.30],[.90*breath,.64,.80],palette.cream,{part:'body',patch:cowPatch});
 for(let i=0;i<4;i++){
  const left=i%2===0,front=i<2;
  const x=left?-.49:.49,z=front?.28:-.66;
  const phase=t*.009+(left?0:Math.PI)+(front?0:Math.PI);
  const lift=walk?Math.max(0,Math.sin(phase))*.19:wave&&i===1?.25*Math.max(0,Math.sin(t*.008)):0;
  sphere(tris,[x,.43+lift,z],[.23,.32,.245],palette.cream,{part:'leg'+i});
  sphere(tris,[x,.18+lift,z+.02],[.245,.13,.255],palette.hoof,{part:'hoof'+i});
 }
 // Head group: independently rotates in a genuine 3D frame about the neck.
 const head=[];
 sphere(head,[0,.02,.07],[.75,.66,.60],palette.cream,{part:'head',shape:'skull'});
 sphere(head,[0,-.29,.62],[.57,.245,.27],palette.pink,{part:'muzzle'});
 sphere(head,[0,-.24,.84],[.43,.15,.055],'#f4b0a9',{part:'muzzleHighlight'});
 sphere(head,[0,-.43,.66],[.18,.038,.055],palette.rose,{part:'mouth'});
 for(const side of [-1,1]){
  sphere(head,[side*.74,.28,.03],[.42,.19,.16],palette.brown,{part:'ear'});
  sphere(head,[side*.76,.28,.18],[.30,.11,.065],palette.rose,{part:'innerEar'});
  cylinder(head,[side*.34,.48,.03],[side*.37,.82,.01],.16,.035,palette.horn,'horn');
  sphere(head,[side*.49,-.24,.47],[.15,.10,.08],palette.pink,{part:'cheek'});
  sphere(head,[side*.29,.11,.57],[.155,.17,.075],palette.dark,{part:'eyeBorder'});
  if(!pose.blink){
   sphere(head,[side*.29,.11,.655],[.113,.135,.056],palette.eye,{part:'eye'});
   sphere(head,[side*.29-.045,.17,.706],[.032,.039,.014],palette.shine,{part:'sparkle'});
   sphere(head,[side*.29+.048,.063,.708],[.015,.017,.010],palette.shine,{part:'sparkleSmall'});
  }else{
   sphere(head,[side*.29,.11,.657],[.14,.025,.031],palette.dark,{part:'lid'});
  }
  sphere(head,[side*.24,-.28,.902],[.055,.035,.018],palette.rose,{part:'nostril'});
 }
 sphere(head,[-.09,.54,.35],[.33,.20,.27],palette.white,{part:'fringe'});
 sphere(head,[.06,.60,.29],[.21,.13,.20],palette.white,{part:'fringeDetail'});
 sphere(head,[-.25,.50,.46],[.12,.13,.14],'#fdf1d6',{part:'fringeLock'});
 const neck=[0,1.65,.19];
 for(const tri of head)tris.push({...tri,normal:spin(tri.normal,headYaw),points:tri.points.map(p=>vadd(spin([p[0]*1.03,p[1]*1.00,p[2]*1.02],headYaw),[neck[0],neck[1]+headBob,neck[2]]))});
 // A distinct 3D articulated tail, not a plane.
 const sway=Math.sin(t*.004)*.3;
 cylinder(tris,[0,1.12,-1.03],[sway,1.34,-1.40],.10,.065,palette.cream,'tail');
 sphere(tris,[sway,1.34,-1.44],[.16,.18,.17],palette.brown,{part:'tailTuft'});
 const crouch=sleep?.39:1;
 return tris.map(tri=>({...tri,points:tri.points.map(p=>[p[0],p[1]*crouch,p[2]])}));
}
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
export function drawCow3D(canvas,pose={}){
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const pixelScale=2,w=256/pixelScale,h=192/pixelScale;canvas.width=w;canvas.height=h;ctx.imageSmoothingEnabled=false;
 canvas.style.imageRendering='pixelated';
 ctx.fillStyle='#e8dfcc';ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#d3c8b1';ctx.beginPath();ctx.ellipse(w/2,160/pixelScale,57/pixelScale,13/pixelScale,0,0,Math.PI*2);ctx.fill();
 const yaw=rad(Number(pose.yaw)||0),pitch=rad(7),scale=54/pixelScale;
 const project=p=>{const q=spin(p,yaw),y=q[1]*Math.cos(pitch)-q[2]*Math.sin(pitch),z=q[1]*Math.sin(pitch)+q[2]*Math.cos(pitch);const perspective=6/(6-z*.19);return [w/2+q[0]*scale*perspective,148/pixelScale-y*scale*perspective,z];};
 const faces=buildCow3D(pose).map(tri=>{const v=tri.points.map(project);return {v,normal:spin(tri.normal,yaw),ink:tri.ink,part:tri.part,texPoints:tri.texPoints,uv:tri.uv,z:v.reduce((s,q)=>s+q[2],0)/3};}).sort((a,b)=>a.z-b.z);
 const rendered=renderCowMeshPixels(ctx,faces,{width:w,height:h,pigment:detailedCowPigment,uvPigment:detailedCowPigmentUV,textureReady:cowDetailedTextureReady()});
 canvas.dataset.cow3dPixelScale=String(pixelScale);
 canvas.dataset.cow3dPainted=String(rendered.painted);
 canvas.dataset.cow3dOutlinePixels=String(rendered.outlined);
 canvas.dataset.cow3dTexturedPixels=String(rendered.textured);
 canvas.dataset.cow3dFaces=String(faces.length);
 canvas.dataset.cow3dReady='true';
 canvas.dataset.cow3dTextured=String(cowDetailedTextureReady());
 return faces.length;
}
export function mountCow3DLab(root=document){
 const canvas=root.getElementById('cow3d-stage');if(!canvas)return;
 const get=id=>root.getElementById(id);
 let playing=false,last=0,time=0,lastPaint=-1000;
 const render=()=>{const action=get('cow3d-action').value;drawCow3D(canvas,{yaw:Number(get('cow3d-yaw').value),headYaw:action==='turn'?Math.sin(time*.002)*50:Number(get('cow3d-head').value),blink:action==='blink'&&(time%2100>1850),action,time});get('cow3d-status').textContent=(cowDetailedTextureReady()?'Detailed sprite texture · ':'Підготовка Detailed texture · ')+ '3D-геометрія · '+canvas.dataset.cow3dFaces+' трикутників · модель dog (Корівка) · owner-only';};
 get('cow3d-play').addEventListener('change',e=>{playing=e.target.checked;});
 for(const id of ['cow3d-yaw','cow3d-head','cow3d-action'])get(id).addEventListener('input',render);
 get('cow3d-save').addEventListener('click',()=>{render();const a=root.createElement('a');a.download='cow-3d-owner-lab.png';a.href=canvas.toDataURL('image/png');a.click();});
 function tick(now){time+=playing?Math.min(60,Math.max(0,now-(last||now))):0;last=now;
  if(playing&&now-lastPaint>=90&&canvas.isConnected&&!canvas.closest('[hidden]')){render();lastPaint=now;}
  requestAnimationFrame(tick);}
 render();
 loadCowDetailedTexture().then(()=>{render();drawCowDetailedReference(get('cow3d-reference'));});
 requestAnimationFrame(tick);return {render};
}
if(typeof document!=='undefined'&&document.getElementById('cow3d-stage'))window.addEventListener('load',()=>mountCow3DLab());
