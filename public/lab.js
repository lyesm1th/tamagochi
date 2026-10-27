import {species} from './game.js';
import {labPet,labAges,labMoment} from './lab-state.js';
import {emotionNames,emotionOf} from './emotions.js';
import {emotionLine} from './emotion-dialogue.js';
import {loadDetailedAssets,drawDetailedMain} from './detailed-renderer.js';
import {drawClassicActor} from './classic-actor.js';
import {roomRects,roomMomentPose,itemMoves} from './room-life.js';
import {itemDesigns} from './item-designs.js';
import {detailedPhysicalPlacement} from './detailed-renderer.js';
import {frameDifference} from './lab-frames.js';
import {drawExpandedRoom} from './cozy-effects.js';
const $=id=>document.getElementById(id),canvas=$('scene'),base=Date.now();let elapsed=0,playing=true,ready=false,last=performance.now(),pet,moment,reference=null,pendingFrame=false;
function options(id,rows,value){for(const [v,label]of rows){const option=document.createElement('option');option.value=v;option.textContent=label;$(id).append(option);}$(id).value=value;}
options('species',species.map(p=>[p.id,p.name]),'dino');options('age',labAges.map(a=>[a,a]),'Дорослий');options('emotion',Object.entries(emotionNames),'calm');
for(const [id,rows]of Object.entries({body:[['pajamas','Піжама'],['sweater','Светр'],['raincoat','Дощовик']],head:[['panama','Панама'],['crown','Корона']],neck:[['scarf','Шарфик'],['bow','Бантик']],eyes:[['glasses','Окуляри']]}))options(id,[['','Немає'],...rows],id==='body'?'pajamas':'');
const itemNames={bed:'Ліжко',tent:'Намет',bowl:'Миска',fountain:'Фонтанчик',mirror:'Дзеркало',toy:'Іграшка',shelf:'Поличка',cushion:'Подушка',rug:'Килимок',plant:'Рослина',post:'Стовпчик',toybox:'Скринька',lamp:'Лампа',curtains:'Фіранки',box:'Коробка',music:'Музика',laser:'Сонячний зайчик',window:'Вікно'};
const actionNames={jump:'Стрибки',doze:'Дрімота',peek:'Визирання',drink:'Пиття',splash:'Бризки',faces:'Кривляння',play:'Гра',read:'Читання',nest:'Вмощування',roll:'Перекочування',sniff:'Обнюхування',stretch:'Потягування',search:'Пошук',shadow:'Гра з тінню',dance:'Танець',watch:'Спостереження'};
options('item',[['','Без дії'],...Object.keys(itemMoves).filter(id=>id!=='ball').map(id=>[id,itemNames[id]||id])],'');
function itemOptions(){
 $('action').replaceChildren();$('variant').replaceChildren();
 const item=$('item').value;
 options('action',[[itemMoves[item]||'idle',actionNames[itemMoves[item]]||'Спокій'],...(item==='bed'?[['doze','Сон']]:[])],itemMoves[item]||'idle');
 options('variant',(item==='bed'?['Звичайне','М’яке','Хмаринка']:itemDesigns[item]?.map(v=>v.name)||['Оригінальний']).map((v,i)=>[String(i),v]),'0');
}
itemOptions();
$('reduced').checked=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches||false;
function schedule(){if(ready&&!pendingFrame){pendingFrame=true;requestAnimationFrame(loop);}}
function reset(){const values=Object.fromEntries(['species','age','body','head','neck','eyes','emotion','scenario','item','action','variant','condition','layout'].map(id=>[id,$(id).value]));values.sleeping=$('sleeping').checked;dirty=true;pet=labPet(values,base);moment=labMoment(values,base);elapsed=0;last=performance.now();schedule();}
function pause(value){dirty=true;playing=!value;$('pause').textContent=playing?'Пауза':'Продовжити';schedule();}
for(const id of ['species','age','body','head','neck','eyes','emotion','scenario','sleeping','action','variant','condition','layout'])$(id).addEventListener('change',reset);
$('item').onchange=()=>{itemOptions();reset();};
$('pause').onclick=()=>pause(playing);$('restart').onclick=()=>{dirty=true;elapsed=0;last=performance.now();schedule();};$('frame').onclick=()=>{pause(true);elapsed=Math.min(16000,elapsed+1000/60);};$('time').oninput=()=>{pause(true);elapsed=Number($('time').value);};
$('undress').onclick=()=>{for(const id of ['body','head','neck','eyes'])$(id).value='';reset();};
$('zoom').onchange=()=>{const z=Number($('zoom').value);canvas.style.width=384*z+'px';canvas.style.height=288*z+'px';};
$('capture').onclick=()=>{reference=canvas.getContext('2d').getImageData(0,0,384,288);$('compare').disabled=false;$('difference').textContent='Кадр запам’ятовано';};
$('compare').onclick=()=>{if(!reference)return;const current=canvas.getContext('2d').getImageData(0,0,384,288),result=frameDifference(reference.data,current.data);const out=$('comparison').getContext('2d'),pixels=out.createImageData(384,288);pixels.data.set(result.pixels);out.putImageData(pixels,0,0);$('comparison-view').hidden=false;$('difference').textContent=`Змінено ${result.changed} / ${384*288} пікселів`;};
$('save').onclick=()=>{const a=document.createElement('a');a.download=`ragotchi-${pet.species}-${$('emotion').value}-${Math.round(elapsed)}.png`;a.href=canvas.toDataURL('image/png');a.click();};
function render(){if(!ready)return;const now=base+elapsed,originalNow=Date.now;try{
 // Scope the renderer's existing wall-clock dependencies to this synchronous draw.
 Date.now=()=>now;
 const reduced=$('reduced').checked,pose=roomMomentPose(pet,moment,$('style').value,now,reduced)||{x:100,feet:129,scale:1,quiet:true};
 if($('style').value==='detailed')drawDetailedMain(canvas,pet,pet.species,elapsed,reduced,pose,null);
 else{canvas.width=384;canvas.height=288;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.save();c.scale(2,2);drawExpandedRoom(c,pet,elapsed,$('reduced').checked,now);c.translate(32,43);if(pet.portraitStage==='Яєчко'){c.fillStyle='#304d43';c.fillRect(52,43,24,31);c.fillRect(56,38,16,40);c.fillStyle='#fff0d1';c.fillRect(54,45,20,27);c.fillRect(58,40,12,36);c.fillStyle='#8db7a0';c.fillRect(58,52,4,4);}else drawClassicActor(c,pet.species,pet.portraitStage,species.find(p=>p.id===pet.species).color,elapsed,pet,$('reduced').checked);c.restore();}
 const placement=detailedPhysicalPlacement(pet,pose,now,reduced);
 $('geometry').textContent=JSON.stringify({time:Math.round(elapsed),phase:pose.interaction?.approaching?'approach':pose.interaction?.acting?'action':'idle',x:placement.x,feet:placement.feet,scale:placement.scale,layers:['room','actor',...(placement.occlusion?['foreground:'+placement.occlusion.item]:[]),'feedback','lighting']},null,2);
 if($('guides').checked){const c=canvas.getContext('2d');c.save();c.strokeStyle='#dd426e';c.fillStyle='#304d43';c.font='10px monospace';for(const [id,rect]of Object.entries(roomRects(pet,$('style').value))){const [x,y,w,h]=rect.map(v=>v*2);c.strokeRect(x,y,w,h);c.fillText(id,x,y+10);}c.restore();}
 const e=emotionOf(pet,now);$('status').textContent=pet.sleeping?'Сон · головний убір знято':`${emotionNames[e.kind]}${e.reason?' · '+e.reason:''}${emotionLine(pet,now)?'\n'+emotionLine(pet,now):''}`;
 }finally{Date.now=originalNow;}
 $('time').value=String(elapsed);$('clock').textContent=(elapsed/1000).toFixed(3)+' с';}
let dirty=true;
for(const id of ['reduced','style','guides'])$(id).onchange=()=>{dirty=true;schedule();};
function loop(t){pendingFrame=false;const dt=Math.min(100,t-last);last=t;if(playing&&ready){elapsed=Math.min(16000,elapsed+dt*(Number($('speed').value)||1));if(elapsed===16000)pause(true);}if(playing||dirty){render();dirty=false;}if(playing)schedule();}
reset();for(const id of ['pause','restart','frame','save'])$(id).disabled=true;
try{ready=await loadDetailedAssets();if(!ready)throw Error('assets');for(const id of ['pause','restart','frame','save'])$(id).disabled=false;schedule();}catch{$('status').textContent='Не вдалося завантажити графіку. Перезавантаж сторінку.';}
