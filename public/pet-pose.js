// Pure pose calculation. Dependencies are supplied by the caller to preserve the
// existing rendering state, clock reads, and animation priority.
export function resolvePetPose(s,age,frame,preview=false,{behaviorPose,reduced,careForm,effectActive,getEffect,furniturePositions,favoriteCorner,now}={}){
 if(!s||preview)return {x:0,y:0,kind:'rest'};
 const p=behaviorPose(s,age,frame,reduced);
 if(!reduced&&!s.sleeping&&!s.napping&&['Підліток','Дорослий','Старенький'].includes(age)){
  if(careForm(s)==='cozy'){p.x=Math.round(p.x*.5);p.y+=2;}
  if(careForm(s)==='scruffy'&&p.kind==='walk')p.y-=Math.floor(frame/210)%2*2;
  if(effectActive()&&['trick','walk'].includes(getEffect().kind))p.y-=Math.floor(frame/220)%2*5;
 }
 if(s.room?.bed&&(s.sleeping||s.napping)&&age!=='Яєчко')p.x=furniturePositions(s).bed+24-64;
 else if(s.room?.bowl&&effectActive()&&getEffect().kind==='feed'&&!s.portraitStage)p.x=furniturePositions(s).bowl+12-64;
 if(p.kind==='sit'&&!(s.world?.walk?.expires>now()))p.x=favoriteCorner(s).x;
 if(s.playroom?.session?.expires>now()&&!s.sleeping&&!s.napping){
  const run=s.playroom.session;
  p.x=20+run.pet*10-64;
  p.y=run.kind==='music'&&!reduced?-Math.floor(frame/180)%2*5:run.kind==='laser'&&(s.playroom.skills.laser||0)>=3?3:0;
 }
 return p;
}
