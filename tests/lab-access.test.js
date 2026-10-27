import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import worker from '../src/worker.js';
import {readFileSync} from 'node:fs';
const token='test-only-token';
function session(id,date=Math.floor(Date.now()/1000)){
 const p=new URLSearchParams({auth_date:String(date),user:JSON.stringify({id}),query_id:'lab-test'});
 const secret=createHmac('sha256','WebAppData').update(token).digest();
 p.set('hash',createHmac('sha256',secret).update([...p].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('\n')).digest('hex'));return p.toString();
}
const env={BOT_TOKEN:token,OWNER_TELEGRAM_ID:'42',PETS:{idFromName(){throw Error('Lab must never access user progress');}},ASSETS:{fetch:async()=>new Response('private lab')}};
const access=(raw,extra={})=>worker.fetch(new Request('https://game.test/api/owner/access',{method:'POST',headers:{'X-Telegram-Init-Data':raw,...extra}}),env);
test('owner access verifies Telegram signature, denies non-owner and never touches pet storage',async()=>{
 assert.equal((await access('')).status,401);assert.equal((await access(session(43))).status,403);
 assert.equal((await access(session(43).replace('43','42'))).status,401);
 assert.equal((await access(session(42),{origin:'https://evil.test'})).status,403);
 const r=await access(session(42));assert.equal(r.status,200);assert.deepEqual(await r.json(),{owner:true});
 const cookie=r.headers.get('set-cookie');for(const flag of ['HttpOnly','Secure','SameSite=Strict','Max-Age=900'])assert.ok(cookie.includes(flag));
 const request=(path,cookieValue)=>worker.fetch(new Request('https://game.test'+path,{headers:cookieValue?{Cookie:cookieValue}:{}}),env);
 for(const path of ['/lab','/lab.html','/lab.js','/lab-state.js','/lab-frames.js','/lab-25d.html','/lab-25d-bundle.js','/%6cab.html','/lab.html/'])assert.equal((await request(path)).status,403,path);
 const allowed=await request('/lab.html',cookie.split(';')[0]);assert.equal(allowed.status,200);assert.equal(await allowed.text(),'private lab');assert.equal(allowed.headers.get('cache-control'),'private, no-store');
 assert.equal((await request('/lab.html','__Host-pet-lab='+encodeURIComponent(session(43)))).status,403);
 assert.equal((await request('/lab.html','__Host-pet-lab='+encodeURIComponent(session(42,Math.floor(Date.now()/1000)-86401)))).status,403);
 assert.equal((await request('/lab.html','__Host-pet-lab=%invalid')).status,403);
 assert.equal((await worker.fetch(new Request('https://game.test/lab.html',{headers:{Cookie:cookie.split(';')[0]}}),{...env,OWNER_TELEGRAM_ID:''})).status,403);
});
test('private lab cannot bypass Worker at the asset edge and link starts hidden',()=>{
 const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));assert.equal(config.assets.run_worker_first,true);
 assert.match(readFileSync(new URL('../public/index.html',import.meta.url),'utf8'),/id="owner-lab" hidden/);
});
