import {test} from 'node:test';
import assert from 'node:assert/strict';
import {animationLibrary,interactionAnimations,animationForInteraction,interactionPose} from '../public/lab-interactions25d.js';
test('animation library covers room, petting and ordinary pet care',()=>{
 for(const action of ['feed','milk','sleep','wake','pet','hug','walk','dance','mirror','bed','toy'])assert.ok(animationLibrary[animationForInteraction(action)],action);
 assert.ok(Object.keys(animationLibrary).length>=15);
});
test('deterministic and bounded rig poses expose garment and room anchors',()=>{
 for(const name of Object.keys(animationLibrary)){
  const pose=interactionPose(name,333);
  assert.deepEqual(pose,interactionPose(name,333));
  for(const key of ['headYaw','leftHand','rightHand','bob'])assert.ok(Number.isFinite(pose[key]),name+': '+key);
  assert.ok(Math.abs(pose.headYaw)<=30);
  assert.ok(Math.abs(pose.leftHand)<=30);
  assert.ok(pose.garmentAnchors.includes('head')&&pose.roomAnchors.includes('bed'));
 }
 assert.equal(interactionAnimations.mirror,'mirror');
});

test('every clip exposes at least one reachable blink frame unless blinking is disabled',()=>{
 for(const [name,clip] of Object.entries(animationLibrary)){
  const p=interactionPose(name,clip.duration-60);
  assert.equal(p.blink,clip.blink,name);
  assert.ok(p.contacts.bed&&p.contacts.floor,name);
 }
});
