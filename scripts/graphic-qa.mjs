// Browser evidence from the existing private lab; never exposed by the app.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import path from 'node:path';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {labAges} from '../public/lab-state.js';
import {checkVisualBaseline} from './check-visual-baseline.mjs';
const out=path.resolve(process.env.GRAPHIC_QA_OUTPUT||'tmp/graphic-qa');
await fs.mkdir(out,{recursive:true});
const runStarted=new Date().toISOString();
await fs.writeFile(path.join(out,'report.json'),JSON.stringify({status:'running',runStarted}));
checkVisualBaseline(); // Includes the approved teen atlas; never rewrite it here.
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:430,height:932},deviceScaleFactor:1,reducedMotion:'no-preference'});
const errors=[],checks=[],outfitChecks=[];let passed=false;
page.on('pageerror',e=>errors.push(e.message));
try{
 // Test-only transport serves the actual private page without production auth.
 // Production access is exercised separately by lab-access.test.js.
 await page.route('http://graphic-qa.test/**',async route=>{
  const name=decodeURIComponent(new URL(route.request().url()).pathname);
  const root=path.resolve('public'),file=path.resolve(root,'.'+name);
  if(!file.startsWith(root+path.sep))return route.abort();
  await route.fulfill({path:file});
 });
 await page.route('https://**/*',route=>route.abort());
 await page.addInitScript(()=>{Date.now=()=>1793102400000;});
 await page.goto('http://graphic-qa.test/lab.html');
 await page.waitForFunction(()=>!document.getElementById('save').disabled);
 await page.locator('#pause').click();
 const tick=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const select=async(id,value)=>{await page.locator('#'+id).evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('change'));},value);await tick();};
 const seek=async value=>{await page.locator('#time').evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input'));},value);await tick();};
 const capture=async(id,file)=>fs.writeFile(path.join(out,file),Buffer.from(await page.locator('#'+id).evaluate(c=>c.toDataURL('image/png').split(',')[1]),'base64'));
 // Transfer lossless PNG bytes rather than 442,368 JSON numbers per frame.
 const pixels=async()=>Buffer.from(await page.locator('#scene').evaluate(c=>c.toDataURL('image/png').split(',')[1]),'base64');
 await select('body','');
 // All 84 species/stage combinations use the actual browser renderer.
 for(const pet of species)for(const age of labAges){
  await select('species',pet.id);await select('age',age);await seek(2000);
  const data=await pixels();assert.ok(data.length>1000,'room capture must contain scene detail');
  await fs.writeFile(path.join(out,`${pet.id}-${labAges.indexOf(age)}.png`),data);
  checks.push({species:pet.id,age,pngHash:createHash('sha256').update(Buffer.from(data)).digest('hex')});
 }
 console.log(`Rendered ${checks.length} species/stage frames.`);
 for(const pet of species){
  const frames=checks.filter(c=>c.species===pet.id);assert.equal(new Set(frames.map(c=>c.pngHash)).size,6,pet.id+' stages must differ');
  await select('species',pet.id);await select('age','Дорослий');await select('body','');await seek(2000);const naked=await pixels();
  for(const body of ['sweater','raincoat','pajamas']){await select('body',body);await seek(2000);assert.ok(!Buffer.from(await pixels()).equals(Buffer.from(naked)),pet.id+' '+body);outfitChecks.push({species:pet.id,body});}
  await select('body','');
 }
 console.log(`Verified ${outfitChecks.length} body outfits.`);
 await select('species','dino');await select('age','Підліток');
 await seek(2000);const a=await pixels();await seek(2000);assert.ok(Buffer.from(await pixels()).equals(Buffer.from(a)),'same frozen frame must reproduce exactly');
 await page.locator('#capture').click();await page.locator('#compare').click();assert.match(await page.locator('#difference').textContent(),/Змінено 0 /);
 // Verify all live furniture actions and both unavailable states for each pet.
 for(const pet of species){
  await select('species',pet.id);
  for(const item of ['bed','tent','bowl','fountain','mirror','toy','shelf','cushion','rug','plant','post','toybox','lamp','curtains','box','music']){
   await select('item',item);await select('condition','intact');await seek(600);const approach=JSON.parse(await page.locator('#geometry').textContent());assert.equal(approach.phase,'approach');
   await seek(3000);const active=JSON.parse(await page.locator('#geometry').textContent());assert.equal(active.phase,'action');assert.ok(Number.isFinite(active.x)&&Number.isFinite(active.feet));
   for(const condition of ['broken','stored']){await select('condition',condition);await seek(3000);assert.equal(JSON.parse(await page.locator('#geometry').textContent()).phase,'idle');}
   await select('condition','intact');
  }
  console.log('Furniture states verified: '+pet.id);
 }
 await select('species','dino');await select('item','bed');await select('condition','intact');await seek(3000);await page.locator('#capture').click();await seek(4000);await page.locator('#compare').click();assert.doesNotMatch(await page.locator('#difference').textContent(),/Змінено 0 /);
 await capture('scene','dino-teen-bed.png');
 await capture('comparison','frame-difference.png');
 // Exercise the same private WebGL canvas with the reference cat and garment controls.
 await select('species','cat');await select('age','Дорослий');
 await page.waitForFunction(()=>document.getElementById('pixel25d-stage')?.dataset.labRendered==='true',{timeout:15000});
 await page.locator('#pixel25d-reference').check();await select('pixel25d-interaction','greet');
 await page.locator('#pixel25d-play').check();await tick();
 const first25=await page.locator('#pixel25d-stage').evaluate(c=>c.toDataURL('image/png'));
 await page.locator('#pixel25d-play').uncheck();
 await page.locator('#pixel25d-time').evaluate(el=>{el.value='550';el.dispatchEvent(new Event('input'));});await tick();
 const second25=await page.locator('#pixel25d-stage').evaluate(c=>c.toDataURL('image/png'));
 assert.notEqual(first25,second25,'reference 2.5D greet pose must change pixels');
 await capture('pixel25d-stage','reference-cat-greeting-25d.png');
 await select('body','sweater');await tick();
 assert.match(await page.locator('#pixel25d-attachments').textContent(),/body→body/);
 await page.locator('#pixel25d-blink').check();await tick();
 await capture('pixel25d-stage','reference-cat-blink-25d.png');
 await page.locator('#guides').check();await tick();await page.screenshot({path:path.join(out,'lab-mobile.png'),fullPage:true});
 for(let group=0;group<2;group++){
  const tiles=[];
  for(const [col,pet]of species.slice(group*7,group*7+7).entries())for(let row=0;row<labAges.length;row++)tiles.push({input:path.join(out,`${pet.id}-${row}.png`),left:col*384,top:row*288});
  await sharp({create:{width:7*384,height:6*288,channels:4,background:'#eee8da'}}).composite(tiles).png().toFile(path.join(out,`species-stages-${group+1}.png`));
 }
 assert.deepEqual(errors,[]);
 await fs.writeFile(path.join(out,'report.json'),JSON.stringify({status:'passed',runStarted,browser:browser.version(),checks,outfitChecks,furnitureCases:species.length*16,errors,baseline:'Approved source-file hashes; captures are review evidence, not newly approved goldens.'},null,2));
 passed=true;
 console.log(`Graphic QA: ${checks.length} species/age frames, ${species.length*16} furniture cases, deterministic frame comparison passed.`);
}finally{if(!passed)await fs.writeFile(path.join(out,'report.json'),JSON.stringify({status:'failed',runStarted,checks:checks.length,outfitChecks:outfitChecks.length,errors}));await browser.close();}
