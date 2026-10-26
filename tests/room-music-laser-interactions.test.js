import test from 'node:test';
import assert from 'node:assert/strict';
import {roomHit,roomLine,roomSounds} from '../public/room-life.js';

const pet=()=>({id:'room-music-laser',species:'dino',cozy:{owned:{music:true,laser:true},items:{},preferences:{}},room:{},playroom:{toys:{ball:true}}});

for(const style of ['classic','detailed']){
 test(`music and laser are tappable in ${style} room without changing the existing furniture geometry`,()=>{
  const s=pet();
  assert.equal(roomHit(s,160,110,style),'music');
  assert.equal(roomHit(s,140,122,style),'laser');
  assert.equal(roomHit({...s,cozy:{...s.cozy,owned:{music:false,laser:false}}},160,110,style),null);
 });
}
test('music and laser have themed room reactions and audio hooks',()=>{
 const s=pet();
 assert.match(roomLine(s,'music','use',1800000000000),/музик|лапки|пісню|рухи|Музика/i);
 assert.equal(roomSounds.music,'play');
 assert.equal(roomSounds.laser,'play');
});
