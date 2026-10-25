import {emotionLineFor} from './emotion-dialogue.js';
import {emotionOf} from './emotions.js';
import {ambientSlot} from './calm-behavior.js';
import {chooseDialogue} from './pet-dialogue.js';
const thoughtCache=new Map();
import {newPets} from './new-pets.js';
import {stableHash} from './traits.js';
import {weatherAt} from './weather.js';
const mix=n=>{n^=n>>>16;n=Math.imul(n,0x7feb352d);n^=n>>>15;n=Math.imul(n,0x846ca68b);return (n^(n>>>16))>>>0;};
const voices={
 ...Object.fromEntries(Object.entries(newPets).map(([id,p])=>[id,p.songs])),
 dog:['Муу-му-муу… сіно пахне, я росту.','Му-у, му-у… людину вкраду й обійму.','Муу-му… танець маленької корівки!'],
 cat:['Ня-ня-на… ця кімната вже моя.','Мрр-на-на… не чіпай мого хвоста.','Няв-няв… лапки самі танцюють.'],
 chicken:['Ко-ко-ко… зернятко недалеко.','Куд-кудах, ко-ко… обійми мені легко.','Ко-ко! Пір’ячко в ритм, людино!'],
 frog:['Ква-ква-ква… гарна в мене голова.','Ква-а, ква-а… комарика б спіймати.','Ква-ква! Танець мокрих лапок.'],
 corgi:['Гав-гав-на… коротка лапка теж прудка.','Ав-ав-ав… хто мій м’ячик заховав?','Гав! Батон виходить на танцмайданчик.'],
 bear:['Бур-бур-бум… прожену твій сум.','Хрум-та-та… де ягідна смакота?','Туп-туп… підлога, тримайся. Я танцюю.'],
 dino:['Ррр-ра-ра… динозаврику ура.','Р-р-рум… проганяю нудний шум.','Ррр! Це танець. Погром буде пізніше.'],
 bunny:['Пух-пух-па… де морквинка золота?','Шурх-та-та… пухнаста я краса.','Туп-туп! Вуха в ритм не вміщаються.']
};
const thoughts=[
 'А якщо під ліжком живе ще менший я? Треба йому ковдру.',
 'Цікаво, хто гладить людину, коли мене немає поруч?',
 'Маю важливу думку. Забув. Значить, не така вже важлива.',
 'Коробка — це кімната в кімнаті. Я багатий на нерухомість.',
 'Якщо лягти впоперек, справи не зможуть пройти повз мене.',
 'Я сьогодні нічого не зламав. Пишаюся. День ще не скінчився.',
 'Людино, у тебе лапки дивні. Але чухають добре.',
 'Думаю про вечерю. Це серйозна розумова робота.',
 'Якщо я закрию очі, прибирання мене не знайде.',
 'Не байдикую. Створюю атмосферу затишку.',
 'Іноді треба просто посидіти. Бажано на комусь теплому.',
 'Мій хвостик має свої плани. Я за нього не відповідаю.',
 'А можна завести домашню хмаринку? Я б її не їв. Мабуть.',
 'Якщо тебе обійняти міцніше, ти станеш добрішим чи квадратним?',
 'Я вирішив бути слухняним. Потім вирішу, коли почати.',
 'Тут усе пахне домом. Навіть твій дивний смак у меблях.',
 'Сьогодні красивий день. І я. Вдале поєднання.',
 'Коли виросту, буду таким самим. Тільки з більшими вимогами.',
 'Вчора я був молодший. А смаколиків вимагав так само.',
 'Ми з тобою непогана банда. Ти годуєш, я контролюю якість.',
 'Найкращий план на вечір — без плану, але з тобою.',
 'Кажуть, скарби треба закопувати. А обійми теж?',
 'Тиша — це коли я ще не придумав нову витівку.',
 'Я маленький. А любові в мене під зав’язку.'
];
export function chatter(s,now=Date.now()){
 if(!s||s.dead||s.sleeping||s.napping||s.vacation||now-s.born<180000||s.journal?.together||s.cozy?.hide?.expires>now||s.world?.walk?.expires>now||Math.min(s.hunger??0,s.health??0,s.energy??0)<50||(s.happy??0)<40||weatherAt(now).id==='storm')return null;
 const slot=ambientSlot(s,now);if(slot?.lane!=='chatter')return null;const block=slot.block,phase=now-slot.at;
 const seed=stableHash((s.id||s.species)+':chatter:'+block),wordSeed=mix(stableHash((s.id||s.species)+':words:'+block)),kind=['hum','dance','thought'][seed%3],voice=voices[s.species]||voices.cat;
 const key=(s.id||s.species)+':'+slot.id;if(kind==='thought'&&!thoughtCache.has(key)){thoughtCache.set(key,wordSeed%2?chooseDialogue(s,slot.at):thoughts[wordSeed%thoughts.length]);if(thoughtCache.size>128)thoughtCache.delete(thoughtCache.keys().next().value);}let text=kind==='thought'?thoughtCache.get(key):voice[wordSeed%voice.length];
 if(kind==='thought'&&seed%5===0&&s.social?.friends?.[0])text='Цікаво, що зараз робить '+s.social.friends[0].name+'? Потім зустрінемось на майданчику.';
 if(kind==='thought'&&seed%7===0&&s.journal?.drawings?.length)text='Мій малюнок треба повісити рівніше. Хоча ні. Це авторський нахил.';
 const emotion=emotionOf(s,now),emotionalText=emotionLineFor(s,emotion);if(emotionalText){text=emotionalText;return {id:block+':emotion',kind:'thought',text,item:'front',progress:slot.progress,tune:0};}
 return {id:block+':'+kind,kind,text,item:'front',progress:slot.progress,tune:seed%3};
}
export const chatterVoiceCount=Object.keys(voices).length;
