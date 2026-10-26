import {interactionPreferences} from './interaction-preferences.js';
import {traitOf,stableHash} from './traits.js';
const HOUR=3600000;
// At most one proactive invitation per 8 hours; no push messages or rewards.
// Uses a persisted time-window ID to avoid repetitions across reloads.
export function petInitiative(s,now=Date.now()){
 if(!s||!Number.isFinite(s.born)||!s.id||s.dead||s.sleeping||s.napping||s.vacation||(s.hunger??100)<40||(s.energy??100)<35||(s.health??100)<40)return null;
 const m=s.initiatives??={lastAt:0,lastWindow:'',count:0};
 const window=Math.floor(now/(8*HOUR));
 if(m.pending&&now<m.pending.expires)return null;
 if(m.pending&&now>=m.pending.expires)m.pending=null;
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
 m.pending={id:key,kind,text:result,at:now,expires:now+2*HOUR};m.lastAt=now;m.lastWindow=String(window);m.count=Math.min(100,(m.count||0)+1);m.lastKind=kind;
 return result;
}

export const initiativeAnswers=['Погодитися','Запропонувати інше','Зараз не можу'];
export function answerPetInitiative(s,id,choice,now=Date.now()){
 const m=s?.initiatives,p=m?.pending;
 if(!p||p.id!==id||now>p.expires)return {state:s,error:'Це прохання вже неактуальне.'};
 if(!Number.isInteger(choice)||choice<0||choice>2)return {state:s,error:'Обери один із трьох варіантів.'};
 m.pending=null;m.lastAnswer={id:p.id,choice,kind:p.kind,at:now};
 const kind=p.kind;
 const text=choice===0?(kind==='play'?'Ура! Тоді ходімо гратися, я вже готовий!':kind==='touch'?'Обійми! Я саме цього й хотів.':'Чудово. Посидимо поруч у тиші.'):
 choice===1?(kind==='play'?'Гаразд, можна й обійми. Але про гру не забудь!':kind==='touch'?'Домовились, придумаємо щось інше.':'Добре, тільки не дуже галасуй, гаразд?'):
 'Гаразд, я почекаю. Дякую, що сказав чесно.';
 return {state:s,text};
}
