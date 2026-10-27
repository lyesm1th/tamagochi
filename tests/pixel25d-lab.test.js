import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('Pixel 2.5D lives inside the existing owner-only lab, not another test room',()=>{
 const html=read('public/lab.html');
 assert.match(html,/PIXEL 2\.5D LAB/);
 assert.match(html,/id="scene"/);
 assert.match(html,/id="pixel25d-stage"/);
 assert.match(html,/src="\/lab-pixel25d\.js"/);
 assert.equal((html.match(/<main>/g)||[]).length,1);
});
test('Pixel 2.5D reuses Detailed assets, has WebGL nearest-neighbor texture filtering, and no save/API mutation',()=>{
 const source=read('public/lab-pixel25d.js');
 assert.match(source,/drawDetailedRoom/);
 assert.match(source,/drawDetailedPortrait/);
 assert.match(source,/gl\.NEAREST/);
 assert.match(source,/gl\.VERTEX_SHADER/);
 assert.doesNotMatch(source,/localStorage|\/api\/|fetch\(|PETS|\.put\(/);
 const worker=read('src/worker.js');
 assert.match(worker,/\^\\\/lab\/i);
 assert.match(worker,/OWNER_TELEGRAM_ID/);
});
