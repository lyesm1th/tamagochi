import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {detailedArt} from '../public/detailed-art-manifest.js';
import {detailedFurniturePolicy} from '../public/detailed-renderer.js';
import {species} from '../public/game.js';
const src=readFileSync(new URL('../public/detailed-renderer.js',import.meta.url),'utf8');
test('detailed furniture uses original detailed atlas even for styled cactus and feeding bowl',()=>{
 for(const id of ['plant','bowl','shelf','window','mirror','bed','toybox','curtains','rug'])assert.equal(detailedFurniturePolicy(id).base,'detailed-atlas',id);
 assert.equal(detailedFurniturePolicy('plant').variant,'full-replacement');
 assert.equal(detailedFurniturePolicy('bowl').variant,'atlas-badge');
 assert.doesNotMatch(src,/else if\(!drawItemVariant\(c,s,id/);
 assert.match(src,/stamp\(c,'furniture',key,x,y,w,h/);
 for(const key of ['plant','bowl','shelf','window','mirror','toybox'])assert.ok(detailedArt.furniture.cells[key],key);
});
test('all pet types have detailed atlas art for all ordinary ages and sleep',()=>{
 for(const p of species)for(const stage of ['babies','children','teens','adults','sleep']){
  assert.ok(detailedArt[stage]?.cells?.[p.id]||detailedArt['new_'+stage]?.cells?.[p.id],p.id+':'+stage);
 }
});
test('owned keepsake silhouettes gain ink outline without modifying user saved art',()=>{
 assert.match(src,/const mask=treasureMasks/);
 assert.doesNotMatch(src,/shade\(c,bx-1,by-1/);
 assert.match(src,/drawDoodle\(c,drawing,x\+2,y\+2,w-4,h-4\)/);
});
