import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveMischiefResponse,applyMischiefResponse} from '../public/mischief-reactions.js';
import {performDaily} from '../public/daily-life.js';
const now=1800000000000;
const pet=(discipline,extra={})=>({id:'reactive-dino',species:'dino',trait:'stubborn',born:now-4*86400000,discipline,calm:80,hunger:75,energy:70,happy:70,health:90,bond:20,clean:70,daily:{mess:{id:'mess-1',kind:'food',at:now-1000}},...extra});
test('badly educated pet argues; educated pet accepts responsibility',()=>{const mess={id:'mess-1',kind:'food'};const low=resolveMischiefResponse(pet(5,{calm:20}),mess,0,now);const good=resolveMischiefResponse(pet(92),mess,1,now);assert.equal(low.gesture,'turned');assert.equal(good.repair,true);assert.equal(good.gesture,'approach');});
test('repair earns care benefits; defiant response cannot fake cleanup',()=>{const mess={id:'mess-1',kind:'food'};const good=pet(80);const r=applyMischiefResponse(good,mess,1,now);assert.equal(r.repair,true);assert.equal(good.clean,82);assert.equal(good.bond,22);const defiant=pet(0,{calm:20});const refusal=applyMischiefResponse(defiant,mess,1,now);assert.equal(refusal.repair,false);assert.equal(defiant.clean,70);});
test('resolved mischief cannot be answered twice',()=>{const s=pet(90);const a=performDaily(s,'messAnswer',{eventId:'mess-1',choice:1},now);assert.equal(a.state.daily.mess,null);assert.equal(a.state.daily.lastMess.repaired,true);const replay=performDaily(a.state,'messAnswer',{eventId:'mess-1',choice:1},now+1000);assert.ok(replay.error);});
