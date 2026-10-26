import test from 'node:test';
import assert from 'node:assert/strict';
import {neglectSkills,inheritedLearningBonus} from '../public/behavior-development.js';
import {practiceManners,ensureManners} from '../public/manners.js';
const HOUR=3600000,now=1800000000000;
const pet=(score=60)=>({species:'dino',id:'decay-pet',discipline:score,hunger:70,happy:70,clean:70,energy:70});
test('ordinary absence and vacation never decay mastered rules',()=>{const s=pet(70);ensureManners(s);const before=s.discipline;neglectSkills(s,now,now+72*HOUR);assert.equal(s.discipline,before);s.hunger=0;s.vacation={started:now};neglectSkills(s,now+72*HOUR,now+172*HOUR);assert.equal(s.discipline,before);});
test('neglect needs 48 continuous hours and recovery resets it',()=>{const s=pet(60);s.hunger=0;ensureManners(s);neglectSkills(s,now,now+47*HOUR);assert.equal(s.discipline,60);neglectSkills(s,now+47*HOUR,now+49*HOUR);assert.ok(s.discipline<60);assert.ok(s.discipline>59);s.hunger=80;neglectSkills(s,now+49*HOUR,now+50*HOUR);const after=s.discipline;s.hunger=0;neglectSkills(s,now+50*HOUR,now+97*HOUR);assert.equal(s.discipline,after);});
test('inherited boost is bounded, not learned skills',()=>{assert.equal(inheritedLearningBonus(pet(100)),.08);assert.equal(inheritedLearningBonus(pet(55)),.02);const s=pet(0);ensureManners(s);s.manners.inheritedBonus=.08;practiceManners(s,'food',now);assert.equal(s.manners.skills.food.practice,4.32);});
