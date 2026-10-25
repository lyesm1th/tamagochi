import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dailyChoiceContent} from '../public/daily-choice-content.js';
const deps={
 wishText:()=> 'Хочу пограти!',wishAnswers:['Так!','Пізніше','Не зараз'],
 treasures:[{id:'stone',name:'Камінець'},{id:'leaf',name:'Листочок'}],
 messNames:{mud:'Брудна калюжа'},messAnswers:['Приберімо','Гаразд','Ой'],
 celebrations:()=>[{name:'День вилуплення',done:false},{name:'Перший тиждень',done:true}]
};
const pet={daily:{wish:{accepted:true},lastWish:{result:'Грали разом'},stash:{stone:2,leaf:0},mess:{kind:'mud'},habits:{tidy:2,cheeky:4},kind:{text:'Час відпочити'}}};
const view=(mode,choice=0,s=pet,d=deps)=>dailyChoiceContent(mode,s,choice,d);
test('wishes preserve accepted state, selected answer, and last wish',()=>{
 assert.deepEqual(view('wishes',0),{title:'Чого хоче мій друг',detail:'Хочу пограти!\nДомовились! ▶ Так!\nМинуле: Грали разом'});
 assert.equal(view('wishes',1,{daily:{wish:{accepted:false}}}).detail,'Хочу пограти!\n▶ Пізніше');
 assert.equal(view('wishes',0,{daily:{}}).detail,'Хочу пограти!');
});
test('stash only shows positive count treasures and original fallback',()=>{
 assert.deepEqual(view('stash'),{title:'Камінець ×2',detail:'«Це мій скарб. Дуже важливий!»\nОК — покажи мені · ← → інша знахідка'});
 assert.equal(view('stash',1,{daily:{stash:{stone:0,leaf:0}}}).title,'Поки порожня схованка');
 assert.match(view('stash',0,{daily:{stash:{}}}).detail,/Пет знаходить дрібниці/);
});
test('mischief displays selected answer and habit counters',()=>{
 assert.deepEqual(view('mischief',1),{title:'Брудна калюжа',detail:'«Я просто перевіряв, як воно працює!»\n▶ Гаразд\nЗвички: охайність 2 · пустощі 4'});
 assert.deepEqual(view('mischief',0,{daily:{}}),{title:'Зараз тихо. Підозріло тихо.',detail:'Друг поки нічого не накоїв.\nЗвички: охайність 0 · пустощі 0'});
});
test('celebrations retain done-state labels and empty-state fallback',()=>{
 assert.deepEqual(view('celebrations'),{title:'День вилуплення',detail:'ОК — тортик, ковпачок і обійми!\n← → інше свято'});
 assert.deepEqual(view('celebrations',1),{title:'Перший тиждень',detail:'Уже святкували! Фото є в альбомі.\n← → інше свято'});
 assert.deepEqual(view('celebrations',0,pet,{...deps,celebrations:()=>[]}),{title:'Свята ще попереду',detail:'Вилуплення, перший тиждень і десята прогулянка — кожен привід святкуємо разом.'});
});
test('care for user preserves kind and remembered kind messages',()=>{
 assert.deepEqual(view('human'),{title:'Твій маленький захисник',detail:'Час відпочити\nОК — дякую, друже'});
 assert.deepEqual(view('human',0,{daily:{lastKind:{text:'Ти молодець'}}}),{title:'Твій маленький захисник',detail:'Ти молодець\nНемає штрафів, якщо ти зайнятий. Просто знай: я поруч.'});
 assert.match(view('human',0,{daily:{}}).detail,/Я теж за тобою приглядаю/);
});
test('photos and unrelated modes do not affect DOM or state',()=>{
 const before=JSON.stringify(pet);
 assert.equal(view('photos'),null);assert.equal(view('room'),null);
 for(const mode of ['wishes','stash','mischief','celebrations','human'])view(mode);
 assert.equal(JSON.stringify(pet),before);
 const source=readFileSync(new URL('../public/daily-choice-content.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/document\.|window\.|localStorage|Date\.now\(/);
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.ok(app.includes('dailyChoiceContent(mode,state,choice,{wishText,wishAnswers,treasures,messNames,messAnswers,celebrations})'));
 assert.ok(app.includes("if(mode==='photos'){const row=momentRecords"));
 assert.ok(app.includes("frame.fillRect(0,0,portrait.width,2)"));
});
