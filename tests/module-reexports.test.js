import test from 'node:test';
import assert from 'node:assert/strict';
import * as life from '../public/pet-life.js';
import * as game from '../public/game.js';
import {weatherAt as directWeather} from '../public/weather.js';
import {weatherAt as worldWeather} from '../public/little-world.js';
test('game retains identical pet lifecycle exports after import deduplication',()=>{
 for(const name of ['MINUTE','HOUR','DAY','life','care','seniorAt','stage'])
  assert.strictEqual(game[name],life[name],name);
});
test('world weather export retains the original implementation',()=>{
 assert.strictEqual(worldWeather,directWeather);
});
