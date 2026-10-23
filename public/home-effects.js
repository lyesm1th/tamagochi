import {furniturePositions,bedding} from './playroom.js';
import {treasures} from './daily-life.js';
export function drawHome(ctx,s,frame=0){if(!s)return;const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
 if(s.vacation){r(25,17,78,15,'#d6c6a4');r(27,19,74,11,'#9c8b69');ctx.fillStyle='#f2e7c7';ctx.font='8px monospace';ctx.fillText('HOTEL · PAUSE',30,27);return;}
 const pos=furniturePositions(s),decor=s.playroom?.decor||{},crafted=s.playroom?.crafted||{},sheet=bedding[decor.bedding||0].color;
 if(s.room?.bed){const x=pos.bed;r(x,81,48,5,'#8f6d51');r(x,77,3,14,'#8f6d51');r(x+44,78,3,13,'#8f6d51');r(x+4,76,40,6,sheet);r(x+5,72,12,5,'#e2dcbf');}
 if(s.room?.bowl){const x=pos.bowl;r(x,84,24,4,'#829d9a');r(x+4,88,16,3,'#657b78');r(x+2,81,20,3,'#ccb17a');}
 if(s.room?.plant){const x=pos.plant;r(x,77,10,13,'#a77652');r(x+4,59,3,19,'#5b8052');r(x-4,61,9,5,'#7e9b5e');r(x+6,65,8,5,'#6f9459');}
 if(s.room?.toy||crafted.featherToy){const x=pos.toy+Math.floor(frame/600)%2;r(x,86,8,8,'#b5828e');r(x+2,84,4,2,'#c6a561');if(crafted.featherToy){r(x+5,77,2,9,'#b9a56c');r(x+7,78,3,4,'#d1c18e');}}
 if(crafted.stoneArt){r(102,7,21,20,'#8e795b');for(let i=0;i<9;i++)r(104+i%3*6,9+Math.floor(i/3)*5,4,3,['#a5b1ad','#c5b6a1','#a696b0'][i%3]);}
 if(crafted.mobile){r(pos.bed+22,2,1,17,'#a29068');r(pos.bed+10,18,25,1,'#a29068');r(pos.bed+12,19,1,6,'#a29068');r(pos.bed+30,19,1,9,'#a29068');r(pos.bed+9,25,7,4,'#8fa86d');r(pos.bed+27,28,7,5,'#c4aa94');}
 if(decor.display){const item=treasures.find(t=>t.id===decor.display);if(item){r(40,9,21,3,'#9b805f');r(47,3,7,6,item.color);}}
 if(s.heirloom){r(111,35,9,7,'#b9a06b');r(113,37,2,2,'#e8dfbd');r(117,37,2,2,'#e8dfbd');}
}
export function drawMark(ctx,s,age){if(!s.appearance||age==='Яєчко'||s.dead)return;ctx.fillStyle=s.appearance.color;const y=age==='Малюк'?70:69;if(s.appearance.mark==='stripe'){ctx.fillRect(49,y,7,2);ctx.fillRect(49,y+4,7,2);}else if(s.appearance.mark==='star'){ctx.fillRect(50,y-2,2,7);ctx.fillRect(48,y,6,2);}else ctx.fillRect(49,y,4,4);}
export function drawAdventure(ctx,effect,now){if(!effect||!['adventure','garden'].includes(effect.kind)||now>effect.until)return;const step=Math.floor((now-effect.started)/160)%3;ctx.fillStyle=effect.kind==='garden'?'#729459':'#c19b54';for(let i=0;i<5;i++){const x=24+i*19,y=31+(i+step)%3*9;ctx.fillRect(x,y,2,7);ctx.fillRect(x-2,y+2,6,2);}}
