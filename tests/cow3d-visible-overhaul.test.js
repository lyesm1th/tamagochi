import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCow3D} from '../public/lab-cow3d.js';
function bounds(faces,part){const p=faces.filter(t=>t.part===part).flatMap(t=>t.points);return {w:Math.max(...p.map(a=>a[0]))-Math.min(...p.map(a=>a[0])),h:Math.max(...p.map(a=>a[1]))-Math.min(...p.map(a=>a[1]))};}
test('reference cow silhouette emphasizes facial volume and wider ears over compact torso',()=>{
 const faces=buildCow3D();
 assert.ok(bounds(faces,'head').w>bounds(faces,'body').w*1.14);
 assert.ok(bounds(faces,'ear').w>0.7);
 assert.ok(bounds(faces,'leg0').h<bounds(faces,'body').h*.7);
});
test('head rotation leaves body alone and moves real three-dimensional ears',()=>{
 const a=buildCow3D({headYaw:-35}),b=buildCow3D({headYaw:35});
 const p=(faces,part)=>faces.find(f=>f.part===part).points;
 assert.deepEqual(p(a,'body'),p(b,'body'));
 assert.notDeepEqual(p(a,'ear'),p(b,'ear'));
});
