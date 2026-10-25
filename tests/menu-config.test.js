import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {allMenu,routineFields,groupEntries,groupItems} from '../public/menu-config.js';
import {groups} from '../public/living.js';
import {journalPages} from '../public/life-journal.js';
import {worldPages} from '../public/little-world.js';
const legacy=(id)=>{
 const group=groups.find(g=>g[0]===id);
 const names={roomStyle:'Настрій кімнати',wallet:'Гаманець і подарунки',...Object.fromEntries(journalPages),...Object.fromEntries(worldPages),sandbox:'Спільна пісочниця',stories:'Наші маленькі історії',secrets:'Секрети кімнати'};
 let menu=group[3].filter(x=>!['ritual','peace','pet','kitchen','decorate'].includes(x)).map(key=>allMenu.find(m=>m[0]===key)||[key,{sandbox:'♧',stories:'✿'}[key]||'·',names[key]||key]);
 return menu.map(row=>row[0]==='activity'?[row[0],row[1],'Догляд і обійми']:row[0]==='roomStyle'?[row[0],row[1],'Вигляд і облаштування']:row);
};
test('menu group output is identical to original builder for every group',()=>{
 for(const group of groups)assert.deepEqual(groupItems(group[0],groups,journalPages,worldPages),legacy(group[0]),group[0]);
});
test('root navigation and routine field ordering retain original labels',()=>{
 assert.deepEqual(groupEntries(groups),groups.map(([id,icon,name])=>['group:'+id,icon,name]));
 assert.deepEqual(routineFields,[['enabled','Автоматичний сон'],['bed','Лягати спати'],['wake','Прокидатися'],['meal1','Перший перекус'],['meal2','Другий перекус'],['play','Вечірня гра']]);
 assert.equal(allMenu.find(([id])=>id==='endLife')?.[2],'Завершити життя');
});
test('menu configuration is independent of DOM and persistent game state',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.ok(app.includes("import {allMenu,routineFields,groupEntries,groupItems} from './menu-config.js'"));
 assert.ok(app.includes('menu=groupItems(id,groups,journalPages,worldPages)'));
 assert.ok(app.includes('menu=groupEntries(groups)'));
 const source=readFileSync(new URL('../public/menu-config.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/localStorage|document\.|Date\.now\(/);
});
