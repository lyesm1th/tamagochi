// Owner-only Pixel 2.5D experiment. Reuses the actual Detailed art, without changing a save.
import {drawDetailedRoom,drawDetailedPortrait, detailedAnchors} from './detailed-renderer.js';
import {labPet} from './lab-state.js';
import {articulatePortrait} from './lab-rig.js';
import {labClipPose} from './lab-motion.js';
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
  gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
  gl.drawArrays(gl.TRIANGLES,0,6);
 }
 return {render(background,portrait,{yaw=0,depth=0}={}){
  canvas.width=size[0];canvas.height=size[1];gl.viewport(0,0,...size);gl.clearColor(.91,.88,.82,1);gl.clear(gl.COLOR_BUFFER_BIT);
  layer(background,[-1,-1,2,2]);layer(portrait,[-.34+depth*.13,-.81,.68,.83],yaw,depth,true);
 },destroy(){gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);}};
}
export function mountPixel25DLab(){
 const target=document.getElementById('pixel25d-stage');if(!target)return;
 const status=document.getElementById('pixel25d-status');
 let engine;try{engine=createPixel25D(target);}catch(e){status.textContent='WebGL unavailable: '+e.message;return;}
 if(!engine){status.textContent='WebGL недоступний. Detailed залишається активним.';return;}
 const background=document.createElement('canvas'),portrait=document.createElement('canvas');
 background.width=384;background.height=288;portrait.width=128;portrait.height=128;
 const get=id=>document.getElementById(id);
 let clock=0,last=0,alive=true;
 const redraw=()=>{
  const options=Object.fromEntries(['species','age','body','head','neck','eyes','emotion','scenario','item','action','variant','condition','layout'].map(id=>[id,get(id)?.value]));
  options.sleeping=!!get('sleeping')?.checked;
  const pet=labPet(options,Date.now());
  drawDetailedRoom(background.getContext('2d'),pet,0,!!get('reduced')?.checked,Date.now());
  drawDetailedPortrait(portrait,pet.species,pet,0,true,null,!!get('reduced')?.checked);
  const clip=get('pixel25d-clip').value;
  const pose=clip==='manual'?null:labClipPose(clip,clock);
  const articulated=articulatePortrait(portrait,pet.species,pet.portraitStage,{tilt:pose?.tilt??Number(get('pixel25d-head').value),showRig:get('pixel25d-rig').checked});
  engine.render(background,articulated,{yaw:(pose?.yaw??Number(get('pixel25d-yaw').value))*Math.PI/180,depth:Number(get('pixel25d-depth').value)/100});
  const anchors=detailedAnchors(pet.species,pet.portraitStage);
  get('pixel25d-yaw-output').textContent=get('pixel25d-yaw').value+'°';
  status.textContent='WebGL · ортографічна проєкція · Detailed pixel textures · yaw '+get('pixel25d-yaw').value+'° · depth '+get('pixel25d-depth').value+' · anchors: '+Object.keys(anchors).join(', ');
 };
 for(const el of document.querySelectorAll('select,input'))el.addEventListener('change',redraw);
 for(const id of ['pixel25d-yaw','pixel25d-depth','pixel25d-head'])get(id).addEventListener('input',redraw);
 get('pixel25d-refresh').addEventListener('click',redraw);
 get('pixel25d-time').addEventListener('input',()=>{clock=Number(get('pixel25d-time').value);redraw();});
 const tick=t=>{if(!alive)return;if(get('pixel25d-play').checked&&get('pixel25d-clip').value!=='manual'){clock=(clock+Math.min(64,Math.max(0,t-(last||t))))%3000;get('pixel25d-time').value=String(Math.round(clock));redraw();}last=t;requestAnimationFrame(tick);};
 requestAnimationFrame(tick);
 get('pixel25d-save').addEventListener('click',()=>{redraw();const link=document.createElement('a');link.download='pixel25d-'+get('species').value+'-'+get('age').value+'.png';link.href=target.toDataURL('image/png');link.click();});
 redraw();
 return {redraw,destroy:()=>{alive=false;engine.destroy();}};
}
if(typeof document!=='undefined'&&document.getElementById('pixel25d-stage'))window.addEventListener('load',()=>{mountPixel25DLab();});
