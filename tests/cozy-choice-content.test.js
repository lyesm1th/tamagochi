import test from 'node:test';
import assert from 'node:assert/strict';
import {cozyChoiceContent} from '../public/cozy-choice-content.js';
import {readFileSync} from 'node:fs';
const now=1800000000000;
const deps={
 homeGoods:[{id:'lamp',name:'Лампа',price:9}],
 clothes:[{id:'cap',name:'Кепка',slot:'head',price:12}],
 ingredients:[{id:'fish',name:'Рибка'},{id:'berry',name:'Ягода'}],
 opinionNames:{happy:'Чудово сидить'},itemStatus:()=>({known:true}),opinion:()=> 'happy',
 kitchenOptions:()=>[{dish:{id:'fishdish',name:'Рибна страва',base:'fish'},addition:'berry'}],
 isFavoriteMeal:()=>true,isNight:()=>true
};
const pet={species:'cat',routine:{timezone:'Europe/Kyiv'},cozy:{owned:{},stored:{},outfits:{},wearing:{},pantry:{fish:1,berry:2},foodMemory:{},nightMode:false,peace:{tension:2}}};
const view=(mode,choice=0,s=pet,t=now,d=deps)=>cozyChoiceContent(mode,s,choice,t,d);
test('shop: purchasing, ownership, storage preserve labels and priority',()=>{
 assert.deepEqual(view('shop'),{title:'Лампа · 9 монет',detail:'Показано в кімнаті й крупним планом.\nОК — придбати · ← → інші предмети'});
 const owned={...pet,cozy:{...pet.cozy,owned:{lamp:true}}};
 assert.equal(view('shop',0,owned).title,'Лампа · ВДОМА');
 assert.match(view('shop',0,owned).detail,/ОК — скористатися/);
 const stored={...pet,cozy:{...owned.cozy,stored:{lamp:true}}};
 assert.equal(view('shop',0,stored).title,'Лампа · У СХОВИЩІ');
 assert.match(view('shop',0,stored).detail,/повернути в кімнату/);
});
test('wardrobe: preview, purchased, worn, and removed messages',()=>{
 assert.equal(view('wardrobe').title,'Кепка · 12 монет');
 assert.match(view('wardrobe').detail,/Чудово сидить\nОК — придбати/);
 const wearing={...pet,cozy:{...pet.cozy,outfits:{cap:true},wearing:{head:'cap'}}};
 assert.equal(view('wardrobe',0,wearing).title,'Кепка · НА МЕНІ');
 assert.match(view('wardrobe',0,wearing).detail,/ОК — зняти/);
 const owned={...pet,cozy:{...wearing.cozy,wearing:{}}};
 assert.match(view('wardrobe',0,owned).detail,/ОК — вдягнути/);
 assert.match(view('wardrobe',0,pet,now,{...deps,itemStatus:()=>({known:false})}).detail,/попередня примірка/);
});
test('kitchen expiry boundary, recipe and pantry fallback are unchanged',()=>{
 const cooking={...pet,cozy:{...pet.cozy,cooking:{expires:now+1,step:1}}};
 assert.deepEqual(view('kitchen',0,cooking),{title:'ГОТУЄМО РАЗОМ · 2/3',detail:'Змішати → приготувати → скуштувати.\nОК — наступний крок'});
 assert.equal(view('kitchen',0,cooking,now+1).title,'Рибна страва');
 assert.match(view('kitchen').detail,/Рибка ×1 \+ Ягода ×1/);
 const known={...pet,cozy:{...pet.cozy,foodMemory:{'fishdish-berry':true}}};
 assert.match(view('kitchen',0,known).detail,/♡ Улюблене поєднання!/);
 const empty=view('kitchen',1,pet,now,{...deps,kitchenOptions:()=>[]});
 assert.equal(empty.title,'Поповнити комору · 3 монети');
 assert.match(empty.detail,/Рибка: 1 · Ягода: 2/);
});
test('peace and night retain text and timezone',()=>{
 assert.deepEqual(view('peace'),{title:'МИР І ОБІЙМИ',detail:'Образа: 2/5 · з часом минає.\n▶ Запропонувати обійми\nОК — сказати'});
 assert.match(view('peace',3).detail,/Мені це не подобається/);
 assert.equal(view('night').title,'НІЧНЕ ЖИТТЯ КІМНАТИ');
 assert.match(view('night').detail,/Вимкнено · Зараз ніч/);
 assert.match(view('night').detail,/Europe\/Kyiv/);
});
test('other modes remain in app renderer and new model has no browser side effects',()=>{
 const before=JSON.stringify(pet);
 assert.equal(view('hide'),null);assert.equal(view('belongings'),null);
 for(const mode of ['shop','wardrobe','kitchen','peace','night'])view(mode);
 assert.equal(JSON.stringify(pet),before);
 const src=readFileSync(new URL('../public/cozy-choice-content.js',import.meta.url),'utf8');
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.doesNotMatch(src,/window\.|document\.|localStorage|Date\.now\(/);
 assert.match(app,/cozyChoiceContent\(mode,state,choice,Date\.now\(\)/);
 assert.match(app,/if\(mode==='belongings'\)/);
 assert.match(app,/if\(mode==='hide'\)/);
});
