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
// Explicit topology families. Limbs have *roles*, not four interchangeable
// cow legs. Penguin and dinosaur have individual dedicated biped anatomy.
export const pet3DTopology=Object.freeze({
 chicken:'birdBiped',duck:'birdBiped',penguin:'penguinBiped',dino:'dinoBiped',
 pig:'farmQuadruped',sheep:'farmQuadruped',
 cat:'petQuadruped',corgi:'petQuadruped',fox:'petQuadruped',
 bear:'toyBiped',monkey:'toyBiped',bunny:'toyBiped',frog:'frogBiped'
});
const footCycle=Object.freeze([0,.15,.19,.05]);
function liftFor(pose,index,amplitude=1){
 const t=Number(pose.time)||0,step=(Math.floor(t/125)+index*2)%4;
 return pose.action==='walk'?(pose.renderMode==='locked'?footCycle[step]*amplitude:Math.max(0,Math.sin(t*.009+index*Math.PI))*.18*amplitude):0;
}
function articulatedHead(out,head,pose,pivot){
 articulatedHead(out,head,pose,[0,headY+pace,.16]);
 return asleep?restOnFloor(out):out;
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
