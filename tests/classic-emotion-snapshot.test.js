import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
import {drawClassicActor} from '../public/classic-actor.js';
import {emotionalAppearance} from '../public/pet-expression.js';
const source=readFileSync(new URL('../public/classic-actor.js',import.meta.url),'utf8');

test('classic actor resolves one emotional snapshot per rendered frame',()=>{
 assert.equal((source.match(/emotionalAppearance\(s,Date\.now\(\),reduced\)/g)||[]).length,1);
 assert.ok(source.includes('const a=faceAnchors(id,age),e=expression;'));
});

test('both visual modes share the emotion selector and keep existing coordinates',()=>{
 const s={id:'emotion-check',species:'cat',born:1800000000000-900000,health:90,happy:90,hunger:90,
   emotion:{kind:'sad',at:1800000000000-2000,until:1800000000000+60000,strength:.8}};
 const now=1800000000000;
 assert.deepEqual(emotionalAppearance(s,now,false),emotionalAppearance(structuredClone(s),now,false));
 assert.equal(emotionalAppearance({...s,sleeping:true},now,false).strength,0);
 const detailed=readFileSync(new URL('../public/detailed-renderer.js',import.meta.url),'utf8');
 assert.ok(detailed.includes('emotionalAppearance(pet,now,reduced)'));
 assert.ok(detailed.includes('const appearance=emotionalAppearance(pet,now,reduced)'));
 assert.ok(detailed.includes('dressedSprite(pet,id,age,sheet,now,reduced,!active(effect,now),appearance)'));
});

test('classic canvas renders with and without clothing and never mutates pet state',()=>{
 const beforeDocument=globalThis.document,beforeNow=Date.now;
 const now=1800000000000;
 const canvas=createCanvas(128,100);
 const s={id:'render-check',species:'cat',born:now-900000,health:90,happy:90,hunger:90,
  emotion:{kind:'sad',at:now-2000,until:now+60000,strength:.8},
  cozy:{wearing:{}}};
 globalThis.document={createElement:()=>createCanvas(1,1)};
 Date.now=()=>now;
 try{
  const expected=structuredClone(s);
  drawClassicActor(canvas.getContext('2d'),'cat','Дорослий','#bf9ae0',1,s,false);
  assert.deepEqual(s,expected);
  const dressed={...s,cozy:{wearing:{body:'sweater',neck:'scarf',head:'panama',eyes:'glasses'}}};
  const dressedBefore=structuredClone(dressed);
  drawClassicActor(canvas.getContext('2d'),'cat','Дорослий','#bf9ae0',1,dressed,false);
  assert.deepEqual(dressed,dressedBefore);
 }finally{globalThis.document=beforeDocument;Date.now=beforeNow;}
});
