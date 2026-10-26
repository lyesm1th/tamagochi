import {disciplineScore} from './manners.js';
const LIMIT=30;
export function ensureBehaviorMemory(s){s.behaviorMemory??={events:[],habits:{}};const m=s.behaviorMemory;if(!Array.isArray(m.events))m.events=[];m.habits??={};return m;}
export function rememberBehavior(s,event){
 const m=ensureBehaviorMemory(s);if(!event?.id||m.events.some(x=>x.id===event.id))return false;
 const rule=event.rule||'requests',result=event.result||'unknown';
 m.events.push({id:String(event.id),at:Number(event.at)||Date.now(),rule,result,kind:event.kind||'mischief'});
 m.events=m.events.slice(-LIMIT);
 const h=m.habits[rule]??={resolved:0,repaired:0,defiant:0};h.resolved++;if(result==='repaired')h.repaired++;if(result==='defiant')h.defiant++;
 return true;
}
export function behaviorMemoryEffect(s,rule){const h=s.behaviorMemory?.habits?.[rule];if(!h)return 0;return Math.max(-.08,Math.min(.12,(h.repaired-h.defiant)*.008));}
export function behaviorMemoryHint(s){const m=s.behaviorMemory;if(!m?.events?.length||disciplineScore(s)<40)return null;const last=m.events.at(-1);if(last.result==='repaired')return 'Пам’ятаю, як ми разом прибрали після моєї витівки. Наступного разу спробую стриматися сам.';if(last.result==='defiant')return 'Здається, я тоді нагрубив. Може, наступного разу краще домовитися?';return null;}
