import test from 'node:test';
import assert from 'node:assert/strict';
import {directInteraction,reconcileInteraction} from '../public/interaction-boundaries.js';
import {fresh,act,life} from '../public/game.js';
const H=3600000,now=1800000000000;
const pet=()=>({id:'boundary-dino',species:'dino',trait:'stubborn',discipline:5,hunger:5,happy:70,energy:75,health:100,calm:60});
test('uncomfortable pet may decline interaction with gestures and three-minute cooldown',()=>{
 let refused=null;const s=pet();for(let i=0;i<80;i++){const at=now+i*90000;const r=directInteraction(s,'pet',at);if(r){refused=r;assert.equal(s.bodyLanguage.kind,'disgust');assert.equal(directInteraction(s,'pet',at+1000),null);break;}}
 assert.ok(refused);assert.equal(refused.refused,true);
});
test('fed and calm pet is not forced to refuse',()=>{const s=pet();s.hunger=85;s.discipline=90;s.calm=75;assert.equal(directInteraction(s,'pet',now),null);});
test('reconciliation requires enough care and never repeats',()=>{const s=pet();s.interactionBoundary={refusedAt:now,until:now+45000,kind:'hungry',times:1};assert.equal(reconcileInteraction(s,now+60000),null);s.hunger=90;s.happy=70;assert.match(reconcileInteraction(s,now+60000),/Дякую за їжу/);assert.equal(reconcileInteraction(s,now+61000),null);});
test('boundary refusal has no hidden penalty to coins, food or progress',()=>{const s=fresh('dino',now-life.teen-H);s.updated=now;s.id='action-boundary';s.trait='stubborn';s.discipline=0;s.hunger=8;s.energy=80;s.happy=80;s.calm=70;s.routine.enabled=false;let result=null;for(let i=0;i<80;i++){const at=now+i*4*60000;const next=act(s,'pet',at);if(next.refused){result=next;break;}}
 assert.ok(result,'one bounded refusal should occur');assert.equal(result.state.coins,s.coins);assert.equal(result.state.hunger,s.hunger);assert.equal(result.state.xp,s.xp);assert.ok(result.state.interactionBoundary.refusedAt);});
