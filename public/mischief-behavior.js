import {disciplineScore} from './manners.js';
import {traitOf,stableHash} from './traits.js';
const HOUR=3600000;
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export const mischiefRule={food:'food',pot:'belongings',puddle:'tidy',brush:'belongings'};
export function mischiefDecision(s,now=Date.now()){
 const d=disciplineScore(s),calm=s.calm??Math.min(s.happy??100,s.energy??100),hunger=s.hunger??100;
 const trait=traitOf(s),badMood=clamp((55-calm)/55,0,1),hungry=clamp((45-hunger)/45,0,1);
 const impulse=clamp(0.16+(100-d)*.005+badMood*.16+hungry*.08+(trait==='stubborn'?.12:trait==='playful'?.09:0),.04,.89);
 const key=(s.id||s.species)+':mess:'+Math.floor(now/(15*60000));const roll=stableHash(key)%1000/1000;
 const kinds=['food','pot','puddle','brush'];const kind=kinds[stableHash(key+':kind')%kinds.length];
 const interval=clamp((d<20?35:d<40?55:d<60?90:d<80?150:230)+(trait==='stubborn'?-10:0),25,300)*60000;
 // Physical mischief pauses at critically low energy/health. Need-care speech remains active.
 const allowed=!s.dead&&!s.vacation&&!s.sleeping&&!s.napping&&(s.health??100)>=35&&(s.energy??100)>=20;
 return {happens:allowed&&roll<impulse,kind,rule:mischiefRule[kind],nextAt:now+interval,impulse};
}
