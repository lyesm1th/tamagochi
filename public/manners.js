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
 if(m.lastTraining&&now-m.lastTraining<2*3600000)return {ok:false,text:'Ми вже сьогодні займалися. Давай закріпимо це у справжньому житті, а не тиснутимемо кнопки.'};
 if(m.day!==day){m.day=day;m.sessions=0;}
 if((m.sessions||0)>=4)return {ok:false,text:'На сьогодні уроків вистачить. Я краще спробую застосувати їх на практиці.'};
 if(s.hunger<35||s.energy<30)return {ok:false,text:'Спочатку дай мені поїсти або відпочити. На голодний живіт уроки не лізуть.'};
 const i=(m.sessions||0)%mannersRules.length,key=mannersRules[i],skill=m.skills[key];
 skill.training=clamp(skill.training+Math.max(3,10*(traitOf(s)==='stubborn'?.85:1))*(1+Math.min(.08,Math.max(0,m.inheritedBonus||0))));
 m.lastTraining=now;m.sessions=(m.sessions||0)+1;s.discipline=disciplineScore(s);
 return {ok:true,text:['Вчуся чемно їсти. Але миска досі підозріла.','Добре, речі не гризти. Навіть дуже гарні.','Спробую відповідати без огризань. Не обіцяю, бляха.','Прибирати за собою? Домовились, спробую.','Чекати складно. Але я потренуюсь.','Навчуся не ображати друзів.'][i]};
}
export function practiceManners(s,key,now=Date.now()){
 const m=ensureManners(s);if(!m.skills[key]||(m.lastPractice[key]&&now-m.lastPractice[key]<30*60000))return false;
 m.skills[key].practice=clamp(m.skills[key].practice+4*(1+Math.min(.08,Math.max(0,m.inheritedBonus||0))));m.lastPractice[key]=now;s.discipline=disciplineScore(s);return true;
}
const rude=[
 'Ти взагалі слухаєш мене, людино? Бо я себе вже задовбав повторювати.',
 'Я сказав НІ. І навіть не думай командувати моїм хвостом.',
 'Не чіпай мене зараз. Я злюся, і лапки теж.',
 'Мені не подобається цей план. Придумай кращий.',
 'Ти ж головний по їжі. Так от, працюй, людино!',
 'А можна без повчань? Мені вже вуха згорнулися.',
 'Сам вирішу, коли прибирати! Але, може, ти й маєш рацію.',
 'Ти сказав «зараз»? У мене своє «зараз», двоноге начальство.',
 'Я не зобов’язаний бути милим кожну хвилину. Р-р-р!',
 'Ні. І не треба робити такі очі. Я все бачу.',
 'Невже знову виховна бесіда? Я ще попередню перетравлюю.',
 'Відчепись на хвилинку. Мені треба побурчати.',
];
const rudeSpicy=[
 'Сука, де моя миска? Я вже все обнюхав!',
 'Пиздець, знову правила. Може, я просто хочу побути динозавром?',
 'Блять, я ж тільки вмостився. Дай хоч лапи скласти!',
];
const polite=[
 'Дякую, що повернувся. Як минув твій день?',
 'Можна трохи уваги, будь ласка?',
 'Я пам’ятаю нашу домовленість. Постараюся.',
 'Ти, мабуть, втомився. Посидимо разом?',
 'Я хотів бешкетувати, але вирішив краще спитати тебе.',
 'Можна погратися після того, як поїмо?',
 'Я радий тебе бачити. Навіть лапи затремтіли.',
 'Перепрошую, це я тут трохи розкидав. Зараз виправлю.',
 'Я не згоден, але можу сказати це чемно.',
 'Сьогодні я стримався. Це було непросто, зате вазон цілий.',
 'Можна я сам оберу гру? Дякую, що питаєш.',
 'Я хочу відпочити. Обійми запропонуй трохи згодом.',
];
const spicy=[
 'Блять, як же добре, що ти вдома.',
 'Пиздець, який я сьогодні молодець. Сам у шоці.',
 'Сука, ця іграшка знову закотилася під ліжко.',
 'Я такий чемний, аж страшно, бляха.',
];
const curiosity=[
 'Людино, а що означає слово «блять»? Я чув, але не впевнений, що його варто повторювати.',
 'А слово «пиздець» означає, що щось зламалося? Я сподіваюся, не наш вазон.',
 'Можна запитати? Чому дорослі кажуть «сука», коли щось падає?',
];
export function speechBalance(s){
 const d=disciplineScore(s);
 const h=s.hunger??100,calm=s.calm??Math.min(s.happy??100,s.energy??100);
 const stressed=h<35||calm<40,stubborn=traitOf(s)==='stubborn';
 // Swearing is deliberately rare, even in a rebellious pet. Rudeness is not
 // necessarily swearing. A very educated pet can still ask about rude words.
 const spicy=d<20?(stressed?.065:.045):d<40?.035:d<65?.023:d<80?.018:.012;
 const rude=d<20?(stressed?.67:stubborn?.57:.51):d<40?(stressed?.46:.36):d<60?(stressed?.24:.16):d<80?(stressed?.07:.035):0;
 return {spicy,rude,curiosity:d>=80?.035:0,polite:d>=80?.54:d>=65?.42:d>=40?.14:0};
}
export function mannersDialogue(s,now=Date.now(),context='idle'){
 if(!s||s.dead||s.sleeping||s.napping)return null;
 const profile=speechBalance(s);
 const seed=(s.id||s.species)+':manners:'+Math.floor(now/90000)+':'+context;
 const roll=stableHash(seed+':tone')%10000/10000;
 const pick=stableHash(seed+':words');
 let threshold=profile.spicy;
 if(roll<threshold){const pool=disciplineScore(s)<40?rudeSpicy:spicy;return pool[pick%pool.length];}
 threshold+=profile.rude;
 if(roll<threshold)return rude[pick%rude.length];
 threshold+=profile.curiosity;
 if(roll<threshold)return curiosity[pick%curiosity.length];
 threshold+=profile.polite;
 if(roll<threshold)return polite[pick%polite.length];
 return null;
}

export function trainingInvitation(s,now=Date.now()){
 if(!s||s.dead||s.vacation||s.sleeping||s.napping)return null;
 const m=ensureManners(s),last=s.daily?.lastMess;
 if(m.lastRequestAt&&now-m.lastRequestAt<12*3600000)return null;
 const afterMistake=last&&now>=last.at&&now-last.at<2*3600000;
 const curious=(stableHash((s.id||s.species)+':learn:'+Math.floor(now/(12*3600000)))%7===0);
 if(!afterMistake&&!curious)return null;
 const rules={food:'food',pot:'belongings',puddle:'tidy',brush:'belongings'};
 const rule=afterMistake?(rules[last.kind]||'tidy'):'requests';
 if(disciplineScore(s)>=97||m.skills[rule]?.training>=100)return null;
 m.lastRequestAt=now;
 return afterMistake?'Слухай... я тут знову наплутав. Може, потренуємо '+({food:'охайне харчування',belongings:'бережливість',tidy:'прибирання'}[rule]||'виховання')+'? Я справді хочу навчитися.':'Можна я попрошу урок чемного спілкування? Цікаво, як чемно сказати «ні».';
}
