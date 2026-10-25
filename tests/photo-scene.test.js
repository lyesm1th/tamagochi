import test from 'node:test';
import assert from 'node:assert/strict';
import {composePhotoScene} from '../public/photo-scene.js';
import {readFileSync} from 'node:fs';
test('detailed scene preserves arguments and never allocates classic layers',()=>{
 const calls=[],cv={width:48,height:48},pet={species:'dino'};
 composePhotoScene(cv,pet,{
  detailedReady:()=>true,
  drawDetailedMain:(...args)=>calls.push(['detailed',...args]),
  drawExpandedRoom:()=>{throw Error('classic room called');},
  drawClassic:()=>{throw Error('classic pet called');},
  drawLighting:()=>{throw Error('lighting called');},
  createCanvas:()=>{throw Error('unnecessary canvas');}
 });
 assert.deepEqual(calls,[['detailed',cv,pet,'dino',1000,true,{x:96,feet:128,scale:.9},null]]);
 assert.deepEqual([cv.width,cv.height],[48,48]);
});
test('classic photograph draws room, sprite and lighting in original exact order',()=>{
 const steps=[],ctx={drawImage:(...args)=>steps.push(['compose',...args])};
 const cv={width:0,height:0,getContext:()=>ctx},layer={width:0,height:0},pet={species:'cat'};
 composePhotoScene(cv,pet,{
  detailedReady:()=>false,
  drawDetailedMain:()=>{throw Error('detailed called');},
  drawExpandedRoom:(...args)=>steps.push(['room',...args]),
  drawClassic:(...args)=>steps.push(['pet',...args]),
  drawLighting:(...args)=>steps.push(['light',...args]),
  createCanvas:()=>layer
 });
 assert.deepEqual([cv.width,cv.height],[192,144]);
 assert.deepEqual([layer.width,layer.height],[128,100]);
 assert.deepEqual(steps,[
  ['room',ctx,pet,1000,true],['pet',layer,'cat',1000,pet,false,true],
  ['compose',layer,39,43,115,90],['light',ctx,pet]
 ]);
});
test('app delegates both preview and saved frame paths to same isolated composition',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 const helper=readFileSync(new URL('../public/photo-scene.js',import.meta.url),'utf8');
 assert.match(app,/function paintPhotoScene\(cv,p\)\{return composePhotoScene/);
 assert.match(app,/paintPhotoScene\(portrait,p\)/);
 assert.match(app,/paintPhotoScene\(source,row\.pet\)/);
 assert.doesNotMatch(helper,/localStorage|sessionStorage|window\.|document\./);
});
