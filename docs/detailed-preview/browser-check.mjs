const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import fs from 'node:fs';
import {fresh,life,act} from '../../public/game.js';
import {performCozy} from '../../public/cozy-life.js';
import {performWorld} from '../../public/little-world.js';
const out=new URL('./screenshots/',import.meta.url);fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-zygote']});
const page=await browser.newPage({viewport:{width:430,height:1000},deviceScaleFactor:2,reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://**/*',route=>route.abort());
await page.route('http://preview.local/**',route=>{const p=new URL(route.request().url()).pathname;return route.fulfill({path:new URL('../../public'+(p==='/'?'/index.html':p),import.meta.url).pathname});});
let now=Date.now(),state=fresh('dog',now-life.teen-3600000),peers=[];state.updated=now;state.adultCare=75;state.trait='affectionate';state.room={bed:true,bowl:true,plant:true,toy:true};state.cozy.owned={rug:true,shelf:true,curtains:true,lamp:true};state.cozy.wearing={neck:'bow'};state.memory.lastSeen=now;state.memory.introDone=true;
await page.addInitScript(()=>{window.Telegram={WebApp:{initData:'fixture',ready(){},expand(){},setHeaderColor(){},setBackgroundColor(){}}};});
await page.route('**/api/**',async route=>{const path=new URL(route.request().url()).pathname;const body=route.request().postDataJSON();let result={state,pets:peers,reminders:{enabled:false}};
 if(path.endsWith('/action')){result=act(state,body.action,Date.now(),body);state=result.state||state;}
 if(path.endsWith('/cozy')){result=performCozy(state,body.command,body);state=result.state||state;}
 if(path.endsWith('/world')){result=performWorld(state,body.command,body);state=result.state||state;}
 await route.fulfill({json:result});});
await page.goto('http://preview.local/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#pet').width===384,{timeout:30000});await page.waitForTimeout(400);
await page.locator('#pet').screenshot({path:new URL('room-cow.png',out).pathname});await page.locator('.device').screenshot({path:new URL('device-room.png',out).pathname});await page.locator('.device').screenshot({path:new URL('device-room.jpg',out).pathname,type:'jpeg',quality:96});
const navigate=async text=>{for(let i=0;i<25;i++){const label=await page.locator('#selected-action').innerText();if(label.includes(text))return;await page.locator('#button-right').click();}throw Error('missing menu '+text);};
await navigate('ТУРБОТА');await page.locator('#button-ok').click();await navigate('ПОГЛАДИТИ');await page.locator('#button-ok').click();await page.waitForTimeout(150);await page.locator('#pet').screenshot({path:new URL('petting.png',out).pathname});await page.locator('#button-back').click();await navigate('ПРИГОДИ');await page.locator('#button-ok').click();await navigate('СПІЛЬНА');
peers=['cat','chicken','frog','corgi','bear','dino'].map((species,i)=>({id:'fixture-'+i,name:species,species,look:{portraitStage:'Дорослий',adultCare:75,cozy:{wearing:i===0?{head:'panama'}:{}}}}));await page.locator('#button-ok').click();await page.waitForTimeout(250);await page.locator('#choice-panel').screenshot({path:new URL('playground.png',out).pathname});await page.locator('.device').screenshot({path:new URL('device-playground.png',out).pathname});await page.locator('.device').screenshot({path:new URL('device-playground.jpg',out).pathname,type:'jpeg',quality:96});
fs.writeFileSync(new URL('browser-report.json',out),JSON.stringify({errors,canvasRoom:[384,288],peers:peers.length}));await browser.close();console.log(JSON.stringify({errors,screenshots:out.pathname}));
