import test from 'node:test';
import assert from 'node:assert/strict';
import {patienceTraining,trainingView,lessonKinds} from '../public/patience-training.js';
import {trainingInvitation} from '../public/manners.js';
const now=1800000000000;
const make=()=>({id:'lesson-dino',species:'dino',trait:'stubborn',discipline:40,hunger:75,energy:80,happy:75,calm:60,born:now-3*86400000});
test('tidying and friendship lessons award only a completed success',()=>{for(const kind of ['tidy','friends']){assert.ok(lessonKinds.includes(kind));const s=make();assert.equal(patienceTraining(s,null,now,kind).ok,true);assert.equal(trainingView(s).kind,kind);const before=s.manners.skills[kind].training;patienceTraining(s,0,now+1000);patienceTraining(s,0,now+2000);assert.equal(s.manners.skills[kind].training,before+10);assert.equal(trainingView(s),null);assert.equal(patienceTraining(s,0,now+3000).ok,false);}});
test('training invitation follows recent mess but respects twelve-hour cooldown',()=>{const s=make();s.daily={lastMess:{kind:'food',at:now-60000}};const first=trainingInvitation(s,now);assert.ok(first?.includes('харчування'));assert.equal(trainingInvitation(s,now+1000),null);assert.equal(trainingInvitation(s,now+11*3600000),null);});
test('sleep and vacation prevent training invitations',()=>{const s=make();s.daily={lastMess:{kind:'brush',at:now-1000}};s.sleeping=true;assert.equal(trainingInvitation(s,now),null);s.sleeping=false;s.vacation={started:now};assert.equal(trainingInvitation(s,now),null);});
