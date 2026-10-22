import {fresh,act,tick,species} from '../public/game.js';
const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});
export async function validate(raw,token,now=Date.now()){
 if(!raw||!token)return null;
 try{
 const p=new URLSearchParams(raw),hash=p.get('hash');p.delete('hash');
 const date=Number(p.get('auth_date'));if(!date||date*1000>now+60000||now-date*1000>86400000)return null;
 const enc=new TextEncoder();
 const key=await crypto.subtle.importKey('raw',enc.encode('WebAppData'),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const secret=await crypto.subtle.sign('HMAC',key,enc.encode(token));
 const k=await crypto.subtle.importKey('raw',secret,{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const check=[...p.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('\n');
 const sig=new Uint8Array(await crypto.subtle.sign('HMAC',k,enc.encode(check)));
 if(!hash||!/^[0-9a-f]{64}$/i.test(hash))return null;
 let diff=0;for(let i=0;i<32;i++)diff|=sig[i]^parseInt(hash.slice(i*2,i*2+2),16);
 if(diff)return null;const u=JSON.parse(p.get('user'));return Number.isSafeInteger(u?.id)?u:null;
 }catch{return null;}
}
export default {async fetch(req,env){
 const url=new URL(req.url);
 if(url.pathname==='/api/health')return json({ok:true});
 if(url.pathname.startsWith('/api/')){
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 if(Number(req.headers.get('content-length'))>8192)return json({error:'Too large'},413);
 if(req.headers.get('origin')&&req.headers.get('origin')!==url.origin)return json({error:'Forbidden'},403);
 const user=await validate(req.headers.get('X-Telegram-Init-Data'),env.BOT_TOKEN);
 if(!user)return json({error:'Відкрий гру через Telegram. Сесія могла закінчитись.'},401);
 const id=env.PETS.idFromName(String(user.id));
 return env.PETS.get(id).fetch(new Request('https://pet'+url.pathname,{method:'POST',body:await req.text()}));
 }
 return env.ASSETS.fetch(req);
}};
export class PetRoom{
 constructor(ctx){this.ctx=ctx;}
 async fetch(req){
 return this.ctx.blockConcurrencyWhile(async()=>{
 let body;try{const raw=await req.text();if(raw.length>8192)return json({error:'Too large'},413);body=JSON.parse(raw||'{}');}catch{return json({error:'Bad JSON'},400);}
 const path=new URL(req.url).pathname;let s=await this.ctx.storage.get('pet');let result;
 if(path==='/api/adopt'){
 if(s&&!s.dead)return json({error:'У тебе вже є друг.'},409);
 if(!species.some(p=>p.id===body.species))return json({error:'Невідомий вид'},400);
 s=fresh(body.species);if(typeof body.name==='string'&&body.name.trim())s.name=body.name.trim().slice(0,24);result={state:s,text:'Ну привіт. Тепер ти за мене відповідаєш!'};
 }else if(path==='/api/state'){s=tick(s);result={state:s||null};}
 else if(path==='/api/action'){if(!s)return json({error:'Спочатку обери друга'},400);result=act(s,body.action);s=result.state||s;}
 else return json({error:'Not found'},404);
 if(s)await this.ctx.storage.put('pet',s);return json(result);
 });
 }
}
