import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('2.5D compare uses existing pure RGBA diff and never sends game API requests',()=>{
 const src=readFileSync(new URL('../public/lab-compare25d.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../public/lab.html',import.meta.url),'utf8');
 assert.match(src,/frameDifference/);assert.match(src,/compareLabCanvases/);
 assert.doesNotMatch(src,/fetch\(|localStorage|PETS|\.put\(/);
 for(const id of ['pixel25d-compare','pixel25d-diff','pixel25d-diff-view','pixel25d-diff-status'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(html,/src="\/lab-compare25d\.js"/);
});
