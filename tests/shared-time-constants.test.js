import test from 'node:test';
import assert from 'node:assert/strict';
import {MINUTE,HOUR} from '../public/pet-life.js';
import {weatherAt} from '../public/weather.js';
import {weatherAt as worldWeather} from '../public/little-world.js';

test('shared time constants retain exact original durations',()=>{
 assert.equal(MINUTE,60000);
 assert.equal(HOUR,3600000);
 assert.strictEqual(worldWeather,weatherAt);
});
test('weather rolls over only at a three-hour UTC slot boundary',()=>{
 const slot=12*HOUR,start=slot+9;
 const first=weatherAt(start);
 assert.deepEqual(weatherAt(start+3*HOUR-10),first);
 assert.equal(first.until,slot+3*HOUR);
 assert.notEqual(weatherAt(slot+3*HOUR).until,first.until);
});
