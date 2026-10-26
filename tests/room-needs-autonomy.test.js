import test from 'node:test';
import assert from 'node:assert/strict';
import {roomNeedPriority} from '../public/room-life.js';
test('tired pets choose an available bed ahead of food',()=>{
 assert.equal(roomNeedPriority({energy:50,hunger:40},['bed','bowl']),'bed');
});
test('hungry pets seek their available bowl or fountain',()=>{
 assert.equal(roomNeedPriority({energy:90,hunger:50},['bed','bowl']),'bowl');
 assert.equal(roomNeedPriority({energy:90,hunger:50},['fountain']),'fountain');
});
test('unavailable or broken furnishings do not force need actions',()=>{
 assert.equal(roomNeedPriority({energy:45,hunger:45},['mirror']),null);
 assert.equal(roomNeedPriority({energy:90,hunger:90},['bed','bowl']),null);
 assert.equal(roomNeedPriority({},['bed','bowl']),null);
});
