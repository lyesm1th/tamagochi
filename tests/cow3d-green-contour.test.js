import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCow3D,originalCowHeadProfile} from '../public/lab-cow3d.js';

const pts=pose=>buildCow3D({designStyle:'reference',renderMode:'locked',...pose})
 .filter(t=>t.part==='head').flatMap(t=>t.texPoints);
const ext=(values)=>Math.max(...values)-Math.min(...values);
const band=(v,lo,hi)=>ext(v.filter(p=>p[1]>=lo&&p[1]<=hi).map(p=>p[0]));

test('green outline: significantly narrower head without diamond corners',()=>{
 const vertices=pts({headYaw:0});
 const forehead=band(vertices,.25,.5),cheeks=band(vertices,-.31,-.09),chin=band(vertices,-.55,-.39);
 assert.ok(cheeks>forehead*1.28,'cheeks must be the broadest region, not the temples');
 assert.ok(chin<cheeks*.80,'head must taper under cheeks');
 const oldRadius=.94,oldProfile=1.25;
 const newCheekRadius=cheeks/2;
 assert.ok(newCheekRadius<oldRadius*oldProfile*.82,'narrow whole head, not just rearrange width');
 const profile=Array.from({length:180},(_,i)=>originalCowHeadProfile(-.9+i*.01));
 assert.ok(profile.every(Number.isFinite));
 for(let i=1;i<profile.length;i++)assert.ok(Math.abs(profile[i]-profile[i-1])<.03);
});

test('head surface is unchanged by yaw or smile and body stays separate',()=>{
 const a=pts({headYaw:-36,emotion:'neutral'});
 const b=pts({headYaw:36,emotion:'happy'});
 assert.deepEqual(a,b,'repaint and head turns cannot warp the face');
 const straight=buildCow3D({designStyle:'reference',headYaw:0});
 const turned=buildCow3D({designStyle:'reference',headYaw:36});
 assert.notDeepEqual(straight.find(t=>t.part==='head').points,turned.find(t=>t.part==='head').points);
 assert.deepEqual(straight.find(t=>t.part==='body').points,turned.find(t=>t.part==='body').points);
});

test('sleep uses same green sculpt with rigid rotation and protected face details',()=>{
 const awake=buildCow3D({designStyle:'reference',action:'idle'});
 const asleep=buildCow3D({designStyle:'reference',action:'sleep'});
 const A=awake.find(t=>t.part==='head').points,B=asleep.find(t=>t.part==='head').points;
 const d=(points)=>Math.hypot(...points[0].map((x,i)=>x-points[1][i]));
 assert.ok(Math.abs(d(A)-d(B))<1e-7,'lying pose must not squash the head');
});
