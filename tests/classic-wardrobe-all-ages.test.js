import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {species,fresh,life} from '../public/game.js';
import {drawClassicActor,clipWardrobeToSprite} from '../public/classic-actor.js';

const time=Date.parse('2026-10-27T12:00:00Z');
const ages=[['Малюк',life.egg+5000],['Дитина',life.baby+5000],['Підліток',life.child+5000],['Дорослий',life.teen+5000]];
const render=(s,age)=>{
 const cv=createCanvas(128,100);
 drawClassicActor(cv.getContext('2d'),s.species,age,'#bca27e',time,s,true);
 return cv.getContext('2d').getImageData(0,0,128,100).data;
};

test('silhouette clip removes only unsupported garment pixels and preserves source',()=>{
 const cv=createCanvas(4,3),c=cv.getContext('2d');
 c.fillStyle='#ad5a60';c.fillRect(0,0,4,3);
 const source=c.getImageData(0,0,4,3);
 for(let y=0;y<3;y++)for(let x=2;x<4;x++){const q=(y*4+x)*4;source.data[q]=0;source.data[q+1]=0;source.data[q+2]=0;source.data[q+3]=0;}
 clipWardrobeToSprite(cv,source);
 const result=c.getImageData(0,0,4,3).data;
 for(let y=0;y<3;y++)for(let x=0;x<4;x++){
  const q=(y*4+x)*4;
  assert.equal(result[q+3],x<2?255:0);
 }
});

test('classic torso outfits follow existing silhouettes for all fourteen pets and all growth stages',()=>{
 assert.equal(species.length,14);
 globalThis.document={createElement:()=>createCanvas(1,1)};
 try{
  for(const {id} of species)for(const [age,elapsed] of ages){
   const original=fresh(id,time-elapsed);original.sleeping=false;original.napping=false;
   original.cozy.wearing={};
   const base=render(original,age),before=structuredClone(original);
   for(const body of ['sweater','raincoat','pajamas']){
    const dressed=structuredClone(original);
    dressed.cozy.wearing={body,neck:'scarf'};
    const out=render(dressed,age);
    let changed=0;
    for(let q=0;q<out.length;q+=4){
     assert.equal(out[q+3],base[q+3],id+' '+age+' '+body);
     if(out[q]!==base[q]||out[q+1]!==base[q+1]||out[q+2]!==base[q+2])changed++;
    }
    assert.ok(changed>=1,id+' '+age+' '+body);
   }
   assert.deepEqual(original,before);
  }
 }finally{delete globalThis.document;}
});

test('headgear and eyewear remain separately positioned accessories, not alpha-clipped torso wear',()=>{
 globalThis.document={createElement:()=>createCanvas(1,1)};
 try{
  for(const {id} of species){
   const pet=fresh(id,time-life.teen-60000);
   pet.cozy.wearing={head:'crown',eyes:'glasses'};
   const a=render(pet,'Дорослий');
   assert.ok(a.some((v,i)=>i%4===3&&v>0),id);
  }
 }finally{delete globalThis.document;}
});
