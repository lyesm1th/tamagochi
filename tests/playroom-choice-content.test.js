import test from 'node:test';
import assert from 'node:assert/strict';
import {playroomChoiceContent} from '../public/playroom-choice-content.js';
import {readFileSync} from 'node:fs';
const now=1800000000000;
const deps={
 toys:[{id:'ball',name:'М’яч',price:12,hint:'Пострибаємо!'},{id:'music',name:'Музика',price:24,hint:'Послухай ритм!'}],
 recipes:[{id:'ribbon',name:'Стрічка',cost:{stone:2,leaf:1},hint:'Прикрасимо кімнату'}],
 treasures:[{id:'stone',name:'Камінець'},{id:'leaf',name:'Листок'}],
 decorFields:[['layout','Планування'],['bedding','Постіль'],['display','Вітрина'],['corner','Куточок']],
 layouts:{default:'Затишний'},bedding:{soft:{name:'М’яка'}},
 favoriteCorner:()=>({name:'Біля вікна'})
};
const state={playroom:{session:null,toys:{ball:true},skills:{ball:3,music:1},crafted:{ribbon:false},decor:{layout:'default',bedding:'soft',display:'stone'}},daily:{stash:{stone:1,leaf:4}}};
const view=(mode,choice=0,s=state,time=now)=>playroomChoiceContent(mode,s,choice,time,deps);
test('toy cards preserve owned status, prices, hints and earned skill badges',()=>{
 const a=view('toys',0),b=view('toys',1);
 assert.equal(a.title,'М’яч · НАША');
 assert.match(a.detail,/ОК — почати · ← → інша іграшка/);
 assert.match(a.detail,/Разом грали: 3 · власний прийом вивчено!/);
 assert.equal(b.title,'Музика · 24 монет');
 assert.match(b.detail,/ОК — придбати · ← → інша іграшка/);
});
test('active sessions take precedence and expire at the exact boundary',()=>{
 const running={...state,playroom:{...state.playroom,session:{kind:'music',hits:2,expires:now+1}}};
 const active=view('toys',0,running);
 assert.equal(active.title,'Музика · 2/3');
 assert.match(active.detail,/завершити гру без нагороди/);
 const expired=view('toys',0,running,now+1);
 assert.equal(expired.title,'М’яч · НАША');
});
test('craft and decor show original resources and configuration',()=>{
 const craft=view('craft');
 assert.equal(craft.title,'Стрічка');
 assert.equal(craft.detail,'Камінець: 1/2 · Листок: 4/1\nПрикрасимо кімнату\nОК — зробити · ← → інший рецепт');
 assert.equal(view('craft',0,{...state,playroom:{...state.playroom,crafted:{ribbon:true}}}).title,'Стрічка · ГОТОВО');
 assert.equal(view('decorate',0).detail,'Затишний\nОК — наступний варіант\n← → інше налаштування');
 assert.equal(view('decorate',1).detail,'М’яка\nОК — наступний варіант\n← → інше налаштування');
 assert.equal(view('decorate',2).detail,'Камінець\nОК — наступний варіант\n← → інше налаштування');
 assert.equal(view('decorate',3).detail,'Біля вікна\nПет сам обрав місце за характером.\n← → інше налаштування');
});
test('pure UI labels do not mutate playroom state, unknown mode is a no-op',()=>{
 const before=JSON.stringify(state);
 assert.equal(view('sandbox'),null);
 for(const mode of ['toys','craft','decorate'])view(mode);
 assert.equal(JSON.stringify(state),before);
 const src=readFileSync(new URL('../public/playroom-choice-content.js',import.meta.url),'utf8');
 assert.doesNotMatch(src,/window\.|document\.|localStorage|Date\.now\(/);
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.ok(app.includes('playroomChoiceContent(mode,state,choice,Date.now(),{toys,recipes,decorFields,treasures,layouts,bedding,favoriteCorner})'));
 assert.ok(app.includes('draw(portrait,state.species,Date.now(),state)'));
});
