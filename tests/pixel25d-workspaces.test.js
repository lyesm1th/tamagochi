import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('seven workspaces are integrated in owner-only Graphic QA',()=>{
 const js=read('public/lab-tabs.js'),html=read('public/lab.html');
 for(const title of ['Scene','Pet Studio','Rig & Anatomy','Wardrobe Studio','Furniture Studio','Animation Studio','Graphic QA'])assert.ok(js.includes(title),title);
 for(const id of ['lab-tabs','lab-workspace','species','scene','pixel25d-stage','pixel25d-head','pixel25d-rig','pixel25d-save','capture','comparison','time'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/src="\/lab-tabs\.js"/);
 assert.equal((html.match(/<main>/g)||[]).length,1);
});
test('new lab modules are owner-gated by Worker routing',()=>{
 const worker=read('src/worker.js');
 assert.match(worker,/OWNER_TELEGRAM_ID/);
 assert.ok(worker.includes('if(/^\\/lab/i.test(assetPath))'));
 for(const p of ['lab-tabs.js','lab-rig.js','lab-pixel25d.js'])assert.ok(read('public/'+p).length>100);
});
test('2.5D is explicitly non-production and uses only original Detailed assets',()=>{
 const js=read('public/lab-pixel25d.js');
 assert.match(js,/drawDetailedRoom/);
 assert.match(js,/drawDetailedPortrait/);
 assert.match(js,/gl\.NEAREST/);
 assert.match(js,/articulatePortrait/);
 assert.match(js,/pixel25d-save/);
 assert.doesNotMatch(js,/localStorage|\/api\/|fetch\(|PETS/);
});
