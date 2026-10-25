import {emotionOf} from './emotions.js';
import {petAnatomy} from './pet-anatomy.js';

// Animate the existing illustrated pixels. No replacement eyes, mouth or skin
// colour sampled from the room. All coordinates belong to the isolated actor.
export function emotionalAppearance(pet,now=Date.now(),reduced=false){
 const e=emotionOf(pet,now),elapsed=Math.max(0,now-(e.at??pet?.born??now)),phase=elapsed%14000;
 const strength=Math.max(0,Math.min(1,e.strength||0))*(e.at==null?1:Math.min(1,elapsed/700));
 const gesture=!reduced&&phase<1800?Math.sin(phase/1800*Math.PI):0;
 const blinkAt=e.kind==='bored'?5100:5800,blinkLength=e.kind==='bored'?850:300,blink=!reduced&&phase>=blinkAt&&phase<blinkAt+blinkLength?Math.sin((phase-blinkAt)/blinkLength*Math.PI):0;
 return {kind:e.kind,strength,gesture,blink,tear:!reduced&&['sad','hurt'].includes(e.kind)&&phase>=1800&&phase<4200?(phase-1800)/2400:-1};
}
function mappedAxis(y,center,radius,scale){
 const d=y-center,inner=radius*.62,abs=Math.abs(d),outer=radius*1.8;
 if(abs>=outer)return y;
 if(abs<=inner*scale)return center+d/scale;
 return center+Math.sign(d)*(inner+(abs-inner*scale)*(outer-inner)/(outer-inner*scale));
}
export function expressionFrame(base,id,stage,appearance,pad=0){
 const a=petAnatomy[id]?.[stage];if(!a||!appearance.strength)return base;
 const lid={angry:-.08,annoyed:-.06,bored:-.10,shy:-.04,surprised:.05}[appearance.kind]||0,eyeScale=Math.max(.12,1-appearance.blink*.86)*(1+lid*appearance.strength)*(appearance.kind==='amused'?1-.13*appearance.gesture*appearance.strength:1),open=appearance.kind==='amused'?1+.14*appearance.gesture*appearance.strength:1;
 if(eyeScale===1&&open===1&&appearance.tear<0)return base;
 const cv=document.createElement('canvas');cv.width=base.width;cv.height=base.height;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
 const e=appearance;
 const warp=eyeScale!==1||open!==1;
 if(warp){
 const src=base.getContext('2d').getImageData(0,0,base.width,base.height),out=c.createImageData(base.width,base.height),w=base.width,h=base.height;
 const eyes=a.eyes.map(b=>({x:pad+(b[0]+b[2])/2,y:pad+(b[1]+b[3])/2,rx:(b[2]-b[0])/2+1,ry:(b[3]-b[1])/2+1}));
 const mouth=a.mouth;
 // An inverse local warp squeezes the actual eye, highlight and outline together.
 // The continuous surrounding skin mapping avoids erase patches and doubled faces.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  let sy=y;
  for(const eye of eyes)if(Math.abs(x-eye.x)<eye.rx*1.55){const edge=Math.min(1,(eye.rx*1.55-Math.abs(x-eye.x))/(eye.rx*.35));sy=mappedAxis(y,eye.y,eye.ry,1+(eyeScale-1)*edge);}
  if(open!==1&&Math.abs(x-(pad+mouth[0]))<mouth[2])sy=mappedAxis(y,pad+mouth[1],mouth[3],open);
  const q=(y*w+x)*4,p=(Math.max(0,Math.min(h-1,Math.round(sy)))*w+x)*4;
  out.data[q]=src.data[p];out.data[q+1]=src.data[p+1];out.data[q+2]=src.data[p+2];out.data[q+3]=src.data[p+3];
 }
 c.putImageData(out,0,0);
 }else c.drawImage(base,0,0);
 if(e.tear>=0){
  // A tear first gathers at the lower eyelid, then travels down that cheek.
  const u=Math.max(1,Math.round(a.size[1]/110)),t=e.tear,alpha=Math.min(1,(1-t)*4)*e.strength;
  c.globalAlpha=alpha;
  for(const [i,b]of a.eyes.entries()){
   if(e.kind==='hurt'&&i===1)continue;
   const x=Math.round(pad+(i===0?b[0]+(b[2]-b[0])*.68:b[0]+(b[2]-b[0])*.32)),start=pad+b[3],travel=Math.min(a.size[1]*.11,16),y=Math.round(start+(t<.22?0:(t-.22)/.78*travel));
   c.fillStyle='#4e91ac';c.fillRect(x,y,2*u,3*u);c.fillRect(x-u,y+u,4*u,2*u);
   c.fillStyle='#9ed5df';c.fillRect(x,y,2*u,2*u);c.fillStyle='#e5f5ee';c.fillRect(x,y,u,u);
  }c.globalAlpha=1;
 }
 return cv;
}
export function withEmotionalPose(c,appearance,x,feet,paint,reduced=false){
 const e=appearance;if(!e.strength){paint();return;}const k=e.strength,g=reduced?0:e.gesture;
 c.save();c.translate(x,feet);
 if(['sad','hurt'].includes(e.kind)){c.rotate(-.035*k);c.scale(1,1-.025*k);}
 if(e.kind==='angry'){c.rotate(.025*k);c.translate(Math.sin(g*Math.PI*4)*g*1.1*k,0);}
 if(e.kind==='annoyed')c.rotate(.045*k);
 if(e.kind==='bored'){c.rotate(-.025*k);c.scale(1,1-.018*k);}
 if(e.kind==='amused'){c.translate(0,-Math.abs(Math.sin(g*Math.PI*3))*g*1.8*k);c.scale(1,1-Math.abs(Math.sin(g*Math.PI*3))*g*.022*k);}
 if(e.kind==='curious')c.rotate(.055*k);
 if(e.kind==='surprised'){c.translate(0,-g*2*k);c.scale(1,1+.018*g*k);}
 if(e.kind==='anxious'){c.scale(.99,1.012);c.rotate(Math.sin(g*Math.PI*2)*g*.015*k);}
 if(e.kind==='shy')c.rotate(-.045*k);
 if(e.kind==='proud')c.scale(1,1+.018*k);
 if(['grateful','content'].includes(e.kind))c.rotate(.012*k);
 c.translate(-x,-feet);paint();c.restore();
}
