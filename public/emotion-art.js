import {emotionOf} from './emotions.js';
import {expressionRecipe,emotionFrame} from './emotion-frames.js';
import {wardrobeAnatomy} from './detailed-wardrobe.js';
export function faceAnchors(species,age,box=null){
 if(box){const a=wardrobeAnatomy(species,age);return {eyes:[a.cx-.2,a.cx+.2].map(x=>[box.x+x*box.w,box.y+a.eyes*box.h]),mouth:[box.x+a.cx*box.w,box.y+(a.eyes+.11)*box.h],unit:Math.max(1,box.h/65)};}
 const wide=age==='Малюк'?.42:age==='Дитина'?.65:age==='Підліток'?.75:1,sy=age==='Малюк'?.36:age==='Дитина'?.60:age==='Підліток'?.84:1,oy=age==='Малюк'?52:age==='Дитина'?32:age==='Підліток'?12:0;
 return {eyes:(species==='frog'?[[50,36],[78,36]]:[[54,49],[74,49]]).map(([x,y])=>[64+(x-64)*wide,oy+y*sy]),mouth:[64,oy+63*sy],unit:Math.max(.65,wide)};
}
// Classic faces are authored directly into the procedural sprite, before clothes.
// No skin-colour rectangles, screen reads, room sampling or paw cutouts.
export function drawPixelExpression(c,id,e,now=Date.now(),reduced=false){
 const f=emotionFrame(e,now,reduced),recipe=expressionRecipe(e.kind,f);if(!recipe)return;
 const eyes=id==='frog'?[[50,36],[78,36]]:[[54,49],[74,49]],ink='#304d43',r=(x,y,w,h,col=ink)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},line=(x,y,dx,dy)=>{const n=Math.max(Math.abs(dx),Math.abs(dy),1);for(let i=0;i<=n;i++)r(Math.round(x+dx*i/n),Math.round(y+dy*i/n),1,1);};
 for(const [i,[x,y]]of eyes.entries()){
  const dir=i===0?1:-1;
  if(['droop','wide','soft','look','side'].includes(recipe.eyes)){const gaze=recipe.eyes==='look'?1:recipe.eyes==='side'?-1:0;r(x-2+gaze,y-3,4,recipe.eyes==='droop'?4:6);r(x-2+gaze,y-3,1,2,'#fff0d1');}
  else if(recipe.eyes==='arc'){line(x-3,y+1,3,-2);line(x,y-1,3,2);}
  else if(recipe.eyes==='slant'){line(x-3,y-2,6,dir*2);r(x-1,y,3,2);}
  else {r(x-3,y,6,1);if(recipe.eyes==='half')r(x,y,2,2);}
  if(recipe.brow==='sad')line(x-3,y-6,6,-dir*2);
  if(recipe.brow==='angry')line(x-3,y-6,6,dir*2);
  if(recipe.brow==='raised')line(x-3,y-(i?5:7),6,0);
  if(recipe.blush)r(x-4,y+5,6,2,'#dc9aa4');
 }
 const mx=64,my=id==='frog'?59:['pig','dog'].includes(id)?66:['duck','penguin','chicken'].includes(id)?59:62,m=recipe.mouth;
 if(m==='frown'){line(mx-4,my+2,4,-2);line(mx,my,4,2);}
 else if(['laugh','laughWide','yawn','oh'].includes(m)){r(mx-3,my-1,6,m==='laughWide'?6:4);if(m.startsWith('laugh'))r(mx-2,my+2,4,1,'#d6929c');}
 else if(m==='grit'){r(mx-4,my,8,3);r(mx-3,my+1,6,1,'#fff0d1');}
 else if(m==='smile'||m==='smirk'){line(mx-4,my,4,2);line(mx,my+2,4,-2);}
 else r(mx-(m==='small'?2:4),my,m==='small'?4:8,1);
 if(recipe.tear>=0&&!reduced&&e.strength>.6){const [x,y]=eyes[0];r(x+2,y+4+recipe.tear*4,2,3,'#77b5cf');r(x+2,y+4+recipe.tear*4,1,1,'#d4f0ed');}
}
export function pixelEmotion(){return null;} // Preserve the original pixel-art face.
