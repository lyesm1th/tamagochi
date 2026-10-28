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
 await page.waitForFunction(()=>document.getElementById('pixel25d-stage')?.dataset.labRendered==='true',null,{timeout:15000});
 await page.locator('#pixel25d-reference').check();await select('pixel25d-interaction','greet');
 await page.locator('#pixel25d-play').check();await tick();
 const first25=await page.locator('#pixel25d-stage').evaluate(c=>c.toDataURL('image/png'));
 await page.locator('#pixel25d-play').uncheck();
 await page.locator('#pixel25d-time').evaluate(el=>{el.value='550';el.dispatchEvent(new Event('input'));});await tick();
 const second25=await page.locator('#pixel25d-stage').evaluate(c=>c.toDataURL('image/png'));
 assert.notEqual(first25,second25,'reference 2.5D greet pose must change pixels');
 await capture('pixel25d-stage','reference-cat-greeting-25d.png');
 await select('pixel25d-interaction','manual');await page.locator('#pixel25d-blink').uncheck();
 await select('body','');await tick();
 const naked25=await page.locator('#pixel25d-stage').evaluate(c=>c.toDataURL('image/png'));
 await select('body','sweater');await tick();
 const sweater25=await page.locator('#pixel25d-stage').evaluate(c=>c.toDataURL('image/png'));
 assert.notEqual(naked25,sweater25,'cat sweater must alter visible WebGL pixels');
 assert.match(await page.locator('#pixel25d-attachments').textContent(),/body→body/);
 await page.locator('#pixel25d-blink').check();await tick();
 const closed25=await page.locator('#pixel25d-stage').evaluate(c=>c.toDataURL('image/png'));
 assert.notEqual(closed25,sweater25,'closed eyelids must visibly change WebGL pixels');
 await capture('pixel25d-stage','reference-cat-blink-25d.png');
 // Real geometry QA in the existing private room; no flat billboard is used.
 await page.waitForFunction(()=>document.getElementById('cow3d-stage')?.dataset.cow3dReady==='true');
 await page.locator('#cow3d-play').uncheck();
 // The *lower* Detailed sprite is the approved original: black cap and flanks,
 // creamy white face, pink muzzle, and happy expression. The upper cream cow
 // was an earlier 3D attempt, retained separately for A/B inspection.
 await select('cow3d-design','reference');
 await select('cow3d-render-mode','locked');
 await select('cow3d-emotion','neutral');
 await select('cow3d-pixels','3');
 await select('cow3d-action','idle');
 await page.locator('#cow3d-yaw').evaluate(el=>{el.value='0';el.dispatchEvent(new Event('input'));});await tick();
 const cowMatch=await page.locator('#cow3d-stage').evaluate(c=>{
  const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  let cream=0,pink=0,charcoal=0,darkRim=0,roseRim=0;
  for(let i=0;i<data.length;i+=4){
   const [r,g,b]=[data[i],data[i+1],data[i+2]];
   if(r>=196&&g>=180&&b>=158&&r>g&&g>=b&&r-b>=17)cream++;
   if(r>=174&&g>=94&&g<=195&&b>=102&&b<=200&&r>g+25)pink++;
   if(r<=88&&g<=88&&b<=97&&Math.abs(r-g)<20&&Math.abs(g-b)<20)charcoal++;
   if(r===18&&g===17&&b===25)darkRim++;
   if(r===110&&g===55&&b===68)roseRim++;
  }
  return {cream,pink,charcoal,darkRim,roseRim,outlinePalette:c.dataset.cow3dOutlinePalette,
   borderPixels:Number(c.dataset.cow3dCharcoalRimPixels||0),design:c.dataset.cow3dDesign,revision:c.dataset.cow3dRevision,
   material:c.dataset.cow3dMaterial,painted:Number(c.dataset.cow3dPaintedFurPixels||0)};
 });
 assert.equal(cowMatch.design,'reference');
 assert.equal(cowMatch.revision,'head-palette-v5');
 assert.equal(cowMatch.material,'original-detailed-surface');
 assert.equal(cowMatch.outlinePalette,'reference-adaptive');
 assert.ok(cowMatch.darkRim>8&&cowMatch.borderPixels>8,'original charcoal fur must have a visibly darker border');
 assert.ok(cowMatch.roseRim>3,'pink muzzle must have its own rose shadow outline');
 assert.ok(cowMatch.cream>40,'reference head/chest must remain creamy ivory');
 assert.ok(cowMatch.pink>8,'original snout and blush need a visible pink shade');
 assert.ok(cowMatch.charcoal>25,'reference needs obvious dark forehead, ears and body flanks');
 assert.ok(cowMatch.painted>15,'3D paint must actually cover depth-tested mesh pixels');
 const originalFrame=await page.locator('#cow3d-stage').evaluate(c=>c.toDataURL('image/png'));
 // Higher native resolution shows the actual Detailed-style eyes and cheeks.
 await select('cow3d-pixels','2');
 await capture('cow3d-stage','cow-3d-sprite-silhouette-x2.png');
 await capture('cow3d-stage','cow-3d-head-palette-v5-x2.png');
 await select('cow3d-pixels','3');
 await capture('cow3d-stage','cow-3d-original-black-ivory-front.png');
 await select('cow3d-design','cream');
 const creamFrame=await page.locator('#cow3d-stage').evaluate(c=>c.toDataURL('image/png'));
 assert.notEqual(originalFrame,creamFrame,'approved original coat must visibly differ from previous cream paint');
 assert.equal(await page.locator('#cow3d-stage').evaluate(c=>c.dataset.cow3dDesign),'cream');
 await capture('cow3d-stage','cow-3d-previous-cream.png');
 await select('cow3d-design','legacy');
 await capture('cow3d-stage','cow-3d-legacy-front.png');
 await select('cow3d-design','reference');
 assert.equal(await page.locator('#cow3d-stage').evaluate(c=>c.dataset.cow3dDesign),'reference');
 const cowFrame=()=>page.locator('#cow3d-stage').evaluate(c=>c.toDataURL('image/png'));
 const frontCow=await cowFrame();
 // Static poses must be pixel-identical even while the animation clock runs.
 // A screenshot-by-screenshot match catches the former "melting" pixel effect.
 await page.locator('#cow3d-play').check();
 await page.waitForTimeout(560);
 const staticA=await cowFrame();
 await page.waitForTimeout(440);
 const staticB=await cowFrame();
 assert.equal(staticA,staticB,'Sprite-Locked idle pixels must not drift, shimmer, or blend');
 assert.equal(await page.locator('#cow3d-stage').evaluate(c=>c.dataset.cow3dMotion),'rigid-keyframes-8fps');
 await page.locator('#cow3d-play').uncheck();
 await capture('cow3d-stage','cow-3d-sprite-locked-idle.png');
 // Only feet may change across locked walking frames. The head, pupils, horn
 // and markings must not warp as the steps advance.
 await page.locator('#cow3d-action').selectOption('walk');
 await page.locator('#cow3d-play').check();
 const sample=(x,y,w,h)=>page.locator('#cow3d-stage').evaluate((c,area)=>
  Array.from(c.getContext('2d').getImageData(...area).data),[x,y,w,h]);
 await page.waitForTimeout(170);
 const faceWalkA=await sample(16,6,52,19),feetWalkA=await sample(18,39,50,20);
 await page.waitForTimeout(170);
 const faceWalkB=await sample(16,6,52,19),feetWalkB=await sample(18,39,50,20);
 assert.deepEqual(faceWalkA,faceWalkB,'locked walking must not reshape the face each frame');
 assert.notDeepEqual(feetWalkA,feetWalkB,'locked walking must visibly advance leg poses');
 await page.locator('#cow3d-play').uncheck();
 await page.locator('#cow3d-action').selectOption('idle');
 await page.locator('#cow3d-yaw').evaluate(el=>{el.value='90';el.dispatchEvent(new Event('input'));});await tick();
 const sideCow=await cowFrame();
 assert.notEqual(frontCow,sideCow,'3D cow must have different geometry when viewed from side');
 await capture('cow3d-stage','cow-3d-original-side.png');
 await page.locator('#cow3d-yaw').evaluate(el=>{el.value='0';el.dispatchEvent(new Event('input'));});await tick();
 await page.locator('#cow3d-action').selectOption('blink');await page.locator('#cow3d-play').check();await tick();
 await capture('cow3d-stage','cow-3d-front.png');
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
