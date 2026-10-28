import {test} from 'node:test';import assert from 'node:assert/strict';import {buildCow3D} from '../public/lab-cow3d.js';
function range(parts,part,axis){const v=parts.filter(t=>t.part===part).flatMap(t=>t.points).map(p=>p[axis]);return Math.max(...v)-Math.min(...v);}
test('cow has a sculpted 3D cheek profile rather than a perfect ellipsoid',()=>{
 const mesh=buildCow3D({headYaw:0});
 const head=mesh.filter(t=>t.part==='head').flatMap(t=>t.points);
 const cheek=head.filter(v=>v[1]>1.0&&v[1]<1.45);
 const brow=head.filter(v=>v[1]>1.95&&v[1]<2.18);
 assert.ok(cheek.length>15&&brow.length>15);
 const width=pts=>Math.max(...pts.map(p=>p[0]))-Math.min(...pts.map(p=>p[0]));
 assert.ok(width(cheek)>width(brow)*1.25,'rounded cheek must be visibly wider than upper forehead');
 const rotated=buildCow3D({headYaw:40});
 assert.notDeepEqual(mesh.find(t=>t.part==='head').points,rotated.find(t=>t.part==='head').points);
 assert.deepEqual(mesh.find(t=>t.part==='body').points,rotated.find(t=>t.part==='body').points);
});
