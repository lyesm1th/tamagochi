import {personality} from './pet-personality.js';
import {stage} from './pet-life.js';
const labels={bed:'ліжечко',ball:'м’ячик',toy:'іграшку',sweater:'светрик',bow:'метелик',scarf:'шарфик',panama:'панамку',rug:'килимок',plant:'рослинку',music:'музичну скриньку',laser:'світлову цятку'};
export function farewellFacts(s){
 const worn=Object.values(s.cozy?.wearing||{}),things=Object.entries(s.cozy?.items||{}).filter(([,v])=>v.uses>0).sort((a,b)=>b[1].uses-a[1].uses);
 const item=things[0]?.[0]||worn[0]||null,friend=(s.social?.friends||[]).filter(f=>f.score>0).sort((a,b)=>b.score-a.score)[0]?.name||null;
 const skills=Object.entries(s.playroom?.skills||{}).filter(([k,v])=>['ball','laser','music'].includes(k)&&v>0).sort((a,b)=>b[1]-a[1]),game=skills[0]?.[0]||null;
 return {item,friend,game,care:(s.memory?.moments||[]).some(m=>m.action==='pet')||!!s.memory?.relationship?.petAt};
}
export function farewell(s,outcome='death'){
 const f=farewellFacts(s),p=personality(s.species),lines=[outcome==='family'?'Моя людино, я залишаю тобі нове маленьке диво.':'Моя людино.'];
 if(outcome==='family')lines.push('У нього ще все попереду. Познайом його з нашим маленьким світом, добре?');
 else lines.push('Дякую за наш маленький світ. За те, що в ньому було місце для мене.');
 if(f.item)lines.push('Пам’ятаєш '+(labels[f.item]||'мою улюблену річ')+'? Залиш собі на згадку. Для тебе це річ, а для мене — шматочок дому.');
 if(f.friend)lines.push('Передай '+f.friend+': я радий, що ми зустрілися. Наші маленькі пригоди я заберу із собою.');
 if(f.game)lines.push('Найкраще було '+({ball:'ганяти з тобою м’ячик',laser:'разом полювати на світлову цятку',music:'слухати нашу музику'}[f.game])+'. Я тоді не думав ні про що. Просто було добре.');
 if(f.care)lines.push('А твої почухування '+p.touch+' — взагалі без конкуренції. Якби можна було, я попросив би ще одне. І ще одне після нього.');
 if(!f.item&&!f.friend&&!f.game)lines.push('Ми не все встигли. Але навіть наші короткі хвилинки були моїми. На якийсь час цей маленький екран став моїм домом.');
 if(stage(s,s.diedAt||Date.now())==='Старенький')lines.push('Останнім часом я рухався повільніше. Але радів тобі так само, як у перший день.');
 lines.push(outcome==='family'?'Я залишаю тут не порожнє місце, а продовження нашої історії. Дякую, що в мене була своя людина.':'Якщо колись згадаєш моє «'+p.voice.toLowerCase()+'», уяви, що я знову вмостився поруч. Не треба нічого казати. Ми й мовчати разом вміли.');
 if(outcome!=='family')lines.push('Не сумуй надто довго, дурко. Дякую, що в мене була своя людина. Твій маленький нахаба.');
 return {text:lines.join('\n\n'),item:f.item,friend:f.friend,game:f.game};
}
export function farewellPlea(s,now=Date.now()){
 const p=personality(s.species),f=farewellFacts(s),age=stage(s,now);
 if(age==='Яєчко')return ['У шкаралупці хтось тихенько ворушиться.','Ваше знайомство ще навіть не почалося. Можна просто почекати.'];
 if(age==='Малюк')return [p.voice+'?.. Почекай. Можна я залишусь?', 'Я ще маленький. Мені тут тепло. Побудь зі мною ще трішки?'];
 const special={cat:'Я ж тут. Можу ще посидіти з тобою? Мені подобається бути твоїм котом.',dog:'Я ще хочу пожити тут. Похрумати сіном, пострибати на ліжку… Тільки тихенько цього разу.',dino:'Я не злякався. Просто… не натискай поки, добре? Я грізний тільки зовні.',penguin:'Я ще хочу поковзати поруч. Мені тут тепліше, ніж на будь-якій крижині.',chicken:'Я ще хочу зустрічати з тобою ранок. І тихенько кудкудакати про свої справи.',duck:'Я ще хочу потупцяти по кімнаті. І розповісти тобі щось своє, качине.'};
 const shared=f.item?'Тут моя улюблена річ — '+(labels[f.item]||'наш маленький скарб')+'. Але найкраще тут — ти.':'Мені так добре мати дім. І свою людину. Мені подобається прокидатися й бачити, що ти прийшов.';
 return [p.voice+'?.. Людино, почекай.',special[s.species]||'Можна я ще залишусь? Я люблю цей маленький світ і наші звичайні дні.',shared,`Погладь ${p.touch}. Давай поки нічого не вирішувати?`];
}
