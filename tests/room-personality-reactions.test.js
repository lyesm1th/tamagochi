import test from 'node:test';
import assert from 'node:assert/strict';
import {roomCharacterLine,roomLine} from '../public/room-life.js';

const pet=(character)=>({id:'personality-room-dialogue',species:'dino',born:1,trait:'sleepy',
 character:{playfulness:20,curiosity:20,stubbornness:20,affection:20,...character},
 cozy:{items:{},preferences:{object:{}}}});
const now=1800000000000;

test('personality-specific object dialogue follows the strongest matching trait',()=>{
 const playful=pet({playfulness:95});
 assert.match(roomCharacterLine(playful,'music',now),/Танцюю|Сусідам/);
 assert.equal(roomCharacterLine(playful,'shelf',now),null);
 const curious=pet({curiosity:95});
 assert.match(roomCharacterLine(curious,'plant',now),/листя/);
 const stubborn=pet({stubbornness:95});
 assert.match(roomCharacterLine(stubborn,'toybox',now),/скарби/);
 const affectionate=pet({affection:95});
 assert.match(roomCharacterLine(affectionate,'cushion',now),/Посидь/);
});

test('lines remain deterministic without mutating a pet or creating a speech loop',()=>{
 const s=pet({playfulness:95});
 const before=structuredClone(s),line=roomCharacterLine(s,'music',now);
 assert.equal(roomCharacterLine(s,'music',now),line);
 assert.equal(roomCharacterLine(s,'window',now),null);
 assert.deepEqual(s,before);
 const lines=Array.from({length:100},(_,i)=>roomLine(s,'music','use',now+i*2300));
 assert.ok(lines.some(text=>text===line||/Танцюю|Сусідам/.test(text)));
});

test('new purchases and outfit reactions retain their established wording',()=>{
 const s=pet({playfulness:95});
 assert.match(roomLine(s,'music','new',now),/Придивлюся|обновка|погодився|улюблене|Підходить/);
 assert.equal(roomCharacterLine(pet({}),'music',now),null);
});
