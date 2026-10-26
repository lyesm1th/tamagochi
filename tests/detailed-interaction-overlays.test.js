import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {detailedArt} from '../public/detailed-art-manifest.js';const src=readFileSync(new URL('../public/detailed-renderer.js',import.meta.url),'utf8');
test('detailed interactions do not scale classic effect drawing into room',()=>{
 assert.ok(src.includes('drawDetailedInteractionFeedback(c,pet,point,Date.now(),reduced)'));
 assert.doesNotMatch(src,/drawRoomResponse\(c,pet,point/);
 assert.doesNotMatch(src,/drawEnrichment\(c,pet,point/);
 assert.doesNotMatch(src,/c\.scale\(2,2\);drawDetailedInteractionFeedback/);
});
test('all mapped interaction effects use detailed atlas props',()=>{
 for(const id of ['ball','heart','water','leaf','gift','blanket'])assert.ok(detailedArt.props.cells[id],id);
 assert.match(src,/const x=Math\.round\(pose\.x\*2\),y=Math\.round\(pose\.feet\*2\)/);
});