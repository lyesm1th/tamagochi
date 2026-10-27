import {feel} from './emotions.js';
import {ambientSlot} from './calm-behavior.js';
import {drawToyVariant} from './item-designs.js';
import {stableHash} from './traits.js';
import {weatherAt} from './weather.js';
import {stage} from './pet-life.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const roomGames=[['ball','М’яч'],['yarn','Клубок'],['feather','Пір’їнка'],['sun','Зайчик'],['duck','Качечка']];
export const speciesMotions={pig:'root',sheep:'fluff',fox:'prowl',monkey:'hang',duck:'paddle',penguin:'slide',chicken:'scratch',cat:'pounce',corgi:'wag',frog:'hop',bear:'sway',dog:'graze',dino:'stomp',bunny:'earHop'};
export const sensitivePlaces={pig:'п’ятачок і м’які вушка',sheep:'вовняні боки',fox:'за гострим вушком',monkey:'долоньки й боки',duck:'пір’ячко під крильцем',penguin:'боки біля ластів',chicken:'пушок під крильцем',cat:'щічки й за вушком',corgi:'короткі лапки й боки',frog:'волога спинка',bear:'пухнасті боки',dog:'чоло між ріжками',dino:'спинка між шипами',bunny:'основа довгих вушок'};
export function ensureEnrichment(s){s.living??={};s.living.enrichment??={traces:[]};const e=s.living.enrichment;e.traces??=[];return e;}
export function roomAvailable(s,now=Date.now()){return !!s&&!s.dead&&!s.vacation&&!s.sleeping&&!s.napping&&stage(s,now)!=='Яєчко'&&!(s.world?.walk?.expires>now)&&!(s.cozy?.hide?.expires>now)&&!(s.playroom?.session?.expires>now);}
export function markRoomTrace(s,item,now=Date.now()){
 const kind={bed:'blanket',cushion:'pillow',shelf:'book',bowl:'wet',fountain:'wet',plant:'leaves',toybox:'toys',rug:'fur',post:'thread'}[item];if(!kind)return;
 const e=ensureEnrichment(s);e.traces=e.traces.filter(t=>t.until>now);if(e.traces.some(t=>t.item===item&&now-t.at<20000))return;
 e.traces.push({item,kind,at:now,until:now+90*60000});e.traces=e.traces.slice(-8);e.tidyAt??=now+60000+stableHash(s.id+now)%120000;
}
export function updateEnrichment(s,now=Date.now()){
 const e=s.living?.enrichment;if(!e)return;e.traces=e.traces.filter(t=>t.until>now);if(s.dead||s.vacation)return;
 if(e.session&&e.session.until<=now)e.session=null;
 if(e.touch?.until<=now)e.touch=null;if(e.home?.until<=now)e.home=null;
 if(e.traces.length&&e.tidyAt<=now&&roomAvailable(s,now)&&!(e.session?.until>now)&&!(e.home?.until>now)&&!(e.touch?.until>now)&&!(s.living.motion?.until>now)&&ambientSlot(s,now)?.lane==='room'){
 const first=e.traces[0];e.tidying={...first,at:now,until:now+6500};e.traces.shift();e.tidyAt=now+90000;
 }
}
export function toyPosition(run,rects={},now=Date.now(),reduced=false){
 const age=clamp((now-run.at)/1000,0,8),kind=run.kind;
 if(kind==='feather'||kind==='sun')return {x:run.x??105,y:run.y??110,vx:0,vy:0,bounces:0};
 if(kind==='duck'){const rect=rects[run.water||'fountain']||rects.bowl||[135,108,27,16];return {x:rect[0]+rect[2]/2+(reduced?0:Math.sin(age*3)*4),y:rect[1]+rect[3]/2+(reduced?0:Math.sin(age*4)*2),vx:0,vy:0,bounces:0};}
 let x=run.x??110,y=run.y??125,vx=run.vx??35,vy=run.vy??-12,bounces=0;
 // Fixed small steps make collisions reproducible regardless of frame rate.
 const obstacles=Object.entries(rects).filter(([id])=>(run.obstacles||['bed','tent','post','toybox','cushion','bowl','fountain']).includes(id)).map(([,r])=>r);
 for(let t=0;t<age;t+=1/60){const dt=Math.min(1/60,age-t),ox=x,oy=y;x+=vx*dt;y+=vy*dt;vx*=Math.exp(-.23*dt);vy*=Math.exp(-.23*dt);
 if(x<8||x>184){x=clamp(x,8,184);vx=-vx*.82;bounces++;}if(y<76||y>137){y=clamp(y,76,137);vy=-vy*.82;bounces++;}
 for(const [a,b,w,h]of obstacles){if(x>a-4&&x<a+w+4&&y>b-4&&y<b+h+4){if(ox<=a-4||ox>=a+w+4){x=ox;vx=-vx*.75;}else if(oy<=b-4||oy>=b+h+4){y=oy;vy=-vy*.75;}else continue;bounces++;break;}}
 }
 return {x,y,vx,vy,bounces};
}
export function enrichmentAction(state,body={},now=Date.now(),rects={}){
 if(!state)return {error:'Спочатку обери друга.'};const s=structuredClone(state),e=ensureEnrichment(s);
 if(body.event==='stop'){e.session=null;return {state:s,text:'Іграшка почекає. Я поруч.'};}
 if(body.event==='clean'){e.session=null;e.touch=null;e.home=null;s.living.motion=null;s.living.reaction=null;if(s.journal)s.journal.gesture=null;e.traces=[];e.tidying={item:'rug',kind:'tidy',at:now,until:now+6500};return {state:s,text:'Підправили ковдру й поскладали дрібниці.',effect:'clean'};}
 if(!roomAvailable(s,now))return {error:'Пограємо вдома, коли друг прокинеться й вилупиться.'};
 if(body.event==='touch'){
 if(!['stroke','tickle','nose'].includes(body.kind))return {error:'Невідомий жест.'};e.tidying=null;e.home=null;e.session=null;e.touch={kind:body.kind,at:now,until:now+4500};s.living.motion=null;s.living.reaction=null;if(s.journal)s.journal.gesture=null;
 if(now-(e.touchRewardAt||0)>=60000){e.touchRewardAt=now;s.happy=clamp(s.happy+3,0,100);s.bond=clamp((s.bond||0)+1,0,100);}
 feel(s,body.kind==='tickle'?'amused':body.kind==='nose'?'surprised':'content',body.kind==='tickle'?'Мене лоскочуть':'Ніжний дотик',now,.7,45000);
 const nose={pig:'п’ятачок',duck:'дзьобик',chicken:'дзьобик',penguin:'дзьобик'}[s.species]||'носик';const text=body.kind==='nose'?'Біп! Це мій '+nose+'. Твій тепер теж перевіримо.':body.kind==='tickle'?'Хі-хі! Лоскотно: '+sensitivePlaces[s.species]+'. Все, здаюся!':'М-м… ніжненько. '+sensitivePlaces[s.species]+'. Ще трошки, людино.';
 return {state:s,text,effect:body.kind==='tickle'?'giggle':'pet'};
 }
 if(body.event==='start'){
 if(!roomGames.some(([id])=>id===body.kind))return {error:'Обери іграшку.'};if(['ball','yarn'].includes(body.kind)&&!s.room?.toy&&!s.playroom?.toys?.ball)return {error:'Спочатку придбай іграшку для кімнати.'};if(body.kind==='duck'&&!s.room?.bowl&&!s.cozy?.owned?.fountain)return {error:'Качечці потрібна мисочка або фонтанчик.'};
 e.tidying=null;e.home=null;e.touch=null;e.session={id:'room-'+now,kind:body.kind,at:now,until:now+90000,x:120,y:125,vx:42,vy:-16,hits:0,turn:0,last:0,water:s.cozy?.owned?.fountain?'fountain':'bowl',obstacles:Object.keys(rects).filter(id=>['bed','tent','post','toybox','cushion','bowl','fountain'].includes(id)&&(s.room?.[id]||s.cozy?.owned?.[id]))};s.living.motion=null;s.living.reaction=null;if(s.journal)s.journal.gesture=null;
 return {state:s,text:{ball:'Коти м’яч пальцем — я наздожену!',yarn:'Тягни клубок. Нитка вже живе своїм життям.',feather:'Поводи пір’їнкою. Лапки готові!',sun:'Веди сонячного зайчика. Я його впіймаю!',duck:'Торкнись водички — качечка гойдається!'}[body.kind],effect:'play'};
 }
 const run=e.session;if(!run||run.until<=now||body.session!==run.id)return {error:'Ця гра вже завершилася.'};
 if(!['move','tap'].includes(body.event))return {error:'Невідома дія.'};
 if(!Number.isFinite(body.x)||!Number.isFinite(body.y)||body.x<0||body.x>192||body.y<0||body.y>144)return {error:'Іграшка за межами кімнати.'};
 if(now-run.last<250)return {state:s,text:''};
 const point=toyPosition(run,rects,now),follow=1-Math.exp(-Math.max(0,now-run.at)/700),petX=(run.petX??96)+(clamp(point.x-14,20,172)-(run.petX??96))*follow,petY=(run.petY??130)+(clamp(point.y+10,103,136)-(run.petY??130))*follow,near=Math.hypot(body.x-point.x,body.y-point.y)<25;run.last=now;run.turn++;run.petX=petX;run.petY=petY;run.at=now;run.x=clamp(body.x,8,184);run.y=clamp(body.y,76,137);
 run.vx=Number.isFinite(body.dx)?clamp(body.dx*4,-110,110):35;run.vy=Number.isFinite(body.dy)?clamp(body.dy*4,-80,80):-15;
 if(near||['feather','sun','duck'].includes(run.kind))run.hits++;
 if(run.hits>=5){markRoomTrace(s,run.kind==='duck'?'fountain':run.kind==='yarn'?'post':'toybox',now);run.hits=0;run.rounds=(run.rounds||0)+1;
 if(now-(e.playRewardAt||0)>=5*60000){feel(s,'proud','Впіймав іграшку!',now,.7,60000);e.playRewardAt=now;s.happy=clamp(s.happy+6,0,100);s.bond=clamp((s.bond||0)+1,0,100);return {state:s,text:'Зловив! Давай ще. Ти хороша банда для моїх лапок.',effect:'pet'};}}
 return {state:s,text:'',effect:null};
}
export function moodOf(s){if(s?.sleeping||s?.napping||s?.energy<35)return 'sleepy';if(s?.cozy?.peace?.tension>0||s?.happy<35)return 'sulky';if(s?.happy>=80&&s?.energy>=50)return 'springy';return 'calm';}
export function enrichmentPose(s,rects,now=Date.now(),reduced=false){
 if(!roomAvailable(s,now))return null;const e=s.living?.enrichment;
 const home=e?.home;if(home?.until>now){const t=(now-home.at)/1000,noticing=t>3,a=rects[home.item],hx=a?a[0]+a[2]/2:home.x,hy=a?Math.min(132,Math.max(99,a[1]+a[3]+8)):home.feet,k=reduced?(noticing?1:0):clamp((t-3)/3,0,1);return {x:hx+(96-hx)*k,feet:hy+(132-hy)*k,scale:.9,interaction:{kind:noticing?'welcome':home.kind,item:home.item,acting:true,at:home.at},enriched:{kind:'home',noticing}};}
 const tidy=e?.tidying;if(tidy?.until>now){const r=rects[tidy.item]||rects.rug||[70,105,40,20];return {x:r[0]+r[2]/2,feet:Math.min(135,Math.max(100,r[1]+r[3]+8)),scale:.85,interaction:{kind:'gentle',item:tidy.item,acting:true,at:tidy.at},enriched:{kind:'tidy'}};}
 if(e?.session?.until>now){const p=toyPosition(e.session,rects,now,reduced),kind=e.session.kind;const k=reduced?1:1-Math.exp(-Math.max(0,now-e.session.at)/700);return {x:(e.session.petX??96)+(clamp(p.x-14,20,172)-(e.session.petX??96))*k,feet:(e.session.petY??130)+(clamp(p.y+10,103,136)-(e.session.petY??130))*k,scale:.94,interaction:{kind:'play',item:'toy',acting:true,at:e.session.at},enriched:{kind,point:p}};}
 const touch=e?.touch;if(touch?.until>now)return {x:96,feet:133,scale:1.05,interaction:{kind:touch.kind==='tickle'?'dance':'outfit',item:'front',acting:true,at:touch.at},enriched:{kind:touch.kind}};
 // Quiet weather moments have their own time window; no obligation or penalty.
 if(!s.lively)return null;const slot=ambientSlot(s,now);if(slot?.lane!=='weather')return null;if(s.living?.motion?.until>now||s.living?.reaction?.until>now||s.journal?.gesture?.until>now)return null;
 const weather=weatherAt(now).id,r=rects.window||[14,8,43,43],kind=weather==='sun'?'warmSpot':weather==='rain'?'raindrops':weather==='storm'?'listenRain':'cloudWatch';
 return {x:weather==='sun'?80:r[0]+r[2]/2,feet:weather==='sun'?130:103,scale:.8,interaction:{kind:weather==='sun'?'nest':'watch',item:'window',acting:true,at:slot.at},enriched:{kind}};
}
// Small species-specific motion accents for active room interactions only.
export function speciesRoomAccent(species,kind,item,now){
 if(!['play','jump','stretch','roll','dance','splash','sniff','search','read','drink','nest'].includes(kind))return {x:0,feet:0,scale:1};
 const beat=Math.sin(now/300),bounce=Math.abs(beat);
 switch(species){
  case 'chicken': return {x:beat*1.5,feet:-bounce*2,scale:1};
  case 'cat': return {x:beat*2,feet:-bounce*1.5,scale:1};
  case 'corgi': return {x:beat*2.5,feet:-bounce*2,scale:1};
  case 'frog': return {x:0,feet:-bounce*4,scale:1};
  case 'bear': return {x:beat*1.5,feet:0,scale:1};
  case 'dog': return {x:beat*1.5,feet:-bounce,scale:1};
  case 'dino': return {x:beat,feet:bounce*1.5,scale:1};
  case 'bunny': return {x:0,feet:-bounce*5,scale:1};
  case 'pig': return {x:beat*2,feet:item==='rug'?-bounce*2:0,scale:1};
  case 'sheep': return {x:beat*2,feet:-bounce,scale:1};
  case 'fox': return {x:beat*3,feet:-bounce,scale:1};
  case 'monkey': return {x:beat*3,feet:item==='shelf'?-bounce*3:0,scale:1};
  case 'duck': return {x:beat*2,feet:-bounce,scale:1};
  case 'penguin': return {x:beat*4,feet:0,scale:.98};
  default: return {x:0,feet:0,scale:1};
 }
}
export function enrichPose(s,pose,now=Date.now(),reduced=false){if(pose?._enriched)return pose;if(!s||!pose||s.dead||s.sleeping||s.napping||s.vacation)return pose;const p={...pose,_enriched:true},mood=moodOf(s);p.enriched={...p.enriched,mood};if(reduced)return p;
 if(mood==='springy'&&p.enriched?.point&&!p.interaction?.approaching)p.feet-=Math.max(0,Math.sin(now/400))*1.5;
 if(mood==='sleepy')p.scale*=.97;
 const active=p.interaction?.acting&&['play','jump','stretch','roll','dance','splash'].includes(p.interaction.kind)||p.enriched?.point;if(active){const gait=speciesMotions[s.species];p.enriched.gait=gait;if(gait==='hop'||gait==='earHop')p.feet-=Math.abs(Math.sin(now/240))*6;if(gait==='slide'){p.x=clamp(p.x+Math.sin(now/600)*6,40,152);p.scale*=.88;}if(gait==='hang'&&p.interaction?.item==='post'){p.feet=133;p.x=clamp(p.x,24,168);p.scale*=.55;}if(gait==='stomp')p.feet+=Math.abs(Math.sin(now/240))*2;}
 if(p.interaction?.acting&&!p.interaction?.approaching){
  const a=speciesRoomAccent(s.species,p.interaction.kind,p.interaction.item,now);
  const feeling=p.interaction.emotionStyle;
  // Emotional expression changes the intensity, never the intended object or route.
  const weight=feeling==='comfort'?.35:feeling==='tired'?.2:feeling==='explore'?.8:1;
  p.x=clamp(p.x+a.x*weight,20,172);
  p.feet=clamp(p.feet+a.feet*weight,80,136);
  p.scale*=a.scale;
  if(feeling==='comfort'||feeling==='tired')p.scale*=.98;
  p.enriched.emotionStyle=feeling||null;
 }
 return p;
}
export function noteHomeScene(s,gap,now=Date.now()){
 if(!roomAvailable(s,now)||!Number.isFinite(gap)||gap<5*60000)return null;const e=ensureEnrichment(s),items=[['shelf','read'],['toy','play'],['plant','sniff'],['bed','nest']].filter(([id])=>s.room?.[id]||s.cozy?.owned?.[id]);if(!items.length)return null;const [item,kind]=items[stableHash(s.id+Math.floor(now/60000))%items.length];
 e.home={item,kind,x:item==='shelf'?110:item==='plant'?155:65,feet:item==='shelf'?101:124,at:now,until:now+11000};return {read:'О! Ти вже тут? Я читав. Догори дриґом теж рахується.',play:'О, моя людина! Дивися, що я розіграв без тебе.',sniff:'Ти прийшов! Я саме перевіряв зеленого сусіда.',nest:'А? О! Я беріг тобі найтепліше місце.'}[kind];
}
export function drawEnrichment(c,s,pose,rects={},now=Date.now(),reduced=false){
 if(!s||s.dead||s.vacation||s.world?.walk?.expires>now)return;const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);},e=s.living?.enrichment;
 for(const t of pose?[]:e?.traces||[]){if(t.until<=now)continue;const a=rects[t.item]||rects.rug||[70,105,40,20],x=a[0]+a[2]/2,y=t.kind==='book'?132:Math.min(137,a[1]+a[3]);
 if(t.kind==='wet')for(let i=0;i<4;i++){r(x-6+i*5,y+2-i%2*3,4,2,'#9cbfc1');r(x-5+i*5,y-1-i%2*3,2,2,'#b5cfd0');}
 if(t.kind==='blanket'){r(x-13,y-13,27,6,'#c0a4c8');r(x+6,y-7,10,12,'#a98fb4');r(x-10,y-12,18,1,'#eadbcf');}
 if(t.kind==='pillow'){r(x-9,y-9,20,8,'#c2accb');r(x-6,y-11,14,3,'#e2cbdc');}
 if(t.kind==='book'){r(x-8,y+2,17,9,'#eee0bb');r(x,y+2,1,9,'#9f8266');r(x-6,y+4,4,1,'#8d9679');r(x+3,y+6,4,1,'#8d9679');}
 if(['leaves','toys','fur','thread'].includes(t.kind))for(let i=0;i<4;i++)r(x-10+i*7,y+3-i%2*4,4,2,t.kind==='leaves'?'#7e9d65':t.kind==='thread'?'#b196bf':'#b09ac0');
 }
 if(!pose)return;const v=pose.enriched||{},x=pose.x,y=pose.feet,beat=reduced?0:Math.floor(now/200)%3;
 if(v.kind==='warmSpot'){for(let i=0;i<5;i++)r(41+i*6,110+i*2,48-i*3,4,'#efd98b33');}
 if(['raindrops','listenRain','cloudWatch'].includes(v.kind)){const a=rects.window||[14,8,43,43];if(v.kind==='cloudWatch'){r(a[0]+10,a[1]+14,19,4,'#e9e7d5');r(a[0]+14,a[1]+11,11,3,'#e9e7d5');}else for(let i=0;i<4;i++)r(a[0]+8+i*7,a[1]+16+(i+beat)%3*7,1,5,'#94b8c5');if(v.kind==='listenRain'){r(x-15,y-16,30,11,'#b4a1c4');r(x-12,y-14,24,2,'#dac8de');}}
 if(v.kind==='home'&&v.noticing){r(x+18,y-50,2,7,'#a58961');r(x+18,y-41,2,2,'#a58961');}
 if(v.kind==='tidy'){for(let i=0;i<3;i++){r(x-16+i*14,y-28-i%2*8,1,5,'#e6d39e');r(x-18+i*14,y-26-i%2*8,5,1,'#e6d39e');}}
 if(v.kind==='nose'){r(x+14,y-42,2,6,'#bc8c85');r(x+14,y-34,2,2,'#bc8c85');}
 if(v.kind==='stroke'||v.kind==='tickle'){for(let i=0;i<2;i++){const a=x-20+i*35,b=y-42-beat*2;r(a,b,3,3,'#c18398');r(a+5,b,3,3,'#c18398');r(a,b+3,8,3,'#c18398');r(a+2,b+6,4,2,'#c18398');}}
 const run=e?.session;if(run?.until>now&&v.point){const p=v.point;
 if(run.kind==='ball'||run.kind==='yarn'){if(run.kind==='yarn'){const length=clamp(run.turn*4,6,42);for(let i=0;i<length;i++)r(p.x-i,p.y+Math.sin(i/4)*2,1,1,'#b99ac4');}if(run.kind!=='ball'||!drawToyVariant(c,s,p.x-5,p.y-7,10,10)){r(p.x-5,p.y-7,10,9,run.kind==='yarn'?'#b397c1':'#a8b98e');r(p.x-3,p.y-5,6,1,'#e4dbbf');r(p.x-1,p.y-6,1,7,'#e4dbbf');}}
 if(run.kind==='feather'){r(p.x,p.y-10,1,20,'#a78d66');for(let i=0;i<5;i++){r(p.x-4+i%2,p.y-10+i*3,8,2,'#bdabc9');}}
 if(run.kind==='sun'){r(p.x-5,p.y-3,11,7,'#f1df8e');r(p.x-2,p.y-7,2,16,'#f1df8e');r(p.x-8,p.y,17,1,'#fff1b5');}
 if(run.kind==='duck'){r(p.x-7,p.y-3,13,6,'#e3c76e');r(p.x+2,p.y-7,6,6,'#efd681');r(p.x+8,p.y-4,4,2,'#cf9455');r(p.x+5,p.y-6,1,1,'#415a4e');for(let i=0;i<2;i++)r(p.x-12-i*3,p.y+5+i*3,24+i*6,1,'#a3c9cb');}
 c.fillStyle='#496344';c.font='bold 6px monospace';c.fillText((run.rounds||0)+' ♥ · '+run.hits+'/5',5,142);
 }
 const gait=v.gait;if(gait){if(['root','scratch','stomp','slide','earHop','hop'].includes(gait))for(let i=0;i<3;i++)r(x-17+i*14,y+3+i%2*2,3,1,gait==='slide'?'#afd3d5':'#b89b70');if(['paddle','fluff','wag','sway','pounce','prowl','hang','graze'].includes(gait))for(let i=0;i<2;i++)r(x-17+i*31,y-14-beat*2,2,5,['paddle'].includes(gait)?'#a1c6cb':'#d2be91');}
 if(v.mood==='sulky'){c.fillStyle='#8b9b87';c.font='bold 7px monospace';c.fillText('…',x+15,y-39);}if(v.mood==='sleepy'){c.fillStyle='#8c81a1';c.font='7px monospace';c.fillText('z',x+15,y-38-beat);}
}
export function transformEnriched(c,s,pose,paint,now=Date.now(),reduced=false){const gait=pose.enriched?.gait,kind=pose.enriched?.kind;if(reduced||(!gait&&!kind&&pose.enriched?.mood!=='sulky')){paint();return;}const age=s.portraitStage||stage(s,now),factor=age==='Малюк'?.4:age==='Дитина'?.64:age==='Підліток'?.84:1,pivot=['slide','hang'].includes(gait)?pose.feet-35*pose.scale*factor:pose.feet;c.save();c.translate(pose.x,pivot);const t=Math.sin(now/210);
 if(gait==='slide')c.rotate(Math.PI*.32);if(gait==='hang'&&pose.interaction?.item==='post')c.rotate(Math.PI);if(gait==='root')c.rotate(.14+t*.04);if(gait==='graze')c.rotate(.06+Math.sin(now/580)*.025);if(gait==='paddle')c.rotate(t*.07);if(gait==='sway')c.rotate(t*.025);if(gait==='wag')c.rotate(t*.055);if(gait==='prowl'){c.rotate(t*.035);c.scale(1.04,.96);}if(gait==='fluff')c.scale(1+Math.abs(t)*.04,1-Math.abs(t)*.03);if(gait==='pounce')c.scale(1-Math.abs(t)*.035,1+Math.abs(t)*.05);if(gait==='scratch')c.rotate(t*.07);if(pose.enriched?.mood==='sulky'&&Math.floor(now/1800)%3!==0)c.scale(-1,1);if(kind==='tickle')c.rotate(t*.12);if(kind==='stroke')c.scale(1.02,.98);
 c.translate(-pose.x,-pivot);paint();c.restore();}
