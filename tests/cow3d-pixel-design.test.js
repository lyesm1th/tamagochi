import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCow3D} from '../public/lab-cow3d.js';
test('reference cow retains solid articulated body and both independent eyes',()=>{
 const pose=buildCow3D({headYaw:23,action:'idle',time:500});
 const parts=new Set(pose.map(x=>x.part));
 for(const part of ['head','muzzle','muzzleHighlight','eye','sparkle','sparkleSmall','fringe','fringeLock','fringeDetail','horn','body','cheek'])assert.ok(parts.has(part),part);
 const eyes=pose.filter(x=>x.part==='eye'),blink=buildCow3D({blink:true});
 assert.equal(blink.filter(x=>x.part==='eye').length,0);
 assert.ok(eyes.length>50);
 assert.ok(blink.some(x=>x.part==='lid'));
});
test('eye detail tracks head rotation without moving body geometry',()=>{
 const a=buildCow3D({headYaw:-40}),b=buildCow3D({headYaw:40});
 const byPart=(faces,name)=>faces.find(x=>x.part===name).points;
 assert.notDeepEqual(byPart(a,'sparkle'),byPart(b,'sparkle'));
 assert.deepEqual(byPart(a,'body'),byPart(b,'body'));
});
