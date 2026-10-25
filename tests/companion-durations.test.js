import test from 'node:test';
import assert from 'node:assert/strict';
import {HOUR,DAY} from '../public/pet-life.js';
import {maybeAdventure,routineHint} from '../public/companionship.js';
test('companion durations preserve historic hour and day sizes',()=>{
 assert.equal(HOUR,3600000);
 assert.equal(DAY,86400000);
 assert.equal(typeof maybeAdventure,'function');
 assert.equal(typeof routineHint,'function');
});
