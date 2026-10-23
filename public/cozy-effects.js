import {drawRoomArt} from './pixel-art.js';
import {needs,variants,furnitureStatus} from './living.js';
import {stableHash,behaviorPose} from './traits.js';
import {isNight,nightPhase,itemStatus} from './cozy-life.js';
import {bedding,favoriteCorner} from './playroom.js';
import {weatherAt} from './little-world.js';
export function sceneFurniture(s){const layout=s?.playroom?.decor?.layout||0;return layout===1?{bed:126,bowl:18,plant:12,tent:20,shelf:87}:layout===2?{bed:70,bowl:16,plant:170,tent:132,shelf:7}:{bed:8,bowl:156,plant:170,tent:124,shelf:82};}
export function scenePose(s,frame=0,reduced=false,now=Date.now()){
 const pos=sceneFurniture(s),phase=nightPhase(s,now);if(s?.dead||s?.vacation)return {x:96,feet:118,scale:1,phase};if(s?.sleeping||s?.napping){if(phase==='return'){const k=((now+stableHash(s.id||s.species))%(12*60000)-8000)/6000;return {x:(pos.bowl+10)*(1-k)+(pos.bed+25)*k,feet:119-20*k,scale:1.02-.24*k,phase};}return phase==='water'?{x:pos.bowl+10,feet:119,scale:1.02,phase}:{x:pos.bed+25,feet:99,scale:.78,phase};}
 const motion=s?.living?.motion;if(motion?.until>now){const target=motion.item==='bed'?{x:pos.bed+25,feet:97}:motion.item==='bowl'?{x:pos.bowl+10,feet:118}:motion.item==='cushion'?{x:50,feet:118}:motion.item==='plant'?{x:pos.plant-10,feet:110}:motion.item==='shelf'?{x:pos.shelf+20,feet:90}:motion.item==='rug'?{x:95,feet:126}:motion.item==='toybox'?{x:160,feet:133}:{x:145,feet:105};return {...target,feet:target.feet-(motion.kind==='jump'&&!reduced?Math.abs(Math.sin(frame/150))*12:0),scale:.8,phase};}
 if(s?.playroom?.session?.expires>now)return {x:34+s.playroom.session.pet*15,feet:124,scale:1.05,phase};
 if(s?.bodyLanguage?.kind==='approach'&&s.bodyLanguage.until>now)return {x:96,feet:134,scale:1.12,phase};
 if(s){const gesture=behaviorPose(s,'Дорослий',frame,reduced);if(gesture.kind==='approach')return {x:96,feet:134,scale:1.12,phase};if(gesture.kind==='sit'&&!(s.world?.walk?.expires>now)){const corner=favoriteCorner(s);return corner.index===0?{x:pos.bed+25,feet:99,scale:.78,phase}:corner.index===1?{x:pos.bowl+10,feet:119,scale:1.02,phase}:{x:151,feet:88,scale:.68,phase};}}

 const need=needs(s);if(need&&!reduced){const targets={bed:[pos.bed+25,99],bowl:[pos.bowl+10,119],cushion:[50,119],box:[30,126]},[x,feet]=targets[need.pose]||[96,120];return {x,feet,scale:feet<100?.78:1,phase};}
 const d=reduced ? .5 : (Math.sin(frame/4700)+1)/2;return {x:96+(reduced?0:Math.sin(frame/3200)*43),feet:85+45*d,scale:.65+.45*d,phase};
}
export function drawExpandedRoom(c,s,frame=0,reduced=false,now=Date.now()){
 const night=s?.cozy?.nightMode&&isNight(s,now),pos=sceneFurniture(s),goods=s?.cozy?.owned||{},r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);},step=reduced?0:Math.floor(frame/400)%3;
 if(s?.world?.walk?.expires>now){const place=s.world.walk.place;r(0,0,192,144,night?'#587775':'#b6cbb6');r(0,61,192,83,night?'#738766':'#97b77c');for(let i=0;i<6;i++){r(64-i*5,68+i*13,64+i*10,13,'#b7ad86');r(5+i*32,86+i%2*25,2,6,'#628453');}for(const x of [7,157]){r(x+12,37,8,61,'#9a805b');r(x,19,33,35,place==='forest'?'#64815c':'#809b66');}if(place==='pond'){r(28,108,135,24,'#8eafb0');r(38,104,115,5,'#8eafb0');for(let i=0;i<6;i++)r(35+i*22,113+(i+step)%3*5,12,1,'#c1d3c3');}return;}
 drawRoomArt(c,s,frame,reduced,night,pos);
}
export function drawHideClue(c,s){const run=s.cozy?.hide;if(!run)return;const pos=sceneFurniture(s),point={box:[18,122],bed:[pos.bed+45,87],plant:[pos.plant-3,61],tent:[pos.tent+19,64],shelf:[pos.shelf+31,29]}[run.spot]||[25,85],r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};const [x,y]=point,col={cat:'#bf9ae0',chicken:'#e9c954',corgi:'#e5a05a',frog:'#9bbf63',bear:'#b38a69',dog:'#f2eee1',dino:'#7cb3a0',bunny:'#e4bacb'}[s.species];if(s.species==='frog'){r(x,y,8,3,col);r(x+2,y-2,2,2,col);}else if(s.species==='chicken'){r(x,y,3,8,col);r(x+3,y+2,3,5,col);}else{r(x,y-6,3,s.species==='bunny'?11:7,col);r(x+5,y-4,3,s.species==='bunny'?9:5,col);}}
// Neck anchors follow the visible muzzle, rather than sharing the body's top edge.
export function neckAnchor(species,age){
 const baby=age==='Малюк',child=age==='Дитина',teen=age==='Підліток';
 // Baby, child, teenager, adult/senior: cow muzzle stays lower than other faces.
 const rows={dog:[76,76,74,72],frog:[72,75,73,66],chicken:[72,71,68,68],bear:[74,75,68,69],bunny:[74,75,68,69],corgi:[74,75,68,69]};
 const y=(rows[species]||[72,75,68,69])[baby?0:child?1:teen?2:3];
 return {x:64,y,wing:baby||child?5:6,height:baby?3:child?4:5,scarfWidth:baby?21:child?27:33,tail:baby?3:child?5:7};
}

export function drawClothes(c,s,age,frame=0){if(!s||s.dead||age==='Яєчко')return;const wearing=s.cozy?.wearing||{},young=age==='Малюк',r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},headY=young?51:s.species==='bunny'?36:s.species==='chicken'?39:s.species==='frog'?27:36,bodyY=young?68:67;
 if(wearing.body==='raincoat'){r(48,bodyY,32,12,'#ceb65d');r(62,bodyY,3,12,'#a3934c');}if(wearing.body==='pajamas'){r(48,bodyY,32,12,'#a095bd');for(let i=0;i<5;i++)r(51+i*6,bodyY+4,2,2,'#ded7c8');}if(wearing.body==='sweater'){r(48,bodyY,32,12,'#b3878e');r(49,bodyY+4,30,2,'#d6b5b3');}
 const neck=neckAnchor(s.species,age);if(wearing.neck==='scarf'){r(neck.x-Math.floor(neck.scarfWidth/2),neck.y,neck.scarfWidth,3,'#c88d83');r(neck.x+Math.floor(neck.scarfWidth/2)-5,neck.y+3,4,neck.tail,'#c88d83');}if(wearing.neck==='bow'){r(neck.x-neck.wing-2,neck.y,neck.wing,neck.height,'#8c9caf');r(neck.x+2,neck.y,neck.wing,neck.height,'#8c9caf');r(neck.x-1,neck.y+1,3,Math.max(2,neck.height-2),'#697d91');}
 if(wearing.head==='panama'){r(53,headY-5,22,6,'#c4ad7a');r(49,headY+1,30,3,'#c4ad7a');r(53,headY-1,22,2,'#a18c65');}if(wearing.head==='crown'){r(53,headY-1,22,4,'#d5bd64');for(let i=0;i<3;i++)r(53+i*9,headY-6-i%2*2,4,6+i%2*2,'#d5bd64');}
 if(wearing.eyes==='glasses'){const y=s.species==='frog'?34:young?59:46;for(const x of (s.species==='frog'?[43,72]:[49,69])){r(x,y,11,1,'#536d60');r(x,y+8,11,1,'#536d60');r(x,y,1,9,'#536d60');r(x+10,y,1,9,'#536d60');}r(s.species==='frog'?54:60,y+4,s.species==='frog'?18:9,1,'#536d60');}
 for(const id of Object.values(wearing))if(itemStatus(s,id).wear<30)r(76,bodyY+5,3,3,'#7d806d');
}
export function drawCozyEvent(c,s,effect,now=Date.now(),reduced=false){if(!effect||effect.until<now||!s||s.dead)return;const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},step=reduced?1:Math.floor(now/250)%3;if(effect.kind==='cook'){r(79,72,24,14,'#a28f72');r(76,70,30,3,'#c1af8c');r(81+step*5,60,3,12,'#90785a');r(87,53-step*3,2,8,'#dbe1bf');r(95,50-step*3,2,8,'#dbe1bf');}}
