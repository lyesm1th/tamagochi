// Long-term emotional associations, kept separate from pet personality and saved items.
const clamp=n=>Math.max(0,Math.min(100,n));
export function ensureInteractionMemory(s){s.interactionMemory??={trust:50,comfort:50,playJoy:50,events:[],lastByKind:{}};const m=s.interactionMemory;m.events??=[];m.lastByKind??={};m.trust=clamp(m.trust??50);m.comfort=clamp(m.comfort??50);m.playJoy=clamp(m.playJoy??50);return m;}
export function noteInteractionMemory(s,kind,now=Date.now()){
 const m=ensureInteractionMemory(s);
 const gap={boundary:180000,care:180000,play:600000,reunion:600000}[kind]??180000;
 if(now-(m.lastByKind[kind]||0)<gap)return false;
 const delta={boundary:[0,-1,0],care:[1,2,0],play:[1,0,2],reunion:[2,2,0]}[kind];
 if(!delta)return false;
 m.lastByKind[kind]=now;
 m.trust=clamp(m.trust+delta[0]);m.comfort=clamp(m.comfort+delta[1]);m.playJoy=clamp(m.playJoy+delta[2]);
 m.events.push({kind,at:now});m.events=m.events.slice(-20);
 return true;
}
export function emotionalAffinity(s){const m=s?.interactionMemory;if(!m)return 0;return Math.max(-.08,Math.min(.08,((m.trust??50)+(m.comfort??50)+(m.playJoy??50)-150)/750));}
export function relationshipReflection(s){const m=s?.interactionMemory;if(!m)return null;if(m.trust>=67&&m.comfort>=64)return 'Я пам’ятаю, як ти давав мені перепочити. З тобою безпечно бути собою.';if(m.playJoy>=68)return 'З тобою гратися весело. Я вже передчуваю наступну пригоду!';return null;}
