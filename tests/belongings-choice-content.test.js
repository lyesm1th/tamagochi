import test from 'node:test';
import assert from 'node:assert/strict';
import {belongingsChoiceContent} from '../public/cozy-choice-content.js';
import {readFileSync} from 'node:fs';
const variants=[{name:'Стандартне',price:0},{name:'М’якеньке',price:10}];
const item={id:'lamp',name:'Лампа'};
const bed={id:'bed',name:'Ліжечко'};
const state={living:{furniture:{bed:0}},cozy:{stored:{}},room:{},species:'cat'};
const deps={
 itemStatus:()=>({known:true,wear:73.6}),opinionNames:{happy:'Подобається'},
 opinion:()=> 'happy',variants,nextDesign:()=>({name:'Зоряний',price:15}),
 bedBonus:()=>1.5,designName:()=>'',designsFor:()=>[]
};
const content=(selectedItem,rows=[{item,action:['repair','Полагодити']}],data=state,more={})=>
 belongingsChoiceContent(data,0,selectedItem,rows,{...deps,...more});
test('empty belongings and first selection keep original instructions',()=>{
 assert.deepEqual(content(null,[]),{title:'Речі ще попереду',detail:'Зазирни в крамничку або придбай іграшку.',preview:false});
 assert.deepEqual(content(null),{title:'Лампа',detail:'Обери річ — потім побачиш лише її дії.\nОК — відкрити · або торкнись назви нижче',preview:false});
});
test('repair action shows known opinion, rounded wear and repair fee',()=>{
 assert.deepEqual(content('lamp'),{title:'Лампа',detail:'Подобається · стан 74%\n▶ Полагодити · 2 монети\n← → речі й дії · ОК',preview:false});
 const stored={...state,cozy:{stored:{lamp:true}}};
 assert.match(content('lamp',undefined,stored).detail,/У сховищі · стан 74%/);
 const unknown=content('lamp',undefined,state,{itemStatus:()=>({known:false,wear:12})});
 assert.match(unknown.detail,/Ще знайомимося · стан 12%/);
});
test('replacement and zero-priced designs keep original currency labels',()=>{
 const rows=[{item,action:['replace','Змінити дизайн']}];
 assert.match(content('lamp',rows).detail,/Змінити дизайн → Зоряний · 15 монет/);
 assert.match(content('lamp',rows,state,{nextDesign:()=>({name:'Безкоштовний',price:0})}).detail,/Безкоштовний · безкоштовно/);
 assert.deepEqual(content('lamp',rows,state,{designsFor:()=>['one']}).preview,true);
});
test('bed keeps sleep bonus, next variant name and optional design text',()=>{
 const rows=[{item:bed,action:['replace','Змінити дизайн']}];
 const result=content('bed',rows,state,{designName:()=> 'Квіточки',designsFor:()=>[{}]});
 assert.equal(result.title,'Ліжечко');
 assert.match(result.detail,/Змінити дизайн → М’якеньке · 10 монет/);
 assert.match(result.detail,/Сон: \+1.5 енергії\/год · Стандартне/);
 assert.match(result.detail,/Дизайн: Квіточки/);
 assert.equal(result.preview,true);
});
test('view model is independent of DOM and app retains preview call',()=>{
 const before=JSON.stringify(state);
 content('lamp');content('bed',[{item:bed,action:['repair','Полагодити']}]);
 assert.equal(JSON.stringify(state),before);
 const source=readFileSync(new URL('../public/cozy-choice-content.js',import.meta.url),'utf8');
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/window\.|document\.|localStorage/);
 assert.match(app,/belongingsChoiceContent\(state,choice,belongingItem,uiBelongingChoices\(state\)/);
 assert.match(app,/if\(view\.preview\)paintPhotoScene\(portrait,state\)/);
});
