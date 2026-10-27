import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('existing owner laboratory offers Detailed, Pixel 2.5D and comparison without a second app',()=>{
 const html=read('public/lab.html'),view=read('public/lab-view.js');
 for(const value of ['detailed','pixel25d','compare'])assert.ok(html.includes('value="'+value+'"'));
 for(const id of ['lab-detailed-view','lab-pixel25d-view','lab-view-mode','scene','pixel25d-stage'])assert.ok(html.includes('id="'+id+'"'));
 assert.ok(view.includes('lab-detailed-view')&&view.includes('pixel25d'));
 assert.equal((html.match(/<main>/g)||[]).length,1);
 const mode=read('public/graphics-mode.js');
 assert.doesNotMatch(mode,/pixel25d|2\.5d/i);
});
test('2.5D waits for original detailed sprite resources, without touching player saves',()=>{
 const code=read('public/lab-pixel25d.js');
 assert.match(code,/await loadDetailedAssets\(\)/);
 assert.match(code,/clearRect\(0,0,portrait.width,portrait.height\)/);
 assert.doesNotMatch(code,/localStorage|\/api\/|fetch\(/);
});
