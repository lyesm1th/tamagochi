import test from 'node:test';
import assert from 'node:assert/strict';
import {rememberBehavior,behaviorMemoryEffect,behaviorMemoryHint} from '../public/behavior-memory.js';
import {mischiefDecision} from '../public/mischief-behavior.js';
const now=1800000000000;
const pet=()=>({id:'memory-dino',species:'dino',born:now-20000000,trait:'stubborn',discipline:85,hunger:80,energy:80,happy:80,health:100});
test('memory remains bounded, deduplicated and persists habits',()=>{const s=pet();for(let i=0;i<35;i++)assert.equal(rememberBehavior(s,{id:'e'+i,at:now+i,rule:'food',result:'repaired'}),true);assert.equal(s.behaviorMemory.events.length,30);assert.equal(s.behaviorMemory.habits.food.repaired,35);assert.equal(rememberBehavior(s,{id:'e34',at:now+999,rule:'food',result:'repaired'}),false);assert.equal(s.behaviorMemory.habits.food.repaired,35);});
test('remembered repairs reduce impulse and defiance reinforces it modestly',()=>{const original=pet(),careful=pet(),rebellious=pet();for(let i=0;i<12;i++){rememberBehavior(careful,{id:'a'+i,at:now+i,rule:'food',result:'repaired'});rememberBehavior(rebellious,{id:'b'+i,at:now+i,rule:'food',result:'defiant'});}assert.ok(behaviorMemoryEffect(careful,'food')>0);assert.ok(behaviorMemoryEffect(rebellious,'food')<0);assert.ok(mischiefDecision(careful,now).impulse>=0);assert.equal(mischiefDecision(original,now).kind,mischiefDecision(careful,now).kind);});
test('mature pets recall important outcomes',()=>{const s=pet();rememberBehavior(s,{id:'e1',at:now,rule:'tidy',result:'repaired'});assert.match(behaviorMemoryHint(s),/прибрали/);rememberBehavior(s,{id:'e2',at:now+1,rule:'requests',result:'defiant'});assert.match(behaviorMemoryHint(s),/нагрубив/);});
