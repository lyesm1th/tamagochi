import {interactionPreferences} from './interaction-preferences.js';
import {disciplineScore} from './manners.js';
import {traitOf,stableHash} from './traits.js';

// Reactions to direct actions are contextual, not always grateful. Pure and stable
// within a time window; does not overwrite actual game rewards or saved stats.
const pools={
 pet:{
  warm:['О, твої руки! Ще трохи, будь ласка.','Мур-р. Мій день став значно кращим.','Я тут для обіймів. А ти для мене.','Ще почухай за вушком. Отут!','Ти повернувся? Іди сюди, моя людино.','Так тепло. Можна зупинити час?'],
  rude:['Ну і що це за раптові обійми? Спочатку спитай!','Я не плюшева подушка! ...Але можеш ще раз.','Лапи прибери. Я тут серйозні справи думаю.','Не зараз, людино. Я маю право побурчати.','Ти знову мене тискаєш? Я взагалі-то хижак!','Я сам прийду за ласкою. Коли захочу.'],
  hungry:['Почухав? Тепер, може, поїмо? Живіт уже протестує.','Люблю тебе, але миску люблю прямо зараз сильніше.','Обійми на голодний шлунок? Це якась підстава.','Можна спочатку їжу? Я тоді стану ніжніший.'],
  upset:['Не чіпай. Я сьогодні на нервах.','Мені треба хвилина тиші. А потім поговоримо.','Я тебе бачу, але зараз хочу побути сам.','Сядь поруч. Без обіймів поки що, добре?'],
  playful:['Лови хвіст! Ні, не той. Ха-ха!','Тільки якщо потім пограємося. Домовились?','Обережно, я можу залоскотати у відповідь!'],
 },
 play:{
  warm:['Оце ми дали! Ще раз якось повторимо.','Було весело. Я аж лапами затупотів!','Ти класно граєшся. Я це визнаю.','Мені подобається грати з тобою, навіть коли програю.'],
  rude:['Грав непогано. Але я, звісно, краще.','Міг би й швидше! У мене лапи сверблять грати.','Пощастило тобі. Я просто піддався.','Ну нарешті! Наступний раунд мій.'],
  hungry:['Гарна гра. А призом буде вечеря, так?','Я виграв. Де мій перекус?','Бігати на голодний шлунок? Людино, серйозно?'],
  upset:['Мені зараз не дуже весело. Давай тихішу гру.','Сьогодні нервуюся, але стараюсь грати чесно.','У мене настрій бурчати. Це теж вид спорту?'],
  playful:['Ще! Ще! Я не втомився... майже.','Ха! Бачив цей стрибок? Я чемпіон.','Наступного разу я вигадаю власні правила!'],
 },
 room:{
  warm:['О, я люблю цю штуку. Дякую, що показав!','Давай разом. Самому не так цікаво.','Мені тут затишно. І ти поруч.','Обережно торкнуся лапкою. Ось так!'],
  rude:['Не командуй, як мені цим користуватися!','Я сам розберуся. Майже. Не підглядай!','Р-р, у мене на цю річ власні плани.','Ну і навіщо ти мене сюди привів?'],
  hungry:['Це чудова річ. А вона їстівна?','Іграшка потім. Миска зараз.','Якщо тут немає їжі, я офіційно протестую.'],
  upset:['Сьогодні мене навіть улюблена іграшка дратує.','Не хочу зараз чіпати це. Просто посидь поруч.','Давай тихіше. Я сьогодні трохи розгубився.'],
  playful:['Зараз покажу фокус! Тільки не лякайся.','Ха, воно рухається! Зловлю!','Можна ще раз? Ну будь ласочка!'],
 },
};
const roomNotes={
 bed:['На ліжку моє місце. Твоє десь поруч.','Ковдру не чіпай, я її так гарно вмостив.'],
 mirror:['Дивись, яка поважна морда. Майже не впізнав!','Дзеркало погоджується, що я красунчик.'],
 ball:['М’яч! Втікай, поки я тебе не впіймав!','Цей м’яч підозріло круглий. Доведеться ганяти.'],
 bowl:['Миску бачу. Питання одне: де їжа?','Це мій священний круглий трон для вечері.'],
 toy:['У мене є план. Іграшка, ти попалася!','Обережно, тут розгортається велика пригода.'],
 plant:['Не чіпатиму вазон. Ну... поки що.','Це рослина? А чому вона не грається?'],
};
export function interactionMood(s){
 const education=disciplineScore(s);
 const hungry=(s.hunger??100)<36;
 const uneasy=(s.calm??Math.min(s.happy??100,s.energy??100))<37||(s.happy??100)<30;
 const trait=traitOf(s);
 return {education,hungry,uneasy,trait};
}
export function interactionDialogue(s,action,now=Date.now(),detail=''){
 if(!s||s.dead||s.sleeping||s.napping||s.vacation)return null;
 const kind=action==='pet'?'pet':action==='play'?'play':'room';
 const pool=pools[kind],m=interactionMood(s),preferences=interactionPreferences(s);
 const slot=Math.floor(now/13000);
 const seed=stableHash((s.id||s.species)+':interaction:'+kind+':'+detail+':'+slot);
 const roll=stableHash(seed+':mood')%1000/1000;
 let tone='warm';
 const affinity=kind==='pet'?preferences.touch:kind==='play'?preferences.play:preferences.quiet;
 const resistance=(50-affinity)/500;
 if(m.hungry&&roll<Math.max(.45,.72+resistance))tone='hungry';
 else if(m.uneasy&&roll<Math.max(.43,.68+resistance))tone='upset';
 else if(m.education<35&&roll<Math.max(.30,.68+resistance))tone='rude';
 else if(m.education<65&&roll<.30)tone='rude';
 else if(m.trait==='stubborn'&&roll<.19)tone='rude';
 else if(m.trait==='playful'&&roll<.25)tone='playful';
 let choices=pool[tone];
 // Familiar items add flavor without forcing a constantly sweet response.
 if(kind==='room'&&tone==='warm'&&roomNotes[detail])choices=[...choices,...roomNotes[detail]];
 return choices[stableHash(seed+':pick')%choices.length];
}
