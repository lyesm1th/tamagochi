// Real volumetric procedural cow mesh for the OWNER-ONLY laboratory.
// Mesh surfaces are 3D triangles with perspective projection, depth ordering and indexed pixel shading.
// No billboard sprites or paid dependencies; intentionally isolated from gameplay.
import {renderCowMeshPixels} from './lab-cow3d-raster.js?v=profilev5';
import {originalCowPigments,paintOriginalCowSurface} from './lab-cow3d-paint.js';
import {loadCowDetailedTexture,detailedCowPixel,cowDetailedTextureReady,drawCowDetailedReference,detailedCowPigment,cowPartUV,detailedCowPigmentUV} from './lab-cow3d-texture.js';
// Deliberately quantized poses preserve coherent pixel clusters between frames.
// All spatial values snap together, so eyes and contours follow the same 3D rig.
export function pixelLockedPose(pose={}){
 if(pose.renderMode!=='locked')return {...pose};
 const snap=(value,step)=>Math.round((Number(value)||0)/step)*step;
 // Fixed 8 fps pose frames and 12° head/turn increments. A continuously
 // recomputed sub-pixel silhouette looked like melting fur at 2×–4×.
 return {...pose,yaw:snap(pose.yaw,12),headYaw:snap(pose.headYaw,12),
  headPitch:snap(pose.headPitch,5),time:snap(pose.time,125)};
}
export const cow3DParts=Object.freeze(['body','head','muzzle','ears','horns','eyes','four legs','tail']);
const palette={cream:'#f8e8c9',white:'#fff1da',brown:'#845039',dark:'#482b25',pink:'#ed9b9b',rose:'#bf6c75',hoof:'#50362d',horn:'#ecd5a2',eye:'#251d1a',shine:'#fff9ef'};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Detailed cow art: pale ivory coat, chestnut markings, soft rose muzzle and
// deep warm outlines. Keep these pigments separate from the old 3D preview.
export const detailedCowColors=Object.freeze({
 coat:'#fff0cf',patch:'#845039',muzzle:'#e99ba1',
 muzzleLight:'#f1abb0',ink:'#3c2925',tear:'#60b2d7',horn:'#f6d9a1'
});
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
// The original Detailed cow has a rounded brow and jaw, not the V-shaped
// lower cheeks or pinched forehead of the previous procedural head.
export function originalCowHeadProfile(sy){
 const cheek=1+.17*Math.exp(-Math.pow((sy+.20)/.38,2));
 const temples=1-.105*Math.exp(-Math.pow((sy-.79)/.25,2));
 const jaw=1-.045*Math.exp(-Math.pow((sy+.88)/.20,2));
 return cheek*temples*jaw;
}
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
 const rows=opts.rows||16,cols=opts.cols||24; // enough for 2x–4x pixels, ~40% fewer triangles
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const point=(u,v)=>{const ph=v*Math.PI,th=u*Math.PI*2;
   const localY=Math.cos(ph);
   // Anatomically sculpted skull instead of a generic ellipsoid:
   // broad cheek mass below the eyes, slimmer forehead and round jaw.
   const contour=opts.shape==='skull'?1+.34*Math.exp(-Math.pow((localY+.30)/.38,2))-.16*Math.exp(-Math.pow((localY-.77)/.26,2)):1;
   const faceDepth=opts.shape==='skull'?.10*Math.exp(-Math.pow((localY+.20)/.48,2)):0;
   const roundSquare=q=>Math.sign(q)*Math.pow(Math.abs(q),.74);
   if(opts.shape==='spriteHead'){
    // The approved Detailed sprite has a large dome, soft round cheeks,
    // narrowed temples and a distinctly curved jaw, not the old sphere.
    // Full depth is retained for 360° yaw and independent head movement.
    const sy=Math.cos(ph),sx=Math.sin(ph)*Math.cos(th),sz=Math.sin(ph)*Math.sin(th);
    const round=(q,p)=>Math.sign(q)*Math.pow(Math.abs(q),p);
    const profile=originalCowHeadProfile(sy);
    return [c[0]+r[0]*round(sx,.72)*profile,
      c[1]+r[1]*round(sy,.89),
      c[2]+r[2]*round(sz,.82)];
   }
   if(opts.shape==='spriteBody'){
    // Tiny pear-shaped plush torso below a dominant head. The top tapers into
    // the neck while the lower belly stays rounded and visibly 3D.
    const sy=Math.cos(ph),sx=Math.sin(ph)*Math.cos(th),sz=Math.sin(ph)*Math.sin(th);
    const round=(q,p)=>Math.sign(q)*Math.pow(Math.abs(q),p);
    const taper=1-.21*Math.max(0,sy)+.07*Math.max(0,-sy);
    return [c[0]+r[0]*round(sx,.82)*taper,
      c[1]+r[1]*round(sy,.85),
      c[2]+r[2]*round(sz,.80)];
   }
   if(opts.shape==='toyBody'||opts.shape==='toyHoof'){
    // Rounded box / toy-plush proportions: wider cream chest and square hooves.
    const curved=q=>Math.sign(q)*Math.pow(Math.abs(q),opts.shape==='toyHoof'?.60:.77);
    return [c[0]+r[0]*curved(Math.sin(ph)*Math.cos(th)),
      c[1]+r[1]*curved(Math.cos(ph)),
      c[2]+r[2]*curved(Math.sin(ph)*Math.sin(th))];
   }
   if(opts.shape==='muzzle'){
    // Rounded rectangular face of the original Detailed muzzle, in real 3D.
    const x=Math.sin(ph)*Math.cos(th),y=Math.cos(ph),z=Math.sin(ph)*Math.sin(th);
    return [c[0]+r[0]*roundSquare(x),c[1]+r[1]*roundSquare(y),c[2]+r[2]*z];
   }
   return [c[0]+r[0]*contour*Math.sin(ph)*Math.cos(th),c[1]+r[1]*Math.cos(ph),c[2]+(r[2]+faceDepth)*Math.sin(ph)*Math.sin(th)];};
  const pts=[point(i/cols,j/rows),point((i+1)/cols,j/rows),point((i+1)/cols,(j+1)/rows),point(i/cols,(j+1)/rows)];
  for(const tri of [[0,1,2],[0,2,3]]){
   const p=tri.map(k=>pts[k]);
   const center=p.reduce((a,q)=>vadd(a,q),[0,0,0]).map(x=>x/3);
   const n=[(center[0]-c[0])/r[0],(center[1]-c[1])/r[1],(center[2]-c[2])/r[2]];
   let ink=color;
   if(opts.patch&&opts.patch(n,center))ink=opts.patchColor||palette.brown;
   // Pigment is now sampled only by per-pixel UV rasterizer, never baked as flat triangle colors.
   parts.push({points:p,texPoints:p,uv:p.map(q=>cowPartUV(opts.part||'body',q)),normal:n,ink:opts.solidInk||['eye','eyeBorder','sparkle','sparkleSmall','nostril','mouth','blush','tear','lid','muzzle','muzzleHighlight'].includes(opts.part)?ink:furTone(ink,center),part:opts.part||'body'});
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
 const authentic=pose.designStyle!=='legacy'&&pose.designStyle!=='cream';
 const reference=authentic||pose.designStyle==='cream';
 const colors=authentic?originalCowPigments:detailedCowColors;
 const coat=authentic?originalCowPigments.coat:reference?detailedCowColors.coat:palette.cream;
 const patch=authentic?originalCowPigments.patch:reference?detailedCowColors.patch:palette.brown;
 const locked=pose.renderMode==='locked';
 const tris=[],t=Number(pose.time)||0,headYaw=rad(clamp(pose.headYaw??0,-55,55));
 const headBob=locked||pose.action==='sleep'?0:Math.sin(t*.002)*.025;
 const walk=pose.action==='walk',wave=pose.action==='wave',sleep=pose.action==='sleep';
 const emotion=['happy','sad','angry'].includes(pose.emotion)?pose.emotion:'neutral';
 const headPitch=rad(clamp(Number(pose.headPitch)||0,-25,25));
 // Locked idle is geometrically still: use sprite-like key poses rather than
 // continuously breathing via triangle deformation. No temporal fur shimmer.
 const breath=locked?1:1+Math.sin(t*.0025)*(sleep?.008:.018);
 sphere(tris,[0,authentic?1.04:1.07,-.30],
  [(authentic?.80:reference?.92:.90)*breath,authentic?.63:.64,authentic?.72:.80],coat,
  {part:'body',patch:authentic?undefined:cowPatch,patchColor:patch,
   shape:authentic?'spriteBody':undefined,solidInk:authentic&&locked});
 for(let i=0;i<4;i++){
  const left=i%2===0,front=i<2;
  const x=left?(authentic?-.42:-.49):(authentic?.42:.49),z=front?.28:-.66;
  const phase=t*.009+(left?0:Math.PI)+(front?0:Math.PI);
  // Four canonical footfall poses, discrete and predictable on the pixel grid.
  const step=Math.floor(t/125)%4,walkingLift=[0,.15,.19,.06][(step+(left?0:2)+(front?0:2))%4];
  const lift=walk?(locked?walkingLift:Math.max(0,Math.sin(phase))*.19)
    :wave&&i===1?(locked?[0,.12,.25,.12][step]:.25*Math.max(0,Math.sin(t*.008))):0;
  sphere(tris,[x,(authentic?.37:.43)+lift,z],
   authentic?[.23,.275,.245]:[.23,.32,.245],coat,
   {part:'leg'+i,shape:authentic?'toyBody':undefined,solidInk:authentic&&locked});
  sphere(tris,[x,.18+lift,z+.02],
   authentic?[.255,.135,.252]:[.245,.13,.255],authentic?colors.hoof:palette.hoof,
   {part:'hoof'+i,shape:authentic?'toyHoof':undefined,solidInk:authentic&&locked});
 }
 // Head group: independently rotates in a genuine 3D frame about the neck.
 const head=[];
 sphere(head,[0,.02,.07],authentic?[.94,.72,.63]:reference?[.76,.67,.60]:[.75,.66,.60],coat,
  {part:'head',shape:authentic?'spriteHead':'skull',solidInk:authentic&&locked});
 if(reference){
  // The reference muzzle is a broad pink, softly squared snout, not a tiny
  // round button. Shape and micro-features are volumetric and turn with head.
  sphere(head,[0,-.30,.68],authentic?[.53,.24,.285]:[.66,.255,.29],colors.muzzle,{part:'muzzle',shape:'muzzle'});
  sphere(head,[0,-.24,.976],authentic?[.22,.068,.020]:[.49,.105,.025],colors.muzzleLight,{part:'muzzleHighlight'});
  // Frown in the supplied reference: centre higher than corners.
  for(let i=-2;i<=2;i++){
   const sad=emotion==='sad',happy=emotion==='happy';
   const y=authentic?(sad?-.49-Math.abs(i)*.018:emotion==='angry'?-.48:happy?-.55+Math.abs(i)*.035:-.53+Math.abs(i)*.029):
     sad?-.46-Math.abs(i)*.026:happy?-.51+Math.abs(i)*.026:emotion==='angry'?-.45:-.48;
   const mouthX=i*(authentic?.050:.072);
   const mx=mouthX/.53,my=(y+.30)/.24;
   // Put the thin original smile directly onto the curved snout, not
   // floating in front of it as a thick black stripe.
   const mouthZ=authentic?.68+.285*Math.sqrt(Math.max(.025,1-mx*mx-my*my))+.024:.945;
   sphere(head,[mouthX,y,mouthZ],authentic?[.029,.022,.020]:[.046,.023,.027],
     colors.ink,{part:'mouth',rows:12,cols:20});
  }
 }else{
  sphere(head,[0,-.30,.62],[.60,.26,.29],palette.pink,{part:'muzzle'});
  sphere(head,[0,-.24,.84],[.43,.15,.055],'#f4b0a9',{part:'muzzleHighlight'});
  if(emotion==='happy')sphere(head,[0,-.43,.68],[.21,.075,.060],palette.rose,{part:'mouth'});
  else if(emotion==='sad')sphere(head,[0,-.48,.68],[.15,.041,.059],palette.rose,{part:'mouth'});
  else if(emotion==='angry')sphere(head,[0,-.40,.68],[.19,.028,.053],palette.dark,{part:'mouth'});
  else sphere(head,[0,-.43,.66],[.18,.038,.055],palette.rose,{part:'mouth'});
 }
 for(const side of [-1,1]){
  sphere(head,[side*(authentic?.93:.75),.26,.03],authentic?[.47,.18,.165]:reference?[.46,.17,.16]:[.44,.17,.14],patch,{part:'ear'});
  sphere(head,[side*(authentic?.95:.77),.26,.20],reference?[.34,.095,.070]:[.32,.095,.065],authentic?colors.innerEar:palette.rose,{part:'innerEar'});
  cylinder(head,[side*.34,.48,.03],[side*.37,.80,.01],.16,.035,reference?colors.horn:palette.horn,'horn');
  sphere(head,[side*.49,-.24,reference?.58:.47],[.15,.10,.08],reference?coat:palette.pink,{part:'cheek'});
  if(authentic)sphere(head,[side*.52,-.225,.70],[.16,.115,.055],colors.blush,{part:'blush'});
  if(reference){
   // Tall narrow eyes, pronounced cocoa eyebrows and visible tears restore
   // the recognisable expression of the original Detailed reference.
   sphere(head,[side*(authentic?.33:.285),.095,.65],authentic?[.143,.160,.078]:[.147,.174,.081],colors.ink,{part:'eyeBorder'});
   if(!authentic||emotion==='sad'||emotion==='angry')
    sphere(head,[side*.29,.315,.67],authentic?[.21,.046,.055]:[.238,.054,.060],patch,{part:'brow'});
   if(!(pose.blink||sleep)){
    sphere(head,[side*(authentic?.33:.285),.091,.732],authentic?[.107,.135,.054]:[.100,.136,.051],authentic?colors.eye:palette.eye,{part:'eye'});
    sphere(head,[side*(authentic?.33:.285)-(authentic?side*.035:.038),.147,authentic?.817:.80],[.037,.041,.017],authentic?colors.shine:palette.shine,{part:'sparkle'});
    sphere(head,[side*(authentic?.33:.285)+.040,.052,.797],[.013,.015,.010],authentic?colors.shine:palette.shine,{part:'sparkleSmall'});
   }else sphere(head,[side*(authentic?.33:.285),.09,.735],[.139,.025,.035],colors.ink,{part:'lid'});
   sphere(head,[side*(authentic?.18:.275),-.255,1.000],authentic?[.037,.034,.020]:[.058,.045,.026],colors.ink,{part:'nostril'});
   if(emotion==='sad')sphere(head,[side*.47,-.045,.83],[.045,.125,.038],colors.tear||'#60b2d7',{part:'tear'});
  }else{
   sphere(head,[side*.29,.11,.57],[.155,.17,.075],palette.dark,{part:'eyeBorder'});
   if(emotion==='angry')sphere(head,[side*.29,.32,.60],[.18,.038,.052],palette.dark,{part:'brow'});
   if(emotion==='sad')sphere(head,[side*.29,.29,.60],[.145,.029,.045],palette.brown,{part:'brow'});
   if(!(pose.blink||sleep)){
    sphere(head,[side*.29,.11,.655],[.113,.135,.056],palette.eye,{part:'eye'});
    sphere(head,[side*.29-.045,.17,.706],[.032,.039,.014],palette.shine,{part:'sparkle'});
    sphere(head,[side*.29+.048,.063,.708],[.015,.017,.010],palette.shine,{part:'sparkleSmall'});
   }else sphere(head,[side*.29,.11,.657],[.14,.025,.031],palette.dark,{part:'lid'});
   sphere(head,[side*.25,-.28,.916],[.055,.035,.018],palette.rose,{part:'nostril'});
   if(emotion==='sad')sphere(head,[side*.42,-.05,.67],[.035,.095,.028],'#74b8d5',{part:'tear'});
  }
 }
 // Layered sculpted forehead tufts remain independent 3D geometry.
 sphere(head,[-.09,.54,.35],authentic?[.275,.19,.24]:[.33,.20,.27],authentic?colors.coat:palette.white,{part:'fringe'});
 sphere(head,[.06,.60,.29],[.21,.13,.20],authentic?colors.coat:palette.white,{part:'fringeDetail'});
 sphere(head,[-.25,.50,.46],[.12,.13,.14],authentic?colors.coat:'#fdf1d6',{part:'fringeLock'});
 // Curved coat patches are shallow volumetric surfaces, not screen-space decals.
 if(!authentic){
  sphere(head,[-.49,.34,reference?.53:.48],reference?[.23,.23,.105]:[.19,.19,.08],patch,{part:'foreheadMark'});
  sphere(head,[.48,.39,reference?.48:.42],reference?[.20,.20,.09]:[.15,.17,.07],patch,{part:'foreheadMark'});
 }
 // A chocolate cheek marking below the left edge of the snout is an iconic
 // part of the approved sprite, not a camera-facing black-and-white texture.
 if(reference&&!authentic)sphere(head,[-.66,-.43,.48],[.17,.16,.14],patch,{part:'cheekMark'});
 const neck=[0,authentic?1.55:1.65,.19];
 // Pitch is applied in the local head frame before the independent yaw.
 const tilt=p=>[p[0],p[1]*Math.cos(headPitch)-p[2]*Math.sin(headPitch),p[1]*Math.sin(headPitch)+p[2]*Math.cos(headPitch)];
 for(const tri of head)tris.push({...tri,normal:spin(tilt(tri.normal),headYaw),points:tri.points.map(p=>vadd(spin(tilt([p[0]*1.03,p[1],p[2]*1.02]),headYaw),[neck[0],neck[1]+headBob,neck[2]]))});
 // A distinct 3D articulated tail, not a plane.
 const sway=locked?0:Math.sin(t*.004)*.3;
 if(authentic){
  // The original sprite has a visible curved tail at its left, with a dark
  // tuft. It stays volumetric and follows the body during sleep/rotation.
  cylinder(tris,[-.82,.70,-.40],[-1.09,.63+sway*.10,-.31],.095,.068,coat,'tail');
  cylinder(tris,[-1.09,.63+sway*.10,-.31],[-1.25,.84+sway*.12,-.28],.068,.048,coat,'tail');
  sphere(tris,[-1.24,.88+sway*.12,-.27],[.16,.23,.15],patch,{part:'tailTuft'});
 }else{
  cylinder(tris,[0,1.12,-1.03],[sway,1.34,-1.40],.10,.065,palette.cream,'tail');
  sphere(tris,[sway,1.34,-1.44],[.16,.18,.17],patch,{part:'tailTuft'});
 }
 // Rigid recline: preserve actual 3D proportions of every part.
 if(!sleep)return tris;
 const angle=rad(-72),co=Math.cos(angle),si=Math.sin(angle);
 const rotate=p=>[p[0]*co-p[1]*si,p[0]*si+p[1]*co,p[2]];
 let bottom=Infinity;
 for(const tri of tris)for(const p of tri.points)bottom=Math.min(bottom,rotate(p)[1]);
 return tris.map(tri=>({...tri,points:tri.points.map(p=>{const q=rotate(p);return [q[0],q[1]-bottom+.08,q[2]];}),normal:rotate(tri.normal)}));
}
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
export function drawCow3D(canvas,pose={}){
 const ctx=canvas.getContext('2d');if(!ctx)return;
 pose=pixelLockedPose(pose);
 const pixelScale=[2,3,4].includes(Number(pose.pixelScale))?Number(pose.pixelScale):2,w=Math.round(256/pixelScale),h=Math.round(192/pixelScale);canvas.width=w;canvas.height=h;ctx.imageSmoothingEnabled=false;
 canvas.style.imageRendering='pixelated';
 // Fractional CSS upscaling at ×3 (85→768) makes pixel columns uneven.
 // Prefer an integer nearest-neighbor factor (85→765) on wide screens.
 canvas.style.width=(w*Math.max(1,Math.round(768/w)))+'px';
 ctx.fillStyle='#e8dfcc';ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#d3c8b1';ctx.beginPath();ctx.ellipse(w/2,160/pixelScale,57/pixelScale,13/pixelScale,0,0,Math.PI*2);ctx.fill();
 const yaw=rad(Number(pose.yaw)||0),pitch=rad(7),scale=54/pixelScale;
 const project=p=>{const q=spin(p,yaw),y=q[1]*Math.cos(pitch)-q[2]*Math.sin(pitch),z=q[1]*Math.sin(pitch)+q[2]*Math.cos(pitch);const perspective=6/(6-z*.19);return [w/2+q[0]*scale*perspective,148/pixelScale-y*scale*perspective,z];};
 const authentic=pose.designStyle!=='legacy'&&pose.designStyle!=='cream';
 // Hide the coarse 3D beads used by the earlier model for mouth/nostrils:
 // tiny features are now inked onto the actual curved snout and cheeks.
 // Build still retains each true head part for rig tests and future variants.
 const paintedFacialParts=new Set(['mouth','nostril','muzzleHighlight','eyeBorder','blush']);
 const faces=buildCow3D(pose).filter(tri=>!authentic||!paintedFacialParts.has(tri.part))
  .map(tri=>{const v=tri.points.map(project);return {v,normal:spin(tri.normal,yaw),
   ink:tri.ink,part:tri.part,texPoints:tri.texPoints,uv:tri.uv,
   z:v.reduce((sum,q)=>sum+q[2],0)/3};}).sort((a,b)=>a.z-b.z);
 const rendered=renderCowMeshPixels(ctx,faces,{width:w,height:h,pigment:detailedCowPigment,uvPigment:detailedCowPigmentUV,
  materialPigment:authentic?paintOriginalCowSurface:null,
  textureReady:cowDetailedTextureReady()&&pose.renderMode!=='locked'&&pose.designStyle==='legacy',
  outlineWidth:(pixelScale===2||(pose.renderMode==='locked'&&pose.outlines!=='soft'&&pixelScale===3))?2:1,
  protectFeatures:pose.renderMode==='locked',stablePalette:pose.renderMode==='locked',
  detailOutlines:pose.renderMode==='locked'&&pose.outlines!=='soft',
  adaptiveOutlines:authentic&&pose.renderMode==='locked'});
 canvas.dataset.cow3dPixelScale=String(pixelScale);
 canvas.dataset.cow3dDesign=pose.designStyle==='legacy'?'legacy':pose.designStyle==='cream'?'cream':'reference';
 canvas.dataset.cow3dMaterial=authentic?'original-detailed-surface':'legacy-flat';
 canvas.dataset.cow3dMotion=pose.renderMode==='locked'?'rigid-keyframes-8fps':'continuous';
 canvas.dataset.cow3dPoseFrame=String(Math.round((Number(pose.time)||0)/125));
 canvas.dataset.cow3dRevision='head-palette-v5';
 canvas.dataset.cow3dOutlinePalette=authentic&&pose.renderMode==='locked'?'reference-adaptive':'classic';
 canvas.dataset.cow3dRenderMode=pose.renderMode==='locked'?'locked':'classic';
 canvas.dataset.cow3dPainted=String(rendered.painted);
 canvas.dataset.cow3dOutlinePixels=String(rendered.outlined);
 canvas.dataset.cow3dDetailOutlinePixels=String(rendered.detailOutlined);
 canvas.dataset.cow3dPaintedFurPixels=String(rendered.materialPixels);
 canvas.dataset.cow3dOutlineStyle=pose.renderMode==='locked'&&pose.outlines!=='soft'?'detailed':'soft';
 canvas.dataset.cow3dTexturedPixels=String(rendered.textured);
 canvas.dataset.cow3dFaces=String(faces.length);
 canvas.dataset.cow3dReady='true';
 canvas.dataset.cow3dTextured=String(cowDetailedTextureReady()&&pose.renderMode!=='locked'&&pose.designStyle==='legacy');
 canvas.dataset.cow3dSleeping=String(pose.action==='sleep');
 return faces.length;
}
export function mountCow3DLab(root=document){
 const canvas=root.getElementById('cow3d-stage');if(!canvas)return;
 const get=id=>root.getElementById(id);
 let playing=false,last=0,time=0,lastPaint=-1000,lastSignature='';
 const render=()=>{const action=get('cow3d-action').value;drawCow3D(canvas,{designStyle:get('cow3d-design').value,renderMode:get('cow3d-render-mode').value,outlines:get('cow3d-outlines').value,emotion:get('cow3d-emotion').value,headPitch:Number(get('cow3d-pitch').value),pixelScale:Number(get('cow3d-pixels').value),yaw:Number(get('cow3d-yaw').value),headYaw:action==='turn'?Math.sin(time*.002)*50:Number(get('cow3d-head').value),blink:action==='blink'&&(time%2100>1850),action,time});get('cow3d-status').textContent='Дизайн '+canvas.dataset.cow3dDesign+' · v5 · '+(canvas.dataset.cow3dDesign==='reference'?'Розпис оригіналу на 3D · ':cowDetailedTextureReady()?'Detailed sprite texture · ':'Підготовка Detailed texture · ')+ (canvas.dataset.cow3dRenderMode==='locked'?'Pixel-Locked · ':'Поточний 3D · ')+'контури '+canvas.dataset.cow3dOutlineStyle+' ('+canvas.dataset.cow3dDetailOutlinePixels+' детальних) · '+'3D-геометрія · піксель ×'+canvas.dataset.cow3dPixelScale+' · '+canvas.dataset.cow3dFaces+' трикутників · модель dog (Корівка) · owner-only';};
 get('cow3d-play').addEventListener('change',e=>{playing=e.target.checked;});
 for(const id of ['cow3d-yaw','cow3d-head','cow3d-pitch','cow3d-emotion','cow3d-action','cow3d-pixels','cow3d-render-mode','cow3d-outlines','cow3d-design']){
  const control=get(id);
  // Ranges draw live on input; dropdowns draw once on change. This avoids
  // two expensive full-mesh paints for each native select interaction.
  control.addEventListener(control.tagName==='SELECT'?'change':'input',render);
 }
 canvas.addEventListener('click',()=>{const choice=get('cow3d-emotion');choice.value=choice.value==='happy'?'neutral':'happy';render();});
 get('cow3d-save').addEventListener('click',()=>{render();const a=root.createElement('a');a.download='cow-3d-owner-lab.png';a.href=canvas.toDataURL('image/png');a.click();});
 function tick(now){time+=playing?Math.min(60,Math.max(0,now-(last||now))):0;last=now;
  if(playing&&now-lastPaint>=(get('cow3d-render-mode').value==='locked'?125:90)&&canvas.isConnected&&!canvas.closest('[hidden]')){const signature=[get('cow3d-action').value,get('cow3d-render-mode').value,get('cow3d-pixels').value,Math.floor(time/125)].join(':');if(signature!==lastSignature){render();lastSignature=signature;}lastPaint=now;}
  requestAnimationFrame(tick);}
 render();
 loadCowDetailedTexture().then(()=>{render();drawCowDetailedReference(get('cow3d-reference'));});
 requestAnimationFrame(tick);return {render};
}
if(typeof document!=='undefined'&&document.getElementById('cow3d-stage'))window.addEventListener('load',()=>mountCow3DLab());
