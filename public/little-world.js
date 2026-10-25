import {weatherAt} from './weather.js';
import {MINUTE} from './pet-life.js';
export {weatherAt};
import {cozyPages,noteCozy} from './cozy-life.js';
import {playroomPages} from './playroom.js';
import {dailyPages,noteDaily} from './daily-life.js';
import {stableHash} from './traits.js';
import {personality} from './pet-personality.js';
const MIN=MINUTE,clamp=n=>Math.max(0,Math.min(100,n));
export const worldPages=[['ritual','Наші ритуали'],['weather','Погода за вікном'],['walk','Прогулянки'],['activity','Спільні заняття'],['dreams','Сни друга'],['forms','Як я виріс'],...dailyPages,...playroomPages,...cozyPages];
export const activities=[{id:'bath',name:'Купання',hint:'ОК — намочити, намилити, змити',steps:['Набираємо теплу водичку','Пінимо й пускаємо бульбашки','Змиваємо піну й витираємо']},{id:'groom',name:'Догляд за собою',hint:'ОК — три ніжні рухи',steps:['Приготували м’яку щіточку','Обережно пригладжуємо','Останній ніжний рух']},{id:'blanket',name:'Загорнути в ковдру',hint:'ОК — вмостити, загорнути, обійняти',steps:['Стелимо м’яку ковдру','Загортаємо друга','Обіймаємо теплий згорток']},{id:'trick',name:'Вивчити трюк',hint:'ОК — показати, повторити, похвалити',steps:['Показуємо новий рух','Друг пробує повторити','Хвалимо за старання']}];
const rituals={chicken:['Дзьобик до пальця','Почухати пір’ячко','Подарувати пір’їнку'],cat:['Привітатися носиком','Почухати за вушком','Принести ґудзик'],corgi:['Привітатися носиком','Почухати за вушком','Принести м’ячик'],frog:['Торкнутися лапкою','Погладити спинку','Принести листочок'],bear:['Обійняти лапами','Почухати за вушком','Поділитися ягідкою'],dog:['Привітатися носиком','Почухати за ріжками','Принести квіточку'],dino:['Торкнутися мордочкою','Погладити між шипами','Принести камінчик'],bunny:['Привітатися носиком','Погладити довгі вушка','Принести стеблинку']};
const dreams={chicken:['Зернята розміром з кавун','Я знайшла зернятко завбільшки з тебе. Прокинулась — знову порожня миска.','grain'],cat:['Політ за величезною рибою','Літав за рибиною. Вона сказала «мур». Підозріла, бляха, риба.','fish'],corgi:['М’ячик на Місяці','Наздогнав м’ячик на Місяці. Короткі лапки — не виправдання!','ball'],frog:['Концерт у великій калюжі','Квакав на сцені. Калюжа аплодувала. Ти був у першому ряду.','pond'],bear:['Малинові хмари','Їв малинові хмари. Тебе теж пригостив, не бурчи.','berry'],dog:['Політ над зеленим лугом','Літала над лугом. Трава знизу кричала: «З’їж мене!» От дурна.','grass'],dino:['Вулкан із печивом','З вулкана летіло печиво. Я всіх урятував. З’їв печиво.','cookie'],bunny:['Морквяна ракета','Полетів на моркві до зірок. Назад довелося стрибати: ракету з’їв.','carrot']};
export function ensureWorld(s){s.world??={};const w=s.world;w.rituals??={};w.skills??={};w.cooldowns??={};w.weatherSound??=true;return w;}
export function careForm(s){const c=s.adultCare??((s.careScore??80)*.7+(s.discipline??70)*.3);return c>=80?'radiant':c>=50?'cozy':'scruffy';}
export const formNames={radiant:'Доглянутий красунчик',cozy:'Затишний сонько',scruffy:'Скуйовджений розбишака'};
export function ritualOptions(s,now=Date.now()){const list=[...(rituals[s.species]||rituals.cat)];if((s.vacation?.started??now)-s.born<63*MIN){if(s.species==='dog')list[1]='Погладити голівку';if(s.species==='dino')list[1]='Погладити маленьку спинку';}return list;}
export function favoriteRitual(s){const counts=s.world?.rituals||{};return [0,1,2].sort((a,b)=>(counts[b]||0)-(counts[a]||0)||a-b)[0];}
export function ritualHint(s){const i=favoriteRitual(s);return (s.world?.rituals[i]||0)>=3?'Наш ритуал? '+ritualOptions(s)[i]+'. Само себе не погладить!':null;}
export function dreamFor(s,at=s.world?.sleepAt||Date.now()){const d=dreams[s.species]||dreams.cat;return stableHash((s.id||s.species)+at)%4===0?{title:'Моя людина поруч',text:'Снилось, що ти вчасно мене годуєш. Фантастика, блін.',icon:'heart'}:{title:d[0],text:d[1],icon:d[2]};}
export function syncDream(s,now=Date.now()){
 const w=ensureWorld(s);if(s.vacation||s.dead)return;const asleep=!!(s.sleeping||s.napping);
 if(asleep){if(!w.wasSleeping){w.sleepAt=now;w.dream=null;}if(now-w.sleepAt>=2*MIN&&!w.dream)w.dream={...dreamFor(s,w.sleepAt),at:now};}
 else if(w.wasSleeping&&w.dream){w.lastDream={...w.dream,wokeAt:now};w.wakeStoryPending=true;w.dream=null;}
 w.wasSleeping=asleep;
}
export function wakeStory(s){const w=s.world;if(!w?.wakeStoryPending)return null;w.wakeStoryPending=false;return w.lastDream.text;}
export const walks=[{id:'park',name:'Парк',scene:'Стежка веде повз гойдалку. Щось блищить у траві.',choices:['Пошукати скарб','Пострибати на галявині']},{id:'forest',name:'Ліс',scene:'Листя шурхотить. На стежці гарний камінчик.',choices:['Зібрати сувенір','Пограти в хованки']},{id:'pond',name:'Ставок',scene:'На воді кола, біля берега м’яка травичка.',choices:['Посидіти біля води','Дослідити берег']}];
function ready(s,now){if(s.dead)return 'Друг уже на веселці.';if(s.vacation)return 'Спочатку забери друга з готелю.';if(now-s.born<3*MIN)return 'Нехай спочатку вилупиться з яйця.';if(s.sleeping||s.napping)return 'Друг спить. Повернемося до цього після сну.';return null;}
function worldCore(state,command,body={},now=Date.now()){
 if(!state)return {error:'Спочатку обери друга.'};const s=structuredClone(state),w=ensureWorld(s);if(command==='weatherSound'&&!s.dead){w.weatherSound=!w.weatherSound;return {state:s,text:'Звуки погоди '+(w.weatherSound?'увімкнено.':'вимкнено.')};}const error=ready(s,now);if(error)return {error};
 if(command==='ritual'){
 if(!Number.isInteger(body.choice)||body.choice<0||body.choice>2)return {error:'Обери ритуал.'};const reward=now-(w.cooldowns.ritual||0)>=5*MIN;
 const i=body.choice;if(reward){w.rituals[i]=(w.rituals[i]||0)+1;w.cooldowns.ritual=now;s.bond=clamp((s.bond||0)+3);s.happy=clamp(s.happy+7);}return {state:s,text:ritualOptions(s,now)[i]+'. '+personality(s.species).voice+'… Ти мій улюблений дурко.'+(w.rituals[i]===3?' Це тепер наш ритуал!':''),effect:i===2?'gift':'ritual'};
 }
 if(command==='walkStart'){
 if(w.walk&&w.walk.expires>now)return {state:s,text:'Прогулянка триває. Обери, що робити далі.'};const place=walks.find(p=>p.id===body.place);if(!place)return {error:'Обери місце.'};const reward=now-(w.cooldowns.walk||0)>=30*MIN;if(s.energy<15||s.hunger<15)return {error:'Перед прогулянкою треба поїсти й відпочити.'};s.energy-=6;s.hunger=clamp(s.hunger-3);if(reward)w.cooldowns.walk=now;w.walk={reward,id:`${now}-${place.id}`,place:place.id,expires:now+10*MIN};return {state:s,text:place.scene,effect:'walk'};
 }
 if(command==='walkChoice'){
 const trip=w.walk;if(!trip||trip.expires<=now||body.eventId!==trip.id)return {error:'Ця прогулянка вже завершилась.'};if(!Number.isInteger(body.choice)||body.choice<0||body.choice>1)return {error:'Обери дію.'};const affinity={chicken:'park',cat:'park',corgi:'park',bear:'forest',dog:'pond',frog:'pond',dino:'forest',bunny:'forest'}[s.species]===trip.place;if(trip.reward!==false){s.happy=clamp(s.happy+10+(affinity?4:0));s.bond=clamp((s.bond||0)+2);}let text=affinity?{chicken:'Наклювала зернят. Оце нормальний ресторан!',cat:'Погрів пузо на лавці. Лавка тепер моя.',corgi:'Оббіг усі дерева. Лапи короткі, амбіції здоровенні.',bear:'Знайшов ягідний кущ. Ліс мене поважає.',dog:'Тут така трава! П’ятизірковий луг, бляха.',frog:'Калюжі! Моя стихія. Ква, яка краса!',dino:'Протупотів лісом. Майже нікого не налякав.',bunny:'Пострибав між деревами. Вуха провітрив.'}[s.species]:'Гарно погуляли. Тепер додому, моя людино.';if(body.choice===0&&trip.reward!==false){s.souvenir={park:'Паркова квіточка',forest:'Лісовий камінчик',pond:'Гладенька мушля'}[trip.place];text+=' Принесли: '+s.souvenir+'.';}w.lastWalk={place:trip.place,at:now};w.walk=null;return {state:s,text,effect:body.choice===0?'gift':'walk'};
 }
 if(command==='activityStart'){
 const a=activities.find(a=>a.id===body.activity);if(!a)return {error:'Обери заняття.'};if(w.activity&&w.activity.expires>now){if(w.activity.kind!==a.id)return {error:'Спочатку закінчимо почате заняття.'};return {state:s,text:activityStepText(s,a,w.activity.step)};}const reward=now-(w.cooldowns[a.id]||0)>=10*MIN;if(a.id==='trick'&&s.energy<12)return {error:'Для трюків спочатку треба відпочити.'};w.activity={reward,id:`${now}-${a.id}`,kind:a.id,step:0,last:0,expires:now+5*MIN};return {state:s,text:activityStepText(s,a,0),effect:a.id};
 }
 if(command==='activityStep'){
 const run=w.activity,a=activities.find(a=>a.id===run?.kind);if(!a||run.expires<=now||body.eventId!==run.id)return {error:'Заняття вже завершилось. Почнімо знову.'};if(now-run.last<650)return {error:'Ніжніше, не поспішай.'};run.last=now;run.step++;if(run.step<3)return {state:s,text:activityStepText(s,a,run.step),effect:a.id};
 if(w.activity.reward!==false){w.cooldowns[a.id]=now;w.skills[a.id]=(w.skills[a.id]||0)+1;s.bond=clamp((s.bond||0)+2);s.happy=clamp(s.happy+8);if(a.id==='bath'){s.clean=100;s.poop=0;}if(a.id==='groom')s.clean=clamp(s.clean+12);if(a.id==='blanket')s.energy=clamp(s.energy+5);if(a.id==='trick'){s.energy=clamp(s.energy-4);s.xp+=3;}}w.activity=null;return {state:s,text:a.id==='trick'?(w.skills.trick>=3?'Трюк вивчено! Дивись, як я вмію. Не зазнавайся, це я талановитий.':'Уже краще виходить! Ще потренуємося разом.'):'Готово. Чистенький, затишний і трохи нахабний. Люблю тебе.',effect:a.id};
 }
 return {error:'Невідома дія.'};
}

export function activityStepText(s,a,step){if(a.id==='groom'&&s.species==='frog')return ['Беремо вологу м’яку губку','Ніжно зволожуємо гладеньку спинку','Ще крапелька води — готово'][step];if(a.id==='groom'&&s.species==='chicken')return ['Беремо м’яку щіточку','Пригладжуємо пір’ячко вздовж крилець','Чубчик теж охайний'][step];if(a.id==='groom'&&s.species==='dino'&&Date.now()-s.born<63*MIN)return ['Беремо м’яку губку','Чистимо маленьку лускату спинку','Хвостик теж чистенький'][step];if(a.id==='groom'&&s.species==='dino')return ['Беремо м’яку щіточку','Чистимо луску, обережно між шипами','Хвостик теж чистенький'][step];return a.steps[step];}

export function performWorld(state,command,body={},now=Date.now()){
 const r=worldCore(state,command,body,now);if(r.state&&!r.error){let action=command;if(command==='activityStep'&&!r.state.world.activity)action=state.world.activity.kind;if(!(command==='walkChoice'&&state.world?.walk?.reward===false))noteDaily(r.state,action,now,{place:state.world?.walk?.place});noteCozy(r.state,action,now);}return r;
}
