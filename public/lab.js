import {species} from './game.js';
import {labPet,labAges} from './lab-state.js';
import {emotionNames,emotionOf} from './emotions.js';
import {emotionLine} from './emotion-dialogue.js';
import {loadDetailedAssets,drawDetailedMain} from './detailed-renderer.js';
import {drawClassicActor} from './classic-actor.js';
import {drawExpandedRoom} from './cozy-effects.js';
const $=id=>document.getElementById(id),canvas=$('scene'),base=Date.now();let elapsed=0,playing=true,ready=false,last=performance.now(),pet;
function options(id,rows,value){for(const [v,label]of rows){const option=document.createElement('option');option.value=v;option.textContent=label;$(id).append(option);}$(id).value=value;}
options('species',species.map(p=>[p.id,p.name]),'dino');options('age',labAges.map(a=>[a,a]),'Дорослий');options('emotion',Object.entries(emotionNames),'calm');
for(const [id,rows]of Object.entries({body:[['pajamas','Піжама'],['sweater','Светр'],['raincoat','Дощовик']],head:[['panama','Панама'],['crown','Корона']],neck:[['scarf','Шарфик'],['bow','Бантик']],eyes:[['glasses','Окуляри']]}))options(id,[['','Немає'],...rows],id==='body'?'pajamas':'');
function reset(){const values=Object.fromEntries(['species','age','body','head','neck','eyes','emotion','scenario'].map(id=>[id,$(id).value]));values.sleeping=$('sleeping').checked;pet=labPet(values,base);elapsed=0;last=performance.now();}
function pause(value){playing=!value;$('pause').textContent=playing?'Пауза':'Продовжити';}
for(const id of ['species','age','body','head','neck','eyes','emotion','scenario','sleeping'])$(id).addEventListener('change',reset);
$('pause').onclick=()=>pause(playing);$('restart').onclick=()=>{elapsed=0;last=performance.now();};$('frame').onclick=()=>{pause(true);elapsed=Math.min(16000,elapsed+150);};$('time').oninput=()=>{pause(true);elapsed=Number($('time').value);};
$('undress').onclick=()=>{for(const id of ['body','head','neck','eyes'])$(id).value='';reset();};
$('zoom').onchange=()=>{const z=Number($('zoom').value);canvas.style.width=384*z+'px';canvas.style.height=288*z+'px';};
$('save').onclick=()=>{const a=document.createElement('a');a.download=`ragotchi-${pet.species}-${$('emotion').value}-${Math.round(elapsed)}.png`;a.href=canvas.toDataURL('image/png');a.click();};
function render(){if(!ready)return;const now=base+elapsed,originalNow=Date.now;try{
 // Scope the renderer's existing wall-clock dependencies to this synchronous draw.
 Date.now=()=>now;
 if($('style').value==='detailed')drawDetailedMain(canvas,pet,pet.species,elapsed,$('reduced').checked,{x:100,feet:129,scale:1,quiet:true},null);
 else{canvas.width=384;canvas.height=288;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.save();c.scale(2,2);drawExpandedRoom(c,pet,elapsed,$('reduced').checked,now);c.translate(32,43);if(pet.portraitStage==='Яєчко'){c.fillStyle='#304d43';c.fillRect(52,43,24,31);c.fillRect(56,38,16,40);c.fillStyle='#fff0d1';c.fillRect(54,45,20,27);c.fillRect(58,40,12,36);c.fillStyle='#8db7a0';c.fillRect(58,52,4,4);}else drawClassicActor(c,pet.species,pet.portraitStage,species.find(p=>p.id===pet.species).color,elapsed,pet,$('reduced').checked);c.restore();}
 const e=emotionOf(pet,now);$('status').textContent=pet.sleeping?'Сон · головний убір знято':`${emotionNames[e.kind]}${e.reason?' · '+e.reason:''}${emotionLine(pet,now)?'\n'+emotionLine(pet,now):''}`;
 }finally{Date.now=originalNow;}
 $('time').value=String(elapsed);$('clock').textContent=(elapsed/1000).toFixed(1)+' с';}
function loop(t){const dt=Math.min(100,t-last);last=t;if(playing&&ready){elapsed=Math.min(16000,elapsed+dt);if(elapsed===16000)pause(true);}render();requestAnimationFrame(loop);}
reset();for(const id of ['pause','restart','frame','save'])$(id).disabled=true;
try{ready=await loadDetailedAssets();if(!ready)throw Error('assets');for(const id of ['pause','restart','frame','save'])$(id).disabled=false;requestAnimationFrame(loop);}catch{$('status').textContent='Не вдалося завантажити графіку. Перезавантаж сторінку.';}
