import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const page=await browser.newPage({viewport:{width:430,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname==='preview.local'?r.fulfill({path:new URL('../../public'+(u.pathname==='/'?'/index.html':u.pathname),import.meta.url).pathname}):r.abort();});
await page.goto('https://preview.local/');const out=new URL('./tailor-check/',import.meta.url);fs.mkdirSync(out,{recursive:true});
const sheets=await page.evaluate(async()=>{const r=await import('/detailed-renderer.js'),g=await import('/game.js');await r.loadDetailedAssets();const ids=g.species.map(s=>s.id),ages=['Малюк','Дитина','Підліток','Дорослий'],stages=['babies','children','teens','adults'],out={};
for(let age=0;age<4;age++){
 const cv=document.createElement('canvas');cv.width=ids.length*150;cv.height=8*180;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
 for(const [col,id]of ids.entries())for(const [row,worn]of [{},{body:'pajamas'},{body:'sweater'},{body:'raincoat'},{head:'panama'},{head:'crown'},{body:'pajamas',head:'panama'},{body:'sweater',head:'crown',neck:'scarf'}].entries()){
  const s={...g.fresh(id),portraitStage:ages[age],cozy:{wearing:worn}},p=r.dressedSprite(s,id,ages[age],stages[age]);for(const kind of ['sad','angry','amused','annoyed','bored','hurt','shy','curious','surprised','anxious','proud','grateful','content']){const emotional=r.dressedSprite({...s,emotion:{kind,at:Date.now(),until:Date.now()+60000,strength:.7}},id,ages[age],stages[age]);if(emotional.image!==p.image)throw Error('Emotion replaced original face: '+id+kind);}c.fillStyle=(row+col)%2?'#4c5862':'#e6dfcf';c.fillRect(col*150,row*180,150,180);const scale=Math.min(140/p.image.width,155/p.image.height);c.drawImage(p.image,col*150+75-p.image.width*scale/2,row*180+18,p.image.width*scale,p.image.height*scale);c.fillStyle='#fff';c.font='10px sans-serif';c.fillText(id+' '+Object.values(worn).join(' '),col*150+2,row*180+12,146);
 }out[stages[age]]=cv.toDataURL('image/png');
}return out;});
for(const [name,url]of Object.entries(sheets))fs.writeFileSync(new URL(name+'.png',out),Buffer.from(url.split(',')[1],'base64'));
for(const id of ['dino','cat','frog','bunny','chicken','fox']){
 await page.evaluate(async id=>{const g=await import('/game.js'),now=Date.now(),s=g.fresh(id,now-g.life.teen-3600000);s.updated=now;s.memory.introDone=true;s.memory.lastSeen=now;s.room={bed:true,bowl:true,plant:true,toy:true};s.cozy.wearing={body:'pajamas',head:'panama'};s.emotion={kind:'annoyed',at:now,until:now+120000,strength:.7};localStorage.setItem('hamagochi-v1',JSON.stringify(s));localStorage.setItem('hamagochi-graphics','detailed');localStorage.setItem('hamagochi-sound','off');},id);
 await page.reload();await page.waitForFunction(()=>!document.querySelector('#button-ok').disabled);await page.waitForFunction(()=>document.querySelector('#pet').width===384);await page.waitForTimeout(300);await page.locator('#pet').screenshot({path:new URL(id+'-room.png',out).pathname});
}
await browser.close();if(errors.length)throw Error(errors.join('\n'));console.log('Original faces and tailored garments rendered for 56 species/age forms; six actual room views');
