import test from 'node:test';
import assert from 'node:assert/strict';
import {selectIdleSpeech} from '../public/idle-speech.js';
import {readFileSync} from 'node:fs';
const clock=1800000000000;
function harness(overrides={},options={}){
 const calls=[];
 const values={introHint:null,wakeStory:null,relationshipHint:null,needs:null,roomMoment:null,ambient:null,dailyHint:null,ritualHint:null,routineHint:null,chooseDialogue:'normal'};
 const d={};
 for(const key of Object.keys(values))d[key]=s=>{calls.push(key);const value=overrides[key]??values[key];return typeof value==='function'?value(s):value;};
 d.roomLine=(_s,item)=>{calls.push('roomLine:'+item);return 'scene '+item;};
 d.line=(kind,_species)=>{calls.push('line:'+kind);return kind;};
 d.clothes=[{id:'coat',name:'Плащ'}];d.online=options.online??false;
 d.save=()=>{calls.push('save');};
 d.now=()=>{calls.push('now');return options.now??clock;};
 const numbers=[...(options.random??[.9,.9,.9,.9])];
 d.random=()=>{calls.push('random');return numbers.shift()??.9;};
 return {d,calls};
}
function select(s,h){return selectIdleSpeech(s,h.d);}
test('critical intro, vacation and sleep speech override all background reactions',()=>{
 const s={species:'cat',hunger:80,clean:80};
 for(const [pet,changes,expected] of [
  [s,{introHint:'Вітаю!'},'Вітаю!'],
  [{...s,vacation:true},{},'Відпочиваю в готелі. Твої обійми заброньовані.'],
  [{...s,sleeping:true},{},'Хрр… обійми… хрр…'],
  [{...s,napping:true,world:{dream:{title:'Квітка'}}},{},'Сниться: Квітка…']
 ]){const h=harness(changes);assert.equal(select(pet,h),expected);assert.deepEqual(h.calls,['introHint']);}
});
test('wake story saves only offline, retains priority and suppresses random dialogue',()=>{
 const s={species:'cat',hunger:20,clean:20};
 for(const online of [false,true]){
  const h=harness({wakeStory:'Прокинувся!'}, {online});
  assert.equal(select(s,h),'Прокинувся!');
  assert.deepEqual(h.calls,online?['introHint','wakeStory']:['introHint','wakeStory','save']);
 }
});
test('recent dream and clothes comments retain strict expiry boundaries',()=>{
 const baseline={species:'cat',hunger:70,clean:70};
 const recentDream={...baseline,world:{wakeStoryPending:false,lastDream:{wokeAt:clock-29999,text:'Мені наснилась зоря'}}};
 const h=harness();assert.equal(select(recentDream,h),'Мені наснилась зоря');
 const expiredDream={...baseline,world:{wakeStoryPending:false,lastDream:{wokeAt:clock-30000,text:'Старий сон'}}};
 assert.equal(select(expiredDream,harness()),'normal');
 const recentlyChanged={...baseline,cozy:{lastRemoved:{at:clock-119999,id:'coat'}}};
 assert.equal(select(recentlyChanged,harness()),'Зняв плащ. Мені незручно. Давай іншу річ?');
 assert.equal(select({...baseline,cozy:{lastRemoved:{at:clock-120000,id:'coat'}}},harness()),'normal');
});
test('relationship and urgent needs precede spontaneous room, music and habits',()=>{
 const pet={species:'cat',hunger:70,clean:70};
 const pair=harness({relationshipHint:'Тут тепло',needs:{text:'Їжа'}});
 assert.equal(select(pet,pair),'Тут тепло');
 assert.equal(pair.calls.includes('roomMoment'),false);
 const urgent=harness({needs:{text:'Їжа'},roomMoment:{auto:true,item:'bed'}});
 assert.equal(select(pet,urgent),'Їжа');
 assert.equal(urgent.calls.includes('random'),false);
});
test('automatic room and ambience use the old probability thresholds and lazy draws',()=>{
 const s={species:'cat',hunger:60,clean:60};
 const room=harness({roomMoment:{auto:true,item:'bed'},ambient:{text:'Танцюю',kind:'dance'}},{random:[.69]});
 assert.equal(select(s,room),'scene bed');
 assert.deepEqual(room.calls.filter(x=>x==='random'),['random']);
 const active=harness({roomMoment:{auto:true,item:'bed'},ambient:{text:'Мурчу',kind:'hum'}},{random:[.70]});
 assert.equal(select(s,active),'Мурчу');
 assert.equal(active.calls.filter(x=>x==='random').length,1,'hum skips second random draw');
 const thought=harness({ambient:{text:'Міркую',kind:'thought'}},{random:[]});
 assert.equal(select(s,thought),'Міркую');
 const generic=harness({ambient:{text:'Погляд',kind:'other'}},{random:[.59]});
 assert.equal(select(s,generic),'Погляд');
 const missed=harness({ambient:{text:'Погляд',kind:'other'}},{random:[.60]});
 assert.equal(select(s,missed),'normal');
});
test('daily, ritual, routine, adventure and fallback hunger/clean speech retain exact order',()=>{
 const pet={species:'cat',hunger:80,clean:80};
 const daily=harness({dailyHint:'Пісня',ritualHint:'Ритуал'},{random:[.49]});
 assert.equal(select(pet,daily),'Пісня');
 const ritual=harness({dailyHint:'Пісня',ritualHint:'Ритуал'},{random:[.50,.29]});
 assert.equal(select(pet,ritual),'Ритуал');
 const routine=harness({routineHint:'Добраніч'});
 assert.equal(select(pet,routine),'Добраніч');
 const adventure=harness();
 assert.equal(select({...pet,adventure:true},adventure),'У мене маленька пригода! Заглянь у ◇.');
 const hunger=harness();
 assert.equal(select({...pet,hunger:24},hunger),'hungry');
 const clean=harness();
 assert.equal(select({...pet,clean:24},clean),'dirty');
 assert.equal(select(pet,harness()),'normal');
});
test('second needs check remains after background activity before low-stat fallback',()=>{
 const s={species:'cat',hunger:20,clean:20},h=harness({needs:()=>null});
 assert.equal(select(s,h),'hungry');
 assert.equal(h.calls.filter(x=>x==='needs').length,2);
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 const module=readFileSync(new URL('../public/idle-speech.js',import.meta.url),'utf8');
 assert.match(app,/function idleSpeech\(s\)\{return selectIdleSpeech\(/);
 assert.doesNotMatch(module,/document\.|window\.|localStorage|Math\.random\(|Date\.now\(/);
});
