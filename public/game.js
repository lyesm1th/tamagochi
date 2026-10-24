import {updateEnrichment,markRoomTrace} from './room-enrichment.js';
import {roomMoment} from './room-life.js';
import {newSpecies,newPets} from './new-pets.js';
import {MINUTE,HOUR,DAY,life,care,seniorAt,stage} from './pet-life.js';
export {MINUTE,HOUR,DAY,life,care,seniorAt,stage} from './pet-life.js';
import {updateJournal} from './life-journal.js';
import {updateLively} from './lively.js';
import {bedBonus,furnitureStatus} from './living.js';
import {updateCozy,noteCozy} from './cozy-life.js';
import {noteDaily,updateDaily} from './daily-life.js';
import {ensureWorld,syncDream,wakeStory} from './little-world.js';
import {ensureCompanion,foodsFor,noteCare,maybeAdventure,routineSleeping} from './companionship.js';
import {traitOf,recordHabit,traits} from './traits.js';
import {personality,foodFor} from './pet-personality.js';
export const species = [
 {id:'chicken',name:'Курочка',nick:'Квочка',color:'#e9c954'},
 {id:'cat',name:'Котик',nick:'Пан Сраколап',color:'#bf9ae0'},
 {id:'corgi',name:'Коргі',nick:'Батон',color:'#e5a05a'},
 {id:'frog',name:'Жабка',nick:'Квасик',color:'#9bbf63'},
 {id:'bear',name:'Ведмедик',nick:'Буркотун',color:'#b38a69'},
 {id:'dog',name:'Корівка',nick:'Мукалка',color:'#f2eee1'},
 {id:'dino',name:'Динозаврик',nick:'Кусьозавр',color:'#7cb3a0'},
 {id:'bunny',name:'Кролик',nick:'Вухань',color:'#e4bacb'},
 ...newSpecies
];
export const fresh = (id,now=Date.now()) => ensureCompanion({id:globalThis.crypto?.randomUUID?.()||`${now}-${id}`,generation:1,species:id,name:species.find(s=>s.id===id)?.nick||'Малюк',born:now,updated:now,hunger:85,happy:85,energy:90,clean:100,health:100,poop:0,sleeping:false,coins:20,xp:0,dead:false,lastAction:0,careScore:80,discipline:70,treatStreak:0,poopClock:0,adultCare:null,lifeRules:2},now);
const clamp=n=>Math.max(0,Math.min(100,n));
export function temperament(s){const c=s.adultCare??care(s);return c>=80?'Лагідний розумник':c>=50?'Ласкавий буркотун':'Неслухняний бешкетник';}
function baseRates(s,now=Date.now()){
 const st=stage(s,now),poor=(s.adultCare??care(s))<50;
 if(st==='Яєчко')return {hunger:0,happy:0,clean:0,energy:0,poop:Infinity};
 if(st==='Малюк')return {hunger:55,happy:65,clean:45,energy:25,poop:7*MINUTE};
 if(st==='Дитина')return {hunger:6,happy:5,clean:5,energy:5,poop:2*HOUR};
 if(st==='Підліток')return {hunger:7,happy:7,clean:6,energy:6,poop:1.5*HOUR};
 if(st==='Старенький')return {hunger:8,happy:5,clean:8,energy:8,poop:HOUR};
 return {hunger:poor?8:5,happy:poor?7:4,clean:poor?9:4,energy:5,poop:(poor?1:3)*HOUR};
}
export function ratesFor(s,now=Date.now()){const r=baseRates(s,now);if(stage(s,now)==='Яєчко'||s.vacation)return r;const trait=traitOf(s);return {...r,hunger:r.hunger*(trait==='glutton'?1.15:1)*(s.room?.bowl&&furnitureStatus(s,'bowl')>0 ? .9 : 1),happy:r.happy*(trait==='playful'?1.15:1)*(s.room?.plant&&furnitureStatus(s,'plant')>0 ? .9 : 1),energy:r.energy*(trait==='sleepy'?1.2:1)};}
export function tick(s,now=Date.now()) {
 if(!s)return s;ensureCompanion(s,now);s.trait??=traitOf(s);ensureWorld(s);if(s.dead)return s;if(s.vacation){s.updated=now;return s;}
 // Old saves keep their birthday and stats. New fields are added in place.
 syncDream(s,s.updated);s.careScore??=80;s.discipline??=70;s.treatStreak??=0;s.poopClock??=0;
 // Integrate by fifteen-minute slices so offline neglect matches online time.
 let cursor=s.updated,steps=0;
 while(cursor<now&&!s.dead&&steps++<12000){
 const age=cursor-s.born,st=stage(s,cursor),r=ratesFor(s,cursor);
 if(st==='Дорослий'&&s.adultCare==null)s.adultCare=care(s);
 const boundaries=[life.egg,life.baby-5*MINUTE,life.baby,life.child,life.teen,seniorAt(s),seniorAt(s)+3*DAY].map(t=>s.born+t).filter(t=>t>cursor);
 const end=Math.min(now,cursor+15*MINUTE,...boundaries),h=(end-cursor)/HOUR;
 if(st!=='Яєчко'){for(const id of [...Object.keys(s.room||{}),...Object.keys(s.cozy?.owned||{})]){const item=s.cozy.items[id]??={wear:100,uses:0,known:false};item.wear=Math.max(0,item.wear-h*(s.sleeping?.25:.6));}
 if(s.routine.enabled&&st!=='Малюк')s.sleeping=routineSleeping(s,cursor);
 const nap=st==='Малюк'&&age>=life.baby-5*MINUTE,asleep=s.sleeping||nap;s.napping=nap;syncDream(s,cursor);
 if(s.social)s.social.mental=clamp(s.social.mental+h);s.hunger=clamp(s.hunger-h*r.hunger);s.happy=clamp(s.happy-h*r.happy);s.clean=clamp(s.clean-h*r.clean);s.energy=clamp(s.energy+h*(asleep?(22+bedBonus(s)):-r.energy));
 s.poopClock+=end-cursor;const droppings=Math.floor(s.poopClock/r.poop);if(droppings){s.poop=Math.min(4,s.poop+droppings);s.poopClock%=r.poop;}
 const neglected=st==='Малюк'?(s.hunger<50||s.happy<50||s.clean<50):(s.hunger<25||s.happy<20||s.clean<25||s.energy<5);
 if(neglected)s.careScore=clamp(s.careScore-h*(st==='Малюк'?20:3));
 if(st==='Дитина'||st==='Підліток')s.discipline=clamp(s.discipline-h*.35);
 const ill=s.hunger<15||s.clean<15||s.energy<5;
 if(st==='Малюк')s.health=Math.max(1,s.health);else s.health=clamp(s.health+h*(ill?-(st==='Старенький'?12:8):2));
 s.dead=s.health<=0;if(s.dead)s.diedAt??=end;
 }
 cursor=end;
 if(cursor===s.born+life.baby&&st==='Малюк')s.sleeping=false;
 if(cursor>=s.born+seniorAt(s)+3*DAY){s.dead=true;s.health=0;s.diedAt??=cursor;}
 }
 s.updated=now;s.napping=stage(s,now)==='Малюк'&&now-s.born>=life.baby-5*MINUTE;
 if(s.dead){s.sleeping=false;s.napping=false;}else{if(s.routine.enabled&&!['Яєчко','Малюк'].includes(stage(s,now)))s.sleeping=routineSleeping(s,now);maybeAdventure(s,now,!s.sleeping&&!s.napping&&stage(s,now)!=='Яєчко');}syncDream(s,now);updateDaily(s,now);updateCozy(s,now);updateLively(s,now);updateJournal(s,now);const moment=roomMoment(s,now);if(moment?.auto&&now-moment.at>5000)markRoomTrace(s,moment.item,now);updateEnrichment(s,now);return s;
}
export const phrases={
 feed:['О, сніданок. Ти мій улюблений персонал.','Дякую, сонечко. Тепер можна й обійняти.','Хрум. Нічого ти так куховариш, людино.','Нарешті їжа, бляха. Іди сюди, обійму.'],
 treat:['Підкуп зараховано. Ти хороша людина.','За таке можеш погладити {touch}.','Оце я розумію — турбота, а не оці твої розмови.','Смачно, зараза. Люблю тебе.'],
 clean:['Дякую. Я тут трохи натворив справ.','Чисто! Ти золотко. Моє особисте золотко.','Прибрав? Молодець. Тепер сиди зі мною.','От халепа. Насрав я, а соромно чомусь тобі.'],
 pet:['{voice}… Ще трохи. Не зазнавайся тільки.','Ти мій улюблений дурко. Чухай далі.','Отак. Бачиш, можеш, коли хочеш.','Люблю тебе, засранця. Не розповідай нікому.'],
 medicine:['Фу. Гірке. Але дякую, що доглядаєш.','Ти мене рятуєш, а я бурчу. Ми гарна команда.','Обійми після ліків входять у вартість?'],
 play:['От бачиш, умієш! Тримай 3 монетки.','Гарно пограли. Тепер їсти й обійматися.','Ми з тобою гроза жуків. +3 монети.','Жук офігів. А ми молодці. +3 монети.'],
 idle:['Іди сюди. Будемо нічого не робити разом.','Ти моє улюблене непорозуміння.','Погладь {touch}. Так, оце твоя робота.','Я грізний. Але можеш взяти на ручки.','Ти поїв? Бо за мною стежиш, а сам як?','Обійняв би тебе. Та лапи короткі.','Я тут головний. Ти головний по обіймах.','Не йди надовго, добре? Я ж бурчу від любові.','Дивлюся на тебе. Нормальна в мене людина.','Я тебе люблю. Все, досить ніжностей.','Бляха, як же добре, коли ти поруч.','Маленький засранець — це я. А ти мій.'],
 hungry:['Погодуй мене, сонечко. Я вже бурчу животом.','Людино, у нас тут миска без їжі. Непорядок.','Я тебе люблю, але вечерю люблю теж.'],
 dirty:['Тут треба трохи прибрати. Я ні на що не натякаю.','У мене лапки. А в тебе — прибиральна місія.','Я тут накоїв. Не сварися, краще допоможи.']};
export function line(key,id='cat',rng=Math.random,age=null){if(typeof id==='function'){rng=id;id='cat';}const p=personality(id),babyPet={chicken:['Пік-пік… Погладь мій м’який пушок, ніжненько.'],frog:['Ква… Погладь легенько по спинці. Хвостик не тягни.'],dog:['Му-у… Погладь по голівці. Ріжки ще виростуть.'],dino:['Р-р… Погладь мою маленьку спинку. Шипи ще попереду.']};const list=key==='pet'?(age==='Малюк'&&babyPet[id]?babyPet[id]:p.pet):(Array.isArray(p[key])?p[key]:phrases[key]||phrases.idle);return list[Math.floor(rng()*list.length)%list.length].replaceAll('{touch}',p.touch).replaceAll('{voice}',p.voice);}
export function babyMeal(id){const food=foodFor(id,'Малюк');return food==='milk'?'Хлюп-хлюп. Молочко! Дякую, моя людино.':food==='fish'?'Пі-пі! Маленькі шматочки рибки для маленького пінгвіна.':food==='grain'?'Пік-пік. Клюю маленькі зернятка. Дякую за кашку!':food==='algae'?'Ква! Маленький пуголовок їсть водорості. Смачно!':'Ам! Маленькі шматочки для маленького динозаврика.';}
export function act(state,action,now=Date.now(),context={}) {
 const s=tick(structuredClone(state),now);
 if(!s)return {error:'Спочатку обери друга.'};
 if(s.dead)return {state:s,error:'Друг уже на веселці. Можна обрати нового.'};
 if(now-s.lastAction<650)return {state:s,error:'Не поспішай, у мене лапки.'};
 if(action==='endLife'){s.health=0;s.dead=true;s.diedAt=now;s.endReason='ended';s.sleeping=false;s.updated=now;s.lastAction=now;return {state:s,text:'Прощавай, людино. У нас були хороші обійми. ♡'};}
 if(s.vacation)return {state:s,error:'Друг у готелі. Обери відпустку, щоб повернути його додому.'};
 if(action==='feed'&&context.food&&!foodsFor(s,stage(s,now)).includes(context.food))return {state:s,error:'Ця їжа не підходить цьому пету та його віку.'};
 if(stage(s,now)==='Яєчко')return {state:s,error:'Тссс. У яйці хтось росте. Поки просто почекай.'};
 if(s.napping)return {state:s,error:'Малюк дрімає перед дорослішанням. Не буди його.'};
 if(s.sleeping&&action!=='sleep')return {state:s,error:'Я сплю. Дай ще п’ять хвилиночок, буркотун.'};
 let text='';
 switch(action){
 case 'feed':if(s.hunger>95)return {state:s,error:'Я вже ситий. Обійняти ще можу, їсти — ні.'};s.hunger=clamp(s.hunger+24);s.clean=clamp(s.clean-4);s.treatStreak=0;s.careScore=clamp(s.careScore+1);text=stage(s,now)==='Малюк'?babyMeal(s.species):line('feed',s.species);break;
 case 'treat':if(s.coins<5)return {state:s,error:'Треба 5 монет. Ходімо заробимо у грі?'};s.coins-=5;s.hunger=clamp(s.hunger+10);s.happy=clamp(s.happy+18);s.treatStreak++;if(s.treatStreak>2){s.health=clamp(s.health-4);s.careScore=clamp(s.careScore-5);s.discipline=clamp(s.discipline-3);}text=stage(s,now)==='Малюк'?babyMeal(s.species):line('treat',s.species);break;
 case 'clean':if(s.living?.enrichment)s.living.enrichment.traces=[];s.careScore=clamp(s.careScore+(s.poop?1:0));s.clean=100;s.poop=0;text=line('clean',s.species);break;
 case 'pet':s.careScore=clamp(s.careScore+(s.happy<70?.5:0));s.happy=clamp(s.happy+(traitOf(s)==='affectionate'?14:9));text=line('pet',s.species,Math.random,stage(s,now));break;
 case 'sleep':s.sleeping=!s.sleeping;text=s.sleeping?'Я в люлю. Посидь поруч, тільки не шаруди.':'Я прокинувся! Де моя людина й мій сніданок?';break;
 case 'discipline':if(s.discipline>90)return {state:s,error:'Я чемний! Можна вже просто обійняти?'};s.discipline=clamp(s.discipline+(traitOf(s)==='stubborn'?12:18));s.careScore=clamp(s.careScore+1);text='Добре-добре, я зрозумів. Але обійняти після виховання треба.';break;
 case 'medicine':if(s.coins<10)return {state:s,error:'Ліки коштують 10 монет. Заробимо у грі.'};s.coins-=10;s.health=clamp(s.health+35);text=line('medicine',s.species);break;
 case 'play':if(s.energy<12)return {state:s,error:'Я втомився, сонечко. Дай поспати.'};s.energy-=8;s.hunger=clamp(s.hunger-4);s.happy=clamp(s.happy+15+(s.room.toy?3:0));s.coins+=3;s.xp+=5;text=context.game==='food'?'Наловили смаколиків! +3 монетки. Ти чудова обслуга.':context.game==='direction'?'Усі напрямки вгадали! +3 монетки, розумники.':context.game==='jump'?'Перестрибнули всі перешкоди! +3 монети й обійми.':line('play',s.species);break;
 default:return {state:s,error:'Не зрозумів, чого ти хочеш. Обіймів?'};
 }
 syncDream(s,now);if(action==='sleep'&&!s.sleeping){const story=wakeStory(s);if(story)text+=' '+story;}
 noteCozy(s,action,now);noteDaily(s,action,now);noteCare(s,action,now,context.food||foodsFor(s,stage(s,now))[0]);if(action==='feed'&&context.food===s.favoriteFood)text+=' Це мій улюблений смак!';recordHabit(s,action,now);s.xp+=1;s.lastAction=now;return {state:s,text};
}
