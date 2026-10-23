import {stableHash,behaviorPose} from './traits.js';
import {isNight,nightPhase,itemStatus} from './cozy-life.js';
import {bedding,favoriteCorner} from './playroom.js';
import {weatherAt} from './little-world.js';
export function sceneFurniture(s){const layout=s.playroom?.decor?.layout||0;return layout===1?{bed:126,bowl:18,plant:12,tent:20,shelf:87}:layout===2?{bed:70,bowl:16,plant:170,tent:132,shelf:7}:{bed:8,bowl:156,plant:170,tent:124,shelf:82};}
export function scenePose(s,frame=0,reduced=false,now=Date.now()){
 const pos=sceneFurniture(s),phase=nightPhase(s,now);if(s?.dead||s?.vacation)return {x:96,feet:118,scale:1,phase};if(s?.sleeping||s?.napping){if(phase==='return'){const k=((now+stableHash(s.id||s.species))%(12*60000)-8000)/6000;return {x:(pos.bowl+10)*(1-k)+(pos.bed+25)*k,feet:119-20*k,scale:1.02-.24*k,phase};}return phase==='water'?{x:pos.bowl+10,feet:119,scale:1.02,phase}:{x:pos.bed+25,feet:99,scale:.78,phase};}
 if(s?.playroom?.session?.expires>now)return {x:34+s.playroom.session.pet*15,feet:124,scale:1.05,phase};
 if(s?.bodyLanguage?.kind==='approach'&&s.bodyLanguage.until>now)return {x:96,feet:134,scale:1.12,phase};
 if(s){const gesture=behaviorPose(s,'Дорослий',frame,reduced);if(gesture.kind==='approach')return {x:96,feet:134,scale:1.12,phase};if(gesture.kind==='sit'&&!(s.world?.walk?.expires>now)){const corner=favoriteCorner(s);return corner.index===0?{x:pos.bed+25,feet:99,scale:.78,phase}:corner.index===1?{x:pos.bowl+10,feet:119,scale:1.02,phase}:{x:151,feet:88,scale:.68,phase};}}
 const d=reduced ? .5 : (Math.sin(frame/4700)+1)/2;return {x:96+(reduced?0:Math.sin(frame/3200)*43),feet:85+45*d,scale:.65+.45*d,phase};
}
export function drawExpandedRoom(c,s,frame=0,reduced=false,now=Date.now()){
 const night=s?.cozy?.nightMode&&isNight(s,now),pos=sceneFurniture(s),goods=s?.cozy?.owned||{},r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);},step=reduced?0:Math.floor(frame/400)%3;
 if(s?.world?.walk?.expires>now){const place=s.world.walk.place;r(0,0,192,144,night?'#587775':'#b6cbb6');r(0,61,192,83,night?'#738766':'#97b77c');for(let i=0;i<6;i++){r(64-i*5,68+i*13,64+i*10,13,'#b7ad86');r(5+i*32,86+i%2*25,2,6,'#628453');}for(const x of [7,157]){r(x+12,37,8,61,'#9a805b');r(x,19,33,35,place==='forest'?'#64815c':'#809b66');}if(place==='pond'){r(28,108,135,24,'#8eafb0');r(38,104,115,5,'#8eafb0');for(let i=0;i<6;i++)r(35+i*22,113+(i+step)%3*5,12,1,'#c1d3c3');}return;}
 r(0,0,192,144,night?'#687b72':'#bfcba3');r(0,64,192,80,night?'#83917c':'#a8b891');r(0,61,192,3,night?'#4d665b':'#85976f');for(const y of [80,102,130])r(0,y,192,1,night?'#7a8b76':'#9aab83');for(let i=0;i<5;i++)for(let j=0;j<8;j++)r(17+i*40+j*2,65+j*10,1,10,night?'#7a8b76':'#9aab83');
 const weather=weatherAt(now);r(13,9,43,33,'#687f65');r(16,12,37,27,night?'#344f5c':weather.id==='sun'?'#e0dba5':'#9cb7b4');r(33,12,2,27,'#687f65');r(16,26,37,2,'#687f65');if(night){r(40,15,8,7,'#e2dcb5');r(43,14,6,6,'#344f5c');for(let i=0;i<5;i++)r(18+i*7,17+(i+step)%3*7,1,1,'#d7dba4');}else if(weather.id==='sun')r(20,15,8,7,'#ddc46e');else{r(21,16,22,5,'#d6dfd2');if(weather.id!=='cloud')for(let i=0;i<5;i++)r(19+i*6,28+(i+step)%4*2,1,4,'#6e929d');}
 if(goods.curtains){r(10,8,7,34,'#b292a8');r(52,8,7,34,'#b292a8');r(10,7,49,3,'#90725c');}
 r(4,125,24,12,'#a78f68');r(3,122,26,4,'#b6a27e');r(14,125,3,12,'#c5b28c');
 if(s?.room?.bed){r(pos.bed,96,52,7,'#8f7052');r(pos.bed,90,3,18,'#8f7052');r(pos.bed+49,90,3,18,'#8f7052');r(pos.bed+3,89,46,8,bedding[s.playroom?.decor?.bedding||0].color);r(pos.bed+5,84,14,6,'#e2dbbd');}
 if(s?.room?.plant){r(pos.plant,72,13,16,'#a77e59');r(pos.plant+5,49,3,24,'#557c52');r(pos.plant-4,52,12,6,'#75945e');r(pos.plant+8,58,10,6,'#75945e');}
 if(s?.room?.bowl||goods.fountain){r(pos.bowl,119,24,5,'#7da3aa');r(pos.bowl+3,116,18,4,'#cad7bc');if(goods.fountain){r(pos.bowl+10,106,3,10,'#8bbac4');r(pos.bowl+7,104-step,9,3,'#b4d2d0');}}
 if(goods.rug){r(59,120,75,16,'#b49c9c');r(64,123,65,10,'#c6b3ad');for(let i=0;i<8;i++)r(60+i*10,118,2,2,'#b49c9c');}
 if(goods.shelf){r(pos.shelf,31,40,4,'#977c5d');r(pos.shelf+3,19,7,12,'#ab98b4');r(pos.shelf+13,23,10,8,'#c6b078');r(pos.shelf+26,20,7,11,'#90a99a');}
 if(goods.lamp){r(176,99,7,4,'#967c5b');r(179,82,2,18,'#967c5b');r(169,73,22,9,night?'#ddd4a1':'#c5b28c');if(night)r(174,83,12,2,'#c7c49a');}
 if(goods.tent){r(pos.tent,62,40,6,'#b49785');r(pos.tent+5,54,30,8,'#b49785');r(pos.tent+10,46,20,8,'#b49785');r(pos.tent+15,42,10,4,'#b49785');r(pos.tent+6,68,28,24,'#b49785');r(pos.tent+15,67,12,25,'#657b65');}
 if(goods.cushion){r(39,111,22,8,'#b6a0bf');r(42,108,16,3,'#cdbcd0');}
 if(goods.mirror){r(146,8,20,33,'#a48a6a');r(149,11,14,27,'#a9c1bf');r(151,13,2,18,'#d6dfd0');}
 if(goods.post){r(5,127,25,5,'#a58b66');r(15,98,6,29,'#b5a27a');for(let i=0;i<6;i++)r(15,100+i*4,6,1,'#8d7c59');}
 if(goods.toybox){r(151,132,32,10,'#a18666');r(149,128,36,5,'#b69a72');r(164,132,5,3,'#d0be91');}
 if(s?.playroom?.crafted?.stoneArt){r(102,7,25,23,'#927d62');for(let i=0;i<9;i++)r(105+i%3*7,10+Math.floor(i/3)*6,5,4,['#a5b1ad','#c5b6a1','#a696b0'][i%3]);}
 if(s?.playroom?.crafted?.mobile){r(pos.bed+25,20,1,15,'#9e906c');r(pos.bed+12,35,27,1,'#9e906c');r(pos.bed+12,36,3,8,'#8caa75');r(pos.bed+34,36,5,11,'#c8ad98');}
 if(s?.playroom?.decor?.display){r(67,16,25,3,'#9f8667');r(76,8,8,8,'#c1ab87');}
 if(s?.daily?.mess){const m=s.daily.mess.kind;for(let i=0;i<5;i++)r(35+i*25,135+i%2*3,m==='puddle'?12:3,m==='puddle'?2:3,m==='puddle'?'#87adb5':'#997d56');}
 if(s?.poop)for(let i=0;i<s.poop;i++){r(15+i*18,136,11,5,'#806247');r(18+i*18,132,5,4,'#806247');}
 if(s?.playroom?.session?.expires>now){const run=s.playroom.session,x=34+run.target*15;if(run.kind==='ball'){r(x,121,8,8,s.playroom.crafted?.featherToy?'#c4ad74':'#bc93a6');r(x+2,119,4,2,'#ddc99b');}if(run.kind==='laser')r(x,124,3,3,'#c77a78');if(run.kind==='music'){r(153,106,25,15,'#a48b67');r(161,98-step*3,2,7,'#856e8f');r(157,103-step*3,5,3,'#856e8f');}}
 if(s?.vacation){c.fillStyle='#e0d7bc';c.font='9px monospace';c.fillText('HOTEL · PAUSE',59,29);}
}
export function drawHideClue(c,s){const run=s.cozy?.hide;if(!run)return;const pos=sceneFurniture(s),point={box:[18,122],bed:[pos.bed+45,87],plant:[pos.plant-3,61],tent:[pos.tent+19,64],shelf:[pos.shelf+31,29]}[run.spot]||[25,85],r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};const [x,y]=point,col={cat:'#bf9ae0',chicken:'#e9c954',corgi:'#e5a05a',frog:'#9bbf63',bear:'#b38a69',dog:'#f2eee1',dino:'#7cb3a0',bunny:'#e4bacb'}[s.species];if(s.species==='frog'){r(x,y,8,3,col);r(x+2,y-2,2,2,col);}else if(s.species==='chicken'){r(x,y,3,8,col);r(x+3,y+2,3,5,col);}else{r(x,y-6,3,s.species==='bunny'?11:7,col);r(x+5,y-4,3,s.species==='bunny'?9:5,col);}}
export function drawClothes(c,s,age,frame=0){if(!s||s.dead||age==='Яєчко')return;const wearing=s.cozy?.wearing||{},young=age==='Малюк',r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},headY=young?51:s.species==='bunny'?36:s.species==='chicken'?39:s.species==='frog'?27:36,bodyY=young?68:67;
 if(wearing.body==='raincoat'){r(48,bodyY,32,12,'#ceb65d');r(62,bodyY,3,12,'#a3934c');}if(wearing.body==='pajamas'){r(48,bodyY,32,12,'#a095bd');for(let i=0;i<5;i++)r(51+i*6,bodyY+4,2,2,'#ded7c8');}if(wearing.body==='sweater'){r(48,bodyY,32,12,'#b3878e');r(49,bodyY+4,30,2,'#d6b5b3');}
 if(wearing.neck==='scarf'){r(47,bodyY-3,33,4,'#c88d83');r(73,bodyY+1,5,9,'#c88d83');}if(wearing.neck==='bow'){r(57,bodyY-3,6,5,'#8c9caf');r(66,bodyY-3,6,5,'#8c9caf');r(63,bodyY-2,3,3,'#697d91');}
 if(wearing.head==='panama'){r(53,headY-5,22,6,'#c4ad7a');r(49,headY+1,30,3,'#c4ad7a');r(53,headY-1,22,2,'#a18c65');}if(wearing.head==='crown'){r(53,headY-1,22,4,'#d5bd64');for(let i=0;i<3;i++)r(53+i*9,headY-6-i%2*2,4,6+i%2*2,'#d5bd64');}
 if(wearing.eyes==='glasses'){const y=s.species==='frog'?34:young?59:46;for(const x of (s.species==='frog'?[43,72]:[49,69])){r(x,y,11,1,'#536d60');r(x,y+8,11,1,'#536d60');r(x,y,1,9,'#536d60');r(x+10,y,1,9,'#536d60');}r(s.species==='frog'?54:60,y+4,s.species==='frog'?18:9,1,'#536d60');}
 for(const id of Object.values(wearing))if(itemStatus(s,id).wear<30)r(76,bodyY+5,3,3,'#7d806d');
}
export function drawCozyEvent(c,s,effect,now=Date.now(),reduced=false){if(!effect||effect.until<now||!s||s.dead)return;const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},step=reduced?1:Math.floor(now/250)%3;if(effect.kind==='cook'){r(79,72,24,14,'#a28f72');r(76,70,30,3,'#c1af8c');r(81+step*5,60,3,12,'#90785a');r(87,53-step*3,2,8,'#dbe1bf');r(95,50-step*3,2,8,'#dbe1bf');}}
