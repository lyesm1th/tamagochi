import {newPets} from './new-pets.js';
import {drawToyVariant} from './item-designs.js';
export function drawDoodle(c,row,x=0,y=0,w=192,h=144){if(!row)return;const r=(a,b,ww,hh,col)=>{c.fillStyle=col;c.fillRect(Math.round(x+a*w/64),Math.round(y+b*h/48),Math.max(1,Math.round(ww*w/64)),Math.max(1,Math.round(hh*h/48)));};r(0,0,64,48,'#f3e4bb');r(1,1,62,46,'#fff2cc');for(let i=0;i<9;i++)r(3+i*7,3+(row.seed+i)%3,1,1,'#d5bd90');const colors={dog:'#717660',cat:'#a487b5',frog:'#739c6b',chicken:'#d2ae4d',bear:'#997452',dino:'#6c9d8b',bunny:'#c79da8',corgi:'#c89b60'},col=colors[row.species]||newPets[row.species]?.color||colors.cat;
 const pet=(xx,yy)=>{r(xx,yy,13,10,col);r(xx+2,yy+10,9,9,col);r(xx+1,yy+18,4,2,col);r(xx+8,yy+18,4,2,col);if(row.species==='bunny'){r(xx+2,yy-7,2,8,col);r(xx+9,yy-8,2,9,col);}else if(['duck','penguin'].includes(row.species)){r(xx+5,yy+7,5,2,'#ce9148');}else if(row.species==='chicken'){r(xx+4,yy-3,5,3,'#bd7970');r(xx+5,yy+6,4,2,'#d4a14e');}else{r(xx,yy-2,3,3,col);r(xx+10,yy-2,3,3,col);}r(xx+3,yy+4,1,2,'#525847');r(xx+9,yy+4,1,2,'#525847');r(xx+5,yy+8,3,1,'#b97f83');};
 pet(12,17);if(row.subject==='food'){if(['hay','grass','leaf','grain','algae'].includes(row.food)){for(let i=0;i<5;i++)r(40+i*3,17+i%2*3,2,17,'#889e5e');r(39,28,17,2,'#cbb176');}else if(row.food==='carrot'){r(43,21,9,12,'#cd945d');r(45,17,2,6,'#859c61');r(49,16,2,7,'#859c61');}else if(row.food==='fish'){r(40,22,12,8,'#8da6ad');r(52,20,4,12,'#8da6ad');r(42,24,1,1,'#525847');}else{r(40,20,13,12,'#bf995e');for(let i=0;i<4;i++)r(42+i%2*6,22+Math.floor(i/2)*6,2,2,'#786847');r(42,17,3,4,'#8d9c63');}}else if(row.subject==='friend'){pet(40,17);}else{r(42,12,7,7,'#c79574');r(44,20,3,13,'#9181a1');r(36,22,8,2,'#9181a1');r(47,22,9,2,'#9181a1');r(40,32,4,9,'#9181a1');r(47,32,4,9,'#9181a1');}r(29,10,3,3,'#ce9290');r(33,10,3,3,'#ce9290');r(30,13,5,3,'#ce9290');r(31,16,3,1,'#ce9290');r(7,43,50,1,'#a4ae76');}
export function drawRoomJournal(c,s,{drawPictures=true}={}){const j=s?.journal;if(!j)return;const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 // Door-jamb height marks, kept independently of replaceable furniture.
 r(4,23,3,65,'#a68c66');for(let i=0;i<(j.marks||[]).length;i++){const y=83-i*9;r(4,y,9+i,1,'#6a7154');r(13+i,y-2,2,2,['#bf8f8f','#879e78','#a799b2'][i%3]);}
 if(!drawPictures)return;
 const drawing=j.drawings?.find(d=>d.id===j.pinned);if(drawing){r(140,17,43,33,'#9f805b');drawDoodle(c,drawing,142,19,39,29);r(159,16,3,3,'#c38a80');}
 if(j.familyArt){r(147,58,28,22,'#9f805b');drawDoodle(c,j.familyArt,149,60,24,18);}

}
export function drawJournalGesture(c,s,pose,now=Date.now(),reduced=false,paint=null){const a=pose?.ambient,j=s?.journal;if(!j)return;const x=pose?.x||96,y=pose?.feet||128,beat=reduced?0:Math.floor(now/400)%2,r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);};
 if(a?.kind==='blanket'||a?.kind==='tuck'||(s.sleeping||s.napping)&&j.quirk?.id==='tuck'){r(x-15,y-17,31,17,'#b5abc5');r(x-14,y-16,29,3,'#e5dccb');r(x+10,y-11,4,6,'#8b859f');}
 if(a?.kind==='towel'){r(x+11,y-14,12,9,'#d5d9be');r(x+12,y-12,10,1,'#9dbaa9');}
 if(a?.kind==='water'){r(x+6,y-9,16,4,'#a4c2c2');r(x+9,y-13,2,3,'#a4c2c2');}
 if(a?.kind==='hello'){r(x+14,y-28-beat*3,4,7,'#c2b394');}
 if(a?.kind==='rain'){for(let i=0;i<3;i++)r(x+12+i*3,y-24-i*5+beat,1,3,'#8aaab3');if(s.species==='frog')r(x+3,y-21,9+beat*2,1,'#c18e9d');}
 if(a?.kind==='warm'){r(x-18,y-5,36,3,'#d0bd87');r(x-16,y-3,8,2,'#8ca896');r(x+10,y-3,8,2,'#8ca896');}
 if(a?.kind==='lamp'){r(x-2+beat*4,y-23,8,10,'#6a745e');r(x-4+beat*4,y-18,12,7,'#6a745e');}
 if(a?.kind==='ball'){const bx=a.ball?.x||96,by=a.ball?.y||127;if(paint){paint('ball',bx-5,by-10,10,10);return;}if(drawToyVariant(c,s,bx-5,by-10,10,10))return;r(bx-4,by-8,8,8,'#ac90ba');r(bx-2,by-7,3,3,'#eadfbe');r(bx-3+(reduced?1:beat),by-3,5,1,'#e4d8b9');}
 if(a?.kind==='together'){if(!reduced&&Math.floor(now/10000)%3===0){c.fillStyle='#8a839e';c.font='bold 7px monospace';c.fillText('…',x+16,y-32);}}
 if(a?.kind==='hum'||a?.kind==='dance'){c.fillStyle='#8e7fa6';c.font='bold 9px monospace';c.fillText('♪',x-19,y-36-beat*2);c.fillText('♫',x+17,y-42+beat*2);}
 if(a?.kind==='thought'){c.fillStyle='#7e856e';c.font='bold 9px monospace';c.fillText('…',x+12,y-36-beat);}
 if(a?.kind==='hiccup'){c.fillStyle='#777b65';c.font='bold 7px monospace';c.fillText('гик!',x+12,y-30-beat*2);}
 if((s.sleeping||s.napping)&&j.quirk?.id==='nose'){r(x-2,y-19,7,4,({dog:'#e7dfc9',frog:'#9ab47d',dino:'#8cad9c',bear:'#b28b6a',cat:'#b5a0ca',bunny:'#d9b4c0',chicken:'#d8bd69',corgi:'#cfa16a'}[s.species]||'#c8bd96'));}
}
export function drawDreamScene(c,s,run,lane,drawPet,now=Date.now(),reduced=false,drawObject=null){const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);};r(0,0,192,144,'#646681');for(let i=0;i<15;i++)r(7+i*13,8+(i*29)%66,1,1,'#ded8b4');r(154,10,17,17,'#e4d8ac');r(161,8,13,16,'#646681');for(let i=0;i<3;i++){const x=12+i*59,y=89-(reduced?0:Math.sin(now/1100+i)*2);r(x+5,y,40,14,'#dfdbe5');r(x,y+5,50,8,'#dfdbe5');if(run&&i===run.target){if(s.species==='dino'){r(x+23,y-9,3,3,'#f1dfb2');}else if(drawObject){drawObject(c,({dog:'hay',cat:'fish',chicken:'grain',frog:'fly',bear:'berry',corgi:'ball',bunny:'carrot'}[s.species]||'cookie'),x+15,y-23,23,23);}else{r(x+18,y-20,14,11,s.species==='dog'?'#c7bb73':'#d5a49f');if(s.species==='dog')for(let k=0;k<4;k++)r(x+20+k*3,y-23,1,15,'#948e57');else{r(x+20,y-18,2,2,'#f6e5c3');r(x+27,y-14,2,2,'#f6e5c3');}}}if(s.species==='dino'&&run&&i!==run.target){if(drawObject)drawObject(c,'cookie',x+4,y-39,43,39);else{r(x+10,y-30,29,28,'#b58a62');r(x+15,y-24,4,4,'#70654e');r(x+27,y-13,4,4,'#70654e');}}}
 const jump=!reduced&&run?.lastAt&&now-run.lastAt<600?Math.sin((now-run.lastAt)/600*Math.PI)*18:0;drawPet(37+lane*59,92-jump,40);c.fillStyle='#ede2c6';c.font='bold 8px monospace';c.fillText(run?run.hits+'/5 · ← → · ОК':'ОК — зайти в сон',38,130);
}
