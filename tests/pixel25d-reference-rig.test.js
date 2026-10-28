import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {referenceSpecies,referenceJoints,referencePose} from '../public/lab-reference-rig.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('first detailed pixel rig is restricted to reference cat and limited joint angles',()=>{
 assert.equal(referenceSpecies,'cat');
 assert.deepEqual(referenceJoints,['head','leftHand','rightHand','eyes']);
 assert.deepEqual(referencePose({head:100,leftHand:-88,rightHand:12}),{head:30,headYaw:0,leftHand:-30,rightHand:12,blink:false});
});
test('new rig remains entirely in owner-only lab, never a player graphics mode',()=>{
 const html=read('public/lab.html'),src=read('public/lab-pixel25d.js'),mode=read('public/graphics-mode.js');
 for(const id of ['pixel25d-reference','pixel25d-left-hand','pixel25d-right-hand'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(src,/referenceEnabled/);
 assert.match(src,/pet\.species===referenceSpecies/);
 assert.doesNotMatch(mode,/referenceRig|pixel25d/i);
});

test('head yaw is independent of sprite tilt and blink is explicit',()=>{
 const pose=referencePose({headYaw:90,head:12,blink:true});
 assert.equal(pose.headYaw,30);assert.equal(pose.head,12);assert.equal(pose.blink,true);
 assert.equal(referencePose({blink:false}).blink,false);
 const html=read('public/lab.html'),renderer=read('public/lab-pixel25d.js');
 assert.match(html,/id="pixel25d-blink"/);
 assert.match(renderer,/yaw:referenceEnabled\?0:/);
 assert.match(renderer,/headYaw:actionPose\?\.headYaw/);
});

test('head yaw avoids destructive clearRect and clips to anatomical head mask',()=>{
 const source=read('public/lab-reference-rig.js');
 assert.match(source,/mc\.ellipse\(x,cy,rx,ry/);
 assert.match(source,/ctx\.ellipse\(x,cy,rx,ry/);
 assert.doesNotMatch(source,/ctx\.clearRect/);
 assert.match(source,/ctx\.imageSmoothingEnabled=false/);
});

test('blink uses independent lids and reconstructed side-cheek strip',()=>{
 const code=read('public/lab-reference-rig.js');
 assert.match(code,/for\(const x of \[center-offset,center\+offset\]\)/);
 assert.match(code,/ctx\.drawImage\(eyelid,left,top\)/);
 assert.match(code,/ctx\.drawImage\(cheek,sideX/);
});
