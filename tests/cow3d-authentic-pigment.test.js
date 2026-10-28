import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCow3D} from '../public/lab-cow3d.js';
import {detailedCowPigment} from '../public/lab-cow3d-texture.js';
test('Detailed texture pigment transfer gracefully falls back without browser atlas',()=>{
 assert.equal(detailedCowPigment('body',[0,1,0],[0,0,1],'#f8e8c9'),'#f8e8c9');
});
test('3D head, body, blinking and rotation stay structurally intact',()=>{
 const base=buildCow3D({headYaw:0});
 const turned=buildCow3D({headYaw:32});
 const a=new Set(base.map(f=>f.part));
 for(const k of ['head','body','muzzle','eye','ear','horn','leg0','leg1','leg2','leg3'])assert.ok(a.has(k),k);
 assert.notDeepEqual(base.find(f=>f.part==='head').points,turned.find(f=>f.part==='head').points);
 assert.deepEqual(base.find(f=>f.part==='body').points,turned.find(f=>f.part==='body').points);
 assert.ok(buildCow3D({blink:true}).some(f=>f.part==='lid'));
});

test('each polygon provides UV-local coordinates for per-pixel 3D raster painting',()=>{
 const triangles=buildCow3D({headYaw:33});
 for(const part of ['head','body']){
  const face=triangles.find(f=>f.part===part);
  assert.equal(face.texPoints.length,3);
  assert.equal(face.texPoints[0].length,3);
 }
});

test('Detailed pixel raster uses exact one-pixel sampling rather than bleeding 2x2 stamps',async()=>{
 const {readFileSync}=await import('node:fs');
 const source=readFileSync(new URL('../public/lab-cow3d.js',import.meta.url),'utf8');
 assert.match(source,/ctx\.fillRect\(x,y,1,1\)/);
 assert.doesNotMatch(source,/ctx\.fillRect\(x,y,2,2\)/);
});
