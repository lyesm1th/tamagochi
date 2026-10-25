import test from 'node:test';
import assert from 'node:assert/strict';
import {createMenuModes,groomName} from '../public/menu-config.js';
import {journalPages} from '../public/life-journal.js';
import {worldPages} from '../public/little-world.js';
import {dailyPages} from '../public/daily-life.js';
import {playroomPages} from '../public/playroom.js';
import {cozyPages} from '../public/cozy-life.js';
import {readFileSync} from 'node:fs';
test('all interface mode arrays preserve exact legacy values and ordering',()=>{
 const j=journalPages.map(([id])=>id);
 const world=['roomStyle','wallet',...j,'secrets','world','stories','sandbox',...worldPages.map(([id])=>id)];
 const panels=['roomStyle','wallet',...j,'secrets','stories','sandbox','games','album','family','food','memory','room','routine','adventure','tree','world','ritual','weather','walk','activity','dreams','forms',...dailyPages.map(([id])=>id),...playroomPages.map(([id])=>id),...cozyPages.map(([id])=>id)];
 const actual=createMenuModes({journalPages,worldPages,dailyPages,playroomPages,cozyPages});
 assert.deepEqual(actual,{journalModes:j,worldModes:world,panelModes:panels});
});
test('grooming prompts preserve labels for all species',()=>{
 const names={chicken:'Пригладити пір’ячко',frog:'Зволожити спинку',dino:'Почистити луску',dog:'Почистити шерстку'};
 for(const species of ['chicken','frog','dino','dog','cat','sheep','penguin','fox'])assert.equal(groomName({species}),names[species]||'Розчесати шерстку');
});
test('app reads UI mode configuration from extracted module',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(app,/const \{journalModes,worldModes,panelModes\}=createMenuModes\(/);
 assert.doesNotMatch(app,/function groomName\(/);
 const mod=readFileSync(new URL('../public/menu-config.js',import.meta.url),'utf8');
 assert.doesNotMatch(mod,/localStorage|document\.|window\./);
});
