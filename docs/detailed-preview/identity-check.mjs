import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const page=await browser.newPage({viewport:{width:1152,height:864}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname==='preview.local'?r.fulfill({path:new URL('../../public'+(u.pathname==='/'?'/index.html':u.pathname),import.meta.url).pathname}):r.abort();});
await page.goto('https://preview.local/');const out=new URL('./identity-check/',import.meta.url);fs.mkdirSync(out,{recursive:true});
const rendered=await page.evaluate(async()=>{
 const r=await import('/detailed-renderer.js'),g=await import('/game.js'),cozy=await import('/cozy-effects.js');if(!await r.loadDetailedAssets())throw Error('assets did not load');
 const ages=['Малюк','Дитина','Підліток','Дорослий'],sheets=['babies','children','teens','adults'],now=Date.now(),make=(id,kind,body='pajamas',head=null)=>{const s=g.fresh(id,now-g.life.teen-3600000);s.updated=now;s.portraitStage='Дорослий';s.happy=70;s.health=80;s.hunger=80;s.energy=80;s.room={bed:true,bowl:true,plant:true,toy:true};s.cozy.wearing={body,head};s.emotion={kind,at:now-(kind==='sad'?3000:850),until:now+90000,strength:.8};return s;};
 const rooms=document.createElement('canvas');rooms.width=384*3;rooms.height=288*2;const c=rooms.getContext('2d');c.imageSmoothingEnabled=false;
 for(const [i,[id,kind,body,head]]of [['dino','content','pajamas',null],['dino','sad','pajamas',null],['dino','amused','pajamas',null],['cat','annoyed','sweater','panama'],['chicken','angry','raincoat','crown'],['frog','bored','pajamas','panama']].entries()){
  const cv=document.createElement('canvas'),s=make(id,kind,body,head);r.drawDetailedMain(cv,s,id,850,false,{x:100,feet:129,scale:1,quiet:true},null);c.drawImage(cv,i%3*384,Math.floor(i/3)*288);
 }
 const all=document.createElement('canvas');all.width=14*160;all.height=4*190;const ac=all.getContext('2d');ac.imageSmoothingEnabled=false;
 for(const [col,p]of g.species.entries())for(let j=0;j<4;j++){
 const s=make(p.id,'content','pajamas','panama');s.portraitStage=ages[j];const dressed=r.dressedSprite(s,p.id,ages[j],sheets[j],now,true,false);ac.fillStyle='#ded9cb';ac.fillRect(col*160,j*190,160,190);const z=Math.min(155/dressed.image.width,170/dressed.image.height);ac.drawImage(dressed.image,col*160+80-dressed.image.width*z/2,j*190+5,dressed.image.width*z,dressed.image.height*z);ac.fillStyle='#304d43';ac.font='12px sans-serif';ac.fillText(p.id+' '+sheets[j],col*160+4,j*190+184);
 }
 return {rooms:rooms.toDataURL(),all:all.toDataURL()};
});
for(const [name,url]of Object.entries(rendered))fs.writeFileSync(new URL(name+'.png',out),Buffer.from(url.split(',')[1],'base64'));
await browser.close();if(errors.length)throw Error(errors.join('\n'));console.log('Real room renderer and 56 dressed forms captured');
