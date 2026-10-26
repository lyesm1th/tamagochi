import test from 'node:test';
import assert from 'node:assert/strict';
import {returnBehaviorSummary} from '../public/behavior-return.js';
const hour=3600000,now=1800000000000;
const pet=()=>({id:'return-dino',species:'dino',daily:{mess:{id:'mess-1',kind:'food',at:now-hour},lastFind:{id:'stone',at:now-hour/2},lastMess:{id:'mess-0',kind:'brush',at:now-hour*3,repaired:true}}});
test('return recap reports only real persisted events and is bounded',()=>{const s=pet();const text=returnBehaviorSummary(s,now-4*hour,now);assert.match(text,/розсипав корм/);assert.match(text,/скарб/);assert.match(text,/допоміг прибрати/);assert.equal(returnBehaviorSummary(s,now-4*hour,now),null);});
test('vacation, short absence and empty history do not make up events',()=>{const s=pet();assert.equal(returnBehaviorSummary(s,now-10*60000,now),null);s.vacation={started:now-hour};assert.equal(returnBehaviorSummary(s,now-4*hour,now),null);assert.equal(returnBehaviorSummary({daily:{}},now-4*hour,now),null);});
test('events before the absence are not included',()=>{const s=pet();assert.equal(returnBehaviorSummary(s,now-5*60000,now),null);s.daily.lastFind.at=now-6*hour;s.daily.lastMess.at=now-6*hour;s.daily.mess.at=now-6*hour;assert.equal(returnBehaviorSummary(s,now-4*hour,now),null);});
