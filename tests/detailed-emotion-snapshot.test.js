import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emotionalAppearance} from '../public/pet-expression.js';
import {emotionOf} from '../public/emotions.js';
import {gitBlobHash} from '../scripts/check-visual-baseline.mjs';
const source=readFileSync(new URL('../public/detailed-renderer.js',import.meta.url),'utf8');
const baseline=JSON.parse(readFileSync(new URL('./baselines/visual-files.json',import.meta.url),'utf8'));
test('detailed actor renders with a single emotional snapshot per frame',()=>{
 const actor=source.split('export function drawDetailedPet(')[1].split('\nfunction layout(')[0];
 assert.equal((actor.match(/emotionalAppearance\(pet,now,reduced\)/g)||[]).length,1);
 assert.ok(actor.includes('const now=Date.now(),sheet=sheetOf(pet,effect,now)'));
 assert.ok(actor.includes('dressedSprite(pet,id,age,sheet,now,reduced,!active(effect,now),appearance)'));
});
test('dressed sprite accepts snapshot without calculating a second mood',()=>{
 const block=source.split('export function dressedSprite(')[1].split('\nfunction sparkles(')[0];
 assert.ok(block.includes('sharedAppearance=null'));
 assert.ok(block.includes('sharedAppearance??emotionalAppearance(pet,now,reduced)'));
});
test('visual safety baseline documents only the intended renderer source change',()=>{
 const bytes=readFileSync(new URL('../public/detailed-renderer.js',import.meta.url));
 assert.equal(gitBlobHash(bytes),baseline['public/detailed-renderer.js']);
});
test('a fixed emotional state stays deterministic across cloned pets',()=>{
 const now=1800000000000,s={id:'snapshot',species:'cat',born:now-900000,emotion:{kind:'sad',at:now-2000,until:now+60000,strength:.8}};
 assert.deepEqual(emotionOf(s,now),emotionOf(structuredClone(s),now));
 assert.deepEqual(emotionalAppearance(s,now,false),emotionalAppearance(structuredClone(s),now,false));
});
