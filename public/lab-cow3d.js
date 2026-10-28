// Real volumetric procedural cow mesh for the OWNER-ONLY laboratory.
// Mesh surfaces are 3D triangles with perspective projection, depth ordering and indexed pixel shading.
// No billboard sprites or paid dependencies; intentionally isolated from gameplay.
export const cow3DParts=Object.freeze(['body','head','muzzle','ears','horns','eyes','four legs','tail']);
const palette={cream:'#f8e8c9',white:'#fff1da',brown:'#845039',dark:'#482b25',pink:'#ed9b9b',rose:'#bf6c75',hoof:'#50362d',horn:'#ecd5a2',eye:'#251d1a',shine:'#fff9ef'};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rad=n=>n*Math.PI/180;
const vadd=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const spin=(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return [p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c];};
function sphere(parts,c,r,color,opts={}){
 const rows=opts.rows||9,cols=opts.cols||14;
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const point=(u,v)=>{const ph=v*Math.PI,th=u*Math.PI*2;return [c[0]+r[0]*Math.sin(ph)*Math.cos(th),c[1]+r[1]*Math.cos(ph),c[2]+r[2]*Math.sin(ph)*Math.sin(th)];};
  const pts=[point(i/cols,j/rows),point((i+1)/cols,j/rows),point((i+1)/cols,(j+1)/rows),point(i/cols,(j+1)/rows)];
  for(const tri of [[0,1,2],[0,2,3]]){
   const p=tri.map(k=>pts[k]);
   const center=p.reduce((a,q)=>vadd(a,q),[0,0,0]).map(x=>x/3);
   const n=[(center[0]-c[0])/r[0],(center[1]-c[1])/r[1],(center[2]-c[2])/r[2]];
   let ink=color;
   if(opts.patch&&opts.patch(n,center))ink=opts.patchColor||palette.brown;
   parts.push({points:p,ink,part:opts.part||'body'});
  }
 }
}
function cylinder(parts,start,end,r1,r2,color,part='tail'){
 const n=9;for(let i=0;i<n;i++){
  const a=i*Math.PI*2/n,b=(i+1)*Math.PI*2/n;
  const ring=(c,r,t)=>[c[0]+Math.cos(t)*r,c[1],c[2]+Math.sin(t)*r];
  const p=[ring(start,r1,a),ring(start,r1,b),ring(end,r2,b),ring(end,r2,a)];
  parts.push({points:[p[0],p[1],p[2]],ink:color,part},{points:[p[0],p[2],p[3]],ink:color,part});
 }
}
export function buildCow3D(pose={}){
 const tris=[],t=Number(pose.time)||0,headYaw=rad(clamp(pose.headYaw??0,-55,55)),headBob=Math.sin(t*.002)*.025;
 const walk=pose.action==='walk',wave=pose.action==='wave',sleep=pose.action==='sleep';
 const breath=1+Math.sin(t*.0025)*.018;
 sphere(tris,[0,1.12,0],[.84*breath,.69,.62],palette.cream,{part:'body',patch:(n,c)=>((c[0]<-.34&&c[2]>.05)||(c[0]>.40&&c[2]<-.12)||(c[1]>1.45&&c[0]<-.12))});
 for(let i=0;i<4;i++){
  const left=i%2===0,front=i<2;
  const x=left?-.52:.52,z=front?.40:-.40;
  const phase=t*.009+(left?0:Math.PI)+(front?0:Math.PI);
  const lift=walk?Math.max(0,Math.sin(phase))*.19:wave&&i===1?.25*Math.max(0,Math.sin(t*.008)):0;
  sphere(tris,[x,.59+lift,z],[.25,.46,.24],palette.cream,{part:'leg'+i});
  sphere(tris,[x,.23+lift,z+.02],[.25,.16,.25],palette.hoof,{part:'hoof'+i});
 }
 // Head group: independently rotates in a genuine 3D frame about the neck.
 const head=[];
 sphere(head,[0,0,.07],[.65,.60,.57],palette.cream,{part:'head',patch:(n,c)=>c[1]>.1&&Math.abs(c[0])>.43});
 sphere(head,[0,-.19,.58],[.43,.285,.255],palette.pink,{part:'muzzle'});
 for(const side of [-1,1]){
  sphere(head,[side*.56,.31,.09],[.34,.225,.16],palette.brown,{part:'ear'});
  sphere(head,[side*.57,.32,.20],[.24,.14,.06],palette.rose,{part:'innerEar'});
  cylinder(head,[side*.34,.48,.03],[side*.37,.82,.01],.16,.035,palette.horn,'horn');
  sphere(head,[side*.25,.085,.59],[.17,.19,.08],palette.dark,{part:'eyeBorder'});
  if(!pose.blink){
   sphere(head,[side*.25,.085,.655],[.114,.144,.065],palette.eye,{part:'eye'});
   sphere(head,[side*.25-.036,.145,.713],[.034,.037,.017],palette.shine,{part:'sparkle'});
  }else{
   sphere(head,[side*.25,.095,.651],[.12,.035,.035],palette.dark,{part:'lid'});
  }
  sphere(head,[side*.19,-.19,.814],[.065,.045,.018],palette.rose,{part:'nostril'});
 }
 sphere(head,[-.09,.54,.35],[.30,.17,.25],palette.white,{part:'fringe'});
 const neck=[0,1.66,.41];
 for(const tri of head)tris.push({...tri,points:tri.points.map(p=>vadd(spin(p,headYaw),[neck[0],neck[1]+headBob,neck[2]]))});
 // A distinct 3D articulated tail, not a plane.
 const sway=Math.sin(t*.004)*.3;
 cylinder(tris,[0,1.20,-.58],[sway,1.44,-1.05],.10,.065,palette.cream,'tail');
 sphere(tris,[sway,1.44,-1.09],[.16,.18,.17],palette.brown,{part:'tailTuft'});
 const crouch=sleep?.39:1;
 return tris.map(tri=>({...tri,points:tri.points.map(p=>[p[0],p[1]*crouch,p[2]])}));
}
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
export function drawCow3D(canvas,pose={}){
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const w=192,h=144;canvas.width=w;canvas.height=h;ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='#e8dfcc';ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#d3c8b1';ctx.beginPath();ctx.ellipse(w/2,119,46,11,0,0,Math.PI*2);ctx.fill();
 const yaw=rad(Number(pose.yaw)||0),pitch=rad(13),scale=44;
 const project=p=>{const q=spin(p,yaw),y=q[1]*Math.cos(pitch)-q[2]*Math.sin(pitch),z=q[1]*Math.sin(pitch)+q[2]*Math.cos(pitch);const perspective=6/(6-z*.19);return [w/2+q[0]*scale*perspective,112-y*scale*perspective,z];};
 const faces=buildCow3D(pose).map(tri=>{const v=tri.points.map(project);return {v,ink:tri.ink,part:tri.part,z:v.reduce((s,q)=>s+q[2],0)/3};}).sort((a,b)=>a.z-b.z);
 const light=[-.43,.71,.52];
 for(const f of faces){
  const [a,b,c]=f.v,ab=[b[0]-a[0],b[1]-a[1]],ac=[c[0]-a[0],c[1]-a[1]];
  const area=ab[0]*ac[1]-ab[1]*ac[0];if(Math.abs(area)<.12)continue;
  const center=f.v.reduce((v,p)=>[v[0]+p[0]/3,v[1]+p[1]/3],[0,0]);
  const base=rgb(f.ink),shade=clamp(.76+(area>0?.11:-.06)+Math.sin(center[0]*.13+center[1]*.17)*.035,.61,1.13);
  const r=base.map(n=>Math.round(clamp(n*shade,0,255)));
  ctx.fillStyle='rgb('+r.join(',')+')';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath();ctx.fill();
 }
 canvas.dataset.cow3dFaces=String(faces.length);
 canvas.dataset.cow3dReady='true';
 return faces.length;
}
export function mountCow3DLab(root=document){
 const canvas=root.getElementById('cow3d-stage');if(!canvas)return;
 const get=id=>root.getElementById(id);
 let playing=true,last=0,time=0;
 const render=()=>{const action=get('cow3d-action').value;drawCow3D(canvas,{yaw:Number(get('cow3d-yaw').value),headYaw:action==='turn'?Math.sin(time*.002)*50:Number(get('cow3d-head').value),blink:action==='blink'&&(time%2100>1850),action,time});get('cow3d-status').textContent='Справжня 3D-геометрія · '+canvas.dataset.cow3dFaces+' трикутників · модель dog (Корівка) · owner-only';};
 get('cow3d-play').addEventListener('change',e=>{playing=e.target.checked;});
 for(const id of ['cow3d-yaw','cow3d-head','cow3d-action'])get(id).addEventListener('input',render);
 get('cow3d-save').addEventListener('click',()=>{render();const a=root.createElement('a');a.download='cow-3d-owner-lab.png';a.href=canvas.toDataURL('image/png');a.click();});
 function tick(now){time+=playing?Math.min(60,Math.max(0,now-(last||now))):0;last=now;render();requestAnimationFrame(tick);}
 requestAnimationFrame(tick);return {render};
}
if(typeof document!=='undefined'&&document.getElementById('cow3d-stage'))window.addEventListener('load',()=>mountCow3DLab());
