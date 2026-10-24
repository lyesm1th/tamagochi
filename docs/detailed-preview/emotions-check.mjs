import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const page=await browser.newPage({viewport:{width:430,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname==='preview.local'?r.fulfill({path:new URL('../../public'+(u.pathname==='/'?'/index.html':u.pathname),import.meta.url).pathname}):r.abort();});
const out=new URL('./emotions-check/',import.meta.url);fs.mkdirSync(out,{recursive:true});
await page.goto('https://preview.local/');
for(const style of ['classic','detailed'])for(const [kind,species,age] of [['sad','cat','Дорослий'],['angry','frog','Дорослий'],['amused','bunny','Дорослий'],['bored','chicken','Малюк'],['grateful','dog','Дитина'],['curious','fox','Підліток']]){
 await page.evaluate(async({style,kind,species,age})=>{const g=await import('/game.js'),e=await import('/emotions.js');const s=g.fresh(species,Date.now()-g.life.teen-3600000);s.updated=Date.now();s.portraitStage=age;s.routine.enabled=false;s.memory.introDone=true;s.room={bed:true,bowl:true,plant:true,toy:true};s.cozy.wearing={body:'sweater',neck:'scarf'};e.feel(s,kind,'Перевірка емоції у кімнаті',Date.now()-500,.9,120000);localStorage.setItem('hamagochi-v1',JSON.stringify(s));localStorage.setItem('hamagochi-graphics',style);localStorage.setItem('hamagochi-sound','off');}, {style,kind,species,age});
 await page.reload();await page.waitForFunction(()=>!document.querySelector('#button-ok').disabled);if(style==='detailed')await page.waitForFunction(()=>document.querySelector('#pet').width===384);await page.waitForTimeout(500);
 await page.locator('#pet').screenshot({path:new URL(`${style}-${kind}-room.png`,out).pathname});
 await page.locator('.device').screenshot({path:new URL(`${style}-${kind}.png`,out).pathname});
}
await browser.close();if(errors.length)throw Error(errors.join('\n'));console.log('12 actual game scenes rendered; no page errors');
