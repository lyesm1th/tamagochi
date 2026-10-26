import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,tick,life,HOUR,DAY} from '../public/game.js';
import {ensureManners,disciplineScore,practiceManners} from '../public/manners.js';
import {returnBehaviorSummary} from '../public/behavior-return.js';
import {rememberBehavior} from '../public/behavior-memory.js';
import {markRoomTrace} from '../public/room-enrichment.js';
const now=1800000000000;
const pet=()=>{const s=fresh('dino',now-life.child-DAY);s.id='lifecycle-dino';s.born=now-life.child-DAY;s.updated=now;s.hunger=99;s.happy=99;s.clean=99;s.energy=99;s.health=100;s.sleeping=false;s.napping=false;s.routine.enabled=false;return s;};
test('two-hour offline catch-up is idempotent across persisted state reloads',()=>{
 const s=pet();tick(s,now+2*HOUR);const state=structuredClone(s);
 const before={hunger:state.hunger,happy:state.happy,health:state.health,coins:state.coins,discipline:state.discipline,messId:state.daily?.mess?.id,kindAt:state.daily?.kindAt,kindId:state.daily?.kind?.id,stash:structuredClone(state.daily?.stash||{}),findAt:state.daily?.findAt};
 tick(state,now+2*HOUR);
 assert.deepEqual({hunger:state.hunger,happy:state.happy,health:state.health,coins:state.coins,discipline:state.discipline,messId:state.daily?.mess?.id,kindAt:state.daily?.kindAt,kindId:state.daily?.kind?.id,stash:state.daily?.stash||{},findAt:state.daily?.findAt},before);
 assert.equal(state.updated,now+2*HOUR);
 assert.ok(state.hunger<99);
 assert.ok(!state.dead);
});
test('training memory and an absence recap survive reload without duplicate rewards',()=>{
 const s=pet();ensureManners(s);const score=disciplineScore(s);
 practiceManners(s,'food',now);assert.ok(disciplineScore(s)>score);
 rememberBehavior(s,{id:'fixed-01',at:now+HOUR,rule:'food',result:'repaired'});
 s.daily??={};s.daily.lastMess={id:'fixed-01',kind:'food',at:now+HOUR,repaired:true};
 const after=structuredClone(s);
 const summary=returnBehaviorSummary(after,now,now+2*HOUR);
 assert.match(summary,/допоміг прибрати/);
 assert.equal(returnBehaviorSummary(after,now,now+2*HOUR),null);
 assert.equal(rememberBehavior(after,{id:'fixed-01',at:now+HOUR,rule:'food',result:'repaired'}),false);
 assert.equal(after.behaviorMemory.habits.food.repaired,1);
});
test('inactive room traces are never recreated by an offline update',()=>{
 const s=pet();
 markRoomTrace(s,'bed',now);
 const old=s.living.enrichment.traces[0];
 assert.ok(old);
 tick(s,now+3*HOUR);
 assert.equal(s.living.enrichment.traces.length,0);
});
test('vacation freezes deterioration and does not generate autonomous events',()=>{
 const s=pet();s.vacation={started:now};const hunger=s.hunger;tick(s,now+2*DAY);
 assert.equal(s.hunger,hunger);
 assert.equal(s.updated,now+2*DAY);
 assert.equal(s.daily?.mess??null,null);
});
test('death prevents later autonomous mischief or offline recaps',()=>{
 const s=pet();s.dead=true;s.health=0;const updated=s.updated;tick(s,now+DAY);
 assert.equal(s.updated,updated);
 assert.equal(returnBehaviorSummary(s,now,now+DAY),null);
});
