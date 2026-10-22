import {drawEffects} from './pet-effects.js';
import {drawYoungPet} from './young-pets.js';
import {species,fresh,act,tick,stage,line,life,temperament,care} from './game.js';
import {createSound} from './sound.js';
const $=s=>document.querySelector(s),tg=window.Telegram?.WebApp,online=!!tg?.initData;
try{tg?.ready();tg?.expand();tg?.setHeaderColor('#e9e3d7');tg?.setBackgroundColor('#e9e3d7');}catch{}
let effect=null;
let state=null,selected='cat',busy=false,bounce=0,game=null,lastSpeech=0,mode='normal',confirmYes=false,picked=0,loading=false,generation=0,choosingNew=false,remindersEnabled=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let savedSound=true;try{savedSound=localStorage.getItem('hamagochi-sound')!=='off';}catch{}
const audio=createSound(()=>new (window.AudioContext||window.webkitAudioContext)(),savedSound);
const menu=[['feed','♨','Годувати'],['sleep','☾','Сон / підйом'],['play','✥','Грати'],['medicine','✚','Ліки · 10'],['clean','≈','Прибрати'],['pet','♡','Погладити'],['discipline','!','Виховати'],['treat','✦','Смаколик · 5'],['status','▦','Мій друг'],['sound','♪','Звук'],['reminders','♧','Нагадування'],['rules','?','Правила'],['endLife','☠','Завершити життя']];
function speak(t){$('#bubble').textContent=t;lastSpeech=Date.now();}
function fail(t){speak(t);$('#error').textContent=t;$('#error').hidden=false;}
function beep(freq){return audio.beep(freq);}
function save(){try{localStorage.setItem('hamagochi-v1',JSON.stringify(state));}catch{}}
async function api(path,body={}){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{const r=await fetch('/api/'+path,{method:'POST',headers:{'Content-Type':'application/json','X-Telegram-Init-Data':tg.initData},body:JSON.stringify(body),signal:controller.signal});let data;try{data=await r.json();}catch{throw new Error('Сервер не відповів коректно. Спробуй ще раз.');}if(!r.ok)throw new Error(data.error||'Не вдалося зберегти. Спробуй ще.');if(data.reminders)remindersEnabled=data.reminders.enabled;return data;}catch(e){if(e.name==='AbortError')throw new Error('Сервер довго відповідає. Натисни ОК ще раз.');throw e;}finally{clearTimeout(timer);}}
function pixel(ctx,x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function drawBase(canvas,id,frame=0,s=null,preview=false){const c=canvas.getContext('2d');c.clearRect(0,0,128,100);const ink='#35482e',light='#e8ecc3';const spec=species.find(p=>p.id===id)||species[1];const age=s?stage(s):'Дорослий';
 let y=(preview||reduced?0:Math.sin(frame/270)*2)-Math.max(0,bounce);c.save();c.translate(0,Math.round(y));
 const r=(x,y,w,h,col=ink)=>pixel(c,x,y,w,h,col);const box=(x,y,w,h,col)=>{r(x-2,y, w+4,h);r(x,y-2,w,h+4);r(x,y,w,h,col);};
 if(s?.dead){r(46,51,36,27);r(51,43,26,12);r(61,49,5,20,light);r(55,55,17,5,light);c.restore();return;}
 if(s&&age==='Яєчко'&&!preview){
 const index=species.findIndex(p=>p.id===id),wobble=reduced||s.sleeping?0:Math.floor(frame/220)%3-1;c.translate(wobble,0);
 box(52,43,24,31,light);r(56,37,16,8,ink);r(57,39,14,7,light);r(49,53,3,15,ink);r(76,53,3,15,ink);
 r(55,51,5,5,spec.color);r(66,59,6,5,spec.color);r(56,67,4,4,spec.color);r(65+(index%3)*2,46,3,3,ink);r(57+(index%4)*3,61,3,3,spec.color);
 if((Date.now()-s.born)>life.egg-60000){r(62,48,3,7);r(59,55,3,4);r(62,59,3,5);r(65,64,3,5);}c.restore();return;}
 if(!preview&&(age==='Малюк'||age==='Дитина'||age==='Підліток')){drawYoungPet(c,id,age,spec.color,frame,s?.sleeping,reduced);c.restore();return;}
 const body=spec.color;
 if(id==='bunny'){box(46,18,9,25,body);box(69,15,9,28,body);r(49,21,3,17,'#bd8293');r(72,18,3,18,'#bd8293');}
 if(id==='cat'){r(43,29,13,19);r(70,29,13,19);r(46,33,7,10,body);r(73,33,7,10,body);}
 if(id==='bear'||id==='corgi'){box(40,32,id==='bear'?12:13,id==='bear'?12:25,body);box(76,32,12,id==='bear'?12:25,body);}
 if(id==='dog'){box(36,38,13,9,body);box(79,38,13,9,body);r(47,28,5,13,'#bfa36a');r(76,28,5,13,'#bfa36a');r(45,26,5,5,'#bfa36a');r(78,26,5,5,'#bfa36a');}
 if(id==='frog'){box(41,30,16,16,body);box(71,30,16,16,body);}
 if(id==='chicken'){r(54,27,7,14,'#a55339');r(63,24,7,16,'#a55339');r(69,29,6,11,'#a55339');}
 if(id==='dino'){r(80,38,7,8,'#4f7958');r(84,47,8,8,'#4f7958');r(87,58,8,8,'#4f7958');r(82,67,16,8);r(88,62,10,8,body);}
 box(43,40,40,29,body);box(47,65,33,14,body);
 if(['corgi','dog','bear','bunny'].includes(id)){r(53,52,21,16,light);r(57,67,14,10,light);}
 if(id==='dog'){r(44,41,12,9,ink);r(73,41,9,13,ink);r(49,69,10,8,ink);box(52,55,25,13,'#dc9ca4');r(57,59,3,4,ink);r(69,59,3,4,ink);}
 if(id==='corgi'){r(60,40,7,15,light);r(56,49,15,7,light);}
 if(id==='chicken'){r(59,54,11,7,'#b47e36');r(62,61,5,5,'#a55339');r(40,53,6,13,'#b7a044');r(81,53,6,13,'#b7a044');}
 if(id==='frog'){r(44,34,8,9,light);r(75,34,8,9,light);r(47,36,4,6);r(76,36,4,6);r(50,60,27,2);}
 const blink=s?.sleeping||(!preview&&frame%3900<150);if(id!=='frog'){if(blink){r(51,49,6,2);r(71,49,6,2);}else{r(52,47,4,6);r(72,47,4,6);r(52,47,1,1,light);r(72,47,1,1,light);}}
 if(id!=='chicken'&&id!=='frog'&&id!=='dog'){r(62,56,5,3);r(59,61,3,2);r(67,61,3,2);r(62,63,5,2);}
 if(id==='cat'){r(37,56,11,2);r(80,56,11,2);r(38,61,9,2);r(81,61,9,2);}
 const step=preview||s?.sleeping||reduced?0:Math.floor(frame/350)%2*2;
 r(45,78,13,5+step);r(70,78,13,7-step);
 
 if(bounce>0){r(91,32,3,8,'#a55365');r(88,35,9,3,'#a55365');}
 c.restore();
}
function draw(canvas,id,frame=0,s=null,preview=false){
 const sleeping=s&&(s.sleeping||s.napping),pet=s?{...s,sleeping}:s;
 drawBase(canvas,id,frame,pet,preview);
 if(preview||!s||s.dead)return;
 const c=canvas.getContext('2d'),age=stage(s);
 if(age!=='Яєчко'&&(age==='Підліток'||age==='Дорослий'||age==='Старенький')){
 if((s.adultCare??care(s))<50){c.fillStyle='#35482e';c.fillRect(51,43,7,2);c.fillRect(70,45,7,2);c.fillStyle='#e8ecc3';c.fillRect(62,64,3,5);c.fillStyle='#35482e';c.fillRect(59,36,3,5);c.fillRect(63,33,3,7);}
 if(age==='Дорослий'&&(s.adultCare??care(s))>=80){c.fillStyle='#c7a449';c.fillRect(59,28,14,3);c.fillRect(59,23,3,5);c.fillRect(65,21,3,7);c.fillRect(70,23,3,5);}
 if(age==='Старенький'){c.fillStyle='#c7c8bb';c.fillRect(53,39,20,5);c.fillRect(48,43,5,5);c.fillRect(74,43,5,5);c.strokeStyle='#35482e';c.lineWidth=1;c.strokeRect(49,46,11,9);c.strokeRect(69,46,11,9);c.fillStyle='#35482e';c.fillRect(60,50,9,1);}
 }
 drawEffects(c,s,age,effect,Date.now(),reduced);
}
function render(){const s=state,has=!!s;$('#adoption').hidden=has;$('#care').hidden=!has;$('#connection').textContent=online?'TG • SYNC':'DEMO • LOCAL';$('#confirm-panel').hidden=mode!=='confirm';$('#mini-game').hidden=mode!=='game';$('#pet-touch').hidden=mode==='confirm'||mode==='game';$('#rules').hidden=mode!=='rules';$('#save-info').textContent=online?'Прогрес прив’язаний до твого Telegram.':'Деморежим: прогрес зберігається в цьому браузері.';
 $('#pet-name').textContent=s?s.name:species.find(p=>p.id===selected).name;$('#age').textContent=s?'DAY '+String(Math.floor((Date.now()-s.born)/86400000)+1).padStart(2,'0'):'♡';$('#stage').textContent=s?(s.dead?'НА ВЕСЕЛЦІ ♡':(s.sleeping||s.napping)?'ТИХО, ВІН СПИТЬ':(stage(s)==='Яєчко'?'ЯЙЦЕ · '+Math.max(0,Math.ceil((s.born+life.egg-Date.now())/60000))+' ХВ':stage(s).toUpperCase())):'← → ОБРАТИ · ОК ЗАБРАТИ';$('#coins').textContent='✦ '+(s?.coins??20);
 $('#menu-icons').replaceChildren();for(let i=0;i<menu.length;i++){const el=document.createElement('span');el.textContent=menu[i][1];el.className=has&&i===picked?'active':'';el.setAttribute('aria-label',menu[i][2]);if(has&&i===picked)el.setAttribute('aria-current','true');$('#menu-icons').append(el);}
 document.querySelectorAll('.species-card').forEach((el,i)=>{el.classList.toggle('selected',species[i].id===selected);});
 $('#confirm-choice').textContent=confirmYes?'ТАК, ЗАВЕРШИТИ ЖИТТЯ':'НІ, ЗАЛИШИТИ';
 $('#selected-action').textContent=busy||loading?'ЗАЧЕКАЙ, У МЕНЕ ЛАПКИ…':mode==='confirm'?'← → ВИБІР · ОК ПІДТВЕРДИТИ':mode==='game'?'← → РУХ · ОК ЛОВИТИ · ↶ ВИХІД':mode==='rules'?'↶ ПОВЕРНУТИСЯ':!s?'← → '+species.find(p=>p.id===selected).name.toUpperCase()+' · ОК ЗАБРАТИ':s.dead?'ОК — ОБРАТИ НОВОГО ДРУГА':menu[picked][2].toUpperCase()+(menu[picked][0]==='sound'?(audio.enabled?' · УВІМК.':' · ВИМК.'):menu[picked][0]==='reminders'?(remindersEnabled?' · УВІМК.':' · ВИМК.'):'');
 for(const id of ['left','right','ok'])$('#button-'+id).disabled=busy||loading;
 $('#stats').replaceChildren();if(!s)return;$('#level').textContent='LVL '+(Math.floor(s.xp/30)+1);for(const [key,label] of [['hunger','Ситість'],['happy','Настрій'],['energy','Енергія'],['clean','Чистота'],['health','Здоров’я']]){const div=document.createElement('div');div.innerHTML=`<div class="stat-label"><span>${label}</span><span>${Math.round(s[key])}%</span></div><div class="bar"><i class="${s[key]<25?'low':''}" style="width:${s[key]}%"></i></div>`;$('#stats').append(div);}}
async function action(a){if(busy||!state)return;busy=true;generation++;$('#error').hidden=true;render();try{const result=online?await api('action',{action:a}):act(state,a);if(result.state)state=result.state;if(!online)save();speak(result.error||result.text||'');if(!result.error){bounce=5;effect={kind:a,started:Date.now(),until:Date.now()+(a==='pet'?2400:1800)};void audio.react(a==='sleep'?(state.sleeping?'sleep':'wake'):(a==='feed'||a==='treat')&&stage(state)==='Малюк'?'milk':a,state.species);try{tg?.HapticFeedback?.impactOccurred('light');}catch{}}}catch(e){fail(e.message);}finally{busy=false;render();}}
for(const s of species){const card=document.createElement('div');card.className='species-card';const cv=document.createElement('canvas');cv.width=128;cv.height=100;cv.setAttribute('aria-hidden','true');const label=document.createElement('span');label.textContent=s.name;card.append(cv,label);draw(cv,s.id,0,null,true);$('#species').append(card);}
async function adopt(){if(busy||loading)return;busy=true;generation++;$('#error').hidden=true;render();try{const name=$('#nickname').value.trim();if(online){const r=await api('adopt',{species:selected,name});state=r.state;speak(r.text);}else{state=fresh(selected);if(name)state.name=name;save();speak('У яйці хтось ворушиться. Годинник налаштовано, чекаємо 3 хвилини.');}choosingNew=false;picked=0;void audio.react('adopt',state.species);}catch(e){fail(e.message);}finally{busy=false;render();}}
function newFriend(){choosingNew=true;generation++;state=null;mode='normal';picked=0;if(!online)save();speak('Обирай нового друга. Для обіймів завжди є місце.');render();}
function move(direction){if(busy||loading)return;if(mode==='confirm'){confirmYes=!confirmYes;render();return;}if(mode==='game'){game.cursor=(game.cursor+direction+3)%3;renderGame();return;}if(mode==='rules')return;if(!state){const i=species.findIndex(s=>s.id===selected);selected=species[(i+direction+species.length)%species.length].id;speak(species.find(s=>s.id===selected).nick+': «Забирай. Я хороший. Майже.»');}else{picked=(picked+direction+menu.length)%menu.length;}render();}
async function ok(){if(busy||loading)return;if(mode==='confirm'){if(!confirmYes){mode='normal';speak('От і добре. Іди сюди, обійму.');render();return;}mode='normal';await action('endLife');return;}if(mode==='game'){catchBug();return;}if(mode==='rules'){mode='normal';render();return;}if(!state){await adopt();return;}if(state.dead){newFriend();return;}const a=menu[picked][0];if(a==='endLife'){mode='confirm';confirmYes=false;render();return;}if(a==='sound'){audio.enabled=!audio.enabled;try{localStorage.setItem('hamagochi-sound',audio.enabled?'on':'off');}catch{}if(audio.enabled){const played=await beep();if(!played)speak('Звук недоступний. Перевір гучність пристрою.');else speak('Пік! Тепер я ще й пищу.');}else speak('Тихенько бурчатиму без звуку.');render();return;}if(a==='reminders'){await toggleReminders();return;}if(a==='rules'){mode='rules';render();return;}if(a==='status'){speak(species.find(s=>s.id===state.species).name+' '+state.name+'. '+stage(state)+' · '+temperament(state)+'. Виховання: '+Math.round(state.discipline??70)+'%.');return;}if(a==='play'){if(state.sleeping||state.napping||stage(state)==='Яєчко'||state.energy<12){await action(a);return;}startGame();return;}await action(a);}
function back(){if(busy)return;if(mode==='game'){endGame(false,true);return;}if(mode!=='normal'){mode='normal';confirmYes=false;render();return;}picked=0;speak(state?'Я тут. Просто посидимо поруч?':'Обирай кнопками ← →, а потім натисни ОК.');render();}
for(const [id,handler] of [['left',()=>move(-1)],['right',()=>move(1)],['ok',ok],['back',back]]){$('#button-'+id).addEventListener('pointerdown',()=>{void audio.unlock();});$('#button-'+id).onclick=()=>{void audio.unlock();if(!(state&&mode==='normal'&&menu[picked][0]==='sound'&&id==='ok'))void beep();handler();};}
function renderGame(){if(!game)return;[...$('#lanes').children].forEach((s,i)=>s.textContent=i===game.bug?'✳':'·');[...$('#cursor-lanes').children].forEach((s,i)=>s.style.visibility=i===game.cursor?'visible':'hidden');$('#game-count').textContent=game.hits+'/5 · '+Math.max(0,Math.ceil((game.until-Date.now())/1000))+' с';}
function startGame(){mode='game';game={hits:0,cursor:1,bug:Math.floor(Math.random()*3),until:Date.now()+15000};game.timer=setInterval(()=>{if(Date.now()>=game.until)endGame(false);else renderGame();},250);render();renderGame();}
function catchBug(){if(!game)return;if(Date.now()>=game.until){endGame(false);return;}if(game.cursor===game.bug){game.hits++;beep(950);if(game.hits>=5){endGame(true);return;}game.bug=(game.bug+1+Math.floor(Math.random()*2))%3;}else{void audio.react('miss',state.species);speak('Трохи лівіше, сонечко. Або правіше.');}renderGame();}
function endGame(won,cancel=false){if(!game)return;clearInterval(game.timer);game=null;mode='normal';render();if(won)void action('play');else speak(cancel?'Перепочинемо. Жук нікуди не дінеться.':'Жук утік. Хитра зараза. Спробуємо ще?');}
async function load(){if(loading||busy||choosingNew)return;loading=true;const revision=generation;render();try{if(online){const r=await api('state');if(revision===generation)state=r.state;}else{try{const raw=JSON.parse(localStorage.getItem('hamagochi-v1'));if(raw&&species.some(s=>s.id===raw.species)&&['born','updated','hunger','happy','energy','clean','health','coins','xp'].every(k=>Number.isFinite(raw[k])))state=tick(raw);}catch{}}if(state)speak(state.dead?'На веселці тепло. ОК — обрати нового друга.':state.sleeping?'Тихенько. Я ще дрімаю.':'О, моя людина! Я зовсім трішки скучив.');}catch(e){fail(e.message);}finally{loading=false;render();}}
let previous=0;function animate(t){if(t-previous>80){draw($('#pet'),state?.species||selected,t,state);bounce*=.65;previous=t;}requestAnimationFrame(animate);}requestAnimationFrame(animate);
setInterval(async()=>{if(!state||busy||loading||mode!=='normal'||document.hidden)return;const revision=generation;if(online){try{const r=await api('state');if(revision!==generation||busy||mode!=='normal'||choosingNew)return;state=r.state;}catch{return;}}else{state=tick(state);save();}render();if(state&&!state.dead&&Date.now()-lastSpeech>25000)speak(state.sleeping?'Хрр… обійми… хрр…':line(state.hunger<25?'hungry':state.clean<25?'dirty':'idle'));},15000);
document.addEventListener('visibilitychange',()=>{if(document.hidden){void audio.suspend();if(game)endGame(false,true);}else if(!busy&&mode==='normal')void load();});render();void load();

let displayedStage=state?stage(state):null,displayedBorn=state?.born;
setInterval(()=>{if(!state||state.dead)return;const current=stage(state);if(displayedBorn===state.born&&displayedStage&&displayedStage!==current){speak(current==='Малюк'?'Трісь! Я вилупився. Де моя людина й обійми?':current==='Дитина'?'Я виспався й підріс. Дивися, які лапки!':current==='Підліток'?'Я вже підліток. Характер росте швидше за лапки.':current==='Старенький'?'Я вже старенький. Посидь зі мною, моя людино.':'Я дорослий! Але на ручки все одно хочу.');void audio.react('adopt',state.species);}displayedStage=current;displayedBorn=state.born;if(mode==='normal'&&!busy)render();},1000);

async function toggleReminders(){
 if(!online){speak('Нагадування доступні в Telegram. Відкрий гру з бота.');return;}
 if(busy)return;
 busy=true;render();try{
 if(!remindersEnabled){
 if(typeof tg.requestWriteAccess!=='function')throw new Error('Онови Telegram, щоб дозволити повідомлення від пета.');
 const allowed=await new Promise(resolve=>{const timeout=setTimeout(()=>resolve(false),60000);tg.requestWriteAccess(ok=>{clearTimeout(timeout);resolve(ok);});});
 if(!allowed){speak('Без дозволу не писатиму. Увімкнути можна пізніше.');return;}
 }
 const timezone=Intl.DateTimeFormat().resolvedOptions().timeZone||'Europe/Kyiv';
 const r=await api('reminders',{enabled:!remindersEnabled,timezone});speak(r.text);$('#error').hidden=true;
 }catch(e){fail(e.message);}finally{busy=false;render();}
}
