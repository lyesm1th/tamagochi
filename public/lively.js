import {chatter} from './pet-chatter.js';
import {journalAmbient} from './life-journal.js';
import {drawJournalGesture} from './journal-effects.js';
import {stableHash} from './traits.js';
import {photo} from './daily-life.js';
const MIN=60000,clamp=n=>Math.max(0,Math.min(100,n));
export const habits={
 dog:{kind:'graze',item:'plant',text:'Муу. Перевіряю травичку. Це дегустація, людино.'},
 cat:{kind:'knock',item:'shelf',text:'Книжка сама впала. Я лише перевіряв гравітацію.'},
 chicken:{kind:'scratch',item:'rug',text:'Ко-ко! Тут точно було зернятко. Зараз усе перекопаю.'},
 frog:{kind:'hunt',item:'plant',text:'Ква! Комарюко, стій. Ти мій обід.'},
 corgi:{kind:'chase',item:'toy',text:'Гав! М’ячик тікає, батон наздоганяє.'},
 bear:{kind:'sniff',item:'bowl',text:'Хрум. Нюхаю мисочку. Раптом там ягідки?'},
 dino:{kind:'stomp',item:'rug',text:'Ррр! Я грізний. Килимок уже злякався.'},
 bunny:{kind:'dig',item:'rug',text:'Шурх-шурх. Копаю нірку. Підлога поки проти.'}
};
export function awake(s,now=Date.now()){return !!s&&!s.dead&&!s.vacation&&!s.sleeping&&!s.napping&&now-s.born>=180000;}
export function ambient(s,now=Date.now()){
 if(!awake(s,now)||!s.lively||s.world?.walk?.expires>now||s.cozy?.hide?.expires>now||s.playroom?.session?.expires>now||s.living?.motion?.until>now)return null;
 const activeGesture=s.journal?.gesture;if(activeGesture?.until>now)return journalAmbient(s,now);
 if(Math.min(s.health,s.energy,s.hunger)<30)return null;
 const hello=s.lively?.welcome;if(hello?.until>now)return {kind:hello.kind==='shy'&&now<hello.at+5000?'turned':'welcome',item:'front',text:hello.text,progress:(now-hello.at)/(hello.until-hello.at)};
 if(s.cozy?.peace?.tension>0)return {kind:'turned',item:'corner',text:'Я поки спиною. Але ти далеко не йди.'};
 const secret=s.lively?.secret;if(secret?.until>now&&now>=secret.at&&now-secret.at<12000)return {...secret,progress:(now-secret.at)/10000};
 const littleMoment=chatter(s,now);if(littleMoment)return littleMoment;
 const journal=journalAmbient(s,now);if(journal)return journal;
 const block=Math.floor(now/40000),phase=now%40000;if(phase>17000)return null;const h=habits[s.species]||habits.cat,seed=stableHash(s.id+':'+block),owned=id=>id==='box'&&s.room?.box!==false||s.room?.[id]||s.cozy?.owned?.[id]||id==='toy'&&s.playroom?.toys?.ball;
 const choices=[{...h,item:owned(h.item)?h.item:'rug'},{kind:'window',item:'window',text:'Дивлюся у вікно. Там теж хтось дивний.'},{kind:'carry',item:s.room?.bed?'bed':'rug',text:'Тягну іграшку у своє гніздечко. Не забирай.'},{kind:'doze',item:s.room?.bed?'bed':'rug',text:'Грався-грався… очі самі закрилися.'}];
 const result=choices[(seed+(s.trait==='playful'?1:s.trait==='sleepy'?3:0))%choices.length];return {...result,progress:phase/17000};
}
export function returnHome(s,gap,now=Date.now()){
 if(!awake(s,now)||gap<5*MIN||!Number.isFinite(gap))return null;s.lively??={};const shy=gap>=6*60*MIN;
 const text=shy?'Я не чекав. Просто сидів біля дверей. Ну… йди вже обійму.':'Моя людина! Я тут! Іди сюди, у мене обійми!';
 s.lively.welcome={kind:shy?'shy':'run',at:now,until:now+16000,text};return text;
}
export function updateLively(s,now=Date.now()){
 if(!awake(s,now))return;s.lively??={};const l=s.lively;if(l.secret&&now-l.secret.at>=12000)l.secret=null;l.nextAt??=now+20*MIN;if(now<l.nextAt)return;l.nextAt=now+(20+stableHash(s.id+now)%21)*MIN;
 const h=habits[s.species]||habits.cat;l.lastHabit={...h,at:now};photo(s,'habit-'+s.species,'Моя маленька звичка',h.text,'habit',now);
}
export function livelyAction(state,command,body={},now=Date.now()){
 if(!state)return {error:'Спочатку обери друга.'};const s=structuredClone(state);s.lively??={};const l=s.lively;
 if(command==='capture'){if(s.dead)return {error:'Наші попередні моменти є в альбомі.'};const caption=photoCaption(s,now);photo(s,'frame-'+now,'Наш кадр кімнати',caption,'frame',now);return {state:s,text:caption,photoId:'frame-'+now};}
 if(!awake(s,now))return {error:'Секрети дослідимо після сну й вилуплення.'};if(body.spot==='box'&&s.room?.box===false)return {error:'Коробка у сховищі.'};if(command!=='secret'||!['window','box','plant'].includes(body.spot))return {error:'Невідома таємниця.'};
 const spot=body.spot;if(spot==='plant'&&!s.room?.plant&&!s.cozy?.owned?.plant)return {error:'Спочатку поставимо рослинку.'};l.taps??={};const tap=l.taps[spot]||{count:0,at:now};tap.count=now-tap.at>15000?1:tap.count+1;tap.at=now;l.taps[spot]=tap;
 if(tap.count<(spot==='box'?3:2))return {state:s,text:spot==='box'?'У коробці щось шурхотить. Постукай ще…':'Щось ворухнулося. Спробуй ще раз…'};tap.count=0;
 const text={window:'Цвірінь! До нас прилетіла пташка. Тільки без полювання, хитрюго.',box:'Це моя фортеця! Людям вхід за обійми.',plant:'Знайшов сонечко на листочку. Маленький сусід!'}[spot];
 l.secret={kind:{window:'bird',box:'box',plant:'bug'}[spot],item:spot,at:now,until:now+12000,text};l.found??={};if(!l.found[spot]){l.found[spot]=now;s.bond=clamp((s.bond||0)+1);photo(s,'secret-'+spot,'Таємниця кімнати',text,'secret',now);}return {state:s,text,effect:'pet'};
}
export function photoCaption(s,now=Date.now()){const h=habits[s.species]||habits.cat;if(s.sleeping||s.napping)return 'Це я сплю. Красу набираю. Не будити, бляха.';const lines=['Це я красивий. Решта — меблі.',h.text,'Моя кімната. Мій безлад. Моя улюблена людина за кадром.','Знімай швидше. У мене лапки й важливі справи.'];return lines[stableHash(s.id+Math.floor(now/60000))%lines.length];}
export function ambientPose(a,pos,reduced=false){if(!a)return null;const targets={bed:[pos.bed+25,99],bowl:[pos.bowl+10,118],plant:[pos.plant-5,108],shelf:[pos.shelf+21,91],rug:[96,123],toy:[112,123],lamp:[135,105],box:[30,130],window:[48,90],front:[96,134],corner:[157,91]};let [x,feet]=targets[a.item]||targets.rug;if(a.kind==='dance'&&!reduced){x+=Math.sin((a.progress||0)*Math.PI*12)*4;feet-=Math.abs(Math.sin((a.progress||0)*Math.PI*16))*5;}if(a.kind==='ball'){x=Math.max(25,Math.min(166,(a.ball?.x||96)-12));feet=128;}if(a.kind==='carry'){const k=Math.min(1,(a.progress||0)*2);x=30+(x-30)*k;feet=130+(feet-130)*k;}if(a.kind==='hop')feet-=Math.abs(Math.sin((a.progress||0)*12))*6;if(a.kind==='welcome'){const k=Math.min(1,(a.progress||0)*2);x=150-54*k;feet=90+44*k;}return {x,feet,scale:feet<100?.72:.93,ambient:a};}
// Small scene props use the same coarse pixels in both graphic modes.
export function drawLively(c,s,pose,now=Date.now(),reduced=false,paint=null){drawJournalGesture(c,s,pose,now,reduced,paint);const a=pose?.ambient;if(!a)return;const x=pose.x,y=pose.feet,beat=reduced?0:Math.floor(now/250)%3,r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);};
 if(a.kind==='carry'||a.kind==='chase'){if(paint)paint('ball',x+8,y-13-beat,10,10);else {r(x+9,y-12-beat,8,8,'#af84b6');r(x+11,y-11-beat,3,3,'#eee3c9');}}
 if(['graze','sniff'].includes(a.kind))for(let i=0;i<3;i++)r(x+9+i*3,y-17-i%2*3,2,6,'#789756');
 if(['scratch','dig','stomp'].includes(a.kind))for(let i=0;i<3;i++)r(x-13+i*12,y+beat-i%2*2,3,2,'#b3936c');
 if(a.kind==='hunt'||a.kind==='bug'){const xx=x+14+beat*3,yy=y-25-beat*4;r(xx,yy,4,3,'#4f6251');r(xx-2,yy-2,3,2,'#e4ddba');r(xx+3,yy-2,3,2,'#e4ddba');if(a.kind==='hunt')r(x+4,y-20,8+beat*3,1,'#cb939d');}
 if(a.kind==='knock'){r(x+14,y-16+beat*6,8,5,'#a386b7');r(x+15,y-15+beat*6,6,1,'#e4ddba');}
 if(a.kind==='bird'){r(44+beat,58,8,5,'#8faab1');r(50+beat,55,4,4,'#8faab1');r(54+beat,57,3,1,'#d0a364');}
 if(a.kind==='box'){r(x-17,y-18,34,21,'#c5aa80');r(x-19,y-20,38,4,'#ddc397');r(x-3,y-20,6,21,'#b29570');}
 if(a.kind==='doze'){c.fillStyle='#7e759b';c.font='bold 7px monospace';c.fillText('zzz',x+10,y-35-beat);}
 if(a.kind==='welcome'){c.fillStyle='#ba8297';c.font='bold 12px monospace';c.fillText('♥',x+12,y-35-beat);}
 if(a.kind==='turned'){const col=({cat:'#b799cd',dog:'#f0e6cf',frog:'#92b16f',bear:'#aa8060',chicken:'#e1c05f',dino:'#82aaa0',bunny:'#d9aec1',corgi:'#cc9a68'}[s.species]||'#a6b585');r(x-12,y-29,24,28,'#40533d');r(x-16,y-23,32,19,'#40533d');r(x-11,y-30,22,26,col);r(x-14,y-22,28,17,col);r(x-10,y-3,7,3,'#40533d');r(x+4,y-3,7,3,'#40533d');if(s.species==='bunny'){r(x-9,y-43,5,14,col);r(x+5,y-43,5,14,col);}else if(s.species!=='frog'){r(x-13,y-34,7,7,col);r(x+7,y-34,7,7,col);}r(x-2,y-10,5,6,'#e4d3ac');if(s.species==='dog'){r(x-9,y-24,6,8,'#4c5145');r(x+4,y-17,7,6,'#4c5145');}}
}
export function roomSpot(x,y){if(x>=22&&x<=73&&y<65)return 'window';if(x>=14&&x<=65&&y>=119)return 'box';return null;}
