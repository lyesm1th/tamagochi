import test from 'node:test';
import assert from 'node:assert/strict';
import {iconGlyph} from '../public/action-icons.js';
import {groups} from '../public/living.js';
import {groupItems,groupEntries} from '../public/menu-config.js';
import {journalPages} from '../public/life-journal.js';
import {worldPages} from '../public/little-world.js';
test('all navigation choices have valid seven-pixel semantic icons',()=>{
 const ids=[...groupEntries(groups),...groups.flatMap(g=>groupItems(g[0],groups,journalPages,worldPages))].map(x=>x[0]);
 for(const id of ids){const glyph=iconGlyph(id);assert.equal(glyph.length,7,id);assert.ok(glyph.every(row=>/^[01]{7}$/.test(row)),id);}
});
test('primary screens and key actions have different recognizable pictograms',()=>{
 const ids=['group:care','group:bond','group:home','group:fun','group:memories','group:settings','feed','sleep','pet','initiative','discipline','play','room','roomStyle','wardrobe','wallet','medicine','clean','reminders','graphics','endLife'];
 const rendered=ids.map(x=>iconGlyph(x).join(''));
 assert.equal(new Set(rendered).size,ids.length,'core menu items require distinct icons');
});
