import {stage,ratesFor,life} from '../public/game.js';
const MIN=60000,HOUR=60*MIN;
export const reminderLines={
 hunger:['Погодуй мене, людисько! Любов’ю живіт не наб’єш.','Моя людино, миска сумує. І я з нею.','Я тебе люблю. Але вечерю теж хочу.'],
 happy:['Зайди обійняти свого малого буркотуна.','Людисько, я скучив. У мене тут план: ти, я й обійми.'],
 energy:['Я вже носом клюю. Вклади мене спатки, командире.','Батарейка сіла. Мені б ковдрочку й добру людину.'],
 clean:['Я тут трохи наклав. У мене лапки, далі ти.','Людисько, час прибрати. Обійми — після прибирання.'],
 health:['Щось я розклеївся. Зайди полікувати свого малого.','Мені недобре. Побурчу потім, а зараз потрібна турбота.']
};
export function safeZone(tz){try{new Intl.DateTimeFormat('en',{timeZone:tz}).format();return tz;}catch{return 'Europe/Kyiv';}}
export function localClock(now,tz){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:safeZone(tz),year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date(now));const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));return {day:`${v.year}-${v.month}-${v.day}`,hour:Number(v.hour)};}
function daytimeAfter(at,tz,nextDay=false,baseDay=null){for(let i=0;i<150;i++){const c=localClock(at,tz);if(c.hour>=9&&c.hour<23&&(!nextDay||c.day!==baseDay))return at;at+=15*MIN;}return at;}
export function planReminder(pet,prefs,now=Date.now(),rng=Math.random){
 const p={...prefs};if(!p.enabled||!pet||pet.dead)return {prefs:p,next:null};
 const clock=localClock(now,p.timezone);if(p.day!==clock.day){p.day=clock.day;p.count=0;}
 if(stage(pet,now)==='Яєчко')return {prefs:p,next:Math.max(now+MIN,pet.born+life.egg)};
 const lows=Object.keys(reminderLines).filter(k=>pet[k]<70&&(k!=='energy'||(!pet.sleeping&&!pet.napping)));
 if(!lows.length){p.pendingAt=0;const r=ratesFor(pet,now);const rates={hunger:r.hunger,happy:r.happy,clean:r.clean,...(!pet.sleeping&&!pet.napping?{energy:r.energy}:{})};const wait=Math.min(...Object.entries(rates).map(([k,rate])=>(pet[k]-70)/rate*HOUR+1000));return {prefs:p,next:now+Math.max(MIN,Math.min(6*HOUR,wait))};}
 if(!p.pendingAt)p.pendingAt=now+(10+Math.floor(rng()*31))*MIN;
 let next=Math.max(p.pendingAt,(p.lastSent||0)+3*HOUR);
 if((p.count||0)>=3)next=daytimeAfter(Math.max(now,next),p.timezone,true,clock.day)+(5+Math.floor(rng()*26))*MIN;
 const at=localClock(Math.max(now,next),p.timezone);if(at.hour<9||at.hour>=23)next=daytimeAfter(Math.max(now,next),p.timezone)+(5+Math.floor(rng()*26))*MIN;
 if(next>now)return {prefs:p,next};
 const key=lows.sort((a,b)=>pet[a]-pet[b])[0];return {prefs:p,next:now,key};
}
