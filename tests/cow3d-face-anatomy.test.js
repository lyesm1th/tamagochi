import {test} from 'node:test';import assert from 'node:assert/strict';import {buildCow3D} from '../public/lab-cow3d.js';
const get=(mesh,part)=>mesh.filter(f=>f.part===part).flatMap(f=>f.points);
const range=(points,k)=>[Math.min(...points.map(p=>p[k])),Math.max(...points.map(p=>p[k]))];
test('muzzle has distinct volumetric projection and nostrils are positioned on its front',()=>{
 const mesh=buildCow3D(),m=get(mesh,'muzzle'),n=get(mesh,'nostril');
 assert.ok(m.length>0&&n.length>0);
 assert.ok(range(n,2)[1]>range(m,2)[0]);
});
test('eye and muzzle stay independently attached to rotating head while body is fixed',()=>{
 const a=buildCow3D({headYaw:-30}),b=buildCow3D({headYaw:30});
 for(const part of ['eye','muzzle','nostril'])assert.notDeepEqual(get(a,part),get(b,part),part);
 assert.deepEqual(get(a,'body'),get(b,'body'));
});
