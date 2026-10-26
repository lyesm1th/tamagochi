import test from 'node:test';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {roomSpeciesPreference,roomNeedPriority} from '../public/room-life.js';

const choices={
 chicken:['rug','bowl'],cat:['toy','mirror'],corgi:['toy','rug'],
 frog:['fountain','plant'],bear:['cushion','bed'],dog:['bowl','rug'],
 dino:['plant','toy'],bunny:['plant','rug'],pig:['rug','bowl'],
 sheep:['cushion','rug'],fox:['toy','mirror'],monkey:['shelf','toybox'],
 duck:['fountain','bowl'],penguin:['rug','fountain']
};
const pet=id=>({id:'species-choice-'+id,species:id,energy:95,hunger:95,cozy:{items:{},preferences:{object:{}}}});

test('every playable species has a distinct safe pair of room preferences',()=>{
 assert.equal(species.length,14);
 assert.deepEqual(new Set(species.map(s=>s.id)),new Set(Object.keys(choices)));
 for(const {id} of species){
  const s=pet(id),available=choices[id];
  assert.ok(available.includes(roomSpeciesPreference(s,available,0)),id);
  assert.equal(roomSpeciesPreference(s,available,1),null);
  assert.equal(roomSpeciesPreference(s,available,2),null);
  assert.ok(available.includes(roomSpeciesPreference(s,available,3)),id);
 }
});
test('stored, absent, disliked furnishings cannot be chosen',()=>{
 for(const {id} of species){
  const s=pet(id),available=choices[id];
  assert.equal(roomSpeciesPreference(s,[],0),null);
  assert.equal(roomSpeciesPreference(s,['unknown'],0),null);
  s.cozy.preferences.object.annoy=available[0];
  assert.equal(roomSpeciesPreference(s,[available[0]],0),null);
  assert.equal(roomSpeciesPreference(s,[available[1]],0),available[1]);
 }
});
test('preferences do not mutate the pet or override need priority',()=>{
 for(const {id} of species){
  const s=pet(id),before=structuredClone(s);
  roomSpeciesPreference(s,choices[id],6);
  assert.deepEqual(s,before);
  assert.equal(roomNeedPriority({...s,energy:50},['bed','bowl']),'bed');
  assert.equal(roomNeedPriority({...s,hunger:50},['bowl']),'bowl');
 }
 assert.equal(roomSpeciesPreference({species:'unknown'},['rug'],0),null);
});
