import {noteInteractionMemory,emotionalAffinity} from './interaction-memory.js';
import {disciplineScore} from './manners.js';
import {traitOf,stableHash} from './traits.js';

const clamp=n=>Math.max(0,Math.min(100,n));
const HOUR=3600000;
export function boundaryState(s,now=Date.now()){
 const b=s.interactionBoundary??={refusedAt:0,until:0,kind:'',times:0};
 if(now>=b.until){b.until=0;if(!b.refusedAt)b.kind='';}
 s.interactionBoundary=b;return b;
}
export function directInteraction(s,action,now=Date.now()){
 if(!['pet','play','feed'].includes(action)||s.dead||s.sleeping||s.napping||s.vacation)return null;
 const b=boundaryState(s,now);
 const hungry=(s.hunger??100)<30,upset=(s.calm??Math.min(s.happy??100,s.energy??100))<30;
 const education=disciplineScore(s),low=education<35,stubborn=traitOf(s)==='stubborn';
 // Affection is not obedience: even a loved, comfortable pet can have a whim.
 // Essential feeding must remain available when actually hungry.
 if(action==='feed'&&((s.hunger??100)<45||(s.health??100)<50))return null;
 if(now-b.refusedAt<3*60000)return null;
 const seed=(s.id||s.species)+':boundary:'+action+':'+Math.floor(now/90000);
 const mood=s.happy??70,energy=s.energy??70;
 const hungerBias=action==='play'&&hungry?.56:action==='feed'&&s.hunger>65?.20:hungry?.19:0;
 const moodBias=upset?.25:mood<55?.12:0;
 const whim=.07+(100-education)*.0017+(stubborn?.07:0)+(energy<35?.14:0);
 const chance=clamp(whim+hungerBias+moodBias-emotionalAffinity(s)*.25,.055,.67);
 if(stableHash(seed)%1000/1000>=chance)return null;
 b.refusedAt=now;b.until=now+45000;b.kind=hungry?'hungry':upset?'upset':'stubborn';b.times=Math.min(30,(b.times||0)+1);
 s.bodyLanguage={kind:hungry?'disgust':upset?'turned':'look',until:now+6000};noteInteractionMemory(s,'boundary',now);
 const text=action==='feed'?'Сьогодні вередую: звичайну їжу не хочу, краще б щось смачненьке! Але можеш запропонувати ще пізніше.':action==='play'&&hungry?'Спершу б поїсти, а вже потім гратися. Живіт бурчить голосніше за мене.':upset?'Я сьогодні не в настрої. Можемо просто посидіти поруч?':'Люблю тебе, але зараз хочу по-своєму. Дай мені хвилинку, добре?';
 return {text,refused:true};
}
export function reconcileInteraction(s,now=Date.now()){
 const b=boundaryState(s,now);
 if(!b.refusedAt||now-b.refusedAt>2*HOUR)return null;
 // Care, time and calm restore openness; do not require payment or repeat taps.
 if((s.hunger??100)<40||(s.happy??100)<35)return null;
 if(now-b.refusedAt<45000)return null;
 const response=b.kind==='treat'?'Гаразд, зголоднів. Можемо і звичайну їжу. Дякую, що терпиш мої примхи.':b.kind==='hungry'?'Дякую за їжу. Тепер уже можна й погратися.':b.kind==='upset'?'Я заспокоївся. Посидиш зі мною?':'Я трохи набурчав. Давай почнемо спочатку.';
 b.refusedAt=0;b.until=0;b.kind='';noteInteractionMemory(s,'reunion',now);s.bodyLanguage={kind:'approach',until:now+6000};
 return response;
}
