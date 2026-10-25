import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sandboxControlModel} from '../public/sandbox-control-model.js';
const commands=[['hello','Привітатись'],['play','Грати'],['tease','Побурчати'],['avoid','Відійти']];
const games=[['duel','Дуель'],['tag','Квач']];
const pets=[{id:'p1',name:'Котик'},{id:'p2',name:'Динозаврик'},{id:'p3',name:'Курочка'}];
function original(pets,choice,busy,online,games){
 const index=Math.floor(choice/4),selected=pets[index];
 return {
  selected,
  peers:pets.map((pet,i)=>({pet,index:i,chosen:index===i})),
  actions:commands.map(([command,label],i)=>({index:i,command,label,chosen:choice%4===i,ariaLabel:label+(selected?' · '+selected.name:''),disabled:busy||!online||!selected})),
  games:games.map(([game,label])=>({game,label,disabled:busy||!online||!selected}))
 };
}
test('all control labels, selections and disabled flags match legacy UI',()=>{
 for(const count of [0,1,3]){
  for(let choice=0;choice<16;choice++){
   for(const busy of [true,false])for(const online of [true,false]){
    const active=pets.slice(0,count);
    assert.deepEqual(sandboxControlModel(active,choice,busy,online,games),original(active,choice,busy,online,games),
      `pets=${count}, choice=${choice}, busy=${busy}, online=${online}`);
   }
  }
 }
});
test('model does not change pet records or action definitions',()=>{
 const before=JSON.stringify(pets);
 const result=sandboxControlModel(pets,5,false,true,games);
 assert.equal(JSON.stringify(pets),before);
 assert.strictEqual(result.selected,pets[1]);
 assert.deepEqual(result.actions.map(a=>a.command),['hello','play','tease','avoid']);
 assert.deepEqual(result.games.map(g=>g.game),['duel','tag']);
});
test('app retains existing DOM and callback responsibilities',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 const module=readFileSync(new URL('../public/sandbox-control-model.js',import.meta.url),'utf8');
 assert.match(app,/sandboxControlModel\(sandboxPets,choice,busy,online,socialGames\)/);
 assert.match(app,/void sandboxAction\(command,selected\.id\)/);
 assert.match(app,/void sandboxAction\('play',selected\.id,game\)/);
 assert.doesNotMatch(module,/document\.|localStorage|window\.|Date\.now\(/);
});
