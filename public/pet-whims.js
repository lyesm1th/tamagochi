import {stableHash,traitOf} from './traits.js';
import {disciplineScore} from './manners.js';
const MIN=60000,WINDOW=27*MIN;
const episodes=['playful','contrary','snack','quiet','affectionate'];
// Time-bound, deterministic whims: no timers, database migration or random reload flicker.
// Attachment is deliberately absent: loving someone does not erase personality.
export function petWhim(s,now=Date.now()){
 if(!s||s.dead||s.vacation||s.sleeping||s.napping)return null;
 const slot=Math.floor(now/WINDOW),phase=now-slot*WINDOW;
 if(phase>=11*MIN)return null;
 const seed=(s.id||s.species)+':whim:'+slot,kind=episodes[stableHash(seed)%episodes.length];
 return {kind,until:(slot*WINDOW+11*MIN),at:slot*WINDOW};
}
export function whimLine(s,now=Date.now()){
 const e=petWhim(s,now);if(!e)return null;
 return {playful:'Слухай, сьогодні я вигадую правила. Тримайся, людино!',contrary:'Люблю тебе, але сьогодні я головний. Хоч трішечки!',snack:'А в нас є щось особливо смачненьке? Просто цікавлюся.',quiet:'Сьогодні хочу спокою. Посидиш біля мене?',affectionate:'Спочатку обійми, а справи хай постоять.'}[e.kind];
}
export function whimRefusalChance(s,action,now=Date.now()){
 const e=petWhim(s,now);if(!e)return 0;
 const rules={playful:{play:-.025,feed:.06},contrary:{play:.16,feed:.11},snack:{play:.13,feed:.18},quiet:{play:.19,feed:0},affectionate:{play:.12,feed:0}};
 const base=rules[e.kind]?.[action]||0,education=disciplineScore(s);
 return Math.max(-.04,base*(.65+(100-education)/280)+(traitOf(s)==='stubborn'&&base>0?.025:0));
}
