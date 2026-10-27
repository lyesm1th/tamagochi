import {feel,characterOf,emotionOf} from './emotions.js';
import {chooseDialogue} from './pet-dialogue.js';
import {rememberThing,thingMemory,withQuietBody,bedtimeInvitation} from './relationship-life.js';
import {ambientSlot,noteCalm} from './calm-behavior.js';
import {moodOf} from './room-enrichment.js';
import {stableHash} from './traits.js';
import {roomExperienceChoice,roomHabitOf} from './room-experience.js';
import {disciplineScore} from './manners.js';
import {behaviorMemoryEffect} from './behavior-memory.js';
export function roomFurniture(s){const n=s?.playroom?.decor?.layout||0;return n===1?{bed:126,bowl:18,plant:12,tent:20,shelf:87}:n===2?{bed:70,bowl:16,plant:170,tent:132,shelf:7}:{bed:8,bowl:156,plant:170,tent:124,shelf:82};}
// Coordinates in the 192×144 logical room; detailed assets are drawn at 2×.
export function roomRects(s,style='classic'){const p=roomFurniture(s);if(style==='detailed')return {box:[32.5,126,24,14.5],bed:[p.bed,66,56,44],bowl:[p.bowl,108.5,26,14],plant:[p.bed===126?95:p.plant-6,50,25,44],rug:[56,116.5,79,18],shelf:[p.shelf,12,42,29],lamp:[p.bed===70?31:66,45.5,19,45.5],tent:[p.tent,45.5,40,48],cushion:[72.5,111.5,26,14],fountain:[p.bowl===18?42.5:133,104.5,25.5,22.5],mirror:[145.5,7.5,21,35],post:[4.5,96.5,23.5,36.5],curtains:[9,4.5,58.5,55],toybox:[149,126.5,35.5,15.5],toy:[132,126.5,14,14],music:[151,104,26,19],laser:[131,118,17,13],window:[13.5,8.5,51.5,49]};return {box:[4,121,25,17],bed:[p.bed,68,52,41],bowl:[p.bowl,114,26,14],plant:[p.plant-8,49,28,42],rug:[59,121,76,17],shelf:[p.shelf,17,42,24],lamp:[170,71,18,33],tent:[p.tent,43,40,50],cushion:[38,108,25,13],fountain:[p.bowl,106,26,20],mirror:[145,9,20,32],post:[5,97,24,35],curtains:[9,7,52,44],toybox:[149,126,35,16],toy:[133,124,12,12],music:[151,104,26,19],laser:[131,118,17,13],window:[14,8,43,43]};}
export function roomOwned(s,id){return !s?.cozy?.stored?.[id]&&(id==='window'||id==='box'&&s?.room?.box!==false||s?.room?.[id]||s?.cozy?.owned?.[id]||s?.playroom?.toys?.[id]||id==='toy'&&s?.playroom?.toys?.ball);}
export function roomHit(s,x,y,style='classic'){if(!Number.isFinite(x)||!Number.isFinite(y))return null;const rects=roomRects(s,style);for(const id of ['laser','music','toy','toybox','bowl','fountain','cushion','post','box','lamp','plant','bed','tent','mirror','shelf','curtains','window','rug']){if(!roomOwned(s,id))continue;const [a,b,w,h]=rects[id];if(x>=a-2&&x<=a+w+2&&y>=b-2&&y<=b+h+2)return id;}return null;}
export const itemMoves={bed:'jump',mirror:'faces',plant:'sniff',bowl:'drink',fountain:'splash',rug:'roll',shelf:'read',lamp:'shadow',tent:'peek',cushion:'nest',post:'stretch',curtains:'peek',toybox:'search',box:'peek',toy:'play',ball:'play',laser:'play',music:'dance',window:'watch'};
const clothIds=new Set(['panama','raincoat','pajamas','crown','scarf','bow','glasses','sweater']);
export function roomTaste(s,id){const affinity=s.cozy?.items?.[id]?.affinity||0,p=s.cozy?.preferences?.[clothIds.has(id)?'cloth':'object'];return affinity>=4?'love':affinity<=-4?'annoy':p?.love===id?'love':p?.annoy===id?'annoy':'neutral';}
const reactions={bed:['Пружинки, тримайтеся!','Ще один стрибочок. Останній. Брехня.','Це моє пружне королівство!'],mirror:['Ого. Оце красуня в дзеркалі!','Покажи язика. Та не ти, я собі!','Грізна морда. Майже.'],plant:['Нюх-нюх. Ростеш? Я теж стараюся.','Листочок, не лоскочи носа.','Зелений сусід, як справи?'],bowl:['Перевіряю миску. Раптом там добавка.','Хлюп. Я дуже акуратно. Майже.'],shelf:['Читаю. Догори дриґом теж цікаво.','Тут книжка про мене? А мала б бути.'],lamp:['Тінь! Стій, я тебе впіймаю!','Це моя тінь. Вона теж красунчик.'],rug:['Килимок пройшов перевірку пузом.','Перекочуюсь. Це зарядка.'],tent:['Ку-ку! Людині вхід за обійми.','Моя хатинка. Стукати лапкою.'],cushion:['Мну подушку. Робота серйозна.','Ось тут буде моє гніздечко.'],fountain:['Плюсь! Це фонтан, а не душ?','Мокрі лапки — щасливі лапки.'],post:['Тя-ягнусь. Ого, який я довгий.','Лапки теж потребують розминки.'],toybox:['Ага! Ось де ховалася іграшка.','Шукаю скарб. Безлад не чіпай.'],curtains:['Ку-ку. Тепер мене видно?','Я фіранка. Дуже мила фіранка.'],box:['Фортеця ще стоїть. Я перевірив.','Ку-ку з моєї нерухомості!'],music:['Музика! Мої лапки вже танцюють.','Ще одну пісню, я майже вивчив рухи!'],laser:['Червона цятка! Стій, я тебе впіймаю!','Вона знову втекла. Це особисте.']};
// Temperament adds occasional object-specific lines, without extra idle speech.
const temperamentLines={
 playful:{toy:['Це мій м’яч! Я вже придумав сім трюків.','Ще разок? У мене лапи самі бігають!'],laser:['Ха! Цятка думає, що втече від мене!'],music:['Танцюю, як умію. Сусідам співчуваю!'],rug:['Перекочуюсь! Оце тренування для чемпіона.']},
 curious:{shelf:['А що буде, якщо прочитати з кінця?','Тут стільки історій, а я ще не всі дослідив.'],plant:['Цікаво, а листя теж хоче обіймів?'],mirror:['А чому ти рухаєшся точнісінько як я?'],toybox:['Тут точно є щось новеньке. Дай пошукаю!']},
 stubborn:{bed:['Нікуди не піду. Це моє законне ліжечко.'],mirror:['Я й так прекрасний. Але перевірю ще раз.'],toybox:['Мої скарби. Перепис майна не дозволяю.']},
 affectionate:{bed:['Тут м’яко. А з тобою було б іще краще.'],cushion:['Посидь поруч. Подушку ділимо навпіл.'],tent:['Тут місце для двох. Іди до мене.']}
};
export function roomCharacterLine(s,id,now=Date.now()){
 if(!s)return null;
 const c=characterOf(s);
 const lanes=[['playful',c.playfulness],['curious',c.curiosity],['stubborn',c.stubbornness],['affectionate',c.affection]]
   .filter(([lane,score])=>score>=75&&temperamentLines[lane][id]);
 if(!lanes.length)return null;
 lanes.sort((a,b)=>b[1]-a[1]);
 const pool=temperamentLines[lanes[0][0]][id];
 return pool[stableHash((s.id||s.species)+':room-line:'+id+':'+Math.floor(now/2300))%pool.length];
}
// Species-specific gestures and language use the same existing room interaction cadence.
const speciesRoomLines={
 chicken:{rug:'Ко-ко! Пір’ячко після перекиду треба пригладити.',bowl:'Клю-клю. Миска пройшла курячу інспекцію.'},
 cat:{mirror:'Няв. Дзеркало підтвердило мою велич.',toy:'Мур. Іграшка рухається, отже вона моя здобич.'},
 corgi:{toy:'Гав! Короткі лапки, великі спортивні амбіції.',rug:'Батон перекотився. Батон задоволений.'},
 frog:{fountain:'Ква! Нарешті водичка, а не сухі балачки.',plant:'Ква-ква, зелений друже, ми майже родичі.'},
 bear:{cushion:'Бур. Це не подушка, це ведмежа хмара.',bed:'Буркотун офіційно оголосив час обіймів.'},
 dog:{bowl:'Муу! Перевірка мисочки завершена.',rug:'Копитця на килимку. Танцювати чи полежати?'},
 dino:{plant:'Р-р. Маленькі джунглі, велика експедиція.',toy:'Р-р! Здобич упіймано, лапки цілі.'},
 bunny:{plant:'Фир-фир. Вушка почули, як росте листочок.',rug:'Стриб-стриб. Це моя тренувальна галявинка.'},
 pig:{rug:'Хрю! П’ятачок шукає скарби під килимком.',bowl:'Хрум! А раптом там яблучко залишилося?'},
 sheep:{cushion:'Бе-е. Подушка тепер пухнаста майже як я.',rug:'Моя вовна й килимок сьогодні змагаються у м’якості.'},
 fox:{toy:'Тяф! Іграшка не знала, що я підкрадаюся.',mirror:'Хвіст і хитрість на місці. Дзеркало не бреше.'},
 monkey:{shelf:'У-а! Поличка, тримайся, я досліджую!',toybox:'У-у-а! Знайшов скарб. Банан не знайшов.'},
 duck:{fountain:'Кря! Калюжа домашня, а радість справжня.',bowl:'Кря-кря. Дзьобик перевірив рівень води.'},
 penguin:{rug:'Пі! Ковзаю пузиком, уявімо, що це крижина.',fountain:'Плюх! Морська експедиція у власній кімнаті.'}
};
export function roomSpeciesLine(s,id){
 return speciesRoomLines[s?.species]?.[id]||null;
}
// One extra line in an existing interaction can acknowledge a pet's learned ritual.
const habitLines={
 toy:'Цю іграшку я знаю напам’ять. Але все одно цікаво!',
 laser:'Мій фірмовий двобій із цяткою. Реванш!',
 music:'Мої лапки вже пам’ятають цей танець.',
 toybox:'Тут я завжди знаходжу щось цікаве.',
 rug:'Це моя особлива ділянка килимка.',
 bed:'У мене тут перевірене місце для дрімоти.',
 cushion:'Моя подушка знає всі мої секрети.',
 tent:'Моя маленька фортеця затишку.',
 mirror:'Дзеркало, ми з тобою вже давні знайомі.',
 plant:'Знову перевіряю зеленого сусіда.',
 shelf:'Моя улюблена поличка з історіями.',
 fountain:'Час перевірити моє улюблене джерельце.'
};
export function roomHabitLine(s,id){
 const habit=roomHabitOf(s);
 if(!habit||habit.item!==id||roomTaste(s,id)==='annoy')return null;
 return habitLines[id]||'Я тут уже стільки разів був. Це мій ритуал.';
}
// Temperament and education can color an existing interaction, never trigger new speech.
export function roomMannersLine(s,id){
 if(!s||roomTaste(s,id)==='annoy')return null;
 const score=disciplineScore(s),c=characterOf(s),memory=behaviorMemoryEffect(s,'tidy');
 if(score>=80&&memory>=0&&['rug','shelf','cushion','plant'].includes(id))
  return id==='rug'?'Після розваг я тут приберу. Обіцяю!':id==='shelf'?'Книжки поверну на місце. Я пам’ятаю.':id==='plant'?'Листочків не чіпатиму без дозволу.':'Можна тихенько тут посидіти, будь ласка?';
 if(score<35&&c.stubbornness>=55&&['toy','toybox','rug'].includes(id))
  return 'Я тут сам розберуся! Але потім усе-таки приберу.';
 return null;
}
export function roomLine(s,id,event='use',now=Date.now()){const taste=roomTaste(s,id),n=stableHash((s.id||s.species)+id+Math.floor(now/2300));if(event==='wear'||event==='new'){const pool=taste==='love'?['О! Це тепер моє улюблене. Не забирай.','Підходить. Обійняти покупку можна?']:taste==='annoy'?['Хм. Дивна штука. Дай мені звикнути.','Спершу огляну. Я ще не погодився.']:['Придивлюся. Може, й подружимось.','Ого, обновка! Зараз перевірю.'];return pool[n%pool.length];}if(n%5===0){const memory=thingMemory(s,id,now);if(memory)return memory;}if(n%4===0)return chooseDialogue(s,now,'room');if(event==='use'&&n%3===0){const characterLine=roomCharacterLine(s,id,now);if(characterLine)return characterLine;}if(event==='use'&&n%7===1){const speciesLine=roomSpeciesLine(s,id);if(speciesLine)return speciesLine;}if(event==='use'&&n%9===2){const habitLine=roomHabitLine(s,id);if(habitLine)return habitLine;}if(event==='use'&&n%11===3){const mannersLine=roomMannersLine(s,id);if(mannersLine)return mannersLine;}const pool=reactions[id]||['Лапки зайняті важливими справами.','Перевіряю. Все моє — все цікаве.'];return pool[n%pool.length];}
export function noteRoomReaction(s,id,event='new',now=Date.now()){if(event==='repair')feel(s,'grateful','Улюблену річ полагоджено',now);else if(event==='new'||event==='wear')feel(s,roomTaste(s,id)==='annoy'?'annoyed':characterOf(s).curiosity>60?'curious':'surprised','Оглядаю обновку',now,.6,45000);if(['new','repair'].includes(event))rememberThing(s,id,event,now);noteCalm(s,now);s.living??={};s.living.motion=null;if(s.living.enrichment){s.living.enrichment.tidying=null;s.living.enrichment.home=null;s.living.enrichment.touch=null;s.living.enrichment.session=null;}if(s.journal)s.journal.gesture=null;s.living.reaction={item:id,kind:clothIds.has(id)?'outfit':itemMoves[id]||'inspect',event,at:now,until:now+9000,taste:roomTaste(s,id)};}
export function directRoomAction(id){return id==='bed'?'jump':'use';}
export function roomNeedPriority(s,items){if((s.energy??100)<65&&items.includes('bed'))return 'bed';if((s.hunger??100)<65&&items.includes('bowl'))return 'bowl';if((s.hunger??100)<65&&items.includes('fountain'))return 'fountain';return null;}
// Continue a quiet room moment with one related activity, without another timer or persisted state.
const roomFollowUps={
 toy:['rug','cushion'],laser:['rug','cushion'],music:['mirror','cushion'],
 shelf:['plant','cushion'],plant:['mirror','cushion'],mirror:['toy','cushion'],
 tent:['toy','cushion'],toybox:['toy','rug'],lamp:['mirror','cushion'],
 post:['rug','cushion'],rug:['toy','cushion']
};
export function roomSequenceStep(s,items,first,slot,now){
 if(!slot||!Number.isFinite(slot.at)||!Number.isFinite(slot.until)||slot.until-slot.at<12000)return null;
 const halfway=slot.at+Math.floor((slot.until-slot.at)/2);
 if(now<halfway||now>=slot.until)return null;
 const candidates=roomFollowUps[first]||[];
 const {playfulness,curiosity}=characterOf(s);
 const order=playfulness>=curiosity?candidates:[...candidates].reverse();
 // A favorite activity should not be cut short for a neutral one.
 const favorite=roomTaste(s,first)==='love';
 const allowed=id=>id!==first&&items.includes(id)&&roomTaste(s,id)!=='annoy'&&(!favorite||roomTaste(s,id)==='love');
 // A practiced ritual can guide the second action, but never outrank an explicit favorite.
 const habit=roomHabitOf(s,order.filter(allowed));
 const next=habit?.item&&allowed(habit.item)?habit.item:order.find(allowed);
 return next?{item:next,at:halfway,originItem:first}:null;
}
// A soft, species-specific preference when there is no urgent need or loved object.
const speciesRoomChoices={
 chicken:['rug','bowl'],cat:['toy','mirror'],corgi:['toy','rug'],
 frog:['fountain','plant'],bear:['cushion','bed'],dog:['bowl','rug'],
 dino:['plant','toy'],bunny:['plant','rug'],pig:['rug','bowl'],
 sheep:['cushion','rug'],fox:['toy','mirror'],monkey:['shelf','toybox'],
 duck:['fountain','bowl'],penguin:['rug','fountain']
};
export function roomSpeciesPreference(s,items,block=0){
 const choices=speciesRoomChoices[s?.species]||[];
 const available=choices.filter(id=>items.includes(id)&&roomTaste(s,id)!=='annoy');
 if(!available.length)return null;
 // Species preference is occasional, rather than overriding diverse room exploration.
 if(block%3!==0)return null;
 return available[stableHash((s.id||s.species)+':species-room:'+block)%available.length];
}
// An occasional mood-led choice within the existing quiet slot, never an extra action.
// Modulo 5 avoids locking mood choices out of the modulo-4 ambient room lane.
export function roomMoodPreference(s,items,block=0,now=Date.now()){
 if(!s||!Array.isArray(items)||!Number.isFinite(block)||block%5!==1)return null;
 const mood=moodOf(s),emotion=emotionOf(s,now).kind,character=characterOf(s);
 let state,options;
 if((s.energy??100)<65){
  state='tired';options=['bed','cushion','tent','rug'];
 }else if(mood==='sulky'||(s.happy??100)<55||['sad','hurt','anxious'].includes(emotion)){
  state='comfort';options=character.affection>=character.independence?['cushion','bed','tent','rug']:['tent','cushion','rug','bed'];
 }else if(mood==='springy'||['amused','curious'].includes(emotion)){
  state='play';options=character.playfulness>=character.curiosity?['toy','laser','music','rug','toybox']:['toybox','laser','toy','music','rug'];
 }else return null;
 const available=options.filter(id=>items.includes(id)&&roomTaste(s,id)!=='annoy');
 if(!available.length)return null;
 const item=available[stableHash((s.id||s.species)+':room-mood:'+state+':'+block)%available.length];
 return {item,kind:state==='play'?itemMoves[item]:item==='bed'?'doze':'nest',mood:state};
}
// Living Pets 4.0: learned manners and previous repaired/defiant moments steer
// the style of autonomous play without creating new timers or persisted fields.
export function roomBehaviorChoice(s,items,block=0){
 if(!s||!Array.isArray(items)||!Number.isInteger(block)||block%11!==3)return null;
 const available=items.filter(id=>roomTaste(s,id)!=='annoy');
 if(!available.length)return null;
 const c=characterOf(s),discipline=disciplineScore(s);
 const tidyPractice=behaviorMemoryEffect(s,'tidy');
 const requestsPractice=behaviorMemoryEffect(s,'requests');
 const polite=discipline>=75&&tidyPractice>=0&&requestsPractice>=0;
 const restless=discipline<40&&c.playfulness>=50&&requestsPractice<=0;
 const options=polite?['shelf','plant','cushion','rug']:restless?['toybox','toy','laser','rug']:null;
 if(!options)return null;
 const candidates=options.filter(id=>available.includes(id));
 if(!candidates.length)return null;
 return {item:candidates[stableHash((s.id||s.species)+':behavior:'+block)%candidates.length],style:polite?'careful':'restless'};
}
export function roomMoment(s,now=Date.now()){
 if(!s||s.dead||s.vacation||s.sleeping||s.napping||s.living?.enrichment?.session?.until>now||s.living?.enrichment?.touch?.until>now||s.living?.enrichment?.home?.until>now||s.living?.enrichment?.tidying?.until>now||now-s.born<180000||s.world?.walk?.expires>now||s.cozy?.hide?.expires>now||s.playroom?.session?.expires>now||s.journal?.gesture?.until>now)return null;
 const m=s.living?.motion;if(m?.until>now&&roomOwned(s,m.item))return {...m,kind:m.kind==='use'?itemMoves[m.item]||'inspect':m.kind,manual:true};
 const r=s.living?.reaction;if(r?.until>now&&(clothIds.has(r.item)||roomOwned(s,r.item)))return {...r,manual:true};
 if(s.lively?.welcome?.until>now)return null;
 if(Math.min(s.hunger??100,s.health??100,s.energy??100)<35||s.cozy?.peace?.tension>0)return null;
 const slot=ambientSlot(s,now);if(slot?.lane!=='room')return null;if(bedtimeInvitation(s,now)&&roomOwned(s,'bed'))return {item:'bed',kind:'ask',at:slot.at,until:slot.until,auto:true,origin:{x:96,feet:130}};const phase=now-slot.at,clock=slot.block*37000;
 const items=Object.keys(itemMoves).filter(id=>id!=='window'&&id!=='box'&&roomOwned(s,id)&&(s.cozy?.items?.[id]?.wear??100)>0);if(!items.length)return null;
 const priority=roomNeedPriority(s,items);
 const loved=items.filter(id=>roomTaste(s,id)==='love'),likedOrNeutral=items.filter(id=>roomTaste(s,id)!=='annoy'),normalPool=likedOrNeutral.length?likedOrNeutral:items,pool=loved.length&&Math.floor(clock/37000)%3!==0?loved:normalPool,moodChoice=loved.length||priority?null:roomMoodPreference(s,items,slot.block,now),speciesChoice=loved.length||moodChoice?null:roomSpeciesPreference(s,items,slot.block),behaviorChoice=loved.length||priority||moodChoice||speciesChoice?null:roomBehaviorChoice(s,items,slot.block),learnedChoice=loved.length||priority||moodChoice||speciesChoice||behaviorChoice?null:roomExperienceChoice(s,items.filter(id=>roomTaste(s,id)!=='annoy'),slot.block),first=priority||moodChoice?.item||speciesChoice||behaviorChoice?.item||learnedChoice||pool[stableHash((s.id||s.species)+Math.floor(clock/37000))%pool.length];
 const followUp=priority||(moodChoice&&moodChoice.mood!=='play')?null:roomSequenceStep(s,items,first,slot,now);
 const id=followUp?.item||first;
 const habit=roomHabitOf(s,items.filter(item=>roomTaste(s,item)!=='annoy'));
 return {item:id,kind:followUp?itemMoves[id]:moodChoice?.kind||(id==='bed'&&(s.energy??100)<65?'doze':itemMoves[id]),at:followUp?.at??slot.at,until:slot.until,auto:true,taste:roomTaste(s,id),origin:{x:96,feet:130},...(followUp?{originItem:first}:{}),...(habit?.item===id?{habit:true}:{}),...(behaviorChoice?.item===id?{behaviorStyle:behaviorChoice.style}:{})};
}
// A short, purely visual finale during the last seconds of an existing autonomous room slot.
// The result is deterministic and never writes mood, rewards or extra dialogue to the save.
export function roomActivityFinale(s,m,now=Date.now()){
 if(!s||!m?.auto||m.kind==='ask'||!Number.isFinite(m.at)||!Number.isFinite(m.until)||now<m.at+3200||now<m.until-2200||now>=m.until)return null;
 const taste=roomTaste(s,m.item);
 if(taste==='love')return 'fond';
 if(m.item==='laser'){
  const seed=stableHash((s.id||s.species)+':laser-finale:'+m.at);
  return seed%3===0?'miss':'caught';
 }
 if(m.kind==='doze'||m.kind==='nest')return 'rest';
 if(m.item==='toy'||m.item==='toybox')return 'discover';
 if(m.kind==='dance')return 'proud';
 return null;
}
export function roomMomentPose(s,m,style='classic',now=Date.now(),reduced=false){if(!m)return null;const rect=roomRects(s,style)[m.item],isOutfit=m.kind==='outfit';if(!rect&&!isOutfit)return null;const [rx,ry,rw,rh]=rect||[76,105,40,25];let x=rx+rw/2,feet=Math.min(136,Math.max(88,ry+rh+10));if(m.item==='bed')feet=ry+rh-5;if(m.item==='plant'||m.item==='shelf'||m.item==='mirror')feet=Math.max(98,feet);if(isOutfit){x=96;feet=133;}
 const elapsed=Math.max(0,now-m.at),duration=m.auto?2400:1300,k=reduced?1:Math.min(1,elapsed/duration);
 let from=m.origin||{x:96,feet:130};
 const prior=m.originItem&&roomRects(s,style)[m.originItem];
 if(prior){const [px,py,pw,ph]=prior;from={x:px+pw/2,feet:m.originItem==='bed'?py+ph-5:Math.min(136,Math.max(88,py+ph+10))};if(['plant','shelf','mirror'].includes(m.originItem))from.feet=Math.max(98,from.feet);}
 const approaching=k<1;
 x=from.x+(x-from.x)*k;feet=from.feet+(feet-from.feet)*k;const beat=reduced?0:Math.sin((elapsed-duration)/140),acting=!approaching;
 if(acting&&!reduced){if(m.kind==='jump')feet-=Math.abs(beat)*13;if(['faces','outfit','dance','play','shadow'].includes(m.kind))x+=Math.sin(elapsed/180)*3;if(['roll','nest','sniff','drink','read'].includes(m.kind))feet+=Math.sin(elapsed/260)*2;}
 const scale=feet<110?.76:.93;return {x,feet,scale,interaction:{...m,acting,approaching,elapsed,finale:acting?roomActivityFinale(s,m,now):null},ambient:null};
}
// Shared visual responses, composed over the same pet in both styles.
export function drawRoomResponse(c,s,pose,now=Date.now(),reduced=false){const m=pose?.interaction;if(!m||!m.acting)return;const x=pose.x,y=pose.feet,beat=reduced?0:Math.floor(now/220)%3,r=(a,b,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(a),Math.round(b),w,h);},heart=(a,b)=>{r(a,b,3,3,'#ba758a');r(a+5,b,3,3,'#ba758a');r(a,b+3,8,3,'#ba758a');r(a+2,b+6,4,2,'#ba758a');};
 if(m.kind==='faces'){r(x-8,y-29,4,2,'#354d43');r(x+5,y-27,4,2,'#354d43');r(x-1,y-20,4,5,'#db8e99');const rect=roomRects(s,c.canvas?.width>=384?'detailed':'classic').mirror;r(rect[0]+5,rect[1]+12,10,9,'#e7e6cf');r(rect[0]+7,rect[1]+15,2,2,'#354d43');r(rect[0]+12,rect[1]+15,2,2,'#354d43');}
 if(['drink','splash','gentle'].includes(m.kind))for(let i=0;i<4;i++)r(x-17+i*11,y-7-(i+beat)%3*6,2,4,'#94bec1');
 if(m.kind==='sniff'){for(let i=0;i<3;i++)r(x+10+i*4,y-24-i%2*3-beat,2,4,'#87a76c');}
 if(m.kind==='read'){r(x+6,y-18,19,13,'#9b80af');r(x+15,y-17,1,11,'#eadfc6');r(x+8,y-15,5,1,'#eadfc6');r(x+18,y-12,5,1,'#eadfc6');}
 if(['play','search','peek','shadow'].includes(m.kind)){r(x+13+beat*2,y-17,8,8,'#ba98c2');r(x+15+beat*2,y-15,3,3,'#ebdec5');}
 if(m.kind==='stretch'){for(let i=0;i<2;i++)r(x-22+i*43,y-25-beat*2,2,8,'#b0a27a');}
 if(m.kind==='roll'){r(x-23,y-1,46,2,'#c1ab80');}
 if(m.kind==='jump'){for(const dx of [-18,16]){r(x+dx,y+3,2,6,'#e5cc88');r(x+dx-2,y+5,6,2,'#e5cc88');}}
 if(m.kind==='doze'){c.fillStyle='#8d7baf';c.font='bold 8px monospace';c.fillText('zzz',x+13,y-39-beat);}
 if(m.kind==='ask')heart(x+14,y-44);if(m.kind==='outfit'||m.event==='new'||m.kind==='nest'){if(m.taste==='annoy'){r(x+15,y-40-beat,2,7,'#a57969');r(x+15,y-31-beat,2,2,'#a57969');}else heart(x+14,y-44-beat*3);}
 if(m.kind==='gentle'||m.kind==='repair'){for(let i=0;i<3;i++){r(x-20+i*18,y-26-i%2*9,1,5,'#eee5a9');r(x-22+i*18,y-24-i%2*9,5,1,'#eee5a9');}}
 // Finale accents sit outside the original face and sprite outlines in either visual style.
 const finale=m.finale;if(finale==='fond'||finale==='rest')heart(x+15,y-46-(reduced?0:beat));
 if(finale==='caught'||finale==='discover'||finale==='proud'){
  for(let i=0;i<3;i++){const sx=x-17+i*16,sy=y-43-(reduced?0:(i+beat)%3*2);r(sx,sy,2,6,'#eee5a9');r(sx-2,sy+2,6,2,'#eee5a9');}
 }
 if(finale==='miss'){r(x+15,y-43,4,2,'#af81a4');r(x+17,y-41,3,4,'#af81a4');r(x+15,y-36,2,2,'#af81a4');}
 if(m.habit&&finale&&finale!=='miss'&&!reduced){r(x-21,y-42,2,4,'#eee5a9');r(x-22,y-41,4,2,'#eee5a9');}
 if(m.behaviorStyle==='careful'&&!reduced&&m.acting){r(x-11,y+2,2,2,'#b7c9aa');}
 if(m.behaviorStyle==='restless'&&!reduced&&m.acting){r(x+15,y-32,2,3,'#e5cc88');}
}
export function speechFilter(){const recent=new Map();return (text,now=Date.now(),important=false)=>{if(!text)return false;const last=recent.get(text);if(!important&&last!==undefined&&now-last<180000)return false;recent.set(text,now);for(const [t,at]of recent)if(now-at>300000)recent.delete(t);return true;};}

export const roomSounds={bed:'jump',mirror:'giggle',bowl:'milk',fountain:'splash',plant:'groom',shelf:'page',rug:'blanket',lamp:'play',tent:'pet',cushion:'blanket',post:'groom',curtains:'play',toybox:'gift',box:'play',music:'play',laser:'play'};
export function withRoomGesture(c,pose,paint,now=Date.now(),reduced=false){const m=pose?.interaction;if(!m?.acting||reduced){withQuietBody(c,pose,paint,reduced);return;}const beat=Math.sin((now-m.at)/230);c.save();c.translate(pose.x,pose.feet);if(m.kind==='roll')c.rotate(Math.sin((now-m.at)/500)*.7);else if(['faces','outfit','peek','shadow'].includes(m.kind))c.rotate(beat*.075);else if(m.kind==='sniff')c.rotate(.09+beat*.025);if(m.kind==='ask')c.rotate(-.12);if(m.kind==='stretch')c.scale(.92,1.10+beat*.025);if(m.kind==='nest')c.scale(1.05,1-Math.abs(beat)*.06);c.translate(-pose.x,-pose.feet);paint();c.restore();}
