import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const page=await browser.newPage({viewport:{width:430,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname==='preview.local'?r.fulfill({path:new URL('../../public'+(u.pathname==='/'?'/index.html':u.pathname),import.meta.url).pathname}):r.abort();});
const out=new URL('./animation-qa/',import.meta.url);fs.mkdirSync(out,{recursive:true});const now=Date.now();await page.clock.setFixedTime(new Date(now));await page.goto('https://preview.local/');
for(const style of ['classic','detailed'])for(const [kind,id,body,neck,head,eyes]of [['sad','cat','sweater','scarf',null,null],['angry','frog','raincoat','bow','crown','glasses'],['amused','bunny','pajamas',null,'panama',null]]){
 await page.clock.setFixedTime(new Date(now));await page.evaluate(async({now,style,kind,id,body,neck,head,eyes})=>{const g=await import('/game.js');const s=g.fresh(id,now-g.life.teen-3600000);s.updated=now;s.memory.introDone=true;s.memory.lastSeen=now;s.routine.enabled=false;s.room={bed:true,bowl:true,plant:true,toy:true};s.cozy.wearing={body,neck,head,eyes};s.emotion={kind,at:now,until:now+120000,strength:.9};localStorage.setItem('hamagochi-v1',JSON.stringify(s));localStorage.setItem('hamagochi-graphics',style);localStorage.setItem('hamagochi-sound','off');},{now,style,kind,id,body,neck,head,eyes});
 await page.reload();await page.waitForFunction(()=>!document.querySelector('#button-ok').disabled);if(style==='detailed')await page.evaluate(async id=>{await (await import('/emotion-sprites.js')).loadEmotionSprite(id);},id);
 for(const [frame,elapsed]of [0,400,800,1200,2000,5000,9000].entries()){
  await page.clock.setFixedTime(new Date(now+elapsed));await page.waitForTimeout(80);await page.locator('#pet').screenshot({path:new URL(`${style}-${kind}-${frame}.png`,out).pathname});
 }
}
await browser.close();if(errors.length)throw Error(errors.join('\n'));console.log('Six real room animation sequences captured; no page errors');
