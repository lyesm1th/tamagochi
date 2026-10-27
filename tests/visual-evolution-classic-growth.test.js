import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {species,fresh,life} from '../public/game.js';
import {drawClassicActor,fitYoungClassicActor} from '../public/classic-actor.js';
const at=Date.parse('2026-10-27T12:00:00Z');
const coverage=cv=>{
 const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
 let pixels=0,left=cv.width,right=-1,top=cv.height,bottom=-1;
 for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++)if(d[(y*cv.width+x)*4+3]){
  pixels++;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
 }
 return {pixels,left,right,top,bottom};
};
test('young-age layout genuinely enlarges tiny sprites and maintains canvas boundaries',()=>{
 globalThis.document={createElement:()=>createCanvas(1,1)};
 try{
  for(const {id} of species){
   for(const age of ['Малюк','Дитина']){
    const s=fresh(id,at-life.teen-60000);s.cozy.wearing={body:'sweater',neck:'scarf'};
    const cv=createCanvas(128,100),c=cv.getContext('2d');
    drawClassicActor(c,id,age,'#a6ba80',0,s,true);
    const display=coverage(cv);
    assert.ok(display.left>=0&&display.right<128&&display.top>=0&&display.bottom<100,id+' '+age);
    assert.ok(display.pixels>0,id+' '+age);
   }
  }
 }finally{delete globalThis.document;}
});
test('teenage and adult sprites remain byte-for-byte untouched by juvenile fitting',()=>{
 const cv=createCanvas(128,100),c=cv.getContext('2d');
 c.fillStyle='#91a26e';c.fillRect(40,40,35,36);
 const reference=Buffer.from(c.getImageData(0,0,128,100).data);
 for(const age of ['Підліток','Дорослий','Старенький']){
  assert.equal(fitYoungClassicActor(cv,age),false);
  assert.deepEqual(Buffer.from(c.getImageData(0,0,128,100).data),reference);
 }
});
test('baby and child visual area increases without inventing pixels outside canvas',()=>{
 globalThis.document={createElement:()=>createCanvas(1,1)};
 try{
  const source=createCanvas(128,100),ctx=source.getContext('2d');
  ctx.fillStyle='#7aa27e';ctx.fillRect(55,65,14,17);
  const original=coverage(source);
  assert.equal(fitYoungClassicActor(source,'Малюк'),true);
  const changed=coverage(source);
  assert.ok(changed.pixels>original.pixels);
  assert.ok(changed.left>=0&&changed.right<128&&changed.top>=0&&changed.bottom<100);
 }
 finally{delete globalThis.document;}
});
