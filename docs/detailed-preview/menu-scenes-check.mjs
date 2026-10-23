import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-zygote']});
const page=await browser.newPage({viewport:{width:390,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='preview.local')return route.abort();const path=u.pathname==='/'?'/index.html':u.pathname;return route.fulfill({path:new URL('../../public'+path,import.meta.url).pathname});});
await page.goto('http://preview.local/');
await page.evaluate(async()=>{const g=await import('/game.js');const s=g.fresh('dog',Date.now()-g.life.teen-3600000);s.updated=Date.now();s.coins=1000;s.routine.enabled=false;s.cozy.nightMode=false;s.room={bed:true,bowl:true,plant:true,toy:true};s.memory.introDone=true;localStorage.setItem('hamagochi-v1',JSON.stringify(s));localStorage.setItem('hamagochi-graphics','detailed');localStorage.setItem('hamagochi-sound','off');});
await page.reload();await page.waitForFunction(()=>!document.querySelector('#button-ok').disabled);await page.waitForTimeout(1500);
async function press(id){await page.locator('#button-'+id).evaluate(e=>e.click());}
async function select(label){for(let i=0;i<40;i++){const text=await page.locator('#menu-icons .active').getAttribute('aria-label');if(text===label){await press('ok');return;}await press('right');}throw Error('menu not found '+label);}
async function home(){await press('back');await press('back');}
const out=new URL('./menu-scenes-check/',import.meta.url);fs.mkdirSync(out,{recursive:true});
const checks=[];
for(const graphicsMode of ['detailed','classic']){
 await page.evaluate(mode=>{localStorage.setItem('hamagochi-graphics',mode);},graphicsMode);await page.reload();await page.waitForFunction(()=>!document.querySelector('#button-ok').disabled);await page.waitForTimeout(1000);
 await select('Дім');await select('Гардероб');
 const before=await page.evaluate(()=>localStorage.getItem('hamagochi-v1')),images=new Set();
 for(let i=0;i<8;i++){await page.waitForTimeout(100);if(!await page.locator('#choice-item-preview').isVisible())throw Error('no wardrobe preview');images.add(await page.locator('#choice-item-preview').evaluate(c=>c.toDataURL()));if(i===7)await page.locator('.device').screenshot({path:new URL(graphicsMode+'-wardrobe.png',out).pathname});await press('right');}
 if(images.size!==8)throw Error('clothing previews not distinct '+images.size);
 if(before!==await page.evaluate(()=>localStorage.getItem('hamagochi-v1')))throw Error('browsing modified saved state');checks.push(graphicsMode+': 8 distinct outfits without purchase');
 await home();await select('Дім');await select('Крамничка для дому');
 for(let i=0;i<10;i++){if(!await page.locator('#choice-item-preview').isVisible())throw Error('missing furniture preview');await press('right');}await page.locator('.device').screenshot({path:new URL(graphicsMode+'-shop.png',out).pathname});checks.push(graphicsMode+': 10 home goods');
 await home();await select('Дім');await select('Мої улюблені речі');for(let i=0;i<100;i++){if((await page.locator('#choice-title').textContent()).includes('Ліжечко')&&(await page.locator('#choice-preview-label').textContent()).includes('НАСТУПНИЙ ДИЗАЙН'))break;await press('right');}if(!(await page.locator('#choice-title').textContent()).includes('Ліжечко'))throw Error('bed not selected');
 if(!(await page.locator('#choice-preview-label').textContent()).includes('НАСТУПНИЙ ДИЗАЙН'))throw Error('bed next design not previewed');await page.locator('.device').screenshot({path:new URL(graphicsMode+'-design.png',out).pathname});
 await home();await select('Пригоди');await select('Прогулянки');const walks=new Set();for(let i=0;i<3;i++){walks.add(await page.locator('#choice-portrait').evaluate(c=>c.toDataURL()));await press('right');}if(walks.size!==3)throw Error('destinations identical');await page.locator('.device').screenshot({path:new URL(graphicsMode+'-walk.png',out).pathname});checks.push(graphicsMode+': 3 destinations before starting');
 await home();await select('Дім');await select('Маленька кухня');await page.locator('.device').screenshot({path:new URL(graphicsMode+'-kitchen.png',out).pathname});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('mobile overflow');
}
await browser.close();if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync(new URL('report.json',out),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors}));
