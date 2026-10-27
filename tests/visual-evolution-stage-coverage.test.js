import test from 'node:test';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {visualVariants} from '../scripts/render-visual-evolution-matrix.mjs';
import {detailedArt} from '../public/detailed-art-manifest.js';
import {wardrobeSprites,wardrobeLayers,wardrobeAssets} from '../public/wardrobe-sprite-manifest.js';
import {petAnatomy} from '../public/pet-anatomy.js';
import {wardrobeAnatomy} from '../public/detailed-wardrobe.js';
import {life,stage} from '../public/pet-life.js';
const stages=['babies','children','teens','adults'],names=['Малюк','Дитина','Підліток','Дорослий'];
test('the visual gallery covers every pet, growth stage and outfit without substitute art',()=>{
 assert.equal(species.length,14);
 assert.equal(visualVariants.length,8);
 assert.equal(new Set(visualVariants.map(x=>x.label)).size,8);
 for(const sheet of stages){
  const original=detailedArt[sheet].cells,additional=detailedArt['new_'+sheet].cells;
  for(const {id} of species){
   assert.ok(original[id]||additional[id],sheet+' '+id);
   assert.ok(!(original[id]&&additional[id]),'duplicate atlas: '+sheet+' '+id);
   assert.ok(petAnatomy[id]?.[sheet],sheet+' '+id);
   assert.deepEqual(petAnatomy[id][sheet].size,wardrobeSprites[sheet][id]);
   for(const kind of ['sweater','raincoat','pajamas']){
    assert.ok(wardrobeLayers[sheet]?.[kind]?.[id],sheet+' '+kind+' '+id);
    assert.ok(wardrobeAssets[sheet]?.[kind],sheet+' '+kind);
    const layout=wardrobeAnatomy(id,names[stages.indexOf(sheet)],sheet);
    assert.ok(layout.width>0&&layout.height>0);
    assert.ok(layout.top>=0&&layout.top<1);
   }
  }
 }
});
test('every age transition selects the intended stage, even across old-save boundaries',()=>{
 const now=Date.parse('2026-10-27T12:00:00Z');
 const cases=[[life.egg+1,'Малюк'],[life.baby+1,'Дитина'],[life.child+1,'Підліток'],[life.teen+1,'Дорослий']];
 for(const {id} of species)for(const [elapsed,label] of cases){
  assert.equal(stage({species:id,born:now-elapsed,discipline:70},now),label,id);
 }
});
