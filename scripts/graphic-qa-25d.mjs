import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve('tmp/graphic-qa-25d');await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.route('http://graphic-qa.test/**',async route=>{const name=decodeURIComponent(new URL(route.request().url()).pathname),root=path.resolve('public'),file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep))return route.abort();try{return await route.fulfill({path:file});}catch{return route.abort();}});
 await page.goto('http://graphic-qa.test/lab-25d.html');await page.getByText('Експериментальна об’ємна модель кота.',{exact:false}).waitFor();
 const canvas=page.locator('#view');await page.waitForTimeout(400);const frame=()=>canvas.evaluate(c=>c.toDataURL('image/png'));
 await page.screenshot({path:path.join(out,'mobile-idle.png'),fullPage:true});
 await page.selectOption('#action','look');await page.waitForTimeout(900);await page.screenshot({path:path.join(out,'mobile-look.png'),fullPage:true});await page.getByRole('button',{name:'Пауза'}).click();await page.waitForTimeout(100);const a=await frame();
 await page.locator('#hat').uncheck();await page.waitForTimeout(100);const b=await frame();assert.notEqual(a,b,'headwear must change rendered pixels');
 await page.getByRole('button',{name:'Продовжити'}).click();
 await page.selectOption('#action','turn');await page.waitForTimeout(1300);await page.screenshot({path:path.join(out,'mobile-turn.png'),fullPage:true});
 await page.selectOption('#action','bowl');await page.waitForTimeout(2100);await page.screenshot({path:path.join(out,'mobile-bowl.png'),fullPage:true});
 await page.getByRole('button',{name:'Пауза'}).click();assert.equal(await page.getByRole('button',{name:'Продовжити'}).count(),1);
 assert.deepEqual(errors,[]);console.log('2.5D lab: browser render, controls and four captures passed.');
}finally{await browser.close();}
