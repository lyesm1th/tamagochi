import test from 'node:test';
import assert from 'node:assert/strict';
import {journalChoiceContent} from '../public/journal-choice-content.js';
import {readFileSync} from 'node:fs';
const journal={
 drawings:[{id:'a',title:'Мій дім',comment:'Дуже затишно'}],
 pinned:'a',marks:[{stage:'Малюк'},{stage:'Підліток'}],
 familyArt:true,quirk:{id:'warm',from:'Мама'},
 courage:{rain:3,bath:1,hello:0},together:false,
 dreamRun:{hits:2}
};
const deps={quirkNames:{warm:'Лагідність'},fearNames:{rain:'Дощ',bath:'Вода',hello:'Знайомство'},dreamTheme:()=>({title:'СОН ПРО ЗІРКИ',hint:'Стрибай до зірок'})};
const state={sleeping:true,napping:false};
const view=(mode,choice=0,j=journal,s=state)=>journalChoiceContent(mode,s,choice,j,deps);
test('drawings retain title, pinned status, and empty-state text verbatim',()=>{
 assert.deepEqual(view('drawings',1),{title:'Мій дім',detail:'«Дуже затишно»\nВисить у кімнаті. ОК — зняти.\n← → малюнки · окрема кнопка — зберегти PNG.'});
 assert.match(view('drawings',2).detail,/ОК — попросити новий малюнок/);
 assert.match(view('drawings',1,{...journal,pinned:null}).detail,/ОК — повісити на стіну/);
});
test('keepsakes and inherited quirks match the prior content',()=>{
 assert.deepEqual(view('keepsakes'),{title:'КІМНАТА ДОРОСЛІШАЄ ЗІ МНОЮ',detail:'Позначки зросту: Малюк → Підліток\nМалюнків: 1 · є сімейний малюнок.\nНа улюбленій іграшці з’являються латки після спільних ігор.'});
 assert.match(view('quirks').detail,/Успадковано від Мама/);
 assert.match(view('quirks',0,{...journal,quirk:{id:'warm',from:null}}).detail,/першого покоління/);
});
test('courage shows correct fear and completed or unfinished guidance',()=>{
 assert.equal(view('courage',0).title,'СМІЛИВІСТЬ: ДОЩ');
 assert.match(view('courage',0).detail,/Довіра: 3\/3\nМи вже впорались/);
 assert.match(view('courage',1).detail,/Довіра: 1\/3\nОК — один спокійний крок/);
 assert.equal(view('courage',2).title,'СМІЛИВІСТЬ: ЗНАЙОМСТВО');
});
test('together mode and all dream states retain exact state-dependent text',()=>{
 assert.equal(view('together').title,'ПРОСТО ПОБУТИ ПОРУЧ');
 assert.match(view('together').detail,/ОК — сісти поруч/);
 assert.match(view('together',0,{...journal,together:true}).detail,/Я тут. Без таймера/);
 assert.deepEqual(view('dreamgame'),{title:'СОН ПРО ЗІРКИ',detail:'Стрибай до зірок\n← → хмаринка · ОК стрибок · 2/5. Без штрафів.'});
 assert.match(view('dreamgame',0,{...journal,dreamRun:null}).detail,/Пет продовжить відпочивати/);
 assert.match(view('dreamgame',0,journal,{sleeping:false,napping:false}).detail,/Пет зараз не спить/);
 assert.equal(view('dreamgame',0,journal,{sleeping:false,napping:true}).title,'СОН ПРО ЗІРКИ');
});
test('journal helper does not mutate game state, and unknown modes leave old DOM untouched',()=>{
 const before=JSON.stringify(journal);
 assert.equal(view('wallet'),null);
 view('drawings',1);view('courage',0);view('dreamgame');
 assert.equal(JSON.stringify(journal),before);
 const source=readFileSync(new URL('../public/journal-choice-content.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/document\.|localStorage|window\.|Date\.now\(/);
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.ok(app.includes('journalChoiceContent(mode,state,choice,j,{quirkNames,fearNames,dreamTheme})'));
 assert.ok(app.includes('renderJournalCanvas(cv)'));
});
