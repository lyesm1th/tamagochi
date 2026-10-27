import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {species,fresh,life} from '../public/game.js';
import {drawClassicActor} from '../public/classic-actor.js';
import {applySeniorPatina} from '../public/age-appearance.js';

const at=Date.parse('2026-10-27T12:00:00Z');
const image=cv=>cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
test('aging patina respects exact original transparency and does not touch non-seniors',()=>{
 const input=createCanvas(5,4),c=input.getContext('2d');
 c.fillStyle='#b16830';c.fillRect(1,1,3,2);
 const before=image(input).slice();
 assert.equal(applySeniorPatina(input,'Дорослий'),false);
 assert.deepEqual(image(input),before);
 assert.equal(applySeniorPatina(input,'Старенький'),true);
 const after=image(input);
 assert.notDeepEqual(after,before);
 for(let i=0;i<after.length;i+=4){
  assert.equal(after[i+3],before[i+3]);
  if(!before[i+3])assert.equal(after[i]+after[i+1]+after[i+2],0);
 }
});
test('all 14 classic pets show a distinct senior look with original silhouettes and fitted outfits',()=>{
 assert.equal(species.length,14);
 globalThis.document={createElement:()=>createCanvas(1,1)};
 try{
  for(const {id} of species)for(const wearing of [{},{body:'sweater'},{body:'pajamas',neck:'scarf'},{body:'raincoat',head:'crown',eyes:'glasses'}]){
   const s=fresh(id,at-life.teen-30*86400000);s.cozy.wearing=wearing;s.sleeping=false;s.napping=false;
   const paint=age=>{
    const cv=createCanvas(128,100);
    drawClassicActor(cv.getContext('2d'),id,age,'#94a982',0,s,true);
    return image(cv);
   };
   const adult=paint('Дорослий'),senior=paint('Старенький');
   let changed=0;
   for(let i=0;i<adult.length;i+=4){
    assert.equal(adult[i+3],senior[i+3],id+' '+JSON.stringify(wearing));
    if(adult[i]!==senior[i]||adult[i+1]!==senior[i+1]||adult[i+2]!==senior[i+2])changed++;
   }
   assert.ok(changed>=10,id+' senior visibly different');
  }
 }finally{delete globalThis.document;}
});
test('senior appearance changes no saved pet state and protects the dinosaur teenager',()=>{
 const teen={id:'dino-stable',species:'dino',born:at-life.child-10000};
 const original=structuredClone(teen);
 const source=createCanvas(3,3),c=source.getContext('2d');
 c.fillStyle='#638878';c.fillRect(1,1,1,1);
 assert.equal(applySeniorPatina(source,'Підліток'),false);
 assert.deepEqual(teen,original);
 const elder=structuredClone(teen);elder.portraitStage='Старенький';
 const elderCanvas=createCanvas(3,3),ec=elderCanvas.getContext('2d');
 ec.fillStyle='#638878';ec.fillRect(1,1,1,1);
 assert.equal(applySeniorPatina(elderCanvas,elder.portraitStage),true);
 assert.equal(teen.portraitStage,undefined);
});
