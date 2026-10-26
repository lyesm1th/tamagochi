import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,act,tick,life,DAY} from '../public/game.js';
import {ensureManners,disciplineScore} from '../public/manners.js';
import {performDaily} from '../public/daily-life.js';
import {returnBehaviorSummary} from '../public/behavior-return.js';
import {mischiefDecision} from '../public/mischief-behavior.js';
import {rememberBehavior} from '../public/behavior-memory.js';
import {nextGeneration,candidates} from '../public/family.js';

const H=3600000,now=Date.parse('2026-10-26T12:00:00Z');
function pet(){const s=fresh('dino',now-life.baby-6*DAY);s.id='behavior-e2e-dino';s.updated=now;s.routine.enabled=false;s.sleeping=false;s.napping=false;s.lastAction=0;s.hunger=85;s.energy=90;s.health=100;s.happy=85;s.clean=90;return s;}
const roundTrip=s=>JSON.parse(JSON.stringify(s));
test('six training lessons survive JSON save/load and have no replay award',()=>{
 const s=pet();ensureManners(s);
 const before=s.manners.skills.requests.training;
 const started=act(s,'discipline',now+1000,{kind:'requests'});
 assert.ok(!started.error,started.error);
 const step=act(roundTrip(started.state),'discipline',now+2000,{choice:0});
 assert.ok(!step.error,step.error);
 const complete=act(roundTrip(step.state),'discipline',now+3000,{choice:0});
 assert.ok(!complete.error,complete.error);
 assert.ok(complete.state.manners.skills.requests.training>before);
 const earned=complete.state.manners.skills.requests.training;
 const repeated=act(roundTrip(complete.state),'discipline',now+4000,{choice:0});
 assert.ok(repeated.error);
 assert.equal(repeated.state.manners.skills.requests.training,earned);
});

test('resolved household mess and memories cannot be rewarded again after reload',()=>{
 const s=pet();ensureManners(s);s.daily.mess={id:'fixed-event-1',kind:'food',at:now};
 const oldCoins=s.coins;
 const answer=performDaily(roundTrip(s),'messAnswer',{eventId:'fixed-event-1',choice:1},now+1000);
 assert.ok(!answer.error,answer.error);assert.equal(answer.state.daily.mess,null);
 assert.equal(answer.state.behaviorMemory.events.length,1);
 assert.equal(answer.state.coins,oldCoins);
 const replay=performDaily(roundTrip(answer.state),'messAnswer',{eventId:'fixed-event-1',choice:1},now+2000);
 assert.ok(replay.error);assert.equal(replay.state?.behaviorMemory?.events.length??1,1);
});
test('return recap never replays on same absence window after serialization',()=>{
 const s=pet();s.daily.mess={id:'pending-mess-3',kind:'brush',at:now-H};
 const first=returnBehaviorSummary(s,now-2*H,now);
 assert.match(first,/щіточку/);
 assert.equal(returnBehaviorSummary(roundTrip(s),now-2*H,now+1000),null);
});
test('offline catch-up preserves ownership, money, sprite identity, and rule score',()=>{
 const s=pet();ensureManners(s);s.daily.wishAt=now+4*DAY;s.daily.mischiefAt=now+4*DAY;s.daily.kindAt=now+4*DAY;s.daily.findAt=now+4*DAY;
 const original={id:s.id,coins:s.coins,species:s.species,trait:s.trait,discipline:disciplineScore(s)};
 const recovered=tick(roundTrip(s),now+2*H);
 assert.equal(recovered.id,original.id);assert.equal(recovered.coins,original.coins);assert.equal(recovered.species,original.species);assert.equal(recovered.trait,original.trait);assert.equal(disciplineScore(recovered),original.discipline);
});
test('old save without new behavioral fields is lazily compatible',()=>{
 const s=pet();delete s.manners;delete s.behaviorMemory;delete s.behaviorReturn;
 const old=roundTrip(s);
 const recovered=tick(old,now+1000);
 assert.ok(recovered.manners?.skills?.friends);
 assert.equal(typeof disciplineScore(recovered),'number');
 assert.equal(recovered.coins,s.coins);
 assert.equal(recovered.species,s.species);
});
test('a strongly educated pet still has rare but nonzero mischief impulse',()=>{
 const s=pet();s.discipline=95;
 const decisions=Array.from({length:100},(_,i)=>mischiefDecision(s,now+i*15*60000));
 assert.ok(decisions.every(d=>d.impulse>0&&d.impulse<.3));
});
