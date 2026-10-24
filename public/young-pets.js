import {drawPetArt} from './pixel-art.js';
// Pixel anatomy changes at each age; each species keeps its own silhouette.
export function drawLegacyYoungPet(ctx,id,age,color,frame=0,sleeping=false,reduced=false){
 const baby=age==='Малюк',ink='#35482e',cream='#f5edcf',pink='#dfa0a8';
 const r=(x,y,w,h,c=ink)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
 const box=(x,y,w,h,c=color)=>{r(x-2,y+2,w+4,h-4);r(x+2,y-2,w-4,h+4);r(x,y,w,h);r(x+2,y,w-4,h,c);r(x,y+2,w,h-4,c);r(x+3,y+1,Math.max(2,w-8),1,'#fff0d1');};
 const eyes=(x,y,gap=14)=>{if(sleeping){r(x,y+2,4,2);r(x+gap,y+2,4,2);}else{r(x,y,3,baby?4:5);r(x+gap,y,3,baby?4:5);r(x,y,1,1,cream);r(x+gap,y,1,1,cream);}};
 const mouth=(x,y)=>{r(x,y,3,2);};
 const step=sleeping||reduced?0:Math.floor(frame/350)%2*2;
 if(age==='Дитина'){
  if(id==='bunny'){box(49,30,7,20);box(70,32,7,18);}
  if(id==='cat'||id==='corgi'){r(47,37,10,17);r(71,37,10,17);r(50,41,4,10,color);r(74,41,4,10,color);}
  if(id==='bear'){box(43,43,10,10);box(74,43,10,10);}
  if(id==='dog'){box(40,49,12,7);box(77,49,12,7);r(51,41,3,8,'#bfa36a');r(74,41,3,8,'#bfa36a');}
  if(id==='frog'){box(45,43,13,12);box(69,43,13,12);r(79,70,13,4,color);}
  if(id==='chicken'){r(58,40,5,10,'#b78239');r(64,42,4,8,'#b78239');}
  if(id==='dino'){r(76,46,6,8,'#527b65');r(78,69,13,5,color);}
  box(47,51,33,27);r(53,76,21,5,color);
  eyes(53,56,17);
  if(id==='dog'){r(48,52,9,8);box(52,63,23,10,pink);r(57,66,3,2);r(68,66,3,2);}
  else if(id==='chicken'){r(61,63,9,5,'#c17c32');r(43,63,4,10,'#c1a345');r(80,63,4,10,'#c1a345');}
  else if(id==='frog'){r(54,66,20,2);r(55,70,18,5,'#b9d284');}
  else{r(55,65,17,9,cream);mouth(63,65);}
  r(48,80,10,4+step);r(70,80,10,6-step);return;
 }

 if(id==='frog'){
  if(baby){r(76,65,17,5);r(88,61,8,5);r(94,57,5,5);box(50,52,26,22);eyes(56,57,11);mouth(63,66);r(55,72,15,3,'#c1d88b');}
  else{box(43,42,13,13);box(71,42,13,13);box(46,53,34,23);r(41,73,14,5);r(73,73,14,5);r(42,77,12,4,color);r(74,77,12,4,color);eyes(47,46,28);r(55,65,17,2);r(56,68,15,4,'#b9d284');}
 }else if(id==='chicken'){
  if(baby){r(62,44,3,7,color);r(66,46,3,5,color);box(51,53,25,23);eyes(56,58,12);r(61,65,7,4,'#ca8a35');r(48,63,4,8,'#c6a342');r(77,63,4,8,'#c6a342');r(55,78,7,3);r(68,78,7,3);}
  else{box(47,45,33,24);box(51,66,26,13);r(58,37,5,8,'#b06343');r(65,39,5,7,'#b06343');eyes(53,51,18);r(60,59,9,5,'#c17c32');r(41,58,6,15,'#c1a345');r(80,58,7,15,'#c1a345');r(54,79,7,4+step);r(70,79,7,6-step);}
 }else if(id==='dog'){
  if(baby){box(46,53,8,6);box(75,53,8,6);box(52,52,23,25);r(52,53,7,9);eyes(56,57,12);box(55,65,18,9,pink);r(59,68,2,2);r(67,68,2,2);r(54,78,7,3);r(67,78,7,3);}
  else{box(39,48,12,8);box(78,48,12,8);r(49,37,4,9,'#b8a067');r(74,37,4,9,'#b8a067');box(48,45,31,25);box(51,69,25,11);r(49,46,10,10);r(70,70,7,8);eyes(54,51,17);box(53,59,22,11,pink);r(58,62,3,3);r(68,62,3,3);r(52,80,8,3+step);r(69,80,8,5-step);}
 }else if(id==='dino'){
  if(baby){box(52,53,23,22);r(74,69,13,5);r(83,65,6,5,color);r(56,68,13,8,cream);eyes(57,58,11);r(64,66,5,2);r(54,77,8,4);r(68,77,8,4);}
  else{r(74,42,6,7,'#527b65');r(79,52,7,7,'#527b65');box(47,45,31,24);box(52,67,27,13);r(77,72,15,6);r(87,67,7,6,color);r(58,68,14,10,cream);eyes(53,51,16);r(63,60,8,2);r(49,62,6,8,color);r(53,80,9,4+step);r(72,80,9,6-step);}
 }else{
  const x=baby?52:48,y=baby?54:46,w=baby?24:32,h=baby?21:25;
  if(id==='bunny'){box(baby?54:49,baby?39:24,baby?5:7,baby?16:24);box(baby?69:72,baby?42:28,baby?5:7,baby?13:20);if(!baby){r(52,27,2,15,pink);r(75,31,2,14,pink);}}
  if(id==='cat'){r(x,y-7,baby?7:10,10);r(x+w-(baby?7:10),y-7,baby?7:10,10);r(x+2,y-4,3,6,color);r(x+w-5,y-4,3,6,color);if(!baby){r(81,64,7,15);r(86,59,5,9);r(82,65,3,11,color);}}
  if(id==='bear'){box(x-4,y-4,baby?7:10,baby?7:10);box(x+w-3,y-4,baby?7:10,baby?7:10);}
  if(id==='corgi'){r(x-3,y-10,baby?8:12,17);r(x+w-5,y-10,baby?8:12,17);r(x,y-5,4,9,color);r(x+w-2,y-5,4,9,color);}
  box(x,y,w,h);if(!baby)box(52,69,24,11);
  if(id==='corgi'){r(baby?62:61,y,baby?4:6,12,cream);r(x+4,y+13,w-8,7,cream);}
  if(id==='bear'||id==='bunny'){r(x+5,y+11,w-10,8,cream);}
  eyes(x+5,y+6,baby?11:18);mouth(baby?63:63,y+14);
  if(id==='cat'&&!baby){r(42,61,8,2);r(79,61,8,2);}
  if(id==='bear'&&!baby){r(53,69,20,9,cream);r(44,69,7,8);r(77,69,7,8);}
  if(id==='corgi'&&!baby){r(54,70,18,8,cream);r(80,70,9,5,color);}
  r(baby?53:51,baby?77:81,baby?8:10,3+step);r(baby?67:69,baby?77:81,baby?8:10,5-step);
 }
 if(sleeping){ctx.fillStyle=ink;ctx.font='8px monospace';ctx.fillText('z',89,39);}
}

export function drawYoungPet(ctx,id,age,color,frame=0,sleeping=false,reduced=false,state=null){
 const [scale,offsetY]=age==='Малюк'?[.36,52]:age==='Дитина'?[.60,32]:[.84,12];
 const wide=age==='Малюк'?.42:age==='Дитина'?.65:.75;
 const proxy={fillStyle:'',fillRect(x,y,w,h){ctx.fillStyle=this.fillStyle==='#e5a0a6'?'#dfa0a8':this.fillStyle;const left=Math.round(64+(x-64)*wide),top=Math.round(offsetY+y*scale);ctx.fillRect(left,top,Math.max(1,Math.round(w*wide)),Math.max(1,Math.round(h*scale)));}};
 drawPetArt(proxy,id,frame,{...state,sleeping,portraitStage:age},reduced);
}
