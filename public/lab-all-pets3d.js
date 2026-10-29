import {buildFamilyBody,pet3DTopology} from './lab-anatomy3d.js?v=speciesv13';
export {pet3DTopology} from './lab-anatomy3d.js?v=speciesv13';
// Owner-only preview: thirteen original, articulated 3D species alongside the
// existing Detailed cow. Each entry has its own head/body silhouette and
// anatomy. No player save, game mechanics, or external libraries are touched.
export const pet3DSpecies=Object.freeze({
 chicken:{name:'Курочка',coat:'#f2dc79',side:'#e7ba56',light:'#fff0ac',accent:'#d64d49',mouth:'#ecac50',head:[.68,.66,.60],body:[.66,.73,.67],face:'bird',ears:'comb',tail:'fan',feet:'bird'},
 cat:{name:'Котик',coat:'#b69ad9',side:'#8c6fb0',light:'#d6c6ed',accent:'#e5a9c6',mouth:'#a77caa',head:[.67,.64,.55],body:[.59,.67,.62],face:'cat',ears:'triangle',tail:'long'},
 corgi:{name:'Коргі',coat:'#e8ab6f',side:'#aa754e',light:'#fff0d3',accent:'#d98e89',mouth:'#573c37',head:[.72,.61,.57],body:[.72,.59,.73],face:'dog',ears:'tallTriangle',tail:'stub'},
 frog:{name:'Жабка',coat:'#91be72',side:'#618e60',light:'#b8dca0',accent:'#d6a0ac',mouth:'#557c59',head:[.82,.48,.60],body:[.67,.55,.60],face:'frog',ears:'eyebumps',tail:'none'},
 bear:{name:'Ведмедик',coat:'#b99073',side:'#775746',light:'#e6c2a0',accent:'#cb9c8a',mouth:'#4c3330',head:[.72,.70,.65],body:[.72,.75,.72],face:'bear',ears:'round',tail:'stub'},
 dino:{name:'Динозаврик',coat:'#80b7a0',side:'#548879',light:'#c1ded0',accent:'#efb773',mouth:'#496956',head:[.73,.59,.71],body:[.74,.77,.79],face:'dino',ears:'spikes',tail:'long'},
 bunny:{name:'Кролик',coat:'#e7c6d9',side:'#be9bad',light:'#fff1fa',accent:'#ef9fb4',mouth:'#805869',head:[.65,.67,.56],body:[.62,.69,.64],face:'bunny',ears:'rabbit',tail:'pom'},
 pig:{name:'Свинка',coat:'#efb1b4',side:'#cf8795',light:'#ffd2d4',accent:'#e18b9d',mouth:'#9d5061',head:[.79,.61,.63],body:[.77,.68,.71],face:'pig',ears:'flop',tail:'curl'},
 sheep:{name:'Овечка',coat:'#f4e9cc',side:'#cbbda5',light:'#fff8e8',accent:'#cfb5b5',mouth:'#786d67',head:[.68,.59,.59],body:[.79,.75,.72],face:'sheep',ears:'flop',tail:'pom'},
 fox:{name:'Лисичка',coat:'#e7a262',side:'#a7613f',light:'#fff0d3',accent:'#d87d7b',mouth:'#65413b',head:[.66,.63,.56],body:[.59,.68,.69],face:'fox',ears:'tallTriangle',tail:'bushy'},
 monkey:{name:'Мавпочка',coat:'#bd9873',side:'#846448',light:'#ead0ab',accent:'#d29f8d',mouth:'#634636',head:[.70,.67,.61],body:[.65,.67,.64],face:'monkey',ears:'roundLarge',tail:'curl'},
 duck:{name:'Качка',coat:'#e9d77e',side:'#c4ad5b',light:'#fff0b4',accent:'#e4a65d',mouth:'#d37e4d',head:[.72,.61,.59],body:[.75,.65,.68],face:'duck',ears:'none',tail:'fan',feet:'bird'},
 penguin:{name:'Пінгвін',coat:'#596977',side:'#344450',light:'#f4f0e7',accent:'#e9a360',mouth:'#ce9455',head:[.68,.60,.57],body:[.68,.84,.70],face:'penguin',ears:'none',tail:'stub',feet:'bird'}
});
export const pet3DSpeciesIds=Object.freeze(['chicken','cat','corgi','frog','bear','dog','dino','bunny','pig','sheep','fox','monkey','duck','penguin']);
const PI=Math.PI;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rad=x=>x*PI/180;
const spinY=(p,a)=>[p[0]*Math.cos(a)+p[2]*Math.sin(a),p[1],-p[0]*Math.sin(a)+p[2]*Math.cos(a)];
const pitchX=(p,a)=>[p[0],p[1]*Math.cos(a)-p[2]*Math.sin(a),p[1]*Math.sin(a)+p[2]*Math.cos(a)];
const add=(a,b)=>a.map((x,i)=>x+b[i]);
const sig=(v,p)=>Math.sign(v)*Math.pow(Math.abs(v),p);
// Full 3D shaded rounded volume; true local texPoints for skin-bound pigments.
function ball(out,part,c,r,ink,shape='round',n=16,m=20){
 const vertex=(u,v)=>{
  const ph=v*PI,th=u*PI*2,y=Math.cos(ph),x=Math.sin(ph)*Math.cos(th),z=Math.sin(ph)*Math.sin(th);
  const taper=shape==='head'?(1+.16*Math.exp(-Math.pow((y+.25)/.37,2))-.09*Math.max(0,y)):shape==='pear'?(1-.20*Math.max(0,y)+.07*Math.max(0,-y)):1;
  const exp=shape==='flat'?.8:shape==='head'?.85:.92;
  return [c[0]+sig(x,exp)*r[0]*taper,c[1]+sig(y,.9)*r[1],c[2]+sig(z,.86)*r[2]];
 };
 for(let j=0;j<n;j++)for(let i=0;i<m;i++){
  const p=[vertex(i/m,j/n),vertex((i+1)/m,j/n),vertex((i+1)/m,(j+1)/n),vertex(i/m,(j+1)/n)];
  for(const idx of [[0,1,2],[0,2,3]]){
   const pts=idx.map(k=>p[k]);
   const center=pts.reduce((a,v)=>add(a,v),[0,0,0]).map(v=>v/3);
   const normal=center.map((v,k)=>(v-c[k])/r[k]);
   out.push({points:pts,texPoints:pts,normal,ink,part});
  }
 }
}
// Closed tapered 3D cone: fox/cat ears, dino spines, bird comb and tail.
function cone(out,part,base,tip,r,ink,n=10){
 for(let i=0;i<n;i++){
  const a=i*2*PI/n,b=(i+1)*2*PI/n;
  const p=[base[0]+Math.cos(a)*r,base[1],base[2]+Math.sin(a)*r];
  const q=[base[0]+Math.cos(b)*r,base[1],base[2]+Math.sin(b)*r];
  const points=[p,q,tip],normal=[Math.cos((a+b)/2),.28,Math.sin((a+b)/2)];
  out.push({points,texPoints:points,ink,part,normal});
 }
}
function link(out,part,a,b,r,ink){
 const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz);
 for(let i=0;i<4;i++){
  const c=a.map((v,k)=>v+(b[k]-v)*(i+.5)/4);
  const rr=r*(1-i*.12);
  ball(out,part,c,[rr,Math.max(rr,Math.abs(dy)/4+rr*.3),rr],ink,'round',8,10);
 }
}
export function buildOtherPet3D(pose={}){
 const species=pose.species;
 const cfg=pet3DSpecies[species];
 if(!cfg)throw new Error('Unknown owner-lab 3D species '+species);
 const out=[],head=[],t=Number(pose.time)||0;
 const locked=pose.renderMode==='locked',asleep=pose.action==='sleep',walk=pose.action==='walk',wave=pose.action==='wave';
 const emot=pose.emotion||'neutral';
 const step=Math.floor(t/125)%4,pace=locked?0:Math.sin(t*.002)*.018;
 const coat=cfg.coat,side=cfg.side,light=cfg.light;
 const headY=buildFamilyBody(out,pose,cfg,species,{ball,cone,link});
 // Local face frame independently turns and pitches with the neck.
 const h=species==='dino'?[.74,.56,.68]:species==='penguin'?[.59,.56,.53]:
 species==='fox'?[.66,.53,.58]:species==='bunny'?[.62,.55,.53]:
 species==='frog'?[.85,.43,.59]:cfg.head;
 ball(head,'head',[0,0,0],h,coat,species==='frog'?'flat':'head',22,28);
 const bird=['chicken','duck','penguin'].includes(species);
 const snout=species==='pig'?[.39,.205,.24]:species==='penguin'?[.22,.085,.18]:
 species==='chicken'?[.25,.12,.20]:species==='duck'?[.37,.10,.24]:
 species==='dino'?[.39,.17,.34]:species==='fox'?[.35,.17,.29]:
 species==='bear'?[.34,.21,.22]:species==='bunny'?[.22,.16,.17]:
 species==='monkey'?[.28,.17,.17]:[.30,.19,.20];
 const tip=species==='dino'?.63:species==='fox'?.54:species==='penguin'?.52:.52;
 ball(head,bird?'beak':'muzzle',[0,species==='penguin'?-.18:-.28,tip],snout,
 bird?cfg.mouth:species==='pig'?cfg.accent:species==='fox'||species==='bear'||species==='monkey'||species==='bunny'?cfg.light:light,
 bird?'flat':'round',18,26);
 // Critical visibility: raised face planes live at positive surface depth,
 // not hidden underneath the front of the skull in a 3D depth buffer.
 if(['bear','pig','bunny','fox','monkey','corgi','cat','dino'].includes(species)){
  const maskDepth=species==='dino'?.53:.50;
  if(['bear','monkey','bunny','fox'].includes(species))
   ball(head,'faceMask',[0,-.03,maskDepth],[.44,.38,.135],species==='bear'||species==='monkey'?cfg.light:cfg.light,'flat',18,24);
  if(species==='bear')ball(head,'noseBridge',[0,-.27,.78],[.19,.16,.10],cfg.light,'round',14,20);
  if(species==='pig')ball(head,'snoutRim',[0,-.28,.72],[.37,.19,.10],cfg.accent,'flat',16,24);
  if(species==='dino')ball(head,'lowerJaw',[0,-.37,.66],[.41,.14,.22],cfg.light,'flat',16,24);
 }
 if(species==='sheep'){
  // Face remains visible through the wool, crown is unmistakably fluffy.
  for(const [x,y,z] of [[-.67,.48,.01],[-.43,.72,.08],[-.14,.83,.08],[.14,.83,.08],[.43,.72,.08],[.67,.48,.01],[-.72,.17,.00],[.72,.17,.00]])
   ball(head,'wool',[x,y,z],[.29,.29,.27],cfg.light,'round',12,16);
 }
 if(species==='pig')for(const s of [-1,1])
  ball(head,'nostril',[s*.17,-.27,tip+snout[2]*.88],[.042,.055,.025],side);
 if(species==='dino')ball(head,'noseTip',[0,-.25,.90],[.26,.14,.17],coat);
 if(species==='fox')ball(head,'chinFur',[0,-.40,.67],[.34,.13,.16],light,'flat');
 // Eyes positioned on the face in 3D rather than stuck to the camera plane.
 const eyesY=species==='frog'?.30:species==='penguin'?.12:species==='bear'?.16:.13;
 for(const s of [-1,1]){
  const ex=s*(species==='frog'?.47:species==='penguin'?.22:species==='dino'?.27:.28);
  const ez=species==='dino'?.69:species==='penguin'?.56:species==='frog'?.52:.67;
  if(species==='frog')ball(head,'eyeBump',[s*.47,.40,.26],[.25,.23,.23],coat);
  ball(head,'eyeWhite',[ex,eyesY,ez-.015],[.135,.155,.055],species==='penguin'?cfg.light:'#fff7eb','round',12,18);
  ball(head,'eye',[ex,eyesY,ez+.050],[.083,.105,.052],emot==='angry'?side:'#25212a','round',14,18);
  if(!asleep&&!pose.blink)ball(head,'shine',[ex-.027,eyesY+.048,ez+.099],[.032,.036,.019],'#fff9f5');
  if(asleep||pose.blink)ball(head,'lid',[ex,eyesY,ez+.109],[.135,.037,.026],side);
  if(emot==='sad')ball(head,'tear',[ex,eyesY-.15,ez+.115],[.034,.08,.024],'#75b9e0');
  if(['cat','corgi','bear','bunny','fox','monkey','pig'].includes(species))
   ball(head,'blush',[s*.43,-.24,.59],[.13,.08,.038],cfg.accent);
 }
 if(species!=='pig'&&!bird)
  ball(head,'nose',[0,-.27,tip+snout[2]*.94],[.08,.055,.042],species==='frog'?side:cfg.mouth);
 if(!bird){
  const smile=emot==='sad'?.0:emot==='happy'?.06:.025;
  ball(head,'mouth',[0,-.42+smile,tip+snout[2]*.98],[.14,.032,.034],cfg.mouth,'round',10,16);
 }
 if(cfg.ears==='triangle'||cfg.ears==='tallTriangle'){
  for(const sign of [-1,1]) {
   const tall=cfg.ears==='tallTriangle';
   cone(head,'ear',[sign*.53,.38,-.05],[sign*(tall?.72:.68),tall?1.04:.85,.03],tall?.22:.24,side);
   cone(head,'innerEar',[sign*.55,.45,.14],[sign*(tall?.70:.68),tall?.90:.75,.15],.13,cfg.accent,8);
  }
 }else if(cfg.ears==='rabbit'){
  for(const sign of [-1,1]){
   ball(head,'ear',[sign*.37,.84,-.05],[.18,.57,.17],coat);
   ball(head,'innerEar',[sign*.37,.87,.10],[.093,.40,.07],cfg.accent);
  }
 }else if(cfg.ears==='round'||cfg.ears==='roundLarge'){
  for(const sign of [-1,1]){
   const r=cfg.ears==='roundLarge'?.29:.22;
   ball(head,'ear',[sign*.67,.48,.02],[r,r,.17],side);
   ball(head,'innerEar',[sign*.67,.48,.15],[r*.57,r*.57,.06],cfg.accent);
  }
 }else if(cfg.ears==='flop'){
  for(const sign of [-1,1])ball(head,'ear',[sign*.77,.25,.03],[.35,.15,.16],side);
 }else if(cfg.ears==='comb'){
  for(let i=-1;i<=1;i++)ball(head,'comb',[i*.16,.63,.02],[.17,.25-(i===0?0:.06),.17],cfg.accent);
 }else if(cfg.ears==='spikes'){
  for(let i=0;i<4;i++)cone(head,'spike',[0,.61-i*.14,-.13-i*.17],[0,.94-i*.14,-.21-i*.17],.17,cfg.accent);
 }
 if(species==='cat'||species==='fox'){
  for(const sign of [-1,1])ball(head,'cheekFur',[sign*.53,-.28,.17],[.18,.18,.20],light);
 }
 const hy=rad(clamp(pose.headYaw||0,-55,55)),hp=rad(clamp(pose.headPitch||0,-25,25));
 const pivot=[0,headY+pace,.16];
 for(const f of head){
  const move=p=>add(spinY(pitchX(p,hp),hy),pivot);
  out.push({...f,points:f.points.map(move),normal:spinY(pitchX(f.normal,hp),hy)});
 }
 if(!asleep)return out;
 const angle=rad(-72),co=Math.cos(angle),si=Math.sin(angle);
 const rotate=p=>[p[0]*co-p[1]*si,p[0]*si+p[1]*co,p[2]];
 let bottom=Infinity;
 for(const tri of out)for(const p of tri.points)bottom=Math.min(bottom,rotate(p)[1]);
 return out.map(tri=>({...tri,points:tri.points.map(p=>{const q=rotate(p);return [q[0],q[1]-bottom+.08,q[2]];}),normal:rotate(tri.normal)}));
}
export function paintOtherPetSurface(species,part,p,normal,base){
 const cfg=pet3DSpecies[species];if(!cfg||!p)return base;
 const [x,y,z]=p;
 if(part==='head'){
  if(species==='penguin'&&z>.28&&y<.30)return cfg.light;
  if(species==='cat'&&z>.2&&y>.23&&Math.abs(x)<.10)return cfg.side;
  if(species==='fox'&&z>.20&&y<-.16&&Math.abs(x)<.39)return cfg.light;
  if(species==='corgi'&&z>.18&&y<.07&&Math.abs(x)<.37)return cfg.light;
 }
 if(part==='body'){
  if(species==='pig'&&z>.15&&Math.abs(x)>.50)return cfg.side;
  if(species==='penguin'&&z>.22&&Math.abs(x)<.51)return cfg.light;
  if(species==='sheep'&&y>.9&&z>.22)return cfg.light;
 }
 return base;
}
