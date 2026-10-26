import {stableHash,traitOf} from './traits.js';
const clamp=n=>Math.max(0,Math.min(100,n));
export const mannersRules=['food','belongings','requests','tidy','patience','friends'];
export function ensureManners(s){
 s.manners??={}; const m=s.manners;
 m.skills??=Object.fromEntries(mannersRules.map(k=>[k,{training:clamp(s.discipline??70),practice:clamp(s.discipline??70)}]));
 for(const k of mannersRules)m.skills[k]??={training:clamp(s.discipline??70),practice:clamp(s.discipline??70)};
 m.lastTraining??=0; m.lastDaily??=0; m.lastPractice??={};m.mannersTalk??=0;
 return m;
}
export function disciplineScore(s){const m=s.manners;if(!m?.skills)return clamp(s.discipline??70);return clamp(mannersRules.reduce((n,k)=>{const t=m.skills[k]||{};return n+.4*clamp(t.training??0)+.6*clamp(t.practice??0);},0)/mannersRules.length);}
export function trainManners(s,now=Date.now()){
 const m=ensureManners(s),day=Math.floor(now/86400000);
 if(now-m.lastTraining<2*3600000)return {ok:false,text:'Ми вже сьогодні займалися. Давай закріпимо це у справжньому житті, а не тиснутимемо кнопки.'};
 if(m.day!==day){m.day=day;m.sessions=0;}
 if((m.sessions||0)>=4)return {ok:false,text:'На сьогодні уроків вистачить. Я краще спробую застосувати їх на практиці.'};
 if(s.hunger<35||s.energy<30)return {ok:false,text:'Спочатку дай мені поїсти або відпочити. На голодний живіт уроки не лізуть.'};
 const i=(m.sessions||0)%mannersRules.length,key=mannersRules[i],skill=m.skills[key];
 skill.training=clamp(skill.training+Math.max(3,Math.round(10*(traitOf(s)==='stubborn'?.85:1))));
 m.lastTraining=now;m.sessions=(m.sessions||0)+1;s.discipline=disciplineScore(s);
 return {ok:true,text:['Вчуся чемно їсти. Але миска досі підозріла.','Добре, речі не гризти. Навіть дуже гарні.','Спробую відповідати без огризань. Не обіцяю, бляха.','Прибирати за собою? Домовились, спробую.','Чекати складно. Але я потренуюсь.','Навчуся не ображати друзів.'][i]};
}
export function practiceManners(s,key,now=Date.now()){
 const m=ensureManners(s);if(!m.skills[key]||now-(m.lastPractice[key]||0)<30*60000)return false;
 m.skills[key].practice=clamp(m.skills[key].practice+4);m.lastPractice[key]=now;s.discipline=disciplineScore(s);return true;
}
const rude=['Ти взагалі слухаєш мене, людино? Бо я себе вже задовбав повторювати.','Я сказав НІ. І навіть не думай командувати моїм хвостом.','Сука, де моя миска? Я тут уже всю підлогу обнюхав.','Пиздець, знову правила. Може, я просто хочу побути динозавром?','Не чіпай мене зараз. Я злюся, і лапки теж.','Мені не подобається цей план. Придумай кращий.','Ти ж головний по їжі. Так от, працюй, людино!','А можна без повчань? Мені вже вуха згорнулися.'];
const polite=['Дякую, що повернувся. Як минув твій день?','Можна трохи уваги, будь ласка?','Я пам’ятаю нашу домовленість. Постараюся.','Ти, мабуть, втомився. Посидимо разом?','Я хотів бешкетувати, але вирішив краще спитати тебе.','Можна погратися після того, як поїмо?','Я радий тебе бачити. Навіть лапи затремтіли.','Перепрошую, це я тут трохи розкидав. Зараз виправлю.'];
const spicy=['Блять, як же добре, що ти вдома.','Пиздець, який я сьогодні молодець. Сам у шоці.','Сука, ця іграшка знову закотилася під ліжко.','Я такий чемний, аж страшно, бляха.'];
const curiosity=['Людино, а що означає слово «блять»? Я чув, але не впевнений, що його варто повторювати.','А слово «пиздець» означає, що щось зламалося? Я сподіваюся, не наш вазон.','Можна запитати? Чому дорослі кажуть «сука», коли щось падає?'];
export function mannersDialogue(s,now=Date.now(),context='idle'){
 if(!s||s.dead||s.sleeping||s.napping)return null;
 const d=disciplineScore(s),h=s.hunger??100,calm=s.calm??Math.min(s.happy??100,s.energy??100),trait=traitOf(s);
 const slot=Math.floor(now/90000),seed=stableHash((s.id||s.species)+':manners:'+slot+':'+context),roll=seed%100;
 if(d<20&&(h<45||calm<45||trait==='stubborn')){if(roll<76)return rude[seed%rude.length];}
 else if(d<40&&roll<46)return rude[seed%rude.length];
 if(d>=80&&roll<5)return curiosity[seed%curiosity.length];
 if(d>=65&&roll<57)return polite[seed%polite.length];
 if(d>=40&&roll<3)return spicy[seed%spicy.length];
 if(d<40&&roll<9)return spicy[seed%spicy.length];
 return null;
}
