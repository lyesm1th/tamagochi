import {drawToyVariant,drawDesignAccent,designIndex} from './item-designs.js';
export function drawPlayroom(c,s,effect,now=Date.now(),reduced=false){if(!s||s.dead||s.vacation||s.sleeping||s.napping)return;const p=s.playroom||{},run=p.session?.expires>now?p.session:null,r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);},step=reduced?1:Math.floor(now/220)%3;
 if(run&&run.kind==='ball'){const x=20+run.target*10;if(!drawToyVariant(c,s,x,79,10,10)){r(x,81,8,8,p.crafted?.featherToy?'#bfa66b':'#bd8ea1');r(x+2,79,4,2,'#ddca9b');}if(p.crafted?.featherToy){r(x+4,73,1,8,'#ab9263');r(x+5,73,3,4,'#dfce9d');}}
 if(run&&run.kind==='laser'){const x=20+run.target*10;r(x,76,3,3,['#c97876','#82b680','#d8c47a'][designIndex(s,'laser')]);r(x-1,77,5,1,'#da9c8a');}
 if(run?.kind==='music'||effect?.kind==='music'&&effect.until>now){r(91,72,25,15,'#a48562');r(89,69,29,4,'#c2a578');r(97,77,4,5,'#e0cc93');drawDesignAccent(c,s,'music',89,69,29,18);for(let i=0;i<3;i++){const x=88+i*11,y=51-(step+i)%3*6;r(x,y,2,8,'#74627d');r(x-3,y+7,5,3,'#74627d');}}
 if(effect?.kind==='craft'&&effect.until>now){r(18,75,25,7,'#9d805e');r(23,64-step*3,4,12,'#aa9675');r(18,62-step*3,14,4,'#9ca9a8');for(let i=0;i<3;i++)r(43+i*4,70+i%2*5,2,2,'#c5ae69');}
}
