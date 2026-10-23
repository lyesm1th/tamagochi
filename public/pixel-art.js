import {drawMood} from './room-mood.js';
// Integer-coordinate 16-bit-style sprites: small palette, strong silhouettes.
const ink='#304d43',cream='#fff0d1',white='#f7f3df',pink='#e5a0a6';
export function drawPetArt(c,id,frame=0,s=null,reduced=false){
 const palettes={cat:['#b8a0d2','#927aaf'],chicken:['#efd06e','#c5a34f'],corgi:['#dea36c','#ba7d4f'],frog:['#a6c17b','#789759'],bear:['#bb9477','#916e55'],dog:[white,'#d6d5bc'],dino:['#8db7a0','#65947e'],bunny:['#e7bdca','#be94a8']};
 const [body,shade]=palettes[id]||palettes.cat,r=(x,y,w,h,color=ink)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const shape=(x,y,w,h,col)=>{const b=Math.min(7,Math.floor(w/5),Math.floor(h/4));r(x+b,y,w-2*b,h);r(x+2,y+2,w-4,h-4);r(x,y+b,w,h-2*b);r(x+b,y+2,w-2*b,h-4,col);r(x+Math.min(4,Math.floor(w/3)),y+Math.min(4,Math.floor(h/3)),Math.max(1,w-8),Math.max(1,h-8),col);r(x+2,y+b,w-4,h-2*b,col);};
 const asleep=s?.sleeping||s?.napping,blink=asleep||(!reduced&&frame%4100<140);
 // Ears, crests and tails stay outside the face; neckwear anchors remain unchanged.
 if(id==='cat'){r(42,28,13,19);r(72,28,13,19);r(45,32,8,12,body);r(74,32,8,12,body);r(47,34,4,7,pink);r(76,34,4,7,pink);r(84,64,7,15);r(88,57,5,12);r(85,65,3,10,body);}
 if(id==='bunny'){shape(46,13,11,30,body);shape(71,10,11,33,body);r(50,18,3,19,pink);r(75,15,3,21,pink);}
 if(id==='bear'){shape(38,30,16,16,body);shape(75,30,16,16,body);r(43,34,6,6,shade);r(80,34,6,6,shade);}
 if(id==='corgi'){shape(38,27,16,28,body);shape(75,27,16,28,body);r(43,32,6,13,shade);r(80,32,6,13,shade);}
 if(id==='dog'){shape(33,37,19,12,body);shape(77,37,19,12,body);r(36,41,10,4,pink);r(83,41,10,4,pink);if(s?.portraitStage!=='Малюк'){r(46,25,6,14,'#c2a06c');r(76,25,6,14,'#c2a06c');r(48,25,4,4,cream);r(76,25,4,4,cream);}}
 if(id==='chicken'){shape(53,26,9,16,'#c97766');shape(62,23,9,18,'#c97766');shape(70,29,8,12,'#c97766');}
 if(id==='dino'){r(80,37,7,8,'#547d68');r(84,47,7,9,'#547d68');r(86,58,8,8,'#547d68');r(82,69,16,8);r(88,65,11,8,body);}
 shape(46,60,36,23,body);r(50,73,28,7,shade);shape(41,38,46,33,body);r(45,60,38,8,shade);
 if(id==='corgi'){r(61,40,7,20,cream);shape(51,53,27,16,cream);r(55,69,20,10,cream);}
 if(id==='bear'||id==='bunny'){shape(53,53,23,15,cream);r(56,69,17,10,cream);}
 if(id==='dog'){r(44,40,12,11,ink);r(75,41,10,12,ink);r(48,68,9,11,ink);r(72,71,7,8,ink);shape(51,54,28,15,pink);r(54,56,22,3,'#efb9ba');r(57,60,3,3);r(70,60,3,3);r(61,66,7,1);}
 if(id==='frog'){shape(39,27,20,20,body);shape(69,27,20,20,body);r(44,31,10,11,cream);r(74,31,10,11,cream);if(blink){r(45,37,8,2);r(75,37,8,2);}else{r(48,33,4,7);r(76,33,4,7);r(48,33,2,2,white);r(76,33,2,2,white);}r(51,58,26,2);r(54,60,20,2);r(53,68,24,9,'#c7d796');}
 if(id==='chicken'){shape(38,51,10,19,shade);shape(80,51,10,19,shade);r(57,54,15,5,'#c48d4e');r(60,59,9,3,'#c48d4e');r(62,62,5,5,'#c97766');}
 if(id==='dino'){r(55,69,20,9,cream);r(80,54,6,8,shade);}
 if(id!=='frog'){for(const x of [52,72]){if(blink)r(x-1,48,7,2);else{r(x,46,5,7);r(x,46,2,2,white);}}}
 if(!['dog','frog','chicken'].includes(id)){r(62,55,5,3,id==='bunny'?pink:ink);r(64,58,1,4);r(60,62,4,2);r(65,62,4,2);}
 if(id==='cat'){for(const y of [56,61]){r(35,y,13,1);r(80,y,13,1);}}
 if(!['dog','chicken'].includes(id)){r(47,55,4,2,pink);r(78,55,4,2,pink);}
 // Separate paws, sole highlights and asymmetric idle footsteps.
 const step=asleep||reduced?0:Math.floor(frame/380)%2*2;
 shape(45,77,15,7+step,id==='dog'?ink:shade);shape(69,77,15,9-step,id==='dog'?ink:shade);
 if(id!=='dog'){r(49,80,7,2,body);r(73,80,7,2,body);}if(id==='chicken'){r(45,83,15,2,'#c48d4e');r(69,83,15,2,'#c48d4e');}
}

export function drawRoomArt(c,s,frame=0,reduced=false,night=false,pos={bed:8,bowl:156,plant:170,tent:124,shelf:82}){
 const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);},goods=s?.cozy?.owned||{},owned=id=>s?.room?.[id]||goods[id],wear=id=>s?.cozy?.items?.[id]?.wear??100;
 const outline=(x,y,w,h,col)=>{r(x,y,w,h,ink);r(x+2,y+2,w-4,h-4,col);},v=id=>s?.living?.furniture?.[id]||0;
 const wall=night?'#71877e':'#b9c7a1',floor=night?'#8d8d76':'#c4a982',wood='#9e7956',darkWood='#765c43',lightWood='#bf9a6f';
 r(0,0,192,144,wall);r(0,66,192,78,floor);r(0,63,192,4,darkWood);r(0,62,192,1,lightWood);
 for(const y of [82,103,125]){r(0,y,192,1,night?'#798273':'#ac8f6d');for(let i=0;i<4;i++)r(15+i*52+(y===103?20:0),y-18,1,18,night?'#798273':'#ac8f6d');}
 drawMood(c,s);outline(14,8,43,43,wood);r(18,12,35,35,night?'#456775':'#a3c5c3');r(18,37,35,10,night?'#698775':'#87a47a');r(34,12,3,35,darkWood);r(18,28,35,3,darkWood);r(18,12,15,2,'#d1e3cc');r(42,16,7,5,night?'#e4dfad':'#f1d791');
 if(goods.curtains){r(9,7,6,44,'#eedcba');r(55,7,6,44,'#eedcba');r(9,7,52,3,darkWood);r(11,28,4,3,wood);r(55,28,4,3,wood);}
 // Storage box stays a recognizable landmark for hiding.
 outline(4,123,25,15,lightWood);r(5,121,23,4,wood);r(14,126,5,3,'#decb95');
 if(owned('rug')){r(59,121,76,17,'#718f72');r(63,123,68,12,'#eee0b7');for(let x=69;x<130;x+=15){r(x,127,5,2,'#9bb28b');r(x+2,125,1,6,'#9bb28b');}}
 if(owned('bed')){
 const x=pos.bed,variant=v('bed'),broken=wear('bed')<=0,quilt=['#b3a6c5','#d4a38d','#aacbc1'][variant];
 r(x,82,52,23,darkWood);r(x+3,78,46,23,variant===2?'#d8e4cd':wood);r(x+6,75,40,5,variant===2?'#d8e4cd':lightWood);if(variant===2){r(x+13,71,26,5,'#d8e4cd');r(x+19,68,14,4,'#d8e4cd');}else{r(x+22,79,7,3,darkWood);r(x+24,82,3,2,darkWood);}
 r(x+4,89,44,14,cream);r(x+8,85,17,7,white);r(x+28,85,14,7,white);
 r(x+4,93,44,9,quilt);r(x+4,93,44,2,'#d7c8d9');r(x+4,100,44,4,quilt);r(x+4,103,44,3,darkWood);r(x,90,4,19,wood);r(x+48,90,4,19,wood);
 if(variant===1){r(x+3,77,46,8,'#d4a38d');r(x+6,74,40,4,'#d4a38d');}
 if(wear('bed')<45){r(x+20,94,3,6,darkWood);r(x+23,98,5,2,darkWood);}if(broken){r(x+5,101,39,5,floor);r(x+9,104,14,4,wood);r(x+23,101,14,4,wood);r(x+18,110,6,3,cream);r(x+36,113,8,3,cream);}
 }
 if(owned('plant')){const x=pos.plant;outline(x-2,72,17,18,v('plant')===1?'#b3a6c5':'#d8cba6');r(x,73,13,3,wood);r(x+5,51,3,23,'#5c8056');r(x-5,54,13,6,'#71925f');r(x-7,51,7,4,'#71925f');r(x+8,59,10,5,'#71925f');r(x+12,56,7,4,'#71925f');if(wear('plant')<30){r(x-6,53,12,6,wall);r(x-5,91,7,3,'#71925f');}}
 if(owned('bowl')||goods.fountain){const x=pos.bowl;outline(x,117,26,9,v('bowl')===1?'#b3a6c5':'#7d9f80');r(x+3,116,20,3,cream);r(x+6,118,14,2,'#698d77');r(x+11,122,4,2,cream);if(goods.fountain&&wear('fountain')>0){r(x+11,108,3,9,'#a4c8cb');r(x+9,106,7,3,'#c6e0d4');}}
 if(goods.shelf){r(pos.shelf,32,42,4,darkWood);r(pos.shelf+3,36,3,5,darkWood);r(pos.shelf+36,36,3,5,darkWood);for(let i=0;i<4;i++){r(pos.shelf+3+i*9,17+i%2*4,7,15-i%2*4,['#9a87b0','#d3b477','#86a390','#b7847e'][i]);r(pos.shelf+4+i*9,20+i%2*4,2,9-i%2*4,'#d7d3b6');}if(wear('shelf')<30){r(pos.shelf+23,20,16,12,wall);r(92,130,12,3,'#9a87b0');r(107,135,10,4,'#d3b477');}}
 if(goods.lamp){r(178,82,2,20,darkWood);r(172,100,14,4,darkWood);r(170,74,18,9,night?'#f1dda3':'#e0c69d');r(173,71,12,4,night?'#f1dda3':'#e0c69d');}
 if(goods.tent){const x=pos.tent;r(x,63,40,30,'#b28f80');r(x+5,55,30,8,'#b28f80');r(x+10,48,20,8,'#b28f80');r(x+16,43,8,6,'#b28f80');outline(x+12,67,16,26,'#5b7667');r(x+14,91,12,2,lightWood);}
 if(goods.cushion){outline(38,110,25,11,v('cushion')===1?'#d4a38d':'#b3a6c5');r(42,108,17,3,'#d7c8d9');}
 if(goods.mirror){outline(145,9,20,32,wood);r(148,12,14,26,'#aac8c3');r(150,14,3,14,'#d2e2d0');}
 if(goods.post){r(5,127,24,5,darkWood);outline(14,97,7,30,lightWood);for(let i=0;i<5;i++)r(16,101+i*5,3,1,wood);}
 if(goods.toybox){outline(149,128,35,14,wood);r(148,126,37,4,lightWood);r(164,131,5,4,'#dbc68e');}
 if((s?.room?.toy||s?.playroom?.toys?.ball)&&!(s?.journal?.gesture?.kind==='ball'&&s.journal.gesture.until>Date.now())){outline(133,126,10,9,'#b3a6c5');r(136,125,5,2,'#d7c8d9');r(137,129,3,3,cream);}
 // Cracks and debris are persistent, functional indicators of furniture wear.
 const anchors={bed:[pos.bed+30,97],plant:[pos.plant,78],bowl:[pos.bowl+5,121],rug:[78,128],shelf:[pos.shelf+12,34],lamp:[178,88],tent:[pos.tent+10,73],cushion:[47,115],fountain:[pos.bowl+15,119],mirror:[151,24],post:[16,112],curtains:[11,34],toybox:[158,135]};
 for(const [id,[x,y]]of Object.entries(anchors)){if(!owned(id))continue;if(v(id)&&id!=='bed')r(x,y,7,2,v(id)===1?'#b3a6c5':'#aacbc1');if(wear(id)<65){r(x,y,2,3,darkWood);r(x+2,y+3,2,3,darkWood);}if(wear(id)<30)for(let i=0;i<4;i++)r(Math.min(187,x-7+i*6),Math.min(140,y+10+i%2*4),4,2,wood);}
 const motion=s?.living?.motion;if(motion?.until>Date.now()&&!reduced){const beat=Math.floor(frame/220)%2,[x,y]=anchors[motion.item]||[97,115];if(motion.item==='mirror'){r(150,17,9,8,white);r(152,20,2,2,ink);r(157,20,2,2,ink);}else if(motion.item==='lamp'){r(164+beat*4,107,12,3,'#8a8e76');}else if(motion.item==='fountain'||motion.item==='bowl'){r(x-4,109-beat*4,2,3,'#a4c8cb');r(x+14,110-beat*3,2,3,'#a4c8cb');}else if(motion.item==='curtains'||motion.item==='tent'){r(x+6,Math.min(112,y+12),5,3,pink);}else if(motion.kind==='gentle'){r(x+6,y-7-beat*2,3,3,cream);r(x+10,y-4,2,2,cream);}else if(motion.item==='toybox'||motion.item==='post'){r(x+8+beat*5,Math.min(136,y-8),6,6,'#b3a6c5');}}
 if(s?.living?.finished?.[0]||s?.living?.story?.step&&!(s.living.story.chapter>0)){r(69,57,10,7,wood);if(s.living.finished?.[0]||s.living.story.step>=2){r(73,47,2,10,'#5c8056');r(68,49,6,3,'#71925f');}if(s.living.finished?.[0]||s.living.story.step>=3){r(70,43,8,5,pink);r(73,44,2,2,'#efd06e');}}
 if(s?.daily?.mess)for(let i=0;i<5;i++)r(35+i*25,135+i%2*3,5,3,s.daily.mess.kind==='puddle'?'#87adb5':wood);
 if(s?.poop)for(let i=0;i<s.poop;i++){r(15+i*18,136,11,5,darkWood);r(17+i*18,133,7,3,darkWood);r(20+i*18,130,3,3,darkWood);}
 if(s?.playroom?.session?.expires>Date.now()){const run=s.playroom.session,x=34+run.target*15;if(run.kind==='ball'){outline(x,121,9,8,'#b3a6c5');r(x+3,123,3,3,cream);}if(run.kind==='laser')r(x,124,3,3,'#c77a78');if(run.kind==='music'){outline(153,108,24,13,wood);r(160,103,3,5,'#9a87b0');r(163,100,5,3,'#9a87b0');}}
 if(s?.playroom?.crafted?.stoneArt){outline(104,7,23,20,lightWood);for(let i=0;i<6;i++)r(108+i%3*5,11+Math.floor(i/3)*6,3,3,['#9a87b0','#86a390','#b7847e'][i%3]);}
 if(s?.playroom?.crafted?.mobile){r(pos.bed+26,14,1,18,wood);r(pos.bed+17,31,20,1,wood);r(pos.bed+17,32,3,7,'#71925f');r(pos.bed+33,32,4,9,pink);}
 if(s?.playroom?.decor?.display){r(68,16,22,3,wood);r(76,10,6,6,'#c2a06c');}
 if(s?.vacation){c.fillStyle=cream;c.font='9px monospace';c.fillText('HOTEL · PAUSE',59,29);}
}
