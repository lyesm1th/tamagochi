import test from 'node:test';
import assert from 'node:assert/strict';
import {roomGameControls} from '../public/room-game-controls.js';
import {readFileSync} from 'node:fs';
function legacy(games,run,traces,now){
 const rows=[];
 for(const [id,label] of games)rows.push({label,request:{event:'start',kind:id},active:!!(run?.kind===id&&run.until>now)});
 if(run?.until>now)rows.push({label:'↶ Закінчити',request:{event:'stop'},active:false});
 if(traces?.length)rows.push({label:'Прибрати сліди',request:{event:'clean'},active:false});
 return rows;
}
test('room buttons keep order and active state before/at/after session expiry',()=>{
 const games=[['ball','М’яч'],['music','Музика'],['laser','Лазер']];
 for(const run of [null,{kind:'ball',until:999},{kind:'music',until:1000},{kind:'laser',until:1001}])
  for(const traces of [null,[],[{id:1}]])
   assert.deepEqual(roomGameControls(games,run,traces,1000),legacy(games,run,traces,1000));
});
test('button preparation does not mutate game list, session or traces',()=>{
 const games=Object.freeze([Object.freeze(['ball','М’яч'])]);
 const run=Object.freeze({kind:'ball',until:123});
 const traces=Object.freeze([{id:1}]);
 const output=roomGameControls(games,run,traces,10);
 assert.equal(output.length,3);
 assert.deepEqual(output.map(x=>x.request.event),['start','stop','clean']);
});
test('UI adapter uses exactly the configured request and selected state',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.ok(app.includes('roomGameControls(roomGames,run,state.living?.enrichment?.traces,Date.now())'));
 assert.ok(app.includes('add(entry.label,()=>void roomGameRequest(entry.request),entry.active)'));
 const helper=readFileSync(new URL('../public/room-game-controls.js',import.meta.url),'utf8');
 assert.doesNotMatch(helper,/document\.|window\.|localStorage|Date\.now\(/);
});
