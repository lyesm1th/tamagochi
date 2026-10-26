import test from 'node:test';
import assert from 'node:assert/strict';
import {detailedVariantRenderMode,detailedFurniturePolicy} from '../public/detailed-renderer.js';
import {itemDesigns} from '../public/item-designs.js';
test('classic standard design keeps authored detailed atlas',()=>{for(const id of ['plant','shelf'])assert.equal(detailedVariantRenderMode(id,0),'atlas');});
test('every alternative cactus and shelf design is rendered as a complete replacement',()=>{for(const id of ['plant','shelf'])for(let n=1;n<itemDesigns[id].length;n++)assert.equal(detailedVariantRenderMode(id,n),'replacement');});
test('shelf and plant variants are independent full objects rather than stacked sprites',()=>{assert.equal(detailedFurniturePolicy('shelf').variant,'full-replacement');assert.equal(detailedFurniturePolicy('plant').variant,'full-replacement');});
