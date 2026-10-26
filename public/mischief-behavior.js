import {behaviorMemoryEffect} from './behavior-memory.js';
import {disciplineScore} from './manners.js';
import {traitOf,stableHash} from './traits.js';
const MINUTE=60000;
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export const mischiefRule={food:'food',pot:'belongings',puddle:'tidy',brush:'belongings'};

// A pet's understanding of this particular rule matters as well as general manners.
// The fixed time slots keep decisions repeatable across reloads and server retries.
export function mischiefDecision(s,now=Date.now()){
 const general=disciplineScore(s);
 const key=(s.id||s.species)+':mess:'+Math.floor(now/(15*MINUTE));
 const kinds=['food','pot','puddle','brush'];
 const kind=kinds[stableHash(key+':kind')%kinds.length],rule=mischiefRule[kind];
 const skill=s.manners?.skills?.[rule];
 const specific=skill?clamp(.4*(skill.training??0)+.6*(skill.practice??0),0,100):general;
 const education=.55*general+.45*specific;
 const calm=s.calm??Math.min(s.happy??100,s.energy??100),hunger=s.hunger??100;
 const trait=traitOf(s);
 const badMood=clamp((55-calm)/55,0,1),hungry=clamp((45-hunger)/45,0,1);
 const base=clamp(.08+(100-education)*.0042,.08,.50);
 const traitBonus=trait==='stubborn'?.07:trait==='playful'?.05:0;
 const experience=behaviorMemoryEffect(s,rule);
 const impulse=clamp(base+badMood*.10+hungry*.07+traitBonus-experience,.02,.72);
 const interval=(education<20?45:education<40?75:education<60?110:education<80?150:220)*MINUTE;
 const roll=stableHash(key+':roll')%10000/10000;
 // Education must reduce both impulse and the frequency of opportunities.
 // Stress and personality still matter, but cannot overwhelm well-learned habits.
 // Needs remain actionable even if the pet is too ill/tired to make a mess.
 const allowed=!s.dead&&!s.vacation&&!s.sleeping&&!s.napping&&(s.health??100)>=35&&(s.energy??100)>=20;
 return {happens:allowed&&roll<impulse,kind,rule,nextAt:now+interval,impulse};
}
