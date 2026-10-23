export function drawHome(ctx,s,frame=0){if(!s)return;const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
 if(s.vacation){r(25,17,78,15,'#d6c6a4');r(27,19,74,11,'#9c8b69');ctx.fillStyle='#f2e7c7';ctx.font='8px monospace';ctx.fillText('HOTEL · PAUSE',30,27);return;}
 if(s.room?.bed){r(4,81,48,5,'#8f6d51');r(4,77,3,14,'#8f6d51');r(48,78,3,13,'#8f6d51');r(8,76,40,6,'#b3a6c5');r(9,72,12,5,'#e2dcbf');}
 if(s.room?.bowl){r(83,84,24,4,'#829d9a');r(87,88,16,3,'#657b78');r(85,81,20,3,'#ccb17a');}
 if(s.room?.plant){r(111,77,10,13,'#a77652');r(115,59,3,19,'#5b8052');r(107,61,9,5,'#7e9b5e');r(117,65,8,5,'#6f9459');}
 if(s.room?.toy){const x=6+Math.floor(frame/600)%2;r(x,86,8,8,'#b5828e');r(x+2,84,4,2,'#c6a561');}
 if(s.heirloom){r(111,35,9,7,'#b9a06b');r(113,37,2,2,'#e8dfbd');r(117,37,2,2,'#e8dfbd');}
}
export function drawMark(ctx,s,age){if(!s.appearance||age==='Яєчко'||s.dead)return;ctx.fillStyle=s.appearance.color;const y=age==='Малюк'?70:69;if(s.appearance.mark==='stripe'){ctx.fillRect(49,y,7,2);ctx.fillRect(49,y+4,7,2);}else if(s.appearance.mark==='star'){ctx.fillRect(50,y-2,2,7);ctx.fillRect(48,y,6,2);}else ctx.fillRect(49,y,4,4);}
export function drawAdventure(ctx,effect,now){if(!effect||!['adventure','garden'].includes(effect.kind)||now>effect.until)return;const step=Math.floor((now-effect.started)/160)%3;ctx.fillStyle=effect.kind==='garden'?'#729459':'#c19b54';for(let i=0;i<5;i++){const x=24+i*19,y=31+(i+step)%3*9;ctx.fillRect(x,y,2,7);ctx.fillRect(x-2,y+2,6,2);}}
