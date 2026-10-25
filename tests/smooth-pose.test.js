import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceSmoothPose} from '../public/smooth-pose.js';

function legacy(previous,target,frame,id,reduced){
 let scene=previous;
 if(target.interaction){scene={...target,id,t:frame};return {scene,pose:target};}
 if(!scene||scene.id!==id||reduced){scene={...target,id,t:frame};return {scene,pose:target};}
 const k=Math.min(1,Math.max(0,(frame-scene.t)/(target.enriched?.mood==='sleepy'?1200:700)));
 for(const key of ['x','feet','scale'])scene[key]+=(target[key]-scene[key])*k;
 scene.t=frame;
 return {scene,pose:{...target,x:scene.x,feet:scene.feet,scale:scene.scale}};
}
test('every frame matches the previous algorithm exactly for normal and sleepy moods',()=>{
 for(const mood of ['normal','sleepy'])for(const reduced of [false,true]){
  let old=null,cur=null;
  for(let frame=0;frame<5000;frame+=73){
   const target={x:Math.sin(frame/233)*60,feet:110+Math.cos(frame/555)*17,scale:.8+Math.sin(frame/888)*.07,enriched:{mood}};
   const before=legacy(old,target,frame,'pet-a',reduced);
   const after=advanceSmoothPose(cur,target,frame,'pet-a',reduced);
   assert.deepEqual(after,before,`${mood} ${reduced} ${frame}`);
   old=before.scene;cur=after.scene;
  }
 }
});
test('active interactions, new pets, reduced motion and negative time deltas reset safely',()=>{
 const old={x:1,feet:1,scale:1,id:'old',t:100};
 const target={x:40,feet:120,scale:.9};
 for(const [prev,t,id,reduced] of [[old,target,'new',false],[old,target,'old',true],[old,{...target,interaction:{}},'old',false]]){
  const result=advanceSmoothPose(prev,t,150,id,reduced);
  assert.strictEqual(result.pose,t);
  assert.deepEqual(result.scene,{...t,id,t:150});
 }
 const backward=advanceSmoothPose({...old},target,50,'old',false);
 assert.equal(backward.pose.x,1);
 assert.equal(backward.scene.t,50);
});
test('same-scene interpolation mutates existing scene reference just as before',()=>{
 const previous={x:0,feet:100,scale:1,id:'pet',t:0};
 const result=advanceSmoothPose(previous,{x:100,feet:120,scale:.6},350,'pet',false);
 assert.strictEqual(result.scene,previous);
 assert.deepEqual([result.pose.x,result.pose.feet,result.pose.scale],[50,110,.8]);
});
