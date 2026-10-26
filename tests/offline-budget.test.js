import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,life,DAY,tick} from '../public/game.js';
import {updateDaily} from '../public/daily-life.js';
const now=1800000000000;
function pet(){const s=fresh('dino',now-life.baby-DAY);s.updated=now;s.sleeping=false;s.napping=false;s.daily.wishAt=now;s.daily.mischiefAt=now;s.daily.findAt=now;s.daily.kindAt=now;return s;}
test('offline catch-up produces no more than three new daily events',()=>{const s=pet();const before=Object.values(s.daily.stash).reduce((n,v)=>n+v,0);updateDaily(s,now,{offline:true});const treasure=Object.values(s.daily.stash).reduce((n,v)=>n+v,0)-before;const count=Number(!!s.daily.wish)+Number(!!s.daily.mess)+treasure+Number(!!s.daily.kind)+Number(!!s.daily.trainingRequest);assert.ok(count<=3);assert.ok(treasure<=1);const countBefore=count;updateDaily(s,now,{offline:true});const after=Object.values(s.daily.stash).reduce((n,v)=>n+v,0)-before;assert.equal(after,treasure);});
test('offline mode preserves sleep and vacation guards',()=>{const s=pet();s.sleeping=true;updateDaily(s,now,{offline:true});assert.equal(s.daily.mess,undefined);s.sleeping=false;s.vacation={started:now};updateDaily(s,now+DAY,{offline:true});assert.equal(s.daily.mess,undefined);});
test('normal tick still maintains time and recurring needs after long absence',()=>{const s=pet();s.daily.wishAt=now+5*DAY;s.daily.mischiefAt=now+5*DAY;s.daily.findAt=now+5*DAY;s.daily.kindAt=now+5*DAY;const hunger=s.hunger;tick(s,now+2*3600000);assert.equal(s.updated,now+2*3600000);assert.ok(s.hunger<hunger);});
