const clamp=n=>Math.max(0,Math.min(100,n));
export const MINUTE=60000,HOUR=3600000,DAY=86400000;
export const life={egg:3*MINUTE,baby:3*MINUTE+HOUR,child:3*MINUTE+HOUR+2*DAY,teen:3*MINUTE+HOUR+5*DAY};
export function care(s){return clamp((s.careScore??80)*.7+(s.discipline??70)*.3);}
export function seniorAt(s){return life.teen+(7+7*(s.adultCare??care(s))/100)*DAY;}
export function stage(s,now=Date.now()){const age=(s.vacation?.started??now)-s.born;return age<life.egg?'Яєчко':age<life.baby?'Малюк':age<life.child?'Дитина':age<life.teen?'Підліток':age<seniorAt(s)?'Дорослий':'Старенький';}
