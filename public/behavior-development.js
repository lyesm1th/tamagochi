// Skill regression depends on continuous unmet care, never on absence alone.
import {ensureManners,disciplineScore} from './manners.js';
const HOUR=3600000,DAY=24*HOUR;
const clamp=n=>Math.max(0,Math.min(100,n));
export function neglectSkills(s,start,end){
 if(!s||s.dead||s.vacation||end<=start)return;
 const m=ensureManners(s),n=m.neglect??={hours:0,lastAt:start};
 const elapsed=Math.max(0,(end-start)/HOUR);
 const unmet=(s.hunger??100)<25||(s.happy??100)<20||(s.clean??100)<25||(s.energy??100)<5;
 if(!unmet){n.hours=0;n.lastAt=end;return;}
 const before=n.hours;n.hours+=elapsed;n.lastAt=end;
 // From 48h of continuous poor care, capped at two global points per 24 hours.
 const eligible=Math.max(0,n.hours-48)-Math.max(0,before-48);
 if(eligible<=0)return;
 const total=Math.min(2*elapsed/24,eligible*2/24);
 for(const key of ['food','belongings','requests','tidy','patience','friends']){
   const skill=m.skills[key];const protectedPractice=clamp(skill.practice??0);
   const loss=total*(protectedPractice>=85?.3:protectedPractice>=60?.6:1);
   skill.practice=clamp(protectedPractice-loss);
 }
 s.discipline=disciplineScore(s);
}
export function inheritedLearningBonus(parent){const d=disciplineScore(parent);return d>=90?.08:d>=80?.06:d>=60?.04:d>=40?.02:0;}
