export const traits={
 affectionate:{name:'Ласкавий',icon:'♡',line:'План на сьогодні: обійми. Потім ще обійми.'},
 playful:{name:'Грайливий',icon:'✥',line:'Гей, моя людино! Пограємо? Я вже розім’яв лапки.'},
 sleepy:{name:'Сонько',icon:'☾',line:'Я не ледачий. Я професійно бережу енергію.'},
 glutton:{name:'Ласун',icon:'♨',line:'А в нас є щось смачненьке? Просто питаю.'},
 stubborn:{name:'Впертюх',icon:'!',line:'Я тебе люблю. Але рішення все одно приймаю сам.'}
};
export function stableHash(text){let n=2166136261;for(const ch of String(text))n=Math.imul(n^ch.charCodeAt(0),16777619);return n>>>0;}
export function traitOf(s){if(s.trait&&traits[s.trait])return s.trait;return Object.keys(traits)[stableHash(s.species+':'+s.born)%5];}
export function recordHabit(s,action,now){s.habits??={};if(now-(s.habitAt??0)<60000)return;s.habitAt=now;const key={pet:'affectionate',play:'playful',sleep:'sleepy',treat:'glutton',discipline:'stubborn'}[action];if(key)s.habits[key]=(s.habits[key]||0)+1;const best=Object.entries(s.habits).sort((a,b)=>b[1]-a[1])[0];if(best&&best[1]>=8)s.trait=best[0];}
export function behaviorPose(s,age,frame,reduced=false){if(!s||s.dead||s.sleeping||s.napping||s.vacation||age==='Яєчко'||reduced)return {kind:'rest',x:0,y:0};const trait=traitOf(s),seed=stableHash(s.species+s.born),block=Math.floor(frame/4000),phase=(block+seed)%7;let kind=['walk','look','sit','scratch','look','walk','yawn'][phase];if(s.poop>0&&phase===2)kind='disgust';if(s.energy<25||trait==='sleepy'&&phase===4)kind='yawn';if((trait==='playful'||(s.world?.skills?.trick||0)>=3)&&phase===2)kind='hop';if(s.room?.toy&&phase===6&&s.energy>=25)kind='toy';if(s.room?.plant&&phase===4)kind='garden';return {kind,x:kind==='walk'?Math.round(Math.sin(frame/1400)*17):0,y:kind==='sit'?5:kind==='hop'?-Math.round(Math.abs(Math.sin(frame/220))*7):0};}
