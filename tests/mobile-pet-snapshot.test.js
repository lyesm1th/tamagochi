import test from 'node:test';
import assert from 'node:assert/strict';
import {mobilePetSnapshot} from '../public/mobile-pet-snapshot.js';
import {fresh} from '../public/game.js';

test('compact snapshot does not mutate saved state',()=>{
 const pet=fresh('dino',1_000_000);pet.cozy={wearing:{hat:'panama'}};pet.happy=71.6;
 const before=structuredClone(pet);
 const result=mobilePetSnapshot(pet,1_000_000);
 assert.equal(result.pet.species,'dino');
 assert.equal(result.pet.age,'Яєчко');
 assert.equal(result.pet.mood.happy,72);
 assert.deepEqual(result.pet.wearing,{hat:'panama'});
 assert.deepEqual(pet,before);
 assert.equal(result.pet.coins,undefined);
});
test('legacy cow identifier remains dog',()=>{
 const pet=fresh('dog',1_000_000);
 assert.equal(mobilePetSnapshot(pet,1_000_000).pet.species,'dog');
});
test('empty pet is represented without inventing a new pet',()=>{
 assert.deepEqual(mobilePetSnapshot(null),{schema:1,pet:null});
});
