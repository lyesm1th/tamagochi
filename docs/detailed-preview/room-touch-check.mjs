import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-zygote']});
const page=await browser.newPage({viewport:{width:390,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='preview.local')return route.abort();return route.fulfill({path:new URL('../../public'+(u.pathname==='/'?'/index.html':u.pathname),import.meta.url).pathname});});
await page.goto('http://preview.local/');
const out=new URL('./room-touch-check/',import.meta.url);fs.mkdirSync(out,{recursive:true});
async function seed(style,layout=0){await page.evaluate(async({style,layout})=>{const g=await import('/game.js');const s=g.fresh('dog',Date.now()-g.life.teen-3600000);s.updated=Date.now();s.coins=1000;s.routine.enabled=false;s.cozy.nightMode=false;s.room={bed:true,bowl:true,plant:true,toy:true};s.cozy.owned={mirror:true,shelf:true,lamp:true,cushion:true,rug:true,tent:true,fountain:true,post:true,curtains:true,toybox:true};s.playroom.decor.layout=layout;s.memory.introDone=true;localStorage.setItem('hamagochi-v1',JSON.stringify(s));localStorage.setItem('hamagochi-graphics',style);localStorage.setItem('hamagochi-sound','off');},{style,layout});await page.reload();await page.waitForFunction(()=>!document.querySelector('#button-ok').disabled);if(style==='detailed')await page.waitForFunction(()=>document.querySelector('#pet').width===384);await page.waitForTimeout(150);}
const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('hamagochi-v1')));
async function tapItem(id,style,long=false){const point=await page.evaluate(async({id,style})=>{const r=await import('/room-life.js'),s=JSON.parse(localStorage.getItem('hamagochi-v1')),rect=r.roomRects(s,style)[id];for(let a=.05;a<1;a+=.15)for(let b=.05;b<1;b+=.15){const x=rect[0]+rect[2]*a,y=rect[1]+rect[3]*b;if(r.roomHit(s,x,y,style)===id)return {x,y};}throw Error('unreachable '+style+' '+s.playroom.decor.layout+' '+id);},{id,style});await page.locator('#pet').scrollIntoViewIfNeeded();const box=await page.locator('#pet').boundingBox(),x=box.x+point.x/192*box.width,y=box.y+point.y/144*box.height;await page.mouse.move(x,y);await page.mouse.down();if(long)await page.waitForTimeout(520);await page.mouse.up();await page.waitForTimeout(150);}
async function press(id){await page.locator('#button-'+id).evaluate(el=>el.click());}
async function select(label){for(let i=0;i<40;i++){if(await page.locator('#menu-icons .active').getAttribute('aria-label')===label){await press('ok');return;}await press('right');}throw Error('missing menu '+label);}
const checks=[];
for(const style of ['detailed','classic']){
 for(let layout=0;layout<3;layout++){
 await seed(style,layout);
 for(const id of ['bed','mirror','shelf','lamp','plant','fountain','tent','cushion','rug','post','curtains','toybox','bowl','box']){
 await tapItem(id,style);const s=await read();if(s.living?.motion?.item!==id)throw Error(style+layout+' expected '+id+' got '+s.living?.motion?.item);if(id==='bed'&&s.living.motion.kind!=='jump')throw Error('bed not jumping');
 }
 checks.push(style+' layout '+layout+': 14 direct touches');
 }
 await seed(style);
 await tapItem('mirror',style);await page.waitForTimeout(1800);const size=await page.locator('#pet').evaluate(c=>({w:c.getBoundingClientRect().width,parent:c.parentElement.getBoundingClientRect().width}));if(size.w<size.parent*.95)throw Error('room canvas shrank');await page.locator('.device').screenshot({path:new URL(style+'-mirror.png',out).pathname});
 await tapItem('shelf',style,true);if(await page.locator('#choice-title').textContent()!=='Поличка')throw Error('long press did not open shelf actions');const labels=await page.locator('#object-controls button').allTextContents();if(!labels.some(s=>s.includes('книжки'))||labels.some(s=>s.includes('Поскакати')))throw Error('unrelated actions in shelf panel');await page.locator('.device').screenshot({path:new URL(style+'-actions.png',out).pathname});await press('back');if(!(await page.locator('#object-controls').textContent()).includes('Дзеркальце'))throw Error('back did not return to item list');await press('back');await press('back');
 await select('Дім');await select('Гардероб');for(let i=0;i<7;i++)await press('right');await press('ok');const dressed=await read();if(dressed.cozy.wearing.body!=='sweater'||dressed.living.reaction.kind!=='outfit')throw Error('purchase did not equip and react');if(!await page.locator('#pet').isVisible())throw Error('reaction hidden behind menu');await page.waitForTimeout(1700);await page.locator('.device').screenshot({path:new URL(style+'-outfit.png',out).pathname});checks.push(style+': long press, scoped actions, back, purchase + outfit reaction');
 await press('back');await select('Турбота');await select('Догляд і обійми');const care=await page.locator('#object-controls button').allTextContents();if(!care.includes('♡ Погладити')||!care.includes('Купання'))throw Error('missing unified care');await page.locator('.device').screenshot({path:new URL(style+'-care.png',out).pathname});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('mobile overflow');
}
await browser.close();if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync(new URL('report.json',out),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors}));
