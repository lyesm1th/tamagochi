import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {referencesFromSource} from '../scripts/audit-unused-modules.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
test('HTML-owned owner laboratory is a runtime dependency',()=>{
 const index=join(root,'public/index.html'),refs=referencesFromSource(index,readFileSync(index,'utf8'));
 assert.ok(refs.includes(join(root,'public/owner-lab-entry.js')));
});
test('module audit includes literal dynamic import and export-from',()=>{
 const file=join(root,'public/example.js');
 const refs=referencesFromSource(file,`import('./weather.js'); export {rain} from './weather.js'; import './graphics-mode.js';`);
 assert.deepEqual(new Set(refs),new Set([join(root,'public/weather.js'),join(root,'public/graphics-mode.js')]));
});
test('external page scripts are not treated as repository dependencies',()=>{
 const index=join(root,'public/index.html'),refs=referencesFromSource(index,'<script src="https://telegram.org/js/telegram-web-app.js"></script>');
 assert.equal(refs.length,0);
});
