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
 ball(out,'body',[0,1.10,-.23],[.62,.90,.65],cfg.coat,'pear',22,30);
 ball(out,'belly',[0,1.05,.24],[.45,.69,.24],cfg.light,'flat',18,26);
 legs(out,pose,cfg,2,'penguin',ball);
 for(const sign of [-1,1]){
  ball(out,'flipper',[sign*.63,1.12,-.20],[.13,.43,.24],cfg.side,'flat',20,22);
  ball(out,'flipperTip',[sign*.75,.79,-.13],[.12,.19,.17],cfg.side,'flat',14,18);
 }
 return 1.82;
}
function dinoBiped(out,pose,cfg,ball,cone,link){
 ball(out,'body',[0,1.10,-.48],[.68,.72,.85],cfg.coat,'pear',22,30);
 ball(out,'belly',[0,1.05,.12],[.45,.51,.26],cfg.light,'flat');
 legs(out,pose,cfg,2,'dino',ball);
 for(const sign of [-1,1]){
  const dy=pose.action==='wave'&&sign===1?[0,.09,.20,.08][Math.floor((pose.time||0)/125)%4]:0;
  ball(out,'arm',[sign*.57,1.17,.20],[.14,.23,.16],cfg.side);
  ball(out,'hand',[sign*.62,.98+dy,.34],[.13,.11,.13],cfg.coat);
  for(const j of [-1,0,1])ball(out,'claw',[sign*.63+j*.065,.94+dy,.45],[.04,.07,.055],cfg.light,'round',8,10);
 }
 link(out,'tail',[0,1.03,-1.02],[.34,1.05,-1.70],.20,cfg.coat);
 link(out,'tail',[.34,1.05,-1.70],[.57,1.15,-2.08],.115,cfg.side);
 for(let i=0;i<5;i++)cone(out,'backSpine',[0,1.64-i*.24,-.72-i*.21],[0,1.88-i*.25,-.87-i*.22],.16,cfg.accent);
 return 1.67;
}
function farmQuadruped(out,pose,cfg,id,ball,link){
 const sheep=id==='sheep',pig=id==='pig';
 ball(out,'body',[0,1.03,-.40],pig?[.78,.69,.83]:[.76,.76,.83],cfg.coat,'pear',20,28);
 if(sheep)for(const [x,y,z] of [[-.50,1.46,-.05],[.50,1.46,-.04],[0,1.62,-.32],[-.65,1.06,-.14],[.65,1.05,-.14]])
  ball(out,'wool',[x,y,z],[.29,.31,.29],cfg.light);
 legs(out,pose,cfg,4,'farm',ball);
 if(pig)link(out,'tail',[.43,.90,-1.08],[.73,1.19,-1.16],.06,cfg.side);
 else ball(out,'tailPom',[.05,.86,-1.15],[.19,.18,.22],cfg.light);
 return sheep?1.67:1.58;
}
function petQuadruped(out,pose,cfg,id,ball,link){
 const corgi=id==='corgi',fox=id==='fox';
 ball(out,'body',[0,corgi?.84:1.02,-.43],corgi?[.75,.52,.87]:fox?[.56,.63,.86]:[.62,.68,.73],cfg.coat,'pear',20,28);
 ball(out,'belly',[0,corgi?.80:.98,.24],[.43,.39,.20],cfg.light,'flat');
 legs(out,pose,cfg,4,'pet',ball);
 if(fox||id==='cat'){
  link(out,'tail',[.50,.85,-.89],[1.15,1.37,-1.24],fox?.20:.09,fox?cfg.side:cfg.coat);
  if(fox)ball(out,'tailTip',[1.15,1.37,-1.24],[.22,.22,.24],cfg.light);
 }
 return corgi?1.46:1.63;
}
function toyBiped(out,pose,cfg,id,ball,link){
 const frog=id==='frog',bear=id==='bear';
 ball(out,'body',[0,frog?.88:1.04,-.30],frog?[.78,.57,.68]:bear?[.72,.77,.69]:[.62,.69,.67],cfg.coat,'pear',20,28);
 if(id==='monkey')ball(out,'belly',[0,1.04,.27],[.42,.42,.20],cfg.light,'flat');
 legs(out,pose,cfg,2,frog?'frog':'toy',ball);
 for(const sign of [-1,1]){
  ball(out,'arm',[sign*(frog?.67:.58),1.10,-.01],[.20,.29,.22],cfg.side);
  ball(out,'hand',[sign*(frog?.79:.67),.88,.12],[.19,.15,.19],cfg.coat);
 }
 if(id==='monkey')link(out,'tail',[.45,.81,-.81],[1.04,1.46,-1.05],.085,cfg.side);
 if(id==='bunny')ball(out,'tailPom',[.02,.89,-.99],[.20,.22,.21],cfg.light);
 return frog?1.54:1.70;
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
