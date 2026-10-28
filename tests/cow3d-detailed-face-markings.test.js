import {test} from 'node:test';import assert from 'node:assert/strict';import {buildCow3D} from '../public/lab-cow3d.js';
test('Detailed-inspired coat markings are independent volumetric head meshes',()=>{
 const a=buildCow3D({headYaw:-30}),b=buildCow3D({headYaw:30});
 const marks=f=>f.filter(x=>x.part==='foreheadMark');
 assert.ok(marks(a).length>30);
 assert.notDeepEqual(marks(a)[0].points,marks(b)[0].points);
 assert.deepEqual(a.find(x=>x.part==='body').points,b.find(x=>x.part==='body').points);
});
