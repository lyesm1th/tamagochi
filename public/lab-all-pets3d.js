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
  const taper=shape==='head'?(1+.16*Math.exp(-((y+.25)/.37)**2)-.09*Math.max(0,y)):shape==='pear'?(1-.20*Math.max(0,y)+.07*Math.max(0,-y)):1;
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
 const bodyY=species==='penguin'?1.10:1.03;
 ball(out,'body',[0,bodyY,-.31],cfg.body,coat,'pear',18,24);
 if(species==='penguin'||species==='fox'||species==='monkey'||species==='corgi')
  ball(out,'belly',[0,bodyY-.05,.26],[cfg.body[0]*.72,cfg.body[1]*.77,.25],light,'flat');
 if(species==='sheep'){
  for(const [x,y,z] of [[-.49,1.44,-.02],[.46,1.43,-.04],[0,1.68,-.22],[-.64,1.00,-.11],[.64,1.0,-.18]])
   ball(out,'wool',[x,y,z],[.28,.32,.29],light);
 }
 // Each animal has a different limb count/look; bird legs are short and slim.
 for(let i=0;i<4;i++){
  const front=i<2,left=i%2===0,sign=left?-1:1;
  const stride=(step+(left?0:2)+(front?0:2))%4;
  const lift=walk?(locked?[0,.14,.20,.06][stride]:Math.max(0,Math.sin(t*.009+stride))* .18):
   wave&&i===1?(locked?[0,.10,.23,.10][step]:Math.abs(Math.sin(t*.009))*.22):0;
  const bird=cfg.feet==='bird';
  const x=sign*(bird?.36:.44),z=front?.24:-.67;
  const limb=bird?[.13,.30,.15]:[.21,.29,.21];
  const foot=bird?[.19,.08,.26]:[.22,.12,.23];
  ball(out,'leg'+i,[x,.39+lift,z],limb,side);
  ball(out,'hoof'+i,[x,.17+lift,z+.07],foot,bird?cfg.mouth:side);
 }
 // Local face frame independently turns and pitches with the neck.
 const headY=species==='frog'?1.62:species==='penguin'?1.79:1.67;
 const h=cfg.head;ball(head,'head',[0,0,0],h,coat,'head',22,28);
 const bird=['chicken','duck','penguin'].includes(species);
 const snout=species==='pig'?[.34,.18,.23]:bird?[.33,.13,.29]:species==='dino'?[.47,.21,.31]:species==='fox'?[.29,.18,.31]:[.31,.21,.20];
 const tip=species==='dino'?.69:species==='fox'?.57:.52;
 ball(head,bird?'beak':'muzzle',[0,-.28,tip],snout,bird?cfg.mouth:species==='pig'?cfg.accent:light,bird?'flat':'round',16,24);
 if(species==='pig')for(const s of [-1,1])
  ball(head,'nostril',[s*.17,-.27,tip+snout[2]*.88],[.042,.055,.025],side);
 if(species==='dino')ball(head,'noseTip',[0,-.22,.84],[.33,.16,.20],light);
 if(species==='monkey')ball(head,'faceMask',[0,-.07,.44],[.50,.39,.17],light,'flat');
 if(species==='fox')ball(head,'faceMask',[0,-.31,.44],[.45,.21,.18],light,'flat');
 // Eyes positioned on the face in 3D rather than stuck to the camera plane.
 const eyesY=species==='frog'?.22:.11;
 for(const s of [-1,1]){
  const ex=s*(species==='frog'?.42:.28),ez=species==='dino'?.60:.51;
  if(species==='frog')ball(head,'eyeBump',[s*.47,.40,.26],[.25,.23,.23],coat);
  ball(head,'eye',[ex,eyesY,ez],[.105,.13,.07],emot==='angry'?side:'#25212a');
  if(!asleep&&!pose.blink)ball(head,'shine',[ex-.028,eyesY+.048,ez+.059],[.034,.042,.017],'#fff9f5');
  if(asleep||pose.blink)ball(head,'lid',[ex,eyesY,ez+.065],[.13,.032,.025],side);
  if(emot==='sad')ball(head,'tear',[ex,eyesY-.15,ez+.06],[.034,.08,.024],'#75b9e0');
  if(['cat','corgi','bear','bunny','fox','monkey','pig'].includes(species))
   ball(head,'blush',[s*.42,-.26,.44],[.14,.10,.045],cfg.accent);
 }
 if(species!=='pig'&&!bird)
  ball(head,'nose',[0,-.29,tip+snout[2]*.86],[.08,.055,.03],species==='frog'?side:cfg.mouth);
 if(emot==='happy')ball(head,'mouth',[0,-.42,tip+snout[2]*.77],[.17,.041,.035],cfg.mouth);
 else if(emot==='sad')ball(head,'mouth',[0,-.48,tip+snout[2]*.80],[.12,.04,.03],cfg.mouth);
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
 // Distinct articulated tails, flippers, feathers and spines on the body.
 if(species==='dino'){
  for(let i=0;i<4;i++)cone(out,'backSpine',[0,1.55-i*.29,-.84],[0,1.78-i*.30,-1.04],.19,cfg.accent);
  link(out,'tail',[0,.93,-.86],[.55,1.01,-1.58],.19,coat);
 }else if(species==='fox'||species==='cat'||species==='monkey'){
  const tip=species==='fox'?[1.20,1.35,-1.10]:[1.13,1.61,-.75];
  link(out,'tail',[.53,.78,-.68],tip,species==='fox'?.22:.08,species==='fox'?side:coat);
  if(species==='fox')ball(out,'tailTip',tip,[.23,.19,.22],light);
 }else if(species==='pig'){
  link(out,'tail',[.40,.91,-.88],[.78,1.20,-1.05],.065,side);
 }else if(species==='bunny'||species==='sheep'){
  ball(out,'tailPom',[.15,.84,-1.03],[.22,.22,.21],light);
 }else if(species==='chicken'||species==='duck'){
  for(const sign of [-1,1]){
   ball(out,'wing',[sign*.67,1.16,-.27],[.22,.36,.27],side);
   cone(out,'tailFeather',[sign*.30,1.25,-.92],[sign*.42,1.76,-1.1],.16,coat);
  }
 }else if(species==='penguin'){
  for(const sign of [-1,1])ball(out,'flipper',[sign*.73,1.12,-.26],[.16,.45,.24],side);
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
