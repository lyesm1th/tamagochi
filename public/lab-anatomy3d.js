// Anatomical topology for the owner-only 3D study.
// Each family's stance, limb count, mass and gait are independent of cow rig.
export const pet3DTopology=Object.freeze({
 chicken:'birdBiped',duck:'birdBiped',penguin:'penguinBiped',dino:'dinoBiped',
 pig:'farmQuadruped',sheep:'farmQuadruped',cat:'petQuadruped',
 corgi:'petQuadruped',fox:'petQuadruped',bear:'toyBiped',
 monkey:'toyBiped',bunny:'toyBiped',frog:'frogBiped'
});
const steps=[0,.15,.19,.05];
const lift=(pose,i,amp=1)=>pose.action==='walk'?
 (pose.renderMode==='locked'?steps[(Math.floor((pose.time||0)/125)+i*2)%4]*amp:
 Math.max(0,Math.sin((pose.time||0)*.009+i*Math.PI))*.18*amp):0;
function legs(out,pose,cfg,count,kind,ball){
 for(let i=0;i<count;i++){
  const side=i%2===0?-1:1,front=i<2;
  const dx=kind==='farm'?.50:kind==='pet'?.40:.28;
  const x=side*dx,z=count===4?(front?.27:-.65):.06,dy=lift(pose,i%2,kind==='penguin'?.55:1);
  const bird=kind==='bird'||kind==='penguin';
  const upper=kind==='dino'?[.22,.30,.25]:kind==='penguin'?[.12,.16,.12]:
   kind==='bird'?[.10,.21,.12]:kind==='toy'?[.20,.26,.21]:
   kind==='frog'?[.21,.19,.22]:kind==='farm'?[.25,.31,.26]:[.19,.27,.20];
  const foot=kind==='dino'?[.23,.10,.33]:kind==='penguin'?[.20,.07,.26]:
   kind==='bird'?[.20,.07,.31]:kind==='toy'?[.22,.12,.23]:
   kind==='frog'?[.30,.09,.27]:kind==='farm'?[.25,.14,.25]:[.22,.12,.23];
  const y=kind==='penguin'?.29:kind==='bird'?.34:.39,ankle=bird?.13:.17;
  const label=kind==='dino'?'thigh':'leg';
  ball(out,label+i,[x,y+dy,z],upper,bird?cfg.mouth:cfg.side,'round',14,18);
  if(kind==='dino')ball(out,'shin'+i,[x,.24+dy,z+.07],[.17,.19,.18],cfg.side);
  ball(out,(bird||kind==='dino'?'foot':'hoof')+i,[x,ankle+dy,z+.11],foot,bird?cfg.mouth:kind==='dino'?cfg.accent:cfg.side,bird?'flat':'round',12,16);
  if(bird)for(const offset of [-.11,0,.11])
   ball(out,'toe'+i,[x+offset,ankle-.025+dy,z+.33],[.065,.045,.14],cfg.mouth,'round',10,14);
 }
}
function birdBiped(out,pose,cfg,id,ball,cone){
 const duck=id==='duck';
 ball(out,'body',[0,.99,-.26],duck?[.76,.66,.78]:[.64,.71,.65],cfg.coat,'pear',20,28);
 ball(out,'breast',[0,1.00,.24],duck?[.47,.48,.29]:[.43,.47,.24],cfg.light,'flat');
 legs(out,pose,cfg,2,'bird',ball);
 for(const sign of [-1,1]){
  ball(out,'wing',[sign*(duck?.67:.56),1.08,-.24],duck?[.22,.31,.35]:[.20,.36,.24],cfg.side,'flat',18,24);
  for(let i=0;i<3;i++)cone(out,'tailFeather',[sign*.20+i*.07,1.21,-.79],[sign*.25+i*.10,1.55+i*.08,-1.12],.10,cfg.coat);
 }
 return duck?1.62:1.70;
}
function penguinBiped(out,pose,cfg,ball){
 // Penguin-specific upright silhouette: round lower belly, narrow upper
 // shoulders, flush head and short orange feet, rather than a hunched dog.
 ball(out,'body',[0,1.00,-.09],[.69,.87,.58],cfg.coat,'round',22,30);
 ball(out,'belly',[0,1.00,.39],[.48,.69,.19],cfg.light,'flat',20,28);
 for(const sign of [-1,1]){
  const dy=lift(pose,sign<0?0:1,.55);
  ball(out,'leg'+(sign<0?0:1),[sign*.23,.20+dy,.04],[.13,.14,.15],cfg.mouth);
  ball(out,'foot'+(sign<0?0:1),[sign*.23,.105+dy,.30],[.22,.08,.31],cfg.mouth,'flat');
  ball(out,'flipper',[sign*.71,1.06,.02],[.14,.42,.22],cfg.side,'flat',20,24);
  ball(out,'flipperTip',[sign*.77,.73,.03],[.13,.16,.17],cfg.coat);
 }
 return 1.71;
}
function dinoBiped(out,pose,cfg,ball,cone,link){
 // Dinosaur silhouette: compact forward-leaning pear and coherent long tapered
 // counterbalancing tail. No stacked torso "snowman" spheres.
 ball(out,'body',[0,1.00,-.42],[.64,.70,.82],cfg.coat,'pear',22,28);
 ball(out,'belly',[0,.97,.17],[.43,.42,.20],cfg.light,'flat');
 legs(out,pose,cfg,2,'dino',ball);
 for(const sign of [-1,1]){
  const dy=pose.action==='wave'&&sign===1?[0,.08,.18,.08][Math.floor((pose.time||0)/125)%4]:0;
  ball(out,'arm',[sign*.52,1.17,.18],[.12,.18,.15],cfg.coat);
  ball(out,'hand',[sign*.56,1.04+dy,.35],[.11,.095,.11],cfg.coat);
  for(const j of [-1,1])ball(out,'claw',[sign*.56+j*.048,1.01+dy,.45],[.035,.055,.045],cfg.light,'round',8,10);
 }
 const nodes=[[0,.99,-1.01],[.24,1.03,-1.37],[.48,1.12,-1.76],[.71,1.19,-2.04]];
 for(let i=1;i<nodes.length;i++)link(out,'tail',nodes[i-1],nodes[i],.19-i*.035,cfg.coat);
 for(let i=0;i<5;i++)cone(out,'backSpine',[0,1.54-i*.24,-.82-i*.23],[0,1.74-i*.24,-.92-i*.25],.11,cfg.accent);
 return 1.63;
}
function farmQuadruped(out,pose,cfg,id,ball,link){
 const sheep=id==='sheep',pig=id==='pig';
 ball(out,'body',[0,1.02,-.42],pig?[.76,.66,.83]:[.76,.70,.81],cfg.coat,'pear',20,28);
 if(sheep){
  // Dense overlapping wool curls wrap the entire shell and visible shoulder.
  const rings=[{y:.69,z:-.45,rx:.66,n:10},{y:1.03,z:-.45,rx:.74,n:12},{y:1.37,z:-.43,rx:.62,n:10},{y:1.59,z:-.43,rx:.39,n:8}];
  for(const [ring,r]of rings.entries())for(let i=0;i<r.n;i++){
   const theta=i*2*Math.PI/r.n,x=Math.cos(theta)*r.rx,z=r.z+Math.sin(theta)*.56;
   ball(out,'wool',[x,r.y,z],[.25,.24,.25],ring%2?cfg.light:cfg.coat,'round',10,14);
  }
  for(const sign of [-1,1])ball(out,'wool',[sign*.56,1.30,.30],[.26,.25,.24],cfg.light);
 }
 legs(out,pose,cfg,4,'farm',ball);
 if(pig){
  // Real corkscrew tail made of short connected 3D segments; visible behind
  // the rump at quarter turns, not a straight generic rope.
  let prev=[.44,1.03,-1.03];
  for(let i=1;i<=13;i++){
   const a=i/13*Math.PI*2.6;
   const next=[.44+i*.035,1.04+.17*Math.sin(a),-1.03-.17*(1-Math.cos(a))];
   link(out,'curlyTail',prev,next,.065-i*.002,cfg.side);prev=next;
  }
 }else ball(out,'tailPom',[.09,.86,-1.12],[.23,.24,.22],cfg.light);
 return sheep?1.66:1.57;
}
function petQuadruped(out,pose,cfg,id,ball,link){
 const corgi=id==='corgi',fox=id==='fox',cat=id==='cat';
 const bodyY=corgi?.69:fox?.94:.96;
 ball(out,'body',[0,bodyY,-.48],corgi?[.67,.42,1.03]:fox?[.52,.55,.86]:[.53,.59,.72],cfg.coat,'pear',20,28);
 if(corgi){
  // Low long-backed corgi: chest forward, short legs, distinct stubby tail.
  ball(out,'chest',[0,.79,.21],[.50,.43,.40],cfg.light,'round',16,22);
  for(let i=0;i<4;i++){
   const sign=i%2===0?-1:1,front=i<2,z=front?.38:-1.05,dy=lift(pose,i%2,.55);
   ball(out,'leg'+i,[sign*.37,.29+dy,z],[.18,.23,.20],cfg.coat);
   ball(out,'hoof'+i,[sign*.37,.12+dy,z+.10],[.21,.11,.24],cfg.light);
  }
  ball(out,'tailStub',[.18,.80,-1.42],[.20,.14,.24],cfg.coat);
 }else{
  if(fox)ball(out,'chest',[0,1.00,.30],[.34,.43,.20],cfg.light,'flat');
  legs(out,pose,cfg,4,'pet',ball);
 }
 if(cat){
  // Thin continuous curved cat-tail, rising then curling inward at the tip.
  const nodes=[[.48,.76,-.96],[.71,.88,-1.13],[.86,1.16,-1.19],[.88,1.49,-1.15],[.71,1.64,-1.06]];
  for(let i=1;i<nodes.length;i++)link(out,'catTail',nodes[i-1],nodes[i],.085-i*.009,cfg.coat);
  ball(out,'catTailTip',nodes.at(-1),[.085,.09,.10],cfg.side);
 }
 if(fox){
  const nodes=[[.48,.74,-1.04],[.80,.83,-1.28],[1.05,1.02,-1.48]];
  for(let i=1;i<nodes.length;i++)link(out,'foxTail',nodes[i-1],nodes[i],.23+i*.025,cfg.side);
  ball(out,'tailTip',[1.05,1.02,-1.48],[.25,.24,.31],cfg.light);
 }
 return corgi?1.35:fox?1.52:1.59;
}
function toyBiped(out,pose,cfg,id,ball,link){
 const frog=id==='frog',bear=id==='bear',bunny=id==='bunny',monkey=id==='monkey';
 if(frog){
  // Frog is wide and low, with spread rear thighs and splayed webbed feet.
  ball(out,'body',[0,.77,-.25],[.83,.42,.68],cfg.coat,'flat',20,28);
  ball(out,'belly',[0,.70,.27],[.54,.25,.19],cfg.light,'flat');
  for(const sign of [-1,1]){
   const dy=lift(pose,sign===-1?0:1,.60);
   ball(out,'leg'+(sign<0?0:1),[sign*.62,.40+dy,-.15],[.32,.25,.32],cfg.side);
   ball(out,'hoof'+(sign<0?0:1),[sign*.70,.13+dy,.26],[.31,.09,.29],cfg.coat,'flat');
   ball(out,'arm',[sign*.73,.79,.13],[.17,.20,.18],cfg.coat);
   ball(out,'hand',[sign*.79,.66,.28],[.21,.12,.18],cfg.coat);
  }
  return 1.34;
 }
 if(bunny){
  // Rabbit: pronounced haunches, tiny chest and elongated hopping hind feet.
  ball(out,'body',[0,.90,-.36],[.54,.62,.59],cfg.coat,'pear',20,28);
  ball(out,'chest',[0,1.04,.18],[.34,.38,.21],cfg.light);
  for(const sign of [-1,1]){
   const dy=lift(pose,sign<0?0:1,1.1);
   ball(out,'leg'+(sign<0?0:1),[sign*.38,.41+dy,-.32],[.28,.32,.31],cfg.coat);
   ball(out,'hoof'+(sign<0?0:1),[sign*.40,.13+dy,.10],[.23,.10,.43],cfg.light,'flat');
   ball(out,'arm',[sign*.40,1.15,.18],[.13,.21,.14],cfg.coat);
   ball(out,'hand',[sign*.44,.99,.29],[.12,.10,.13],cfg.light);
  }
  ball(out,'tailPom',[.07,.89,-.96],[.22,.22,.23],cfg.light);
  return 1.59;
 }
 if(monkey){
  // Monkey has relatively short legs, LONG forearms and a compact torso.
  ball(out,'body',[0,.96,-.33],[.58,.62,.60],cfg.coat,'pear',20,28);
  ball(out,'belly',[0,.94,.24],[.35,.42,.19],cfg.light,'flat');
  for(const sign of [-1,1]){
   const dy=lift(pose,sign<0?0:1,.90);
   ball(out,'leg'+(sign<0?0:1),[sign*.35,.33+dy,-.22],[.19,.25,.24],cfg.side);
   ball(out,'hoof'+(sign<0?0:1),[sign*.36,.13+dy,.11],[.21,.10,.29],cfg.coat);
   ball(out,'arm',[sign*.62,.97,.13],[.14,.41,.17],cfg.coat);
   ball(out,'hand',[sign*.69,.61,.30],[.19,.16,.18],cfg.light);
  }
  let prev=[.42,.81,-.84];
  for(let i=1;i<=6;i++){const a=i/6*Math.PI*1.6;const next=[.42+.12*i,.95+.34*Math.sin(a),-.88-.21*Math.sin(a*.65)];link(out,'monkeyTail',prev,next,.085,cfg.side);prev=next;}
  return 1.57;
 }
 ball(out,'body',[0,1.00,-.30],bear?[.70,.70,.67]:[.62,.69,.67],cfg.coat,'pear',20,28);
 if(bear)ball(out,'belly',[0,.96,.25],[.41,.44,.18],cfg.light,'flat');
 legs(out,pose,cfg,2,'toy',ball);
 for(const sign of [-1,1]){
  ball(out,'arm',[sign*.61,1.13,.05],[.18,.31,.20],cfg.coat);
  ball(out,'hand',[sign*.69,.90,.19],[.19,.17,.19],cfg.side);
 }
 return 1.67;
}
export function buildFamilyBody(out,pose,cfg,id,{ball,cone,link}){
 const family=pet3DTopology[id];
 switch(family){
  case 'birdBiped':return birdBiped(out,pose,cfg,id,ball,cone);
  case 'penguinBiped':return penguinBiped(out,pose,cfg,ball);
  case 'dinoBiped':return dinoBiped(out,pose,cfg,ball,cone,link);
  case 'farmQuadruped':return farmQuadruped(out,pose,cfg,id,ball,link);
  case 'petQuadruped':return petQuadruped(out,pose,cfg,id,ball,link);
  case 'toyBiped':case 'frogBiped':return toyBiped(out,pose,cfg,id,ball,link);
  default:throw new Error('No 3D rig topology for '+id);
 }
}
