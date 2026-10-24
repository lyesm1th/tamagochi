import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:390,height:1200}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname==='preview.local'?r.fulfill({path:new URL('../../public'+(u.pathname==='/'?'/index.html':u.pathname),import.meta.url).pathname}):r.abort();});
await page.goto('https://preview.local/');const out=new URL('./farewell-check/',import.meta.url);fs.mkdirSync(out,{recursive:true});
for(const mode of ['classic','detailed']){
 await page.evaluate(async mode=>{const g=await import('/game.js');const s=g.fresh('cat',Date.now()-g.life.teen-3600000);s.updated=Date.now();s.routine.enabled=false;s.happy=90;s.energy=90;s.memory.introDone=true;localStorage.setItem('hamagochi-v1',JSON.stringify(s));localStorage.setItem('hamagochi-graphics',mode);localStorage.setItem('hamagochi-sound','off');},mode);
 await page.reload();await page.waitForFunction(()=>!document.querySelector('#button-ok').disabled);if(mode==='detailed')await page.waitForFunction(()=>document.querySelector('#pet').width===384);
 const press=async key=>{await page.locator('#button-'+key).click();};await press('left');await press('ok');
 for(let i=0;i<30;i++){if((await page.locator('#selected-action').innerText()).startsWith('ЗАВЕРШИТИ'))break;await press('right');}
 await press('ok');await page.waitForTimeout(800);if(!await page.locator('#pet').isVisible())throw Error('sad pet hidden');
 if(!await page.locator('#confirm-title').innerText().then(t=>t.includes('Побудеш')))throw Error('plea missing');
 await page.locator('.device').screenshot({path:new URL(mode+'-plea.png',out).pathname});
 await press('right');await press('right');await press('ok');if(!await page.locator('#confirm-choice').innerText().then(t=>t==='НІ, ЗАЛИШИТИ'))throw Error('unsafe final default');
 await press('back');if(await page.locator('#confirm-panel').isVisible())throw Error('back blocked');
 if(await page.evaluate(()=>JSON.parse(localStorage.getItem('hamagochi-v1')).dead))throw Error('preview killed pet');
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('hamagochi-v1'));s.happy=20;s.energy=90;localStorage.setItem('hamagochi-v1',JSON.stringify(s));});await page.reload();await page.waitForTimeout(1000);
 await page.locator('.device').screenshot({path:new URL(mode+'-low-mood.png',out).pathname});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('mobile overflow');
}
await browser.close();if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({modes:2,visibleSadPet:true,defaultCancel:true,backWorks:true,noMutation:true,errors}));
