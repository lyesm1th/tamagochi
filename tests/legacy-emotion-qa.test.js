import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url),qa=new URL('../docs/detailed-preview/',import.meta.url);
test('obsolete sprite renderer is no longer publicly served',()=>{
 assert.equal(existsSync(new URL('public/emotion-sprites.js',root)),false);
 const source=readFileSync(new URL('qa-emotion-sprites.js',qa),'utf8');
 for(const imported of ['emotion-sprite-manifest.js','emotions.js','emotion-frames.js'])
  assert.ok(source.includes("from '/"+imported+"'"),imported);
});
test('both browser QA flows route the legacy renderer to the QA-only module',()=>{
 for(const file of ['sprite-qa.mjs','animation-qa.mjs']){
  const source=readFileSync(new URL(file,qa),'utf8');
  assert.ok(source.includes("u.pathname==='/__qa__/emotion-sprites.js'"),file);
  assert.ok(source.includes("import('/__qa__/emotion-sprites.js')"),file);
  assert.ok(!source.includes("import('/emotion-sprites.js')"),file);
 }
});
