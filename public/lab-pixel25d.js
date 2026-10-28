// Owner-only Pixel 2.5D experiment. Reuses the actual Detailed art, without changing a save.
import {drawDetailedRoom,drawDetailedPortrait, detailedAnchors,loadDetailedAssets} from './detailed-renderer.js';
import {labPet} from './lab-state.js';
import {articulatePortrait} from './lab-rig.js';
import {labClipPose} from './lab-motion.js';
import {rigPoints} from './lab-rig.js';
import {interactionPose,animationLibrary} from './lab-interactions25d.js';
import {referenceSpecies,drawReferenceRig} from './lab-reference-rig.js';
import {catAttachmentGraph,attachWardrobe,roomContact} from './lab-attachments25d.js';
const size=[384,288];
export function createPixel25D(canvas){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true});
 if(!gl)return null;
 const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 const program=gl.createProgram();
 gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec2 aPos;attribute vec2 aUV;varying vec2 vUV;uniform float uYaw;uniform float uDepth;uniform float uActor;void main(){float x=aPos.x;float y=aPos.y;if(uActor>0.5){float c=cos(uYaw);float s=sin(uYaw);x=aPos.x*c+uDepth*s*.18;y=aPos.y+uDepth*.05;}gl_Position=vec4(x,y,0.,1.);vUV=aUV;}`));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec2 vUV;uniform sampler2D uTexture;void main(){vec4 col=texture2D(uTexture,vUV);if(col.a<0.04)discard;gl_FragColor=col;}`));
 gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 const buffer=gl.createBuffer(),location=gl.getAttribLocation(program,'aPos'),uv=gl.getAttribLocation(program,'aUV');
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const yawLoc=gl.getUniformLocation(program,'uYaw'),depthLoc=gl.getUniformLocation(program,'uDepth'),actorLoc=gl.getUniformLocation(program,'uActor');
 function layer(source,rect,yaw=0,depth=0,actor=false){
  const [x,y,w,h]=rect;
  const verts=new Float32Array([x,y,0,1,x+w,y,1,1,x,y+h,0,0,x+w,y,1,1,x+w,y+h,1,0,x,y+h,0,0]);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,verts,gl.STREAM_DRAW);
  gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,16,0);
  gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,16,8);
  gl.uniform1f(yawLoc,yaw);gl.uniform1f(depthLoc,depth);gl.uniform1f(actorLoc,actor?1:0);
  gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
  gl.drawArrays(gl.TRIANGLES,0,6);
 }
 return {render(background,portrait,{yaw=0,depth=0,bob=0}={}){
  canvas.width=size[0];canvas.height=size[1];gl.viewport(0,0,...size);gl.clearColor(.91,.88,.82,1);gl.clear(gl.COLOR_BUFFER_BIT);
  layer(background,[-1,-1,2,2]);layer(portrait,[-.34+depth*.13,-.81+bob/144,.68,.83],yaw,depth,true);
 },destroy(){gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);}};
}
export async function mountPixel25DLab(){
 const target=document.getElementById('pixel25d-stage');if(!target)return;
 const status=document.getElementById('pixel25d-status');
 let engine;try{engine=createPixel25D(target);}catch(e){status.textContent='WebGL unavailable: '+e.message;return;}
 if(!engine){status.textContent='WebGL недоступний. Detailed залишається активним.';return;}
 status.textContent='Завантаження Detailed-атласів для Pixel 2.5D…';
 if(!await loadDetailedAssets()){status.textContent='Не вдалося завантажити Detailed-атласи.';engine.destroy();return;}
 const background=document.createElement('canvas'),portrait=document.createElement('canvas');
 background.width=384;background.height=288;portrait.width=128;portrait.height=128;
 const get=id=>document.getElementById(id);
 let clock=0,last=0,alive=true;
 const syncTimeline=()=>{const action=get('pixel25d-interaction')?.value;const duration=animationLibrary[action]?.duration||3000;const timeline=get('pixel25d-time');timeline.max=String(duration);if(clock>=duration)clock=0;timeline.value=String(Math.round(clock));};
 const redraw=()=>{
  const options=Object.fromEntries(['species','age','body','head','neck','eyes','emotion','scenario','item','action','variant','condition','layout'].map(id=>[id,get(id)?.value]));
  options.sleeping=!!get('sleeping')?.checked;
  const time=1700000000000+clock;
  const pet=labPet(options,time);
  drawDetailedRoom(background.getContext('2d'),pet,clock,!!get('reduced')?.checked,time);
  portrait.getContext('2d').clearRect(0,0,portrait.width,portrait.height);
  drawDetailedPortrait(portrait,pet.species,pet,clock,true,null,!!get('reduced')?.checked);
  const clip=get('pixel25d-clip').value;
  const pose=clip==='manual'?null:labClipPose(clip,clock);
  const actionName=get('pixel25d-interaction')?.value||'manual';
  const actionPose=actionName==='manual'?null:interactionPose(actionName,clock);
  const referenceEnabled=get('pixel25d-reference')?.checked&&pet.species===referenceSpecies;
  const articulated=referenceEnabled?portrait:articulatePortrait(portrait,pet.species,pet.portraitStage,{tilt:pose?.tilt??Number(get('pixel25d-head').value),showRig:get('pixel25d-rig').checked});
  const finalPortrait=referenceEnabled?drawReferenceRig(articulated,rigPoints(pet.species,pet.portraitStage,articulated.width,articulated.height),{
   headYaw:actionPose?.headYaw??Number(get('pixel25d-yaw').value),blink:(actionPose?.blink||get('pixel25d-blink')?.checked||false),leftHand:actionPose?.leftHand??Number(get('pixel25d-left-hand').value),rightHand:actionPose?.rightHand??Number(get('pixel25d-right-hand').value)},get('pixel25d-rig').checked):articulated;
  engine.render(background,finalPortrait,{yaw:referenceEnabled?0:(actionPose?.headYaw??pose?.yaw??Number(get('pixel25d-yaw').value))*Math.PI/180,depth:Number(get('pixel25d-depth').value)/100,bob:actionPose?.bob??pose?.bob??0});
  const anchors=detailedAnchors(pet.species,pet.portraitStage);
  const attachmentStatus=get('pixel25d-attachments');
  if(attachmentStatus)attachmentStatus.textContent=referenceEnabled?(()=>{const graph=catAttachmentGraph(pet.portraitStage,{headYaw:actionPose?.headYaw??Number(get('pixel25d-yaw').value),leftHand:actionPose?.leftHand,rightHand:actionPose?.rightHand});const clothes=attachWardrobe(pet.cozy?.wearing||{},graph);const contact=roomContact(actionName,graph);return 'Одяг: '+(clothes.map(x=>x.slot+'→'+x.joint).join(', ')||'немає')+' · Контакт із кімнатою: '+contact.target+' ('+contact.anchor.x.toFixed(2)+', '+contact.anchor.y.toFixed(2)+')';})():'Якорі доступні для еталонного кота';
  target.dataset.labRendered='true';
  get('pixel25d-yaw-output').textContent=get('pixel25d-yaw').value+'°';
  status.textContent=(referenceEnabled?'CAT REFERENCE RIG · ':'')+'WebGL · ортографічна проєкція · Detailed pixel textures · yaw '+get('pixel25d-yaw').value+'° · depth '+get('pixel25d-depth').value+' · anchors: '+Object.keys(anchors).join(', ');
 };
 for(const el of document.querySelectorAll('select,input'))el.addEventListener('change',redraw);
 get('pixel25d-interaction')?.addEventListener('change',()=>{clock=0;syncTimeline();redraw();});
 get('species')?.addEventListener('change',()=>{const cat=get('species').value===referenceSpecies;get('pixel25d-reference').checked=cat;redraw();});
 for(const id of ['pixel25d-yaw','pixel25d-depth','pixel25d-head','pixel25d-left-hand','pixel25d-right-hand'])get(id).addEventListener('input',redraw);
 get('pixel25d-refresh').addEventListener('click',redraw);
 get('pixel25d-time').addEventListener('input',()=>{clock=Number(get('pixel25d-time').value);redraw();});
 const tick=t=>{if(!alive)return;if(get('pixel25d-play').checked&&(get('pixel25d-clip').value!=='manual'||get('pixel25d-interaction')?.value!=='manual')){clock=(clock+Math.min(64,Math.max(0,t-(last||t))))%Math.max(1,Number(get('pixel25d-time').max));get('pixel25d-time').value=String(Math.round(clock));redraw();}last=t;requestAnimationFrame(tick);};
 requestAnimationFrame(tick);
 get('pixel25d-save').addEventListener('click',()=>{redraw();const link=document.createElement('a');link.download='pixel25d-'+get('species').value+'-'+get('age').value+'.png';link.href=target.toDataURL('image/png');link.click();});
 syncTimeline();redraw();
 return {redraw,destroy:()=>{alive=false;engine.destroy();}};
}
if(typeof document!=='undefined'&&document.getElementById('pixel25d-stage'))window.addEventListener('load',()=>{mountPixel25DLab();});
