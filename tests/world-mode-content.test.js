import test from 'node:test';
import assert from 'node:assert/strict';
import {worldModeContent} from '../public/world-mode-content.js';
import {readFileSync} from 'node:fs';
const clock=1800000000000;
const state={
 species:'cat',coins:10,lively:{found:{window:true}},living:{story:{step:1}},
 world:{rituals:[3,0],weatherSound:true,walk:null,activity:null,skills:{trick:3,groom:1}},
};
const worldPages=[['weather','Погода'],['walk','Прогулянки'],['activity','Заняття']];
const deps={
 worldPages,storyView:()=>({title:'Наша історія',steps:['початок','далі']}),
 ritualOptions:()=>['Танок','Обійми'],favoriteRitual:()=>0,
 weatherAt:()=>({name:'Сонце'}),walks:[{id:'park',name:'Парк',scene:'Гуляємо',choices:['Ліворуч','Праворуч']}],
 activities:[{id:'trick',name:'Трюк',hint:'Навчимося',},{id:'groom',name:'Догляд',hint:'Причешемось'}],
 groomName:()=> 'Почистити шерстку',
 activityStepText:(_s,a,step)=>'Рух '+a.id+' '+step,
 formNames:{cozy:'ЗАТИШНА ФОРМА'},careForm:()=> 'cozy',
 now:()=>clock,
};
const view=(mode,choice=0,s=state,peers=[],online=false)=>worldModeContent(mode,s,choice,online,peers,deps);
test('secrets and sandbox preserve found flags, social labels and offline text',()=>{
 assert.deepEqual(view('secrets'),{title:'СЕКРЕТИ КІМНАТИ',detail:'Постукати у вікно · ЗНАЙДЕНО\nОК — дослідити. Деякі секрети люблять кілька дотиків.'});
 assert.match(view('secrets',1).detail,/ · \?\?\?/);
 assert.equal(view('sandbox').title,'СПІЛЬНА ПІСОЧНИЦЯ');
 assert.equal(view('sandbox').detail,'Відкрий гру через Telegram, щоб зустріти реальних петів.');
 assert.equal(view('sandbox',0,state,[],true).detail,'Поки тут тільки ми. Чекаємо інших гравців…');
 const pet={name:'Пух',relationship:4};
 assert.equal(view('sandbox',1,state,[pet],true).detail,'Пух ♡ · Пограти разом\n← → друг і дія · ОК · ↶ додому');
});
test('stories and world list retain exact titles, steps and destination numbering',()=>{
 assert.deepEqual(view('stories'),{title:'НАША МАЛЕНЬКА ІСТОРІЯ',detail:'Наша історія\nдалі\nОК — подбати / продовжити'});
 assert.deepEqual(view('world',1),{title:'МАЛЕНЬКИЙ СВІТ · 2/3',detail:'▶ Прогулянки\n← → обрати · ОК зайти'});
});
test('ritual and weather preserve earned status and weather sound wording',()=>{
 assert.deepEqual(view('ritual'),{title:'Танок',detail:'Разом робили: 3 · НАШ УЛЮБЛЕНИЙ ♡\nОК — зробити разом · ← → інший ритуал'});
 assert.equal(view('ritual',1).detail,'Разом робили: 0\nОК — зробити разом · ← → інший ритуал');
 assert.equal(view('weather').title,'Сонце за вікном');
 assert.match(view('weather').detail,/Звук: увімкнено · ОК перемкнути/);
 assert.match(view('weather',0,{...state,world:{...state.world,weatherSound:false}}).detail,/Звук: вимкнено/);
});
test('walk expiry and activity progression keep strict comparison and labels',()=>{
 assert.equal(view('walk').title,'Парк');
 const trip={...state,world:{...state.world,walk:{expires:clock+1,place:'park'}}};
 assert.equal(view('walk',1,trip).detail,'Гуляємо\n▶ Праворуч\nОК — обрати');
 assert.equal(view('walk',0,{...state,world:{...state.world,walk:{expires:clock,place:'park'}}}).title,'Парк');
 const active={...state,world:{...state.world,activity:{expires:clock+1,kind:'groom',step:1}}};
 assert.equal(view('activity',0,active).title,'Почистити шерстку · 2/3');
 assert.match(view('activity',0,active).detail,/Рух groom 1\nЗавершено разом: 1\nОК — наступний рух/);
 assert.match(view('activity').detail,/трюк: вивчено\nОК — почати/);
 assert.equal(view('activity',0,{...state,world:{...state.world,activity:{expires:clock,kind:'groom',step:1}}}).title,'Трюк');
});
test('dream and form descriptions preserve all variants and unknown mode is no-op',()=>{
 assert.equal(view('dreams').title,'СНИ ДРУГА');
 assert.match(view('dreams').detail,/Засни хоча б на дві хвилини/);
 assert.equal(view('dreams',0,{...state,world:{dream:{title:'Зірка'}}}).detail,'Зірка');
 assert.equal(view('dreams',0,{...state,world:{lastDream:{title:'Хмара',text:'Було затишно'}}}).detail,'Хмара\n«Було затишно»');
 assert.equal(view('forms').title,'ЗАТИШНА ФОРМА');
 assert.match(view('forms').detail,/Доросла форма закріплюється при дорослішанні/);
 assert.equal(view('invalid'),null);
});
test('render code keeps original repeated paints and pure content has no DOM',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 const mod=readFileSync(new URL('../public/world-mode-content.js',import.meta.url),'utf8');
 assert.match(app,/if\(mode==='secrets'\|\|mode==='stories'\)/);
 assert.match(app,/if\(mode==='sandbox'\).*drawSandbox\(portrait\)/);
 assert.match(app,/worldModeContent\(mode,state,choice,online,sandboxPets/);
 assert.doesNotMatch(mod,/document\.|localStorage|window\.|Math\.random\(|Date\.now\(/);
 const previous=JSON.stringify(state);
 view('walk');view('dreams');view('activity');
 assert.equal(JSON.stringify(state),previous);
});
