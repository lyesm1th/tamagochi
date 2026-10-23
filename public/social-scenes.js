export const socialGames=[['ball','М’яч'],['hide','Хованки'],['swing','Гойдалка']];
export function socialScene(scenes,now=Date.now()){return (scenes||[]).find(s=>s.until>now);}
export function drawSocialScene(c,scene,roster,drawPet,now=Date.now(),reduced=false){if(!scene||scene.until<=now)return;const a=roster.find(p=>p.id===scene.actors[0]),b=roster.find(p=>p.id===scene.actors[1]);if(!a||!b)return;const t=reduced?.5:(now-scene.at)/1000,r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);};
 if(scene.kind==='ball'){const k=reduced?.5:(Math.sin(t*2)+1)/2;drawPet(a,55+k*8,132,47);drawPet(b,137-k*8,132,47);r(68+k*53,126-Math.abs(Math.sin(t*2))*9,8,8,'#b192bc');r(70+k*53,127-Math.abs(Math.sin(t*2))*9,3,3,'#ede3c9');}
 if(scene.kind==='hide'){drawPet(a,59,131,47);if(Math.floor(t/2)%2===0||reduced)drawPet(b,135,126,37);r(117,113,36,22,'#b69d75');r(115,111,40,4,'#dfc79a');c.fillStyle='#54694c';c.font='bold 9px monospace';c.fillText('?',74,85);}
 if(scene.kind==='swing'){r(104,53,3,80,'#8e795b');r(160,53,3,80,'#8e795b');r(102,51,64,4,'#8e795b');const sway=reduced?0:Math.sin(t*1.8)*5;r(116+sway,56,1,48,'#695e50');r(148+sway,56,1,48,'#695e50');r(112+sway,103,42,4,'#b79c72');drawPet(b,133+sway,103,39);drawPet(a,64,132,47);}
 c.fillStyle='#4f6548';c.font='bold 7px monospace';c.fillText(scene.score>=3?'ДРУЗІ ЗНОВУ РАЗОМ':'ГРАЄМО РАЗОМ',52,142);
}
