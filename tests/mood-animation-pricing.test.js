import test from 'node:test';import assert from 'node:assert/strict';
import {homeGoods,clothes} from '../public/cozy-life.js';
import {furnishings} from '../public/companionship.js';
import {variants} from '../public/living.js';
import {itemDesigns} from '../public/item-designs.js';
import {ambient} from '../public/lively.js';
import {petWhim} from '../public/pet-whims.js';
import {readFileSync} from 'node:fs';
test('wardrobe and every home furniture purchase now cost twice the original',()=>{
 const home={rug:20,shelf:28,lamp:18,tent:36,cushion:20,fountain:32,mirror:24,post:30,curtains:16,toybox:28};
 const wear={panama:16,raincoat:24,pajamas:20,crown:12,scarf:16,bow:12,glasses:18,sweater:28};
 const basics={bed:24,bowl:16,plant:20,toy:30};
 for(const i of homeGoods)assert.equal(i.price,home[i.id]);for(const i of clothes)assert.equal(i.price,wear[i.id]);for(const i of furnishings)assert.equal(i.price,basics[i.id]);
 assert.deepEqual(variants.map(x=>x.price),[0,20,40]);
 for(const rows of Object.values(itemDesigns))rows.forEach((v,n)=>assert.equal(v.price,n?2*(8+n%3*4):0));
});
test('mood scenes animate a few seconds and never depend on bond or affect pet economy',()=>{
 const now=1800000000000,win=27*60000;
 const base={id:'whim-mood-dino',species:'dino',born:now-10000000,updated:now,health:100,energy:100,hunger:100,happy:100,calm:100,bond:100,lively:{},room:{toy:true,bed:true},cozy:{},world:{},living:{}};
 const categories=new Set();
 for(let i=0;i<70;i++){const at=(Math.floor(now/win)+i)*win+1000,e=petWhim(base,at);categories.add(e?.kind);}
 assert.equal(categories.size,5);
 const c=readFileSync(new URL('../public/lively.js',import.meta.url),'utf8');assert.match(c,/return \{kind,item:item==='bed'/);assert.match(c,/now%55000<8000/);
 const d=readFileSync(new URL('../public/detailed-renderer.js',import.meta.url),'utf8');assert.match(d,/if\(ambient\?\.whim\)/);
});
