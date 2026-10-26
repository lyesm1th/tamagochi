import {interactionPreferences} from './interaction-preferences.js';
import {traitOf,stableHash} from './traits.js';
const HOUR=3600000;
// At most one proactive invitation per 8 hours; no push messages or rewards.
// Uses a persisted time-window ID to avoid repetitions across reloads.
export function petInitiative(s,now=Date.now()){
 if(!s||s.dead||s.sleeping||s.napping||s.vacation||(s.hunger??100)<40||(s.energy??100)<35||(s.health??100)<40)return null;
 const m=s.initiatives??={lastAt:0,lastWindow:'',count:0};
 const window=Math.floor(now/(8*HOUR));
 if(m.lastAt&&now-m.lastAt<8*HOUR||m.lastWindow===String(window))return null;
 const p=interactionPreferences(s),trait=traitOf(s);
 const key=(s.id||s.species)+':initiative:'+window;
 if(stableHash(key)%4!==0)return null;
 const candidates=[['play',p.play],['touch',p.touch],['quiet',p.quiet]].sort((a,b)=>b[1]-a[1]);
 const kind=candidates[0][0],lines={
  play:['Гей, людино! Я сьогодні хочу гратися. Може, поганяємо м’яч?','Мої лапи скучили за пригодами. Зіграємо в щось?'],
  touch:['Можна трохи обіймів? Я сам прийшов!','Почухаєш за вушком? Мені бракує твоєї уваги.'],
  quiet:['Можна посидіти разом у тиші? Я втомився від метушні.','Давай просто відпочинемо. Мені подобається, коли ти поруч.']
 };
 const result=lines[kind][stableHash(key+':line')%2];
 m.lastAt=now;m.lastWindow=String(window);m.count=Math.min(100,(m.count||0)+1);m.lastKind=kind;
 return result;
}
