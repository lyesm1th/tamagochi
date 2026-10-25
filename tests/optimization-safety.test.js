import test from 'node:test';
import assert from 'node:assert/strict';
import {checkVisualBaseline,gitBlobHash} from '../scripts/check-visual-baseline.mjs';
test('git blob hashing follows content-addressable format',()=>{
 assert.equal(gitBlobHash(Buffer.from('hello'+String.fromCharCode(10))),'ce013625030ba8dba906f756967f9e9ca394464a');
});
test('approved pixel art, sprite geometry and wardrobe files remain byte-identical',()=>{
 assert.ok(checkVisualBaseline()>=50);
});
