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
const errors=[],checks=[],outfitChecks=[],headwearChecks=[];let passed=false;
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
 // Locate the changed pixels against the same frozen bare-headed frame, then
 // crop enough of the surrounding actor to judge contact with the head/face.
 // This is review evidence, not a geometric assertion that the fit is good.
 const headCrop=async(bare,dressed)=>{
  const b=await sharp(bare).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const d=await sharp(dressed).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(b.info.width,d.info.width);assert.equal(b.info.height,d.info.height);
  let minX=b.info.width,minY=b.info.height,maxX=-1,maxY=-1;
  for(let y=0;y<b.info.height;y++)for(let x=0;x<b.info.width;x++){
   const i=(y*b.info.width+x)*4;
   if(b.data[i]!==d.data[i]||b.data[i+1]!==d.data[i+1]||b.data[i+2]!==d.data[i+2]||b.data[i+3]!==d.data[i+3]){
    minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
   }
  }
  assert.ok(maxX>=minX&&maxY>=minY,'headwear must change pixels');
  const size=100,left=Math.max(0,Math.min(b.info.width-size,Math.round((minX+maxX)/2-size/2))),top=Math.max(0,Math.min(b.info.height-size,minY-20));
  return sharp(dressed).extract({left,top,width:size,height:size}).resize(200,200,{kernel:'nearest'}).png().toBuffer();
 };
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
 // Review evidence, not golden images: capture the live scene with each hat
 // for every non-egg age, at rest and during a furniture interaction. Keep
 // labels in the report and fixed tile order so defects are easy to locate.
 const headwearAges=labAges.filter(age=>age!=='Яєчко');
 for(const pet of species){
  await select('species',pet.id);await select('body','');await select('neck','');await select('eyes','');
  const tiles=[],closeups=[];
  for(const [row,age] of headwearAges.entries())for(const [col,head] of ['panama','crown'].entries())for(const [poseIndex,pose] of ['idle','bed'].entries()){
   await select('age',age);await select('head','');await select('item',pose==='bed'?'bed':'');await seek(pose==='bed'?3000:2000);
   const bare=await pixels();await select('head',head);await seek(pose==='bed'?3000:2000);const dressed=await pixels();
   assert.ok(!dressed.equals(bare),`${pet.id} ${age} ${head} ${pose}: headwear must render`);
   const tile=await sharp(dressed).resize(192,144,{kernel:'nearest'}).png().toBuffer();
   tiles.push({input:tile,left:(col*2+poseIndex)*192,top:row*144});
   closeups.push({input:await headCrop(bare,dressed),left:(col*2+poseIndex)*200,top:row*200});
   headwearChecks.push({species:pet.id,age,head,pose});
  }
  await sharp({create:{width:768,height:headwearAges.length*144,channels:4,background:'#eee8da'}}).composite(tiles).png().toFile(path.join(out,`headwear-${pet.id}.png`));
  await sharp({create:{width:800,height:headwearAges.length*200,channels:4,background:'#eee8da'}}).composite(closeups).png().toFile(path.join(out,`headwear-closeup-${pet.id}.png`));
 }
 await select('head','');await select('item','');
 console.log(`Captured ${headwearChecks.length} headwear scenes.`);
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
 await page.locator('#guides').check();await tick();await page.screenshot({path:path.join(out,'lab-mobile.png'),fullPage:true});
 for(let group=0;group<2;group++){
  const tiles=[];
  for(const [col,pet]of species.slice(group*7,group*7+7).entries())for(let row=0;row<labAges.length;row++)tiles.push({input:path.join(out,`${pet.id}-${row}.png`),left:col*384,top:row*288});
  await sharp({create:{width:7*384,height:6*288,channels:4,background:'#eee8da'}}).composite(tiles).png().toFile(path.join(out,`species-stages-${group+1}.png`));
 }
 assert.deepEqual(errors,[]);
 await fs.writeFile(path.join(out,'report.json'),JSON.stringify({status:'passed',runStarted,browser:browser.version(),checks,outfitChecks,headwearChecks,headwearSheetLayout:{rows:headwearAges,columns:['panama idle','panama bed','crown idle','crown bed']},furnitureCases:species.length*16,errors,baseline:'Approved source-file hashes; captures are review evidence, not newly approved goldens.'},null,2));
 passed=true;
 console.log(`Graphic QA: ${checks.length} species/age frames, ${species.length*16} furniture cases, deterministic frame comparison passed.`);
}finally{if(!passed)await fs.writeFile(path.join(out,'report.json'),JSON.stringify({status:'failed',runStarted,checks:checks.length,outfitChecks:outfitChecks.length,errors}));await browser.close();}
