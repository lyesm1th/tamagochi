import test from 'node:test';
import assert from 'node:assert/strict';
import {ensureInteractionMemory,noteInteractionMemory,emotionalAffinity,relationshipReflection} from '../public/interaction-memory.js';
import {directInteraction,reconcileInteraction} from '../public/interaction-boundaries.js';
import {fresh,act,life} from '../public/game.js';
const now=1800000000000,H=3600000;
const pet=()=>({id:'bond-test-pet',species:'dino',trait:'stubborn',discipline:35,hunger:80,happy:80,energy:85,health:95,calm:75});
test('new emotional memories initialize without rewriting existing pets',()=>{
 const s=pet(),original=structuredClone(s);
 const m=ensureInteractionMemory(s);assert.equal(m.trust,50);assert.equal(m.comfort,50);assert.equal(m.playJoy,50);
 for(const k of Object.keys(original))assert.deepEqual(s[k],original[k]);
 assert.equal(emotionalAffinity(s),0);
});
test('positive care and games are throttled and persist after JSON roundtrip',()=>{
 const s=pet();assert.equal(noteInteractionMemory(s,'care',now),true);
 assert.equal(noteInteractionMemory(s,'care',now+1000),false);
 assert.equal(noteInteractionMemory(s,'play',now+1000),true);
 assert.equal(noteInteractionMemory(s,'play',now+2000),false);
 assert.equal(s.interactionMemory.events.length,2);
 const copy=JSON.parse(JSON.stringify(s));assert.equal(noteInteractionMemory(copy,'play',now+11000),false);
 assert.equal(copy.interactionMemory.playJoy,52);assert.ok(emotionalAffinity(copy)>0);
});
test('refusals are mild, reconciliation repairs trust without repeated rewards',()=>{
 const s=pet();s.interactionBoundary={refusedAt:now,until:now+45000,kind:'hungry',times:1};
 s.hunger=80;const text=reconcileInteraction(s,now+60000);assert.match(text,/Дякую за їжу/);
 assert.equal(reconcileInteraction(s,now+61000),null);
 assert.equal(s.interactionMemory.trust,52);
});
test('repeated interactions never overflow memory or max score',()=>{
 const s=pet();for(let i=0;i<150;i++)noteInteractionMemory(s,'play',now+i*H);
 assert.equal(s.interactionMemory.playJoy,100);
 assert.equal(s.interactionMemory.events.length,20);
 assert.ok(emotionalAffinity(s)<=.08);
 assert.match(relationshipReflection(s),/гратися весело/);
});
test('normal successful play records joy without changing coin payouts',()=>{
 const s=fresh('dino',now-life.teen-H);s.id='emotional-game';s.updated=now;s.routine.enabled=false;
 s.hunger=85;s.happy=85;s.energy=85;s.health=100;
 const r=act(s,'play',now+1000,{game:'bug'});assert.ok(!r.error,r.error);
 assert.equal(r.state.coins,s.coins+3);assert.equal(r.state.interactionMemory.playJoy,52);
});
