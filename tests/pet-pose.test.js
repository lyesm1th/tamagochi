import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePetPose} from '../public/pet-pose.js';
const clock=1_000_000;
const deps=(overrides={})=>({behaviorPose:()=>({x:40,y:0,kind:'walk'}),reduced:false,careForm:()=> 'normal',effectActive:()=>false,getEffect:()=>null,furniturePositions:()=>({bed:80,bowl:90}),favoriteCorner:()=>({x:7}),now:()=>clock,...overrides});
test('empty state and preview never calculate a pose',()=>{
 const invalid=()=>{throw Error('must not calculate')};
 assert.deepEqual(resolvePetPose(null,'Підліток',0,false,{behaviorPose:invalid}),{x:0,y:0,kind:'rest'});
 assert.deepEqual(resolvePetPose({},'Підліток',0,true,{behaviorPose:invalid}),{x:0,y:0,kind:'rest'});
});
test('care forms preserve the original cozy and scruffy offsets',()=>{
 assert.deepEqual(resolvePetPose({},'Підліток',210,false,deps({careForm:()=> 'cozy'})),{x:20,y:2,kind:'walk'});
 assert.deepEqual(resolvePetPose({},'Підліток',210,false,deps({careForm:()=> 'scruffy'})),{x:40,y:-2,kind:'walk'});
 assert.deepEqual(resolvePetPose({},'Яєчко',210,false,deps({careForm:()=> 'cozy'})),{x:40,y:0,kind:'walk'});
});
test('active effects, feeding and sleep anchor poses as before',()=>{
 assert.deepEqual(resolvePetPose({room:{bowl:true}},'Підліток',220,false,deps({effectActive:()=>true,getEffect:()=>({kind:'feed'})})),{x:38,y:0,kind:'walk'});
 assert.deepEqual(resolvePetPose({room:{bed:true},sleeping:true},'Дорослий',0,false,deps()),{x:40,y:0,kind:'walk'});
 assert.deepEqual(resolvePetPose({},'Підліток',220,false,deps({effectActive:()=>true,getEffect:()=>({kind:'trick'})})),{x:40,y:-5,kind:'walk'});
});
test('sitting corners and playroom sessions override position',()=>{
 assert.deepEqual(resolvePetPose({world:{}},'Дорослий',0,false,deps({behaviorPose:()=>({x:40,y:0,kind:'sit'})})),{x:7,y:0,kind:'sit'});
 assert.deepEqual(resolvePetPose({playroom:{session:{expires:clock+1,pet:3,kind:'laser'},skills:{laser:3}}},'Підліток',0,false,deps()),{x:-14,y:3,kind:'walk'});
 assert.deepEqual(resolvePetPose({playroom:{session:{expires:clock+1,pet:3,kind:'music'},skills:{}}},'Підліток',180,false,deps()),{x:-14,y:-5,kind:'walk'});
});
test('reduced motion suppresses optional animation offsets',()=>{
 assert.deepEqual(resolvePetPose({playroom:{session:{expires:clock+1,pet:0,kind:'music'},skills:{}}},'Підліток',180,false,deps({reduced:true,careForm:()=> 'cozy'})),{x:-44,y:0,kind:'walk'});
});
