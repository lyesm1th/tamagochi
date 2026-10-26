import test from 'node:test';
import assert from 'node:assert/strict';
import {rememberBehavior,behaviorMemoryEffect,ensureBehaviorMemory} from '../public/behavior-memory.js';
import {mischiefDecision} from '../public/mischief-behavior.js';
import {speechBalance,ensureManners} from '../public/manners.js';
import {returnBehaviorSummary} from '../public/behavior-return.js';
import {updateDaily} from '../public/daily-life.js';
const now=1800000000000,HOUR=3600000;
const pet=(discipline=50)=>({id:'long-dino',species:'dino',born:now-7*86400000,trait:'stubborn',discipline,hunger:80,energy:80,health:100,happy:80,clean:80,calm:80,sleeping:false,napping:false});
test('50+ remembered events keep counters exact and suppress old retries after history eviction',()=>{
 const s=pet();for(let i=0;i<60;i++)assert.equal(rememberBehavior(s,{id:'mess-'+i,at:now+i,rule:'food',result:'repaired'}),true);
 assert.equal(s.behaviorMemory.events.length,30);assert.equal(s.behaviorMemory.recentIds.length,60);
 assert.equal(s.behaviorMemory.habits.food.repaired,60);
 assert.equal(rememberBehavior(s,{id:'mess-0',at:now+100,rule:'food',result:'repaired'}),false);
 assert.equal(s.behaviorMemory.habits.food.repaired,60);
 assert.ok(behaviorMemoryEffect(s,'food')<=.12);
 assert.equal(ensureBehaviorMemory(s).recentIds.length,60);
});
test('old saved memories upgrade lazily without losing historical events',()=>{
 const s=pet();s.behaviorMemory={events:[{id:'old',rule:'food',result:'repaired',at:now}],habits:{food:{resolved:1,repaired:1,defiant:0}}};
 assert.equal(rememberBehavior(s,{id:'old',rule:'food',result:'repaired',at:now}),false);
 assert.equal(s.behaviorMemory.habits.food.resolved,1);
 assert.deepEqual(s.behaviorMemory.recentIds,['old']);
});
test('memory identifiers remain capped in very long histories',()=>{
 const s=pet();for(let i=0;i<500;i++)rememberBehavior(s,{id:'e'+i,at:now+i,rule:'pot',result:'defiant'});
 assert.equal(s.behaviorMemory.events.length,30);
 assert.equal(s.behaviorMemory.recentIds.length,256);
 assert.equal(s.behaviorMemory.habits.pot.resolved,500);
});
test('same simulated event cannot cause more than one response memory after reload',()=>{
 const s=pet(90);ensureManners(s);
 const event=mischiefDecision(s,now);
 const rule=event.rule;
 const id='offline-'+event.kind;
 rememberBehavior(s,{id,rule,result:'repaired',at:now});
 const after=structuredClone(s);
 assert.equal(rememberBehavior(after,{id,rule,result:'repaired',at:now+HOUR}),false);
 assert.equal(behaviorMemoryEffect(s,rule),behaviorMemoryEffect(after,rule));
 assert.deepEqual(speechBalance(s),speechBalance(after));
});
test('long offline event recap reads saved history and repeats neither recap nor penalty',()=>{
 const s=pet(90);s.daily={wishAt:now-1000,mischiefAt:now-1000,findAt:now-1000,kindAt:now-1000,stash:{}};
 updateDaily(s,now,{offline:true});
 const before=JSON.stringify(s.daily);
 const line=returnBehaviorSummary(s,now-2*HOUR,now);
 assert.ok(line===null||line.startsWith('Поки тебе не було:'));
 assert.equal(returnBehaviorSummary(s,now-2*HOUR,now),null);
 assert.equal(JSON.stringify(s.daily),before);
});
