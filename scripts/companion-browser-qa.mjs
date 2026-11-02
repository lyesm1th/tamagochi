// Real Chromium check for the independent iPhone companion, its original 2D atlas and care actions.
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFileSync,statSync,mkdirSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('public');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json','.css':'text/css'};
const server=createServer((req,res)=>{
 const u=new URL(req.url,'http://127.0.0.1');
 const path=resolve(root,'.'+u.pathname);
 if(!path.startsWith(root+sep)&&path!==root){res.writeHead(403);res.end();return;}
 try{
  if(!statSync(path).isFile())throw Error('Not a file');
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});
  res.end(readFileSync(path));
 }catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const host='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
 await context.addInitScript(()=>localStorage.setItem('raaarrr-companion-v1',JSON.stringify({token:'123.'+'a'.repeat(64)})));
 const page=await context.newPage();
 const calls=[];
 await page.route('**/api/widget/**',async route=>{
  const endpoint=new URL(route.request().url()).pathname;
  calls.push({endpoint,body:route.request().postDataJSON()});
  if(endpoint==='/api/widget/state')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({pet:{
   id:'mock-pet',name:'Чуча',species:'dog',age:'Підліток',sleeping:false,
   mood:{hunger:67,clean:90,happy:83,health:92,energy:81}}})});
  if(endpoint==='/api/widget/action')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({text:'Чуча поїла!',pet:{
   id:'mock-pet',name:'Чуча',species:'dog',age:'Підліток',sleeping:false,
   mood:{hunger:91,clean:86,happy:83,health:92,energy:81}}})});
  return route.fulfill({status:404,contentType:'application/json',body:'{"error":"Not available in test"}'});
 });
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(host+'/companion.html',{waitUntil:'networkidle',timeout:30000});
 await page.waitForFunction(()=>document.querySelector('#name')?.textContent==='Чуча');
 assert.equal(await page.locator('#name').textContent(),'Чуча');
 assert.equal(await page.locator('#installDirections').isVisible(),true,'ordinary iPhone browser shows install guidance');
 assert.equal(await page.locator('#enablePush').isVisible(),false,'no push consent in ordinary browser tab');
 assert.match(await page.locator('#pushStatus').textContent(),/початковий екран/);
 assert.ok((await page.locator('#stats').textContent()).includes('67%'));
 await page.waitForFunction(()=>{
  const c=document.getElementById('pet'),img=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  for(let i=3;i<img.length;i+=4)if(img[i]>0)return true;
  return false;
 },{timeout:15000});
 const alpha=await page.locator('#pet').evaluate(canvas=>{
  const d=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
  let pixels=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)pixels++;
  return pixels;
 });
 assert.ok(alpha>1500,'pet sprite is visible and cropped');
 await page.locator('button[data-action="feed"]').click();
 await page.waitForFunction(()=>document.querySelector('#bubble')?.textContent==='Чуча поїла!');
 assert.ok(calls.some(c=>c.endpoint==='/api/widget/action'&&c.body?.action==='feed'&&c.body.requestId));
 assert.equal(errors.length,0,errors.join('\n'));
 mkdirSync('tmp/graphic-qa',{recursive:true});
 await page.screenshot({path:'tmp/graphic-qa/companion-iphone.png',fullPage:true});
 console.log('Companion Chromium QA passed: original cow sprite visible, server care action sent, iPhone screenshot saved.');
 await context.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
