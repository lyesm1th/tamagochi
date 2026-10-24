import {enrichmentPose,enrichPose,drawEnrichment} from './room-enrichment.js';
import {roomRects} from './room-life.js';
import {roomFurniture,roomMoment,roomMomentPose} from './room-life.js';
import {stage} from './pet-life.js';
const stageForFarewell=(s,now)=>stage(s,now)!=='Яєчко';
const quietSize=(s,now)=>s?({'Малюк':.4,'Дитина':.64,'Підліток':.84}[stage(s,now)]||1):1;
import {quietBody} from './relationship-life.js';
import {newPets} from './new-pets.js';
import {drawRoomJournal} from './journal-effects.js';
import {ambient,ambientPose} from './lively.js';
import {drawRoomArt} from './pixel-art.js';
import {needs,variants,furnitureStatus} from './living.js';
import {stableHash,behaviorPose} from './traits.js';
import {isNight,nightPhase,itemStatus} from './cozy-life.js';
import {bedding,favoriteCorner} from './playroom.js';
import {weatherAt} from './little-world.js';
export const sceneFurniture=roomFurniture;
function baseScenePose(s,frame=0,reduced=false,now=Date.now()){
 const pos=sceneFurniture(s),phase=nightPhase(s,now);if(s?.dead||s?.vacation)return {x:96,feet:118,scale:1,phase};if(s?.sleeping||s?.napping){if(!s.room?.bed&&phase!=='water')return {x:96,feet:126,scale:1,phase};if(phase==='return'){const k=((now+stableHash(s.id||s.species))%(12*60000)-8000)/6000;return {x:(pos.bowl+10)*(1-k)+(pos.bed+25)*k,feet:119-20*k,scale:1.02-.24*k,phase};}return phase==='water'?{x:pos.bowl+10,feet:119,scale:1.02,phase}:{x:pos.bed+25,feet:99,scale:.78,phase};}
 const moment=roomMoment(s,now),interaction=roomMomentPose(s,moment,'classic',now,reduced);if(interaction)return {...interaction,phase};
 if(s?.playroom?.session?.expires>now)return {x:34+s.playroom.session.pet*15,feet:124,scale:1.05,phase};
 const auto=ambientPose(ambient(s,now),pos,reduced);if(auto)return {...auto,phase};
 if(s?.bodyLanguage?.kind==='approach'&&s.bodyLanguage.until>now)return {x:96,feet:134,scale:1.12,phase};
 const need=needs(s);if(need){const targets={bed:[pos.bed+25,99],bowl:[pos.bowl+10,119],cushion:[50,119],rug:[96,126]},[x,feet]=targets[need.pose]||[96,124];return {x,feet,scale:feet<110?.78:.9,phase,quiet:true};}
 return {x:96,feet:124,scale:.9,phase,quiet:true};
}
export function scenePose(s,frame=0,reduced=false,now=Date.now()){if(s?.farewellPreview)return {x:96,feet:124,scale:.9,quiet:true,quietSize:quietSize(s,now),quietBody:stageForFarewell(s,now)?'withdrawn':null};const p=enrichPose(s,enrichmentPose(s,roomRects(s,'classic'),now,reduced)||baseScenePose(s,frame,reduced,now),now,reduced);return {...p,quietSize:quietSize(s,now),quietBody:p.quiet?quietBody(s,now):null};}
export function drawExpandedRoom(c,s,frame=0,reduced=false,now=Date.now()){
 const night=s?.cozy?.nightMode&&isNight(s,now),pos=sceneFurniture(s),goods=s?.cozy?.owned||{},r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);},step=reduced?0:Math.floor(frame/400)%3;
 if(s?.world?.walk?.expires>now){const place=s.world.walk.place;r(0,0,192,144,night?'#587775':'#b6cbb6');r(0,61,192,83,night?'#738766':'#97b77c');for(let i=0;i<6;i++){r(64-i*5,68+i*13,64+i*10,13,'#b7ad86');r(5+i*32,86+i%2*25,2,6,'#628453');}for(const x of [7,157]){r(x+12,37,8,61,'#9a805b');r(x,19,33,35,place==='forest'?'#64815c':'#809b66');}if(place==='pond'){r(28,108,135,24,'#8eafb0');r(38,104,115,5,'#8eafb0');for(let i=0;i<6;i++)r(35+i*22,113+(i+step)%3*5,12,1,'#c1d3c3');}return;}
 drawRoomArt(c,s,frame,reduced,night,pos);drawRoomJournal(c,s);drawEnrichment(c,s,null,roomRects(s,'classic'),now,reduced);
}
export function drawHideClue(c,s){const run=s.cozy?.hide;if(!run)return;const pos=sceneFurniture(s),point={box:[18,122],bed:[pos.bed+45,87],plant:[pos.plant-3,61],tent:[pos.tent+19,64],shelf:[pos.shelf+31,29]}[run.spot]||[25,85],r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};const [x,y]=point,col={cat:'#bf9ae0',chicken:'#e9c954',corgi:'#e5a05a',frog:'#9bbf63',bear:'#b38a69',dog:'#f2eee1',dino:'#7cb3a0',bunny:'#e4bacb'}[s.species]||newPets[s.species]?.color;if(s.species==='frog'){r(x,y,8,3,col);r(x+2,y-2,2,2,col);}else if(s.species==='chicken'){r(x,y,3,8,col);r(x+3,y+2,3,5,col);}else{r(x,y-6,3,s.species==='bunny'?11:7,col);r(x+5,y-4,3,s.species==='bunny'?9:5,col);}}
// Neck anchors follow the visible muzzle, rather than sharing the body's top edge.
export function neckAnchor(species,age){
 const baby=age==='Малюк',child=age==='Дитина',teen=age==='Підліток';
 // Baby, child, teenager, adult/senior: cow muzzle stays lower than other faces.
 const rows={pig:[78,76,74,72],sheep:[76,75,72,71],fox:[76,75,72,70],monkey:[77,76,73,72],duck:[76,75,72,70],penguin:[76,75,72,70],dog:[76,76,74,72],frog:[72,75,73,66],chicken:[72,71,68,68],bear:[74,75,68,69],bunny:[74,75,68,69],corgi:[74,75,68,69]};
 const y=baby?79:(rows[species]||[79,75,71,69])[child?1:teen?2:3];
 return {x:64,y,wing:baby||child?5:6,height:baby?2:child?4:5,scarfWidth:baby?21:child?27:33,tail:baby?3:child?5:7};
}

export function drawClothes(c,s,age,frame=0){if(!s||s.dead||age==='Яєчко')return;const wearing=s.cozy?.wearing||{},young=age==='Малюк',ageScale=young?.36:age==='Дитина'?.60:age==='Підліток'?.84:1,ageWidth=young?.42:age==='Дитина'?.65:age==='Підліток'?.75:1,ageOffset=young?52:age==='Дитина'?32:age==='Підліток'?12:0,r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},bodyRect=(x,y,w,h,col)=>r(Math.round(64+(x-64)*ageWidth),Math.round(y),Math.max(1,Math.round(w*ageWidth)),Math.max(1,Math.round(h*ageScale)),col),headY0=s.species==='bunny'?36:s.species==='chicken'?39:s.species==='frog'?27:36,headY=Math.round(headY0*ageScale+ageOffset),bodyY=Math.round(67*ageScale+ageOffset);
 if(wearing.body){const col={raincoat:'#ceb65d',pajamas:'#a095bd',sweater:'#b3878e'}[wearing.body];if(col){bodyRect(46,bodyY,36,13,col);bodyRect(43,bodyY+1,7,5,col);bodyRect(78,bodyY+1,7,5,col);bodyRect(52,bodyY,24,2,'#ded7c8');if(wearing.body==='raincoat')bodyRect(62,bodyY,3,13,'#a3934c');if(wearing.body==='pajamas')for(let i=0;i<5;i++)bodyRect(51+i*6,bodyY+4,2,2,'#ded7c8');if(wearing.body==='sweater')bodyRect(49,bodyY+4,30,2,'#d6b5b3');}}
 const neck=neckAnchor(s.species,age);if(wearing.neck==='scarf'){r(neck.x-Math.floor(neck.scarfWidth/2),neck.y,neck.scarfWidth,3,'#c88d83');r(neck.x+Math.floor(neck.scarfWidth/2)-5,neck.y+3,4,neck.tail,'#c88d83');}if(wearing.neck==='bow'){r(neck.x-neck.wing-2,neck.y,neck.wing,neck.height,'#8c9caf');r(neck.x+2,neck.y,neck.wing,neck.height,'#8c9caf');r(neck.x-1,neck.y+1,3,Math.max(young?1:2,neck.height-2),'#697d91');}
 if(wearing.head==='panama'){bodyRect(53,headY-5,22,6,'#c4ad7a');bodyRect(49,headY+1,30,3,'#c4ad7a');bodyRect(53,headY-1,22,2,'#a18c65');}if(wearing.head==='crown'){bodyRect(53,headY-1,22,4,'#d5bd64');for(let i=0;i<3;i++)bodyRect(53+i*9,headY-6-i%2*2,4,6+i%2*2,'#d5bd64');}
 if(wearing.eyes==='glasses'){const y=Math.round((s.species==='frog'?33:46)*ageScale+ageOffset),width=Math.max(6,Math.round(11*ageScale)),height=Math.max(5,Math.round(9*ageScale)),xs=(s.species==='frog'?[43,72]:[49,69]).map(x=>Math.round(64+(x-64)*ageWidth));for(const x of xs){r(x,y,width,1,'#536d60');r(x,y+height-1,width,1,'#536d60');r(x,y,1,height,'#536d60');r(x+width-1,y,1,height,'#536d60');}r(xs[0]+width,y+Math.floor(height/2),Math.max(1,xs[1]-xs[0]-width),1,'#536d60');}

 for(const id of Object.values(wearing))if(itemStatus(s,id).wear<30)r(76,bodyY+5,3,3,'#7d806d');
}
export function drawCozyEvent(c,s,effect,now=Date.now(),reduced=false){if(!effect||effect.until<now||!s||s.dead)return;const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},step=reduced?1:Math.floor(now/250)%3;if(effect.kind==='cook'){r(79,72,24,14,'#a28f72');r(76,70,30,3,'#c1af8c');r(81+step*5,60,3,12,'#90785a');r(87,53-step*3,2,8,'#dbe1bf');r(95,50-step*3,2,8,'#dbe1bf');}}
