import test from 'node:test';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {roomSpeciesLine,roomLine} from '../public/room-life.js';

const expected=['chicken','cat','corgi','frog','bear','dog','dino','bunny','pig','sheep','fox','monkey','duck','penguin'];
const primary={chicken:'rug',cat:'mirror',corgi:'toy',frog:'fountain',bear:'cushion',dog:'bowl',dino:'plant',bunny:'plant',pig:'rug',sheep:'cushion',fox:'toy',monkey:'shelf',duck:'fountain',penguin:'rug'};
const now=1800000000000;

test('every currently playable species has its own room reaction',()=>{
 assert.deepEqual(new Set(species.map(s=>s.id)),new Set(expected));
 const lines=new Set();
 for(const id of expected){
  const pet={id:'room-'+id,species:id};
  const first=roomSpeciesLine(pet,primary[id]);
  assert.ok(first?.length>=20,id);
  assert.equal(roomSpeciesLine(pet,primary[id]),first);
  lines.add(first);
 }
 assert.equal(lines.size,expected.length);
 assert.equal(roomSpeciesLine({species:'unknown'},'rug'),null);
});
test('species dialogue uses existing event triggers without changing shopping lines',()=>{
 for(const id of expected){
  const pet={id:'room-'+id,species:id,cozy:{items:{},preferences:{object:{}}}};
  const item=primary[id],phrase=roomSpeciesLine(pet,item);
  const normal=Array.from({length:80},(_,i)=>roomLine(pet,item,'use',now+2300*i));
  assert.ok(normal.includes(phrase),id);
  const acquired=roomLine(pet,item,'new',now);
  assert.notEqual(acquired,phrase,id);
 }
});
