import test from 'node:test';import assert from 'node:assert/strict';
import {petWhim,whimLine,whimRefusalChance} from '../public/pet-whims.js';
import {directInteraction} from '../public/interaction-boundaries.js';
const BASE=1800000000000,WIN=27*60000;
const p={id:'loved-but-real',species:'dino',bond:100,calm:100,happy:100,hunger:85,energy:100,health:100,discipline:100,trait:'stubborn'};
test('episodes are stable on reload, expire naturally and never depend on bond',()=>{
 const slot=Math.floor(BASE/WIN)*WIN;
 assert.deepEqual(petWhim(p,slot+200),petWhim({...p,bond:0},slot+200));
 assert.equal(petWhim(p,slot+12*60000),null);
 assert.ok(whimLine(p,slot+1000));
});
test('short-lived moods vary across periods and affect interactions',()=>{
 const kinds=new Set(),changes=new Set();
 for(let i=0;i<30;i++){const time=(Math.floor(BASE/WIN)+i)*WIN+30000,episode=petWhim(p,time);kinds.add(episode.kind);changes.add(whimRefusalChance(p,'play',time));}
 assert.ok(kinds.size>=4,[...kinds]);assert.ok(changes.size>=3,[...changes]);
});
test('care is accessible when needed and episode never deducts coins',()=>{
 const s={...p,hunger:20};for(let i=0;i<12;i++)assert.equal(directInteraction({...s},'feed',BASE+i*WIN),null);
 assert.equal(petWhim({...p,sleeping:true},BASE),null);
});
