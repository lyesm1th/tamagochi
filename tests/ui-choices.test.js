import test from 'node:test';
import assert from 'node:assert/strict';
import {countDailyOptions,mealOptions,belongingOptions} from '../public/ui-choices.js';
import {readFileSync} from 'node:fs';
test('daily modes preserve counts, including zero-item minimum and positive stash filtering',()=>{
 const state={daily:{stash:{a:2,b:0,c:-3,d:1}}},moments=[{},{},{}],events=()=>['one','two'];
 const expected={wishes:3,photos:3,stash:2,mischief:3,celebrations:2,unknown:1};
 for(const [mode,count]of Object.entries(expected))assert.equal(countDailyOptions(mode,state,moments,events),count,mode);
 assert.equal(countDailyOptions('photos',state,[],events),1);
 assert.equal(countDailyOptions('stash',{daily:{}},[],events),1);
 assert.equal(countDailyOptions('celebrations',state,[],()=>[]),1);
});
test('meal combinations preserve dish-major ordering and all additions',()=>{
 const dishes={cat:[{id:'fish'},{id:'egg'}]},state={species:'cat'};
 const additions=()=>['none','berry'];
 assert.deepEqual(mealOptions(state,dishes,additions).map(x=>[x.dish.id,x.addition]),[['fish','none'],['fish','berry'],['egg','none'],['egg','berry']]);
 assert.deepEqual(mealOptions({species:'other'},dishes,additions).length,4);
});
test('belonging list preserves selected-item filtering and fallback action',()=>{
 const state={};const items=[{id:'bed'},{id:'lamp'}];
 const rows=items.map(item=>({item,action:['repair','Полагодити']}));
 const choices=()=>rows,owned=()=>items;
 assert.deepEqual(belongingOptions(state,'bed',choices,owned),[rows[0]]);
 assert.deepEqual(belongingOptions(state,null,choices,owned),items.map(item=>({item,action:['select','Відкрити дії']})));
 assert.deepEqual(belongingOptions(state,'missing',choices,owned),[]);
});
test('all app wrappers delegate to side-effect-free module',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 const source=readFileSync(new URL('../public/ui-choices.js',import.meta.url),'utf8');
 for(const call of ['countDailyOptions(mode,state,momentRecords,celebrations)','mealOptions(state,dishes,additionsFor)','belongingOptions(s,belongingItem,belongingChoices,ownedThings)'])assert.ok(app.includes(call));
 assert.doesNotMatch(source,/localStorage|document\.|window\.|Date\.now\(/);
});
