import {ambientSlot,noteCalm} from './calm-behavior.js';
import {personality} from './pet-personality.js';
import {stableHash} from './traits.js';
import {stage} from './pet-life.js';
import {photo,noteDaily} from './daily-life.js';
import {weatherAt} from './weather.js';
const MIN=60000,HOUR=60*MIN,clamp=n=>Math.max(0,Math.min(100,n));
export const journalPages=[['drawings','Мої малюнки'],['keepsakes','Кімната й спогади'],['quirks','Сімейна звичка'],['courage','Маленькі сміливості'],['together','Просто побути поруч'],['dreamgame','Гра у сні']];
export const quirkNames={nose:'Спить із лапкою біля носа',hop:'Підстрибує перед їжею',hiccup:'Дивується власній гикавці',tuck:'Підгортає під себе край ковдри'};
export const fearNames={bath:'Купання',storm:'Гроза',meeting:'Нове знайомство'};
const stages=['Яєчко','Малюк','Дитина','Підліток','Дорослий','Старенький'];
export function ensureJournal(s,now=Date.now()){s.journal??={};const j=s.journal;j.marks??=[];j.drawings??=[];j.courage??={bath:0,storm:0,meeting:0};j.practice??={};j.dreamRewards??=[];j.quirk??={id:Object.keys(quirkNames)[stableHash(s.id||s.species)%4],from:null};j.nextDrawing??=now+3*HOUR;return j;}
export function updateJournal(s,now=Date.now()){
 const j=ensureJournal(s,now);if(s.dead||s.vacation)return;const age=stage(s,now),index=stages.indexOf(age);
 // Catch up visible growth milestones without pretending to know their exact historic time.
 for(let i=1;i<=index;i++)if(!j.marks.some(m=>m.stage===stages[i]))j.marks.push({stage:stages[i],at:now,name:s.name});
 if(!s.sleeping&&!s.napping&&age!=='Яєчко'&&now>=j.nextDrawing){makeDrawing(s,now);j.nextDrawing=now+(8+stableHash(s.id+now)%9)*HOUR;}
 if(!(s.sleeping||s.napping))j.dreamRun=null;
}
export function makeDrawing(s,now=Date.now()){
 const j=ensureJournal(s,now),friends=s.social?.friends||[],seed=stableHash(s.id+':drawing:'+now),subjects=['together','food',...(friends.length?['friend']:[])],subject=subjects[seed%subjects.length],friend=subject==='friend'?friends.slice().sort((a,b)=>b.score-a.score)[0]:null;
 j.drawingSerial=(j.drawingSerial||0)+1;const row={id:'drawing-'+now+'-'+j.drawingSerial,subject,seed,at:now,title:subject==='together'?'Це ми з тобою':subject==='friend'?'Мій друг '+friend.name:'Моя улюблена їжа',friend:friend?.name||null,species:s.species,food:s.favoriteFood||'cookie',comment:subject==='together'?'Людина трохи крива вийшла. Зате моя.':subject==='friend'?'Це мій друг. Вуха майже правильно намалював.':'Натюрморт. З’їв би, але папір шкода.'};
 j.drawings.unshift(row);j.drawings=j.drawings.slice(0,24);j.pinned??=row.id;photo(s,row.id,row.title,row.comment,'drawing',now);return row;
}
export function farewell(s,outcome='death'){
 const worn=Object.values(s.cozy?.wearing||{}),things=Object.entries(s.cozy?.items||{}).sort((a,b)=>(b[1].uses||0)-(a[1].uses||0)),item=things.find(([,v])=>v.uses>0)?.[0]||worn[0];
 const labels={bed:'ліжечко',ball:'м’ячик',toy:'іграшку',sweater:'светрик',bow:'метелик',scarf:'шарфик',panama:'панамку',rug:'килимок',plant:'рослинку',music:'музичну скриньку',laser:'світлову цятку'};
 const friend=(s.social?.friends||[]).slice().sort((a,b)=>b.score-a.score)[0],skills=Object.entries(s.playroom?.skills||{}).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]),game={ball:'ганяти м’ячик',laser:'полювати на світлову цятку',music:'слухати нашу музику'}[skills[0]?.[0]],care=s.memory?.moments||[];
 const lines=[outcome==='family'?'Моя людино, я залишаю тобі нове маленьке диво.':'Моя людино, дякую за наш маленький світ.'];if(item)lines.push('Пам’ятаєш '+(labels[item]||'мою улюблену річ')+'? Воно пахло домом.');if(friend)lines.push('І '+friend.name+' — наші пригоди я теж заберу із собою.');if(game)lines.push('Найкраще було '+game+'.');if(care.some(m=>m.action==='pet'))lines.push('А твої почухування — взагалі без конкуренції.');if(!item&&!friend&&!game)lines.push('Навіть наші короткі хвилинки були моїми.');lines.push('Не сумуй надто довго, дурко. Мої лапки залишилися в твоїй пам’яті.');return {text:lines.join(' '),item:item||null,friend:friend?.name||null,game:skills[0]?.[0]||null};
}
export function noteJournalCare(s,action,now=Date.now()){
 const j=ensureJournal(s,now);if(['pet','feed','play','clean'].includes(action)){if(s.lively)s.lively.secret=null;if(s.cozy)s.cozy.hide=null;}if(['pet','ritual','blanket'].includes(action)){const fear=(s.sleeping||s.napping)?null:weatherAt(now).id==='storm'?'storm':null;if(fear&&j.courage[fear]<3&&j.practice[fear]?.step===2)completeCourage(s,fear,now);}
 if(action==='bath'&&j.practice.bath?.step===2)completeCourage(s,'bath',now);
 if(action==='feed'&&j.quirk.id==='hop')j.gesture={kind:'hop',until:now+5000};
}
function completeCourage(s,fear,now){const j=ensureJournal(s,now);j.courage[fear]=3;j.practice[fear]={step:3,at:now};photo(s,'brave-'+fear,'Я став сміливішим: '+fearNames[fear],'Ти не квапив. Я спробував. Вийшло, людино!','courage',now);}
export function dreamTheme(s){return s.species==='dino'?{title:'Втеча від велетенського печива',kind:'escape',hint:'Обери вільну хмаринку без печива'}:s.species==='dog'?{title:'Хмарки запашного сіна',kind:'hay',hint:'Обери хмаринку з сіном'}:{title:({cat:'Рибки на місяці',chicken:'Зернята між хмарами',frog:'Комарики в зоряному ставку',bear:'Ягідне сузір’я',corgi:'М’ячики на веселці',bunny:'Морквяна галактика'}[s.species]||({pig:'Яблучні хмаринки',sheep:'Вовняні сузір’я',fox:'Хвостик на місяці',monkey:'Бананова галактика',duck:'Ставочок між хмарами',penguin:'Рибки під зоряною кригою'}[s.species])||'Хмарна пригода'),kind:'collect',hint:'Обери сяючу хмаринку'};}
export function journalAction(state,command,body={},now=Date.now()){
 if(!state)return {error:'Спочатку обери друга.'};const s=structuredClone(state),j=ensureJournal(s,now);if(s.dead||s.vacation||stage(s,now)==='Яєчко')return {error:'Повернемось до цього, коли друг буде вдома й готовий.'};
 if(command==='leaveBox'){if(s.lively)s.lively.secret=null;if(s.cozy)s.cozy.hide=null;j.together=false;j.gesture=null;return {state:s,text:'Виліз! Коробка почекає. Пограємось?'};}
 if(command==='dreamStart'){
 if(!s.sleeping&&!s.napping)return {error:'У сон можна зазирнути, коли пет спить.'};const key=String(s.world?.sleepAt||s.born);if(j.dreamRun?.sleepKey===key)return {state:s,text:'Продовжимо наш сон.'};const n=(j.dreamSerial||0)+1;j.dreamSerial=n;j.dreamRun={id:'dream-'+now+'-'+n,sleepKey:key,at:now,hits:0,turn:0,target:stableHash(s.id+key+n)%3,lastAt:0};return {state:s,text:dreamTheme(s).title+'. ← → хмаринка · ОК стрибок. Сон триває.'};}
 if(command==='dreamTurn'){
 const run=j.dreamRun;if(!s.sleeping&&!s.napping||!run||run.id!==body.eventId||String(s.world?.sleepAt||s.born)!==run.sleepKey)return {error:'Цей сон уже завершився.'};if(!Number.isInteger(body.lane)||body.lane<0||body.lane>2||!Number.isInteger(body.turn)||body.turn!==run.turn)return {error:'Обери актуальну хмаринку.'};const hit=body.lane===run.target;run.turn++;if(hit)run.hits++;run.lastAt=now;
 if(run.hits>=5){const fresh=!j.dreamRewards.includes(run.sleepKey);if(fresh){j.dreamRewards=[run.sleepKey,...j.dreamRewards].slice(0,8);s.happy=clamp(s.happy+3);photo(s,'dream-play-'+run.sleepKey,'Пригода у сні',dreamTheme(s).title+'. Людина теж трошки побула в моїй голові.','dream',now);}j.lastDreamGame={at:now,title:dreamTheme(s).title};j.dreamRun=null;return {state:s,text:'Долетіли! Пет спить далі. '+(fresh?'Спогад залишився в альбомі.':'Ще одна тиха пригода.'),done:true};}
 run.target=stableHash(s.id+run.id+run.turn)%3;return {state:s,text:hit?'Стриб! '+run.hits+'/5.':'Хмаринка пролетіла. Спробуй ще — штрафів немає.'};}
 if(command==='together'){noteCalm(s,now,true);if(s.sleeping||s.napping)return {error:'Нехай спить. Можна тихенько зазирнути у сон.'};j.together=!j.together;return {state:s,text:j.together?'Підсувайся. Просто посидимо. Нічого робити не треба.':'Я поруч. Можемо знову зайнятися справами.'};}
 if(s.sleeping||s.napping)return {error:'Це зробимо після сну.'};
 if(command==='draw'){const drawing=makeDrawing(s,now);j.nextDrawing=now+8*HOUR;return {state:s,text:drawing.comment,effect:'craft'};}
 if(command==='pinDrawing'){const row=j.drawings.find(d=>d.id===body.drawing);if(!row)return {error:'Малюнок уже не в альбомі.'};j.pinned=j.pinned===row.id?null:row.id;return {state:s,text:j.pinned?'Повісили! Тепер у нас тут виставка генія.':'Сховали в альбом. Можна повісити інший.'};}
 if(command==='courage'){const fear=body.fear;if(!Object.hasOwn(fearNames,fear))return {error:'Невідома вправа.'};if(j.courage[fear]>=3)return {state:s,text:'З цим я вже дружу. Ти навчив не боятися.'};const step=j.practice[fear]?.step||0;j.practice[fear]={step:Math.min(3,step+1),at:now};j.courage[fear]=Math.max(j.courage[fear],step+1);if(step===2)completeCourage(s,fear,now);j.gesture={kind:fear==='bath'?(step===1?'water':'towel'):fear==='meeting'?(step===0?'turned':'hello'):(step===0?'blanket':step===1?'rain':'hello'),until:now+10000};const texts={bath:['Показали сухий рушничок. Я сам підійшов понюхати.','Тепла водичка на лапку. Без бризок. Уже не так страшно.','Сам приніс рушничок. Людино, можна купатися!'],storm:['Сіли подалі від вікна. Ти поруч, я під ковдрою.','Послухали тихий гуркіт разом. Я вже визираю.','Грім собі бурчить. А я в безпеці й більше не ховаюся.'],meeting:['Подивились на нового сусіда здалеку. Без поспіху.','Помахав лапкою. Можна й не підходити одразу.','Сам підійшов привітатися! Оце я сміливець.']};return {state:s,text:texts[fear][Math.min(2,step)],effect:'pet'};}
 if(command==='gesture'){
 if(!['pet','ball','lamp'].includes(body.gesture))return {error:'Невідома взаємодія.'};if(body.gesture==='lamp'&&!s.cozy?.owned?.lamp)return {error:'Спочатку поставимо лампу.'};if(body.gesture==='ball'&&!s.room?.toy&&!s.playroom?.toys?.ball)return {error:'Спочатку знайдемо м’ячик.'};if(body.gesture==='ball'&&(!Number.isFinite(body.x)||body.x<0||body.x>1))return {error:'М’ячик за межами кімнати.'};if(s.lively){s.lively.secret=null;s.lively.welcome=null;}if(s.cozy)s.cozy.hide=null;if(s.playroom)s.playroom.session=null;if(s.living)s.living.motion=null;noteCalm(s,now,true);j.together=false;j.gesture={kind:body.gesture,x:body.x??.5,from:Number.isFinite(body.from)?Math.max(0,Math.min(1,body.from)):.5,at:now,until:now+(body.gesture==='ball'?6000:10000)};if(body.gesture==='pet'){s.bodyLanguage={kind:'approach',until:now+6000};if(now-(j.lastTouch||0)>=MIN){j.lastTouch=now;s.happy=clamp(s.happy+3);s.bond=clamp((s.bond||0)+1);}noteDaily(s,'pet',now);}return {state:s,text:body.gesture==='pet'?personality(s.species).pet[Math.floor(now/1000)%personality(s.species).pet.length]:body.gesture==='ball'?'Лови! Тепер моя черга котити.':'Тінь! Зараз спіймаю. Ну й хитра штука.',effect:body.gesture==='pet'?'pet':'toy'};
 }
 return {error:'Невідома дія.'};
}
export function journalAmbient(s,now=Date.now()){
 const j=s?.journal;if(!j||s.dead||s.vacation)return null;if(s.sleeping||s.napping)return null;
 if(j.together)return {kind:'together',item:'front',text:'Посидимо. Я тихенько тут.'};
 if(j.gesture?.until>now){const k=j.gesture.kind;if(k==='ball'){const point=ballMotion(j.gesture,now);return {kind:'ball',item:'toy',x:point.x,ball:point,text:'Лови! Я за м’ячиком.'};}return {kind:k,item:k==='lamp'?'lamp':k==='ball'?'toy':k==='towel'?'bowl':'front',x:j.gesture.x,progress:(now-(j.gesture.until-5000))/5000,text:k==='towel'?'Сам приніс рушничок!':null};}
 if(ambientSlot(s,now)?.lane!=='weather')return null;const weather=weatherAt(now).id;if(weather==='storm')return {kind:(j.courage?.storm||0)>=3?'rain':'blanket',item:(j.courage?.storm||0)>=3?'window':'bed',text:(j.courage?.storm||0)>=3?'Грім бурчить, а ми тут у безпеці.':'Гримить… Можна я ближче до тебе, людино?'};
 if(weather==='rain')return {kind:'rain',item:'window',text:s.species==='frog'?'Ква! Моя улюблена водичка.':'Ловлю крапельки. Вони самі прийшли!'};
 if(weather==='sun'&&s.routine?.timezone&&Math.floor(now/HOUR)%4===0)return {kind:'warm',item:'rug',text:'Тепло… Розпластався пузом догори. Не кантувати.'};
 if(j.quirk.id==='hiccup'&&Math.floor(now/12000)%6===0)return {kind:'hiccup',item:'front',text:'Гик! Хто це був? А. Це я.'};return null;
}
export function inheritedJournal(parent,child,now=Date.now()){
 const source=ensureJournal(parent,now),j=ensureJournal(child,now);j.quirk={id:source.quirk.id,from:source.quirk.from||parent.name};j.familyArt=structuredClone(source.drawings.find(d=>d.id===source.pinned)||source.familyArt||null);j.familyMarks=structuredClone([...(source.familyMarks||[]),{name:parent.name,generation:parent.generation||1,stages:source.marks.map(m=>m.stage)}].slice(-5));return j;
}

export function ballMotion(g,now=Date.now(),reduced=false){const elapsed=Math.max(0,now-(g.at||now)),t=Math.min(1,elapsed/1800),back=Math.min(1,Math.max(0,(elapsed-1800)/1800)),start=25+(g.from??.5)*140,end=25+(g.x??.5)*140,x=elapsed<1800?start+(end-start)*(1-(1-t)**2):end+(start-end)*back*.65;return {x,y:127-(reduced?0:Math.abs(Math.sin(Math.min(elapsed,3600)/1800*Math.PI*3))*8),rolling:elapsed<3600};}
