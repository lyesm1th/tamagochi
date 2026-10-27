import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rigPoints} from '../public/lab-rig.js';
test('all real pet anatomies provide finite neck and eye coordinates',()=>{
 for(const id of ['pig','sheep','fox','monkey','duck','penguin','dog','cat','chicken','frog','corgi','bear','dino','bunny']){
  for(const age of ['Малюк','Дитина','Підліток','Дорослий']){
   const p=rigPoints(id,age);
   for(const q of [p.pivot,p.eyes])assert.ok(Number.isFinite(q.x)&&Number.isFinite(q.y),id+' '+age);
   assert.ok(p.pivot.y>p.eyes.y,id+' '+age);
  }
 }
});
test('experimental head controls remain inside owner-only lab',async()=>{
 const {readFileSync}=await import('node:fs');
 const html=readFileSync(new URL('../public/lab.html',import.meta.url),'utf8');
 const source=readFileSync(new URL('../public/lab-pixel25d.js',import.meta.url),'utf8');
 assert.match(html,/id="pixel25d-head"/);
 assert.match(html,/id="pixel25d-rig"/);
 assert.match(source,/articulatePortrait/);
});
