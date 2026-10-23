import {treasures} from './daily-life.js';
export function drawDaily(c,s,effect,now=Date.now(),reduced=false){if(!s||s.dead||s.vacation||now-s.born<180000)return;const d=s.daily||{},r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);},step=reduced?1:Math.floor(now/300)%3;
 if(Object.keys(d.stash||{}).length){r(3,90,24,7,'#9a7f5d');for(let i=0;i<Math.min(4,Object.keys(d.stash).length);i++)r(5+i*5,87+i%2,3,4,treasures[i].color);}
 if(d.mess){const k=d.mess.kind;if(k==='food'){for(let i=0;i<8;i++)r(19+i*12,89+i%3*2,3,2,'#b3975d');}if(k==='pot'){r(109,82,12,7,'#b28260');for(let i=0;i<5;i++)r(83+i*8,91+i%2,4,2,'#79644b');}if(k==='puddle'){r(17,88,35,4,'#8eb1b6');r(23,92,25,2,'#8eb1b6');}if(k==='brush'){r(4,83,14,4,'#b09868');r(8,87,3,7,'#b09868');}}
 if(d.kind?.kind==='warm'){r(0,94,128,6,'#aaa0bc');r(0,92,31,3,'#c5b9cf');r(96,92,32,3,'#c5b9cf');}
 if((!effect||effect.until<now)&&d.lastFind&&now-d.lastFind.at<20000)effect={kind:'treasure',until:d.lastFind.at+20000};if(!effect||effect.until<now)return;
 if(['treasure','mischief'].includes(effect.kind)){r(86-step*2,57,11,10,'#c1a476');r(90-step*2,59,2,2,'#78664a');r(94-step*2,63,2,2,'#78664a');}
 if(effect.kind==='party'){r(54,29,20,4,'#bd919e');r(57,24,14,5,'#c5ad69');r(60,19,8,5,'#bd919e');r(63,15,3,4,'#c5ad69');r(17,75,23,12,'#c49c7f');r(17,72,23,4,'#ead9bd');r(27,65,2,7,'#b7849b');r(27,62,2,3,'#d7b762');for(let i=0;i<8;i++)r(9+i*15,10+(step+i)%3*9,2,3,['#c39aaf','#a2bb85','#d8c178'][i%3]);}
 if(effect.kind==='human'){r(0,89,128,11,'#a9a0bf');r(4,91,120,2,'#d5c4d9');r(92,23,5,3,'#be8797');r(99,23,5,3,'#be8797');r(92,26,12,4,'#be8797');r(95,30,6,3,'#be8797');}
 if(effect.kind==='shrug'){r(39,62,7,2,'#35482e');r(83,62,7,2,'#35482e');}
}
