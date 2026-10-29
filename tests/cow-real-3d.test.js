import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCow3D,cow3DParts} from '../public/lab-cow3d.js';
const source=readFileSync(new URL('../public/lab.html',import.meta.url),'utf8');
test('cow is independently rotating volumetric triangles rather than a billboard',()=>{
 const front=buildCow3D({headYaw:0}),turned=buildCow3D({headYaw:35});
 assert.ok(front.length>900,'rendered cow has a real polyhedral surface');
 assert.equal(front.length,turned.length);
 assert.ok(front.every(f=>f.points.length===3&&f.points.every(p=>p.length===3)));
 const a=front.find(f=>f.part==='head'),b=turned.find(f=>f.part==='head');
 assert.notDeepEqual(a.points,b.points);
 const unchanged=front.find(f=>f.part==='body'),other=turned.find(f=>f.part==='body');
 assert.deepEqual(unchanged.points,other.points,'head rotation does not warp torso');
 assert.ok(cow3DParts.includes('four legs'));
});
test('cow animation includes geometry, four feet, eye blink and sleeping squash',()=>{
 const a=buildCow3D({time:100,action:'walk'}),b=buildCow3D({time:300,action:'walk'});
 assert.notDeepEqual(a.find(f=>f.part==='leg0'),b.find(f=>f.part==='leg0'));
 assert.equal(new Set(a.filter(f=>/^hoof/.test(f.part)).map(f=>f.part)).size,4);
 const open=buildCow3D({blink:false}),closed=buildCow3D({blink:true});
 assert.ok(open.some(f=>f.part==='eye')&&!closed.some(f=>f.part==='eye'));
 assert.ok(closed.some(f=>f.part==='lid'));
 assert.notDeepEqual(buildCow3D({action:'sleep'}).find(f=>f.part==='body').points,open.find(f=>f.part==='body').points);
});
test('3D laboratory is restricted to existing owner lab and keeps real game mode untouched',()=>{
 for(const id of ['cow3d-stage','cow3d-yaw','cow3d-head','cow3d-action','cow3d-status'])assert.match(source,new RegExp('id="'+id+'"'));
 assert.match(source,/src="\/lab-cow3d\.js\?v=allpetsv10"/);
 assert.doesNotMatch(readFileSync(new URL('../public/graphics-mode.js',import.meta.url),'utf8'),/cow3d/i);
});
