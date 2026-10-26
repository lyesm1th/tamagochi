import {disciplineScore,practiceManners} from './manners.js';
import {traitOf,stableHash} from './traits.js';
const clamp=n=>Math.max(0,Math.min(100,n));
const apologies=['Я тут натворив. Давай виправимо разом?','Я знаю, що ми домовлялися. Зараз допоможу.','Упс. Це я. Не вазон і не привид. Давай приберемо.'];
const excuses=['І що? Це була перевірка твоєї уважності!','РРР! Я не винен. Ну, може, трохи.','Я хотів як краще. Як вийшло, ти бачиш.'];
const grumbles=['Я почув. Не обов’язково ж так дивитися!','Бурр. Правило пам’ятаю. Просто зірвався.','Добре, добре. Наступного разу спробую стриматися.'];
export function resolveMischiefResponse(s,mess,choice,now=Date.now()){
 const education=disciplineScore(s),trait=traitOf(s),seed=stableHash((s.id||s.species)+':answer:'+mess.id+':'+choice);
 const aware=education>=60,defiant=education<35&&(trait==='stubborn'||(s.calm??s.happy??100)<45);
 if(choice===2)return {text:defiant?'Ха! Знав, що ти оціниш. Наступний вазон уже нервує!':'Ну все, ми обоє засміялися. Але безлад нікуди не зник.',gesture:'hop',repair:false};
 if(choice===1){const repair=education>=45||!defiant;return {text:repair?(aware?apologies[seed%apologies.length]:'Гаразд, давай прибирати. Але я бурчатиму!'):excuses[seed%excuses.length],gesture:repair?'approach':'turned',repair};}
 return {text:defiant?excuses[seed%excuses.length]:aware?grumbles[seed%grumbles.length]:'Ну гаразд. Я спробую запам’ятати.',gesture:defiant?'turned':'look',repair:false};
}
export function applyMischiefResponse(s,mess,choice,now=Date.now()){
 const response=resolveMischiefResponse(s,mess,choice,now);
 if(choice===1&&response.repair){s.clean=clamp((s.clean??100)+12);s.bond=clamp((s.bond??0)+2);practiceManners(s,'tidy',now);}
 else if(choice===0){practiceManners(s,{food:'food',pot:'belongings',puddle:'tidy',brush:'belongings'}[mess.kind]||'requests',now);s.happy=clamp((s.happy??100)-1);}
 else if(choice===2)s.happy=clamp((s.happy??100)+5);
 s.bodyLanguage={kind:response.gesture,until:now+6000};
 return response;
}
