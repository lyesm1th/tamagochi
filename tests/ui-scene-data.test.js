import test from 'node:test';
import assert from 'node:assert/strict';
import {roomStyleOptions,sceneActionOrigin} from '../public/ui-scene-data.js';
import {roomStyles} from '../public/room-mood.js';
import {readFileSync} from 'node:fs';

test('room-style list preserves existing enumerations and order',()=>{
 const legacy=Object.entries(roomStyles).flatMap(([kind,items])=>items.map((_,i)=>[kind,i]));
 assert.deepEqual(roomStyleOptions(roomStyles),legacy);
 assert.deepEqual(roomStyleOptions({wood:[1,2],stone:[3]}),[['wood',0],['wood',1],['stone',0]]);
 assert.deepEqual(roomStyleOptions({}),[]);
});
test('scene origin preserves actual zeros and legacy defaults',()=>{
 const scenes=[null,undefined,{}, {x:0,feet:0},{x:25,feet:133},{x:null,feet:0},{x:-5,feet:145}];
 for(const scene of scenes)assert.deepEqual(sceneActionOrigin(scene),{fromX:scene?.x??96,fromY:scene?.feet??130});
});
test('scene origin does not mutate animation snapshots',()=>{
 const scene={x:24,feet:116,scale:.8,t:100};
 const origin=sceneActionOrigin(scene);
 origin.fromX=200;
 assert.deepEqual(scene,{x:24,feet:116,scale:.8,t:100});
});
test('app delegates scene choice preparation to pure module',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 const helper=readFileSync(new URL('../public/ui-scene-data.js',import.meta.url),'utf8');
 assert.ok(app.includes('roomStyleOptions(roomStyles)'));
 assert.ok(app.includes('sceneActionOrigin(smoothScene)'));
 assert.doesNotMatch(helper,/document\.|localStorage|window\.|Date\.now/);
});
