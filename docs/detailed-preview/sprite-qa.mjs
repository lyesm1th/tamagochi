import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const page=await browser.newPage({viewport:{width:430,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='preview.local')return r.abort();if(u.pathname==='/__qa__/emotion-sprites.js')return r.fulfill({path:new URL('./qa-emotion-sprites.js',import.meta.url).pathname});return r.fulfill({path:new URL('../../public'+(u.pathname==='/'?'/index.html':u.pathname),import.meta.url).pathname});});
const out=new URL('./sprite-qa/',import.meta.url);fs.mkdirSync(out,{recursive:true});await page.goto('https://preview.local/');
const report=await page.evaluate(async()=>{
 const r=await import('/detailed-renderer.js'),em=await import('/__qa__/emotion-sprites.js'),g=await import('/game.js');await r.loadDetailedAssets();
 const ids=g.species.map(s=>s.id),kinds=['sad','angry','annoyed','amused','bored','curious','surprised','shy','anxious','hurt','proud','grateful','content'],ages=['Малюк','Дитина','Підліток','Дорослий'],sheets=['babies','children','teens','adults'];
 let combinations=0,frames=0,partialAlpha=0,wornSprites=0;const output={};
 for(const [row,age]of ages.entries()){
 const cv=document.createElement('canvas');cv.width=ids.length*144;cv.height=kinds.length*150;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
 for(const [column,id]of ids.entries()){
 await em.loadEmotionSprite(id);
 for(const body of [null,'sweater','raincoat','pajamas'])for(const neck of [null,'scarf','bow'])for(const head of [null,'panama','crown'])for(const eyes of [null,'glasses']){const s={...g.fresh(id),portraitStage:age,cozy:{wearing:{body,neck,head,eyes}}},p=r.dressedSprite(s,id,age,sheets[row],1000,true),d=p.image.getContext('2d').getImageData(0,0,p.image.width,p.image.height).data;for(let q=3;q<d.length;q+=4)if(d[q]>0&&d[q]<255)partialAlpha++;wornSprites++;}
 for(const [y,kind]of kinds.entries()){
  const s={...g.fresh(id),portraitStage:age,emotion:{kind,at:1000,until:1e15,strength:.9},cozy:{wearing:{body:'sweater',neck:'scarf'}}};
  const p=r.dressedSprite(s,id,age,sheets[row],1000,true);c.fillStyle=(y+column)%2?'#465264':'#ded7c5';c.fillRect(column*144,y*150,144,150);c.drawImage(p.image,column*144+3,y*150+17,138,126);c.fillStyle='#fff';c.font='10px monospace';c.fillText(id+' '+kind,column*144+3,y*150+12);
  for(let f=0;f<4;f++){const p=r.dressedSprite(s,id,age,sheets[row],1000+[0,400,800,12900][f],false),d=p.image.getContext('2d').getImageData(0,0,p.image.width,p.image.height).data;frames++;for(let q=3;q<d.length;q+=4)if(d[q]>0&&d[q]<255)partialAlpha++;}
 }
 }
 output[sheets[row]]=cv.toDataURL('image/png');
 }
 const cv=document.createElement('canvas');cv.width=12*144;cv.height=6*155;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;await em.loadEmotionSprite('cat');
 for(const body of [null,'sweater','raincoat','pajamas'])for(const neck of [null,'scarf','bow'])for(const head of [null,'panama','crown'])for(const eyes of [null,'glasses']){
  const x=combinations%12,y=Math.floor(combinations/12),s={...g.fresh('cat'),portraitStage:'Дорослий',cozy:{wearing:{body,neck,head,eyes}}},p=r.dressedSprite(s,'cat','Дорослий','adults',1000,true);
  c.fillStyle=(x+y)%2?'#465264':'#ded7c5';c.fillRect(x*144,y*155,144,155);c.drawImage(p.image,x*144,y*155+15,144,130);c.fillStyle='#fff';c.font='9px monospace';c.fillText([body,neck,head,eyes].filter(Boolean).join(' '),x*144+2,y*155+10,140);combinations++;
 }
 output.wardrobe=cv.toDataURL('image/png');return {output,combinations,wornSprites,frames,partialAlpha};
});
for(const [name,url]of Object.entries(report.output))fs.writeFileSync(new URL(name+'.png',out),Buffer.from(url.split(',')[1],'base64'));delete report.output;
await browser.close();if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync(new URL('report.json',out),JSON.stringify({...report,errors},null,2));console.log(report);
