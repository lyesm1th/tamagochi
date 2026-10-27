import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,Image} from '@napi-rs/canvas';
import {fileURLToPath} from 'node:url';
import {loadDetailedAssets,drawDetailedRoom,drawDetailedMain} from '../public/detailed-renderer.js';
import {labPet} from '../public/lab-state.js';
const now=Date.parse('2026-10-27T12:00:00Z');
test('stored furniture renders exactly like absent furniture, including sleep and hiding',async()=>{
 const before={document:globalThis.document,Image:globalThis.Image,now:Date.now};
 class LocalImage extends Image{set src(src){super.src=fileURLToPath(new URL('../public'+src,import.meta.url));}}
 globalThis.document={createElement:()=>createCanvas(1,1)};globalThis.Image=LocalImage;Date.now=()=>now;
 try{
  assert.equal(await loadDetailedAssets(),true);
  const room=s=>{const c=createCanvas(384,288);drawDetailedRoom(c.getContext('2d'),s,0,true,now);return c.getContext('2d').getImageData(0,0,384,288).data;};
  for(const item of ['bed','bowl','plant','toy','rug','shelf','lamp','tent','cushion','fountain','mirror','post','curtains','toybox','box']){
   const stored=labPet({},now);stored.cozy.stored[item]=true;
   const absent=structuredClone(stored);delete absent.cozy.stored[item];delete absent.room[item];delete absent.cozy.owned[item];if(item==='box')absent.room.box=false;if(item==='toy')absent.playroom.toys={};
   assert.ok(Buffer.from(room(stored)).equals(Buffer.from(room(absent))),item+' stored object must disappear');
  }
  const full=s=>{const c=createCanvas(384,288);drawDetailedMain(c,s,s.species,0,true);return c.getContext('2d').getImageData(0,0,384,288).data;};
  for(const mode of ['sleep','hide']){
   const stored=labPet({species:'dino',age:'Підліток'},now);stored.cozy.stored.bed=true;
   if(mode==='sleep')stored.sleeping=true;else stored.cozy.hide={spot:'bed',expires:now+10000};
   const absent=structuredClone(stored);delete absent.cozy.stored.bed;delete absent.room.bed;if(mode==='hide')absent.cozy.hide=null;
   assert.ok(Buffer.from(full(stored)).equals(Buffer.from(full(absent))),mode+' must not place a pet on stored furniture');
  }
 }finally{globalThis.document=before.document;globalThis.Image=before.Image;Date.now=before.now;}
});
