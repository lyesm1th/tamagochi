import test from 'node:test';
import assert from 'node:assert/strict';
import {patienceTraining,trainingView,lessonKinds} from '../public/patience-training.js';
const now=1800000000000;
const make=()=>({id:'lesson-pet',species:'dino',trait:'stubborn',discipline:50,hunger:80,energy:80,happy:75});
test('four lesson categories are available and learn distinct rules',()=>{assert.deepEqual(lessonKinds,['patience','requests','food','belongings']);for(const kind of lessonKinds){const s=make();assert.equal(patienceTraining(s,null,now,kind).ok,true);assert.equal(trainingView(s).kind,kind);const before=s.manners.skills[kind].training;assert.equal(patienceTraining(s,0,now+1000).ok,true);assert.equal(patienceTraining(s,0,now+2000).ok,true);assert.equal(s.manners.skills[kind].training,before+10);assert.equal(trainingView(s),null);assert.equal(patienceTraining(s,0,now+3000).ok,false);}});
test('wrong answers cannot generate rewards and cooldown spans lesson categories',()=>{const s=make();patienceTraining(s,null,now,'requests');const before=s.manners.skills.requests.training;patienceTraining(s,1,now+1000);assert.equal(s.manners.skills.requests.training,before);assert.equal(patienceTraining(s,null,now+3000,'food').ok,false);});
test('invalid lesson cannot create a training session',()=>{const s=make();assert.equal(patienceTraining(s,null,now,'invalid').ok,false);assert.equal(trainingView(s),null);});
