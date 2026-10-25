import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {companionChoiceContent} from '../public/companion-choice-content.js';
const menu={
 foodsFor:()=>['fish','fruit'],stage:()=> 'Підліток',foodNames:{fish:'Рибка',fruit:'Фрукти'},
 memorySummary:()=> 'Ми давно друзі',
 furnishings:[{id:'bed',name:'Ліжко',price:20,benefit:'Солодкі сни'}],
 routineFields:[['enabled','Автоматичний сон'],['wake','Прокидатися']],
 adventureOf:()=>({title:'Пригода',question:'Куди підемо?',choices:[{label:'До парку'},{label:'Додому'}]})
};
const pet={name:'Пуф',memory:{discoveries:['fish'],lastAdventure:{title:'Знайшли скарб'}},heirloom:{name:'Дзвіночок'},species:'cat',room:{bed:true},routine:{enabled:true,wake:8}};
const view=(mode,choice=0,state=pet,records=[],index=0)=>companionChoiceContent(mode,state,choice,records,index,menu);
test('food mode retains choice index, favourites and fallback prompt',()=>{
 assert.deepEqual(view('food'),{title:'1/2 · Рибка',detail:'♡ Уже знаємо: це улюблена їжа!\nОК — погодувати'});
 assert.deepEqual(view('food',1),{title:'2/2 · Фрукти',detail:'Який смак оберемо сьогодні?\nОК — погодувати'});
});
test('memory uses the existing summary and optional adventure and heirloom',()=>{
 assert.deepEqual(view('memory'),{title:'Пуф пам’ятає',detail:'Ми давно друзі\nПригода: Знайшли скарб\nСпадок: Дзвіночок'});
 assert.equal(view('memory',0,{...pet,memory:{discoveries:[]},heirloom:null}).detail,'Ми давно друзі');
});
test('room purchase and ownership preserve portrait toggle and exact labels',()=>{
 assert.deepEqual(view('room'),{title:'Ліжко · Є В КІМНАТІ',detail:'Солодкі сни\nОК — скористатися',showPortrait:true});
 assert.deepEqual(view('room',0,{...pet,room:{}}),{title:'Ліжко · 20 монет',detail:'Солодкі сни\nОК — придбати',showPortrait:true});
});
test('routine mode preserves enabled state and 24h clock format',()=>{
 assert.deepEqual(view('routine'),{title:'Автоматичний сон',detail:'УВІМКНЕНО\nОК — увімкнути / вимкнути\n← → інший пункт · ↶ назад'});
 assert.deepEqual(view('routine',1),{title:'Прокидатися',detail:'08:00\nОК — додати 1 годину\n← → інший пункт · ↶ назад'});
 assert.match(view('routine',0,{...pet,routine:{enabled:false}}).detail,/ВИМКНЕНО/);
});
test('adventures and family tree preserve branch details',()=>{
 assert.deepEqual(view('adventure',1),{title:'Пригода',detail:'Куди підемо?\n▶ Додому\nОК — відповісти'});
 const ancestor={name:'Рекс',generation:2,parents:[{name:'Пуф'},{name:'Кекс'}],heirloom:{name:'Кулон',from:'Пуф'}};
 assert.deepEqual(view('tree',0,pet,[ancestor],0),{title:'Рекс · покоління 2',detail:'Батьки: Пуф + Кекс\nСпадок: Кулон від Пуф\n1/1 · ← → родичі'});
 assert.equal(view('tree',0,pet,[]).detail,'У нас ще все попереду.');
 const calm=companionChoiceContent('adventure',pet,0,[],0,{...menu,adventureOf:()=>null});
 assert.deepEqual(calm,{title:'Зараз спокійно',detail:'Пригоди часом трапляються самі. А поки можна обійнятися.'});
});
test('unknown mode is no-op and module has no DOM or storage access',()=>{
 assert.equal(view('sandbox'),null);
 const source=readFileSync(new URL('../public/companion-choice-content.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/document\.|window\.|localStorage|Date\.now\(/);
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.ok(app.includes('companionChoiceContent(mode,state,choice,treeRecords,treeIndex,{foodsFor,stage,foodNames,memorySummary,furnishings,routineFields,adventureOf})'));
 assert.ok(app.includes('if(detailedReady())drawDetailedMain(portrait,state,state.species,0,true,{x:96,feet:128,scale:1},null)'));
});
