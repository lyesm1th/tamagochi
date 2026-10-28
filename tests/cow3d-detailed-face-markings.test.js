import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCow3D} from '../public/lab-cow3d.js';
import {paintOriginalCowSurface,originalCowPigments} from '../public/lab-cow3d-paint.js';

test('approved Detailed cow has local-space dark crown instead of floating painted blobs',()=>{
 const left=buildCow3D({designStyle:'reference',headYaw:-30});
 const right=buildCow3D({designStyle:'reference',headYaw:30});
 const marks=f=>f.filter(tri=>tri.part==='foreheadMark');
 assert.equal(marks(left).length,0);
 const headA=left.find(f=>f.part==='head'),headB=right.find(f=>f.part==='head');
 assert.deepEqual(headA.texPoints,headB.texPoints,'head paint UV must not change with turn');
 assert.notDeepEqual(headA.points,headB.points,'paint follows rotating 3D head');
 assert.equal(paintOriginalCowSurface('head',[-.55,.25,.48],[0,0,1],originalCowPigments.coat),originalCowPigments.patch);
 assert.equal(paintOriginalCowSurface('head',[0,.20,.56],[0,0,1],originalCowPigments.coat),originalCowPigments.coat);
 assert.deepEqual(left.find(x=>x.part==='body').points,right.find(x=>x.part==='body').points);
});

test('previous cream Detailed approximation remains available as optional 3D variant',()=>{
 const left=buildCow3D({designStyle:'cream',headYaw:-30});
 const right=buildCow3D({designStyle:'cream',headYaw:30});
 const marks=f=>f.filter(x=>x.part==='foreheadMark');
 assert.ok(marks(left).length>30);
 assert.notDeepEqual(marks(left)[0].points,marks(right)[0].points);
});
