// Real volumetric procedural cow mesh for the OWNER-ONLY laboratory.
// Mesh surfaces are 3D triangles with perspective projection, depth ordering and indexed pixel shading.
// No billboard sprites or paid dependencies; intentionally isolated from gameplay.
import {loadCowDetailedTexture,detailedCowPixel,cowDetailedTextureReady,drawCowDetailedReference,detailedCowPigment} from './lab-cow3d-texture.js';
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
   const contour=opts.shape==='skull'?1+.20*Math.exp(-Math.pow((localY+.30)/.38,2))-.11*Math.exp(-Math.pow((localY-.77)/.26,2)):1;
   const faceDepth=opts.shape==='skull'?.10*Math.exp(-Math.pow((localY+.20)/.48,2)):0;
   return [c[0]+r[0]*contour*Math.sin(ph)*Math.cos(th),c[1]+r[1]*Math.cos(ph),c[2]+(r[2]+faceDepth)*Math.sin(ph)*Math.sin(th)];};
  const pts=[point(i/cols,j/rows),point((i+1)/cols,j/rows),point((i+1)/cols,(j+1)/rows),point(i/cols,(j+1)/rows)];
  for(const tri of [[0,1,2],[0,2,3]]){
   const p=tri.map(k=>pts[k]);
   const center=p.reduce((a,q)=>vadd(a,q),[0,0,0]).map(x=>x/3);
   const n=[(center[0]-c[0])/r[0],(center[1]-c[1])/r[1],(center[2]-c[2])/r[2]];
   let ink=color;
   if(opts.patch&&opts.patch(n,center))ink=opts.patchColor||palette.brown;
   if(['body','head','leg0','leg1','leg2','leg3'].includes(opts.part))ink=detailedCowPigment(opts.part,center,n,ink);
   parts.push({points:p,texPoints:p,normal:n,ink:opts.part==='eye'||opts.part==='sparkle'?ink:furTone(ink,center),part:opts.part||'body'});
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
 sphere(tris,[0,1.07,-.23],[.67*breath,.53,.68],palette.cream,{part:'body',patch:cowPatch});
 for(let i=0;i<4;i++){
  const left=i%2===0,front=i<2;
  const x=left?-.43:.43,z=front?.38:-.46;
  const phase=t*.009+(left?0:Math.PI)+(front?0:Math.PI);
  const lift=walk?Math.max(0,Math.sin(phase))*.19:wave&&i===1?.25*Math.max(0,Math.sin(t*.008)):0;
  sphere(tris,[x,.43+lift,z],[.23,.32,.245],palette.cream,{part:'leg'+i});
  sphere(tris,[x,.18+lift,z+.02],[.245,.13,.255],palette.hoof,{part:'hoof'+i});
 }
 // Head group: independently rotates in a genuine 3D frame about the neck.
 const head=[];
 sphere(head,[0,.02,.07],[.75,.66,.60],palette.cream,{part:'head',shape:'skull',patch:(n,c)=>((c[0]<-.31&&c[1]>.0)||(c[0]>.35&&c[1]>.16))&&c[2]<.43});
 sphere(head,[0,-.27,.63],[.52,.27,.32],palette.pink,{part:'muzzle'});
 sphere(head,[0,-.21,.81],[.38,.18,.07],'#f4b0a9',{part:'muzzleHighlight'});
 sphere(head,[0,-.40,.65],[.21,.055,.085],palette.rose,{part:'mouth'});
 for(const side of [-1,1]){
  sphere(head,[side*.74,.28,.03],[.42,.19,.16],palette.brown,{part:'ear'});
  sphere(head,[side*.76,.28,.18],[.30,.11,.065],palette.rose,{part:'innerEar'});
  cylinder(head,[side*.34,.48,.03],[side*.37,.82,.01],.16,.035,palette.horn,'horn');
  sphere(head,[side*.46,-.22,.48],[.19,.13,.12],palette.pink,{part:'cheek'});
  sphere(head,[side*.25,.085,.59],[.175,.19,.087],palette.dark,{part:'eyeBorder'});
  if(!pose.blink){
   sphere(head,[side*.25,.085,.677],[.132,.155,.070],palette.eye,{part:'eye'});
   sphere(head,[side*.25-.055,.165,.741],[.038,.045,.019],palette.shine,{part:'sparkle'});
   sphere(head,[side*.25+.055,.02,.743],[.018,.021,.013],palette.shine,{part:'sparkleSmall'});
  }else{
   sphere(head,[side*.25,.095,.674],[.159,.030,.040],palette.dark,{part:'lid'});
  }
  sphere(head,[side*.19,-.19,.814],[.065,.045,.018],palette.rose,{part:'nostril'});
 }
 sphere(head,[-.09,.54,.35],[.33,.20,.27],palette.white,{part:'fringe'});
 sphere(head,[.06,.60,.29],[.21,.13,.20],palette.white,{part:'fringeDetail'});
 sphere(head,[-.25,.50,.46],[.12,.13,.14],'#fdf1d6',{part:'fringeLock'});
 const neck=[0,1.45,.52];
 for(const tri of head)tris.push({...tri,normal:spin(tri.normal,headYaw),points:tri.points.map(p=>vadd(spin([p[0]*1.15,p[1]*1.09,p[2]*1.08],headYaw),[neck[0],neck[1]+headBob,neck[2]]))});
 // A distinct 3D articulated tail, not a plane.
 const sway=Math.sin(t*.004)*.3;
 cylinder(tris,[0,1.12,-.67],[sway,1.34,-1.09],.10,.065,palette.cream,'tail');
 sphere(tris,[sway,1.34,-1.13],[.16,.18,.17],palette.brown,{part:'tailTuft'});
 const crouch=sleep?.39:1;
 return tris.map(tri=>({...tri,points:tri.points.map(p=>[p[0],p[1]*crouch,p[2]])}));
}
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
export function drawCow3D(canvas,pose={}){
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const w=256,h=192;canvas.width=w;canvas.height=h;ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='#e8dfcc';ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#d3c8b1';ctx.beginPath();ctx.ellipse(w/2,160,57,13,0,0,Math.PI*2);ctx.fill();
 const yaw=rad(Number(pose.yaw)||0),pitch=rad(7),scale=54;
 const project=p=>{const q=spin(p,yaw),y=q[1]*Math.cos(pitch)-q[2]*Math.sin(pitch),z=q[1]*Math.sin(pitch)+q[2]*Math.cos(pitch);const perspective=6/(6-z*.19);return [w/2+q[0]*scale*perspective,148-y*scale*perspective,z];};
 const faces=buildCow3D(pose).map(tri=>{const v=tri.points.map(project);return {v,normal:spin(tri.normal,yaw),ink:tri.ink,part:tri.part,texPoints:tri.texPoints,z:v.reduce((s,q)=>s+q[2],0)/3};}).sort((a,b)=>a.z-b.z);
 const light=[-.43,.71,.52];
 for(const f of faces){
  const [a,b,c]=f.v,ab=[b[0]-a[0],b[1]-a[1]],ac=[c[0]-a[0],c[1]-a[1]];
  const area=ab[0]*ac[1]-ab[1]*ac[0];if(Math.abs(area)<.12)continue;
  const center=f.v.reduce((v,p)=>[v[0]+p[0]/3,v[1]+p[1]/3],[0,0]);
  const base=rgb(f.ink),normal=f.normal||[0,0,1];
  const sunlight=Math.max(0,normal[0]*light[0]+normal[1]*light[1]+normal[2]*light[2]);
  const shade=clamp(Math.round((.88+sunlight*.15)*8)/8,.82,1.08);
  const r=base.map(n=>Math.round(clamp(n*shade,0,255)));
  ctx.fillStyle='rgb('+r.join(',')+')';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath();ctx.fill();
  // Nearest-neighbor raster paint. Pixels sample positions across each projected
  // triangle, rather than assigning one atlas color to the whole polygon.
  if(cowDetailedTextureReady()&&f.texPoints&&['head','body'].includes(f.part)&&f.normal[2]>.20){
   const minX=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0])/2)*2),maxX=Math.min(w-1,Math.ceil(Math.max(a[0],b[0],c[0])/2)*2);
   const minY=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1])/2)*2),maxY=Math.min(h-1,Math.ceil(Math.max(a[1],b[1],c[1])/2)*2);
   const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
   if(Math.abs(den)<.001)continue;
   for(let y=minY;y<=maxY;y+=2)for(let x=minX;x<=maxX;x+=2){
    const l0=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/den;
    const l1=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/den;
    const l2=1-l0-l1;
    if(l0<0||l1<0||l2<0)continue;
    const pos=[0,1,2].map(k=>f.texPoints[0][k]*l0+f.texPoints[1][k]*l1+f.texPoints[2][k]*l2);
    const ink=detailedCowPigment(f.part,pos,[0,0,1],f.ink);
    if(ink===f.ink)continue;
    ctx.fillStyle=ink;ctx.fillRect(x,y,2,2);
   }
  }
 }
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
