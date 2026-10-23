export const gameTypes=[{id:'bug',name:'Злови жука',hint:'← → під жука · ОК зловити'},{id:'food',name:'Лови смаколик',hint:'← → під їжу · ОК коли вона внизу'},{id:'direction',name:'Вгадай напрямок',hint:'Обери ← або → за стрілкою · ОК'},{id:'jump',name:'Перестрибни',hint:'ОК — стрибок, коли перешкода близько'}];
export function makeGame(kind,now=Date.now(),rng=Math.random){if(!gameTypes.some(g=>g.id===kind))kind='bug';return {kind,started:now,until:now+25000,hits:0,misses:0,cursor:1,target:Math.floor(rng()*3),roundAt:now,nextPress:now,chosen:null,done:false,won:false};}
export function gameMove(g,dir){if(g.done)return;if(g.kind==='direction')g.chosen=dir<0?-1:1;else if(g.kind!=='jump')g.cursor=(g.cursor+dir+3)%3;}
export function advanceGame(g,now=Date.now(),rng=Math.random){if(g.done)return g;if(now>=g.until){g.done=true;g.won=false;return g;}if(['food','jump'].includes(g.kind)&&now-g.roundAt>2600){g.misses++;g.roundAt=now;g.target=Math.floor(rng()*3);}if(g.misses>=3){g.done=true;g.won=false;}return g;}
export function pressGame(g,now=Date.now(),rng=Math.random){advanceGame(g,now,rng);if(g.done||now<g.nextPress)return {hit:false,ignored:true};g.nextPress=now+250;const elapsed=now-g.roundAt;if(g.kind==='jump')g.jumpUntil=now+450;let hit=false;
 if(g.kind==='bug')hit=g.cursor===g.target;
 if(g.kind==='food')hit=g.cursor===g.target&&elapsed>=1400&&elapsed<=2500;
 if(g.kind==='direction')hit=g.chosen===(g.target%2===0?-1:1);
 if(g.kind==='jump')hit=elapsed>=1400&&elapsed<=2400;
 if(hit){g.hits++;g.target=(g.target+1+Math.floor(rng()*2))%3;g.roundAt=now;g.chosen=null;}else{g.misses++;if(g.kind!=='bug'){g.roundAt=now;g.target=Math.floor(rng()*3);g.chosen=null;}}
 if(g.hits>=5){g.done=true;g.won=true;}else if(g.misses>=3){g.done=true;g.won=false;}return {hit,ignored:false};}
export function gameView(g,now=Date.now()){const phase=Math.min(1,(now-g.roundAt)/2600);if(g.kind==='direction')return {scene:g.target%2===0?'◀':'▶',cursor:g.chosen===-1?'◀':g.chosen===1?'▶':'?',hint:'Обери такий самий напрямок'};if(g.kind==='jump')return {scene:'·'.repeat(Math.max(0,6-Math.floor(phase*7)))+'▣'+'·'.repeat(Math.floor(phase*7)),cursor:'▲',hint:phase>=.54&&phase<=.92?'СТРИБАЙ!':'Чекай перешкоду…'};return {scene:[0,1,2].map(i=>i===g.target?(g.kind==='bug'?'✳':phase>.54?'◆':'◇'):'·').join('   '),cursor:[0,1,2].map(i=>i===g.cursor?'▲':'·').join('   '),hint:g.kind==='food'?(phase>.54?'ЛОВИ!':'Їжа падає…'):'Рухайся до жука'};}

export function drawGame(ctx,g,now=Date.now()){
 ctx.clearRect(0,0,128,66);const r=(x,y,w,h,c='#35482e')=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};const phase=Math.max(0,Math.min(1,(now-g.roundAt)/2600));
 if(g.kind==='direction'){const left=g.target%2===0;for(let i=0;i<6;i++){r(left?40+i*5:83-i*5,14+i*3,5,5);r(left?40+i*5:83-i*5,44-i*3,5,5);}r(43,29,40,6);r(g.chosen===-1?25:g.chosen===1?98:61,58,5,4,'#bd8950');return;}
 if(g.kind==='jump'){r(5,57,118,2,'#7a8c5b');const up=now<(g.jumpUntil||0)?-15:0;r(24,35+up,14,16);r(26,31+up,10,6);r(22,49+up,5,8);r(35,49+up,5,8);const x=116-phase*100;r(x,42,9,15,'#9b7049');r(x-2,42,13,3,'#9b7049');if(phase>.54&&phase<.92){r(9,9,2,10);r(9,22,2,2);}return;}
 const x=22+g.target*41,y=g.kind==='food'?8+phase*43:28;
 if(g.kind==='bug'){r(x-3,y,7,9);r(x-5,y-2,2,4);r(x+4,y-2,2,4);r(x-6,y+4,3,2);r(x+5,y+4,3,2);}else{r(x-6,y-4,12,10,'#b57574');r(x-2,y-7,3,5,'#69884e');}
 r(10+g.cursor*41,59,22,3);r(10+g.cursor*41,54,3,5);r(29+g.cursor*41,54,3,5);r(22,62,1,1);r(63,62,1,1);r(104,62,1,1);
}
