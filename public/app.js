import {species,fresh,act,tick,stage} from './game.js';
const $=s=>document.querySelector(s),tg=window.Telegram?.WebApp,online=!!tg?.initData;
try{tg?.ready();tg?.expand();tg?.setHeaderColor('#e9e3d7');tg?.setBackgroundColor('#e9e3d7');}catch{}
let state=null,selected='cat',busy=false,sound=false,bounce=0,game=null,lastSpeech=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function speak(t){$('#bubble').textContent=t;lastSpeech=Date.now();}
function beep(){if(!sound)return;try{const a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.value=660;o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.035,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.08);o.start();o.stop(a.currentTime+.09);o.onended=()=>a.close();}catch{}}
function save(){try{localStorage.setItem('hamagochi-v1',JSON.stringify(state));}catch{}}
async function api(path,body={}){const r=await fetch('/api/'+path,{method:'POST',headers:{'Content-Type':'application/json','X-Telegram-Init-Data':tg.initData},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(data.error||'Не вдалося зберегти. Спробуй ще.');return data;}
function pixel(ctx,x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function draw(canvas,id,frame=0,s=null,preview=false){const c=canvas.getContext('2d');c.clearRect(0,0,128,100);const ink='#35482e',light='#e8ecc3';const spec=species.find(p=>p.id===id)||species[1];
 let y=(preview||reduced?0:Math.sin(frame/270)*2)-Math.max(0,bounce);c.save();c.translate(0,Math.round(y));
 const r=(x,y,w,h,col=ink)=>pixel(c,x,y,w,h,preview?col:(col===ink?ink:col===light?light:'#7c8c5a'));const box=(x,y,w,h,col)=>{r(x-2,y, w+4,h);r(x,y-2,w,h+4);r(x,y,w,h,col);};
 if(s?.dead){r(46,51,36,27);r(51,43,26,12);r(61,49,5,20,light);r(55,55,17,5,light);c.restore();return;}
 if(s&&stage(s)==='Яєчко'&&!preview){box(51,39,26,34,light);r(55,34,18,5,ink);r(56,39,16,8,light);r(52,57,8,5);r(68,48,7,6);r(61,65,6,5);if(frame%2000<500)r(62,48,3,14);c.restore();return;}
 const body='#7c8c5a';
 if(id==='bunny'){box(46,18,9,25,body);box(69,15,9,28,body);r(49,21,3,17,'#bd8293');r(72,18,3,18,'#bd8293');}
 if(id==='cat'){r(43,29,13,19);r(70,29,13,19);r(46,33,7,10,body);r(73,33,7,10,body);}
 if(id==='bear'||id==='dog'||id==='corgi'){box(40,32,id==='bear'?12:13,id==='bear'?12:25,body);box(76,32,12,id==='bear'?12:25,body);}
 if(id==='frog'){box(41,30,16,16,body);box(71,30,16,16,body);}
 if(id==='chicken'){r(54,27,7,14,'#a55339');r(63,24,7,16,'#a55339');r(69,29,6,11,'#a55339');}
 if(id==='dino'){r(80,38,7,8,'#4f7958');r(84,47,8,8,'#4f7958');r(87,58,8,8,'#4f7958');r(82,67,16,8);r(88,62,10,8,body);}
 box(43,40,40,29,body);box(47,65,33,14,body);
 if(['corgi','dog','bear','bunny'].includes(id)){r(53,52,21,16,light);r(57,67,14,10,light);}
 if(id==='corgi'){r(60,40,7,15,light);r(56,49,15,7,light);}
 if(id==='chicken'){r(59,54,11,7,'#b47e36');r(62,61,5,5,'#a55339');r(40,53,6,13,'#b7a044');r(81,53,6,13,'#b7a044');}
 if(id==='frog'){r(44,34,8,9,light);r(75,34,8,9,light);r(47,36,4,6);r(76,36,4,6);r(50,60,27,2);}
 const blink=s?.sleeping||(!preview&&frame%3900<150);if(id!=='frog'){if(blink){r(51,49,6,2);r(71,49,6,2);}else{r(52,47,4,6);r(72,47,4,6);r(52,47,1,1,light);r(72,47,1,1,light);}}
 if(id!=='chicken'&&id!=='frog'){r(62,56,5,3);r(59,61,3,2);r(67,61,3,2);r(62,63,5,2);}
 if(id==='cat'){r(37,56,11,2);r(80,56,11,2);r(38,61,9,2);r(81,61,9,2);}
 const step=preview||s?.sleeping||reduced?0:Math.floor(frame/350)%2*2;
 r(45,78,13,5+step);r(70,78,13,7-step);
 if(s?.sleeping){c.font='9px monospace';c.fillStyle=ink;c.fillText('z Z',88,26);}
 if(bounce>0){r(91,32,3,8,'#a55365');r(88,35,9,3,'#a55365');}
 c.restore();if(s?.poop){for(let i=0;i<s.poop;i++){pixel(c,20+i*13,83,10,5,ink);pixel(c,22+i*13,79,6,4,ink);pixel(c,24+i*13,76,2,3,ink);}}
}
function render(){const has=!!state;$('#adoption').hidden=has;$('#care').hidden=!has;$('#connection').textContent=online?'TG • SYNC':'DEMO • LOCAL';$('#save-info').textContent=online?'Прогрес зберігається на сервері та прив’язаний до твого Telegram.':'Це деморежим: прогрес зберігається лише в цьому браузері. У Telegram буде окремий серверний прогрес.';
 if(!has){$('#pet-name').textContent='ОБЕРИ СВОГО ДРУГА';return;}
 $('#pet-name').textContent=state.name;$('#age').textContent='DAY '+String(Math.floor((Date.now()-state.born)/86400000)+1).padStart(2,'0');$('#stage').textContent=state.dead?'НА ВЕСЕЛЦІ ♡':state.sleeping?'ТИХО, ВІН СПИТЬ':stage(state).toUpperCase();$('#coins').textContent='✦ '+state.coins;$('#level').textContent='LVL '+(Math.floor(state.xp/30)+1);$('#rebirth').hidden=!state.dead;
 $('#stats').replaceChildren();for(const [key,label] of [['hunger','Ситість'],['happy','Настрій'],['energy','Енергія'],['clean','Чистота'],['health','Здоров’я']]){const div=document.createElement('div');div.innerHTML=`<div class="stat-label"><span>${label}</span><span>${Math.round(state[key])}%</span></div><div class="bar"><i class="${state[key]<25?'low':''}" style="width:${state[key]}%"></i></div>`;$('#stats').append(div);}
 document.querySelectorAll('[data-action]').forEach(b=>b.disabled=busy||state.dead);
}
async function action(a){if(busy||!state)return;busy=true;render();try{const result=online?await api('action',{action:a}):act(state,a);if(result.state)state=result.state;if(!online)save();speak(result.error||result.text||'');if(!result.error){bounce=5;beep();try{tg?.HapticFeedback?.impactOccurred('light');}catch{}}}catch(e){speak(e.message);}finally{busy=false;render();}}
for(const s of species){const btn=document.createElement('button');btn.className='species-card'+(s.id===selected?' selected':'');btn.setAttribute('aria-pressed',s.id===selected);const cv=document.createElement('canvas');cv.width=128;cv.height=100;cv.setAttribute('aria-hidden','true');const label=document.createElement('span');label.textContent=s.name;btn.append(cv,label);draw(cv,s.id,0,null,true);btn.onclick=()=>{selected=s.id;document.querySelectorAll('.species-card').forEach(b=>{b.classList.toggle('selected',b===btn);b.setAttribute('aria-pressed',b===btn);});speak(s.nick+': «Чого вилупився? Забирай, поки я добрий.»');};$('#species').append(btn);}
$('#adopt').onclick=async()=>{if(busy)return;busy=true;$('#adopt').disabled=true;try{const name=$('#nickname').value.trim();if(online){const r=await api('adopt',{species:selected,name});state=r.state;speak(r.text);}else{state=fresh(selected);if(name)state.name=name;save();speak('Ну все, пиздець твоєму спокою. Я вдома.');}render();}catch(e){speak(e.message);}finally{busy=false;$('#adopt').disabled=false;}};
$('#pet-touch').onclick=()=>state?action('pet'):speak('Спочатку забери, потім лапай, нахаба.');
$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent=sound?'♫':'♪';$('#sound').setAttribute('aria-label',sound?'Вимкнути звук':'Увімкнути звук');beep();};$('#info').onclick=()=>$('#rules').showModal();$('#close-rules').onclick=()=>$('#rules').close();$('#collection').onclick=()=>speak(species.find(s=>s.id===state.species).name+' '+state.name+'. Твій маленький засранець. Ти тут обслуга.');
$('#rebirth').onclick=()=>{if(!state?.dead)return;state=null;if(!online)save();render();speak('Новий друг чекатиме тут. Старого пам’ятаємо ♡');};
function endGame(won){if(!game)return;clearTimeout(game.timer);game=null;$('#mini-game').hidden=true;document.querySelector('[data-action="play"]').disabled=false;if(won)action('play');else speak('Тебе жук наїбав. ЖУК, бляха.');}
function moveBug(){$('#bug').style.left=Math.floor(Math.random()*75)+'%';$('#bug').style.top=Math.floor(Math.random()*95)+'px';}
$('#bug').onclick=()=>{if(!game)return;game.hits++;beep();$('#game-count').textContent=game.hits+'/5';if(game.hits>=5)endGame(true);else moveBug();};
for(const btn of document.querySelectorAll('[data-action]'))btn.onclick=()=>{const a=btn.dataset.action;if(a!=='play')return action(a);if(game||busy)return;if(state.sleeping||state.energy<12)return action('play');game={hits:0,timer:setTimeout(()=>endGame(false),10000)};$('#mini-game').hidden=false;$('#game-count').textContent='0/5';btn.disabled=true;moveBug();$('#mini-game').scrollIntoView({behavior:reduced?'instant':'smooth',block:'nearest'});};
async function load(){try{if(online){const r=await api('state');state=r.state;}else{try{const raw=JSON.parse(localStorage.getItem('hamagochi-v1'));if(raw&&species.some(s=>s.id===raw.species)&&['born','updated','hunger','happy','energy','clean','health','coins','xp'].every(k=>Number.isFinite(raw[k])))state=tick(raw);}catch{}}render();if(state)speak(state.dead?'Я чекав на тебе… На веселці тепло.':state.sleeping?'Тссс. Я сплю, не заїбуй.':'О, приперся. Я вже думав, ти здох без мене.');}catch(e){speak(e.message);$('#adopt').disabled=true;}}
let previous=0;function animate(t){if(t-previous>80){draw($('#pet'),state?.species||selected,t,state);bounce*=.65;previous=t;}requestAnimationFrame(animate);}requestAnimationFrame(animate);
setInterval(async()=>{if(!state||busy||game)return;if(online){try{const r=await api('state');state=r.state;}catch{return;}}else{state=tick(state);save();}render();if(Date.now()-lastSpeech>20000&&!state.dead){const lines=state.sleeping?['Хррр… пельмешки… хррр…']:state.hunger<25?['Жерти давай, довбню!','Миска порожня. Ти охуїв?']:state.clean<25?['Я насрав. Ти прибираєш. Ідеальні стосунки.','Прибери гівно, бляха. Тут уже своя цивілізація.']:['Ну ти й засранець. Але мій.','Чухай за вухом. Не там, рукожопе.','Маленькі лапки. Великий пиздець.','Люблю тебе, придурка. Нікому ні слова.'];speak(lines[Math.floor(Math.random()*lines.length)]);}},15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!busy&&!game)load();});load();

const picks=[...document.querySelectorAll('[data-pick]')];let picked=-1;
function selectPick(i){picked=i;picks.forEach((b,j)=>b.classList.toggle('active',j===i));$('#selected-action').textContent=i<0?'A — ВИБІР · B — ДІЯ · C — НАЗАД':picks[i].getAttribute('aria-label').toUpperCase()+' · НАТИСНИ B';beep();}
picks.forEach((b,i)=>b.onclick=()=>selectPick(i));
$('#button-a').onclick=()=>{if(!state){const index=species.findIndex(s=>s.id===selected);document.querySelectorAll('.species-card')[(index+1)%species.length].click();return;}selectPick((picked+1)%picks.length);};
$('#button-b').onclick=()=>{if(!state){$('#adopt').click();return;}if(picked<0){selectPick(0);return;}const id=picks[picked].dataset.pick;(id==='collection'?$('#collection'):document.querySelector('[data-action="'+id+'"]')).click();};
$('#button-c').onclick=()=>{if(game)endGame(false);selectPick(-1);if(state)speak('Ну й чого тицяєш? Я тобі не пульт, бляха.');};
