import {test} from 'node:test';
import assert from 'node:assert/strict';
import {labClipPose,labClips} from '../public/lab-motion.js';
test('isolated 2.5D clips are finite, reproducible and loop smoothly',()=>{
 for(const [name,clip] of Object.entries(labClips)){
  const a=labClipPose(name,0),b=labClipPose(name,clip.duration),mid=labClipPose(name,clip.duration/4);
  assert.deepEqual(a,b,name);
  for(const pose of [a,b,mid])for(const value of Object.values(pose))assert.ok(Number.isFinite(value),name);
  assert.ok(Math.abs(mid.tilt)<=Math.abs(clip.tilt)+0.01);
 }
});
test('animation controller is separate from player storage and production graphics mode',async()=>{
 const {readFileSync}=await import('node:fs');
 const src=readFileSync(new URL('../public/lab-pixel25d.js',import.meta.url),'utf8');
 const mode=readFileSync(new URL('../public/graphics-mode.js',import.meta.url),'utf8');
 assert.match(src,/labClipPose/);
 assert.match(src,/pixel25d-play/);
 assert.doesNotMatch(mode,/pixel25d|2\.5d/i);
 assert.doesNotMatch(src,/localStorage|fetch\(/);
});
