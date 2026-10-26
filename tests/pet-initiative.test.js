import test from 'node:test';
import assert from 'node:assert/strict';
import {petInitiative} from '../public/pet-initiative.js';
import {interactionPreferences} from '../public/interaction-preferences.js';
const HOUR=3600000,now=1800000000000;
const pet=(trait='playful')=>({id:'initiative-pet-'+trait,species:'dino',trait,born:now-9*24*HOUR,hunger:85,energy:85,health:85,happy:80,discipline:65});
test('requests arise occasionally and cannot repeat in the same eight-hour window',()=>{
 const s=pet();let first=null,when=null;
 for(let i=0;i<100;i++){const at=now+i*8*HOUR;const text=petInitiative(s,at);if(text){first=text;when=at;break;}}
 assert.ok(first);assert.equal(petInitiative(s,when+1000),null);
 const saved=JSON.parse(JSON.stringify(s));assert.equal(petInitiative(saved,when+10000),null);
});
test('pet initiative uses favorite activity, while respecting hunger and sleep',()=>{
 const s=pet('sleepy');const p=interactionPreferences(s);assert.ok(p.quiet>p.play&&p.quiet>p.touch);
 let message=null;for(let i=0;i<100;i++){message=petInitiative(s,now+i*8*HOUR);if(message)break;}
 assert.match(message,/тиш|відпоч/);
 const asleep=pet();asleep.sleeping=true;assert.equal(petInitiative(asleep,now),null);
 const hungry=pet();hungry.hunger=12;assert.equal(petInitiative(hungry,now),null);
});
test('no coins or equipment change from an initiative',()=>{
 const s=pet();s.coins=555;s.cozy={owned:{bed:true}};
 for(let i=0;i<50;i++)petInitiative(s,now+i*8*HOUR);
 assert.equal(s.coins,555);assert.equal(s.cozy.owned.bed,true);
 assert.ok((s.initiatives?.count||0)<=100);
});
