import {petInitiative} from '../public/pet-initiative.js';
import {requestOnce,requestSignature,protectedRequest,validRequestId} from './request-receipts.js';
import {walletAction,bankAction} from './wallet.js';
import {sandboxFetch} from './sandbox.js';
import {livingAction} from '../public/living.js';
import {performCozy} from '../public/cozy-life.js';
import {performPlayroom} from '../public/playroom.js';
import {performDaily} from '../public/daily-life.js';
import {performWorld,wakeStory} from '../public/little-world.js';
import {performCompanion,visit} from '../public/companionship.js';
import {snapshot,nextGeneration,candidates,petId,lineageRows} from '../public/family.js';
import {planReminder,reminderLines,safeZone,localClock} from './reminders.js';
import {fresh,act,tick,species,stage} from '../public/game.js';
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
 // Private visual lab: verify the signed Telegram session on every request.
 let assetPath;try{assetPath=decodeURIComponent(url.pathname);}catch{return json({error:'Bad path'},400);}
 if(/^\/lab/i.test(assetPath)){
 const raw=req.headers.get('Cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith('__Host-pet-lab='))?.slice('__Host-pet-lab='.length);
 let user;try{user=await validate(raw?decodeURIComponent(raw):'',env.BOT_TOKEN);}catch{}
 if(!user||!String(env.OWNER_TELEGRAM_ID||'').trim()||String(user.id)!==String(env.OWNER_TELEGRAM_ID).trim())return json({error:'Тестова кімната доступна лише овнеру через Telegram.'},403);
 const asset=await env.ASSETS.fetch(req),headers=new Headers(asset.headers);headers.set('Cache-Control','private, no-store');headers.set('Vary','Cookie');return new Response(asset.body,{status:asset.status,headers});
 }
 if(url.pathname==='/api/health')return json({ok:true});
 if(url.pathname.startsWith('/api/')){
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 if(Number(req.headers.get('content-length'))>8192)return json({error:'Too large'},413);
 if(req.headers.get('origin')&&req.headers.get('origin')!==url.origin)return json({error:'Forbidden'},403);
 if(!env.BOT_TOKEN)return json({permanent:true,error:'У Cloudflare не задано BOT_TOKEN. Додай токен цього бота в Settings → Variables and Secrets як Secret, потім застосуй зміни.'},503);
 const user=await validate(req.headers.get('X-Telegram-Init-Data'),env.BOT_TOKEN);
 if(!user)return json({error:'Відкрий гру через Telegram. Сесія могла закінчитись.'},401);
 if(url.pathname==='/api/owner/access'){
 if(!String(env.OWNER_TELEGRAM_ID||'').trim()||String(user.id)!==String(env.OWNER_TELEGRAM_ID).trim())return json({error:'Доступ лише для овнера.'},403);
 return Response.json({owner:true},{headers:{'Cache-Control':'no-store','Set-Cookie':`__Host-pet-lab=${encodeURIComponent(req.headers.get('X-Telegram-Init-Data'))}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=900`}});
 }
 const id=env.PETS.idFromName(String(user.id));
 return env.PETS.get(id).fetch(new Request('https://pet'+url.pathname,{method:'POST',headers:{'X-Pet-Owner':String(user.id),'X-Pet-App':url.origin,'X-Request-ID':req.headers.get('X-Request-ID')||''},body:await req.text()}));
 }
 const asset=await env.ASSETS.fetch(req);if(url.pathname==='/'||url.pathname==='/index.html'){const headers=new Headers(asset.headers);headers.set('Cache-Control','no-store');return new Response(asset.body,{status:asset.status,headers});}return asset;
}};
export class PetRoom{
 constructor(ctx,env={}){this.ctx=ctx;this.env=env;}
 async fetch(req){
 return this.ctx.blockConcurrencyWhile(async()=>{
 let body;try{const raw=await req.text();if(raw.length>8192)return json({error:'Too large'},413);body=JSON.parse(raw||'{}');}catch{return json({error:'Bad JSON'},400);}
 if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Bad JSON'},400);
 const path=new URL(req.url).pathname,id=req.headers.get('X-Request-ID');
 if(id&&!validRequestId(id))return json({error:'Некоректний ідентифікатор запиту.'},400);
 if(id&&protectedRequest(path,body))return requestOnce(this.ctx.storage,id,await requestSignature(path,body),()=>this.execute(req,body));
 return this.execute(req,body);
 });
 }
 async execute(req,body){
 const path=new URL(req.url).pathname;if(path==='/internal/bank')return json(await bankAction(this.ctx.storage,req.headers.get('X-Pet-Owner'),body));if(path==='/internal/sandbox')return json(await sandboxFetch(this.ctx.storage,req.headers.get('X-Pet-Owner'),body));let s=tick(await this.ctx.storage.get('pet'));if(s?.dead)await this.archive(s);let result;let prefs=await this.ctx.storage.get('reminders')||{enabled:false};
 const owner=req.headers.get('X-Pet-Owner'),app=req.headers.get('X-Pet-App');
 if(owner&&/^\d+$/.test(owner)){prefs.userId=Number(owner);prefs.appUrl=app;}
 if(path==='/api/wallet'){if(s)await this.ctx.storage.put('pet',s);const bank=this.env.PETS.get(this.env.PETS.idFromName('shared-wallet-v1'));try{const result=await walletAction(this.ctx.storage,owner,String(this.env.OWNER_TELEGRAM_ID||'').trim()===owner,{...body,requestId:req.headers.get('X-Request-ID')||undefined},async payload=>{const response=await bank.fetch(new Request('https://pet/internal/bank',{method:'POST',headers:{'X-Pet-Owner':owner},body:JSON.stringify(payload)}));return response.json();});if(result.wallet)result.wallet.ownerConfigured=!!String(this.env.OWNER_TELEGRAM_ID||'').trim();return json(result,result.error?400:200);}catch(error){console.error('Wallet operation failed',body.command,error.name,error.message);return json({error:'Не вдалося завершити переказ. Відкрий гаманець ще раз — незавершений подарунок відновиться.'},503);}}
 if(path==='/api/sandbox'){
 if(!s||s.dead||s.vacation||s.sleeping||s.napping||Date.now()-s.born<180000)return json({error:'На майданчик підемо після сну й вилуплення.'},400);
 if(!['join','poll','leave','hello','play','tease','avoid'].includes(body.command))return json({error:'Невідома дія.'},400);
 const hub=this.env.PETS.get(this.env.PETS.idFromName('shared-sandbox-v1'));
 const response=await hub.fetch(new Request('https://pet/internal/sandbox',{method:'POST',headers:{'X-Pet-Owner':owner},body:JSON.stringify({command:body.command,target:body.target,game:body.game,pet:{species:s.species,name:s.name,look:{portraitStage:stage(s),cozy:{wearing:s.cozy?.wearing||{}},appearance:s.appearance,adultCare:s.adultCare}}})}));let data=await response.json();if(data.error)return json(data,400);let automaticFriend=null;if(body.command==='join'&&s.journal?.courage?.meeting>=3&&data.pets?.length){const peer=data.pets.find(p=>p.relationship>=0);if(peer){const hello=await hub.fetch(new Request('https://pet/internal/sandbox',{method:'POST',headers:{'X-Pet-Owner':owner},body:JSON.stringify({command:'hello',target:peer.id,pet:{species:s.species,name:s.name,look:{portraitStage:stage(s),cozy:{wearing:s.cozy?.wearing||{}},appearance:s.appearance,adultCare:s.adultCare}}})}));const greeted=await hello.json();if(!greeted.error){data=greeted;automaticFriend=peer.id;}}}
 s.social??={mental:80};if(['hello','play'].includes(body.command)||automaticFriend){const peer=data.pets?.find(p=>p.id===(automaticFriend||body.target));if(peer&&peer.relationship>0){s.social.friends=[{id:peer.id,name:peer.name,score:peer.relationship||0,at:Date.now()},...(s.social.friends||[]).filter(p=>p.id!==peer.id)].slice(0,8);}}s.happy=Math.max(0,Math.min(100,s.happy+Math.max(-4,Math.min(4,data.delta||0))));s.social.mental=Math.max(0,Math.min(100,s.social.mental+Math.max(-3,Math.min(3,data.mental||0))));await this.ctx.storage.put('pet',s);return json({state:s,pets:data.pets,scenes:data.scenes,selfId:data.selfId,text:data.text});
 }
 if(path==='/api/living'){if(!s)return json({error:'Спочатку обери друга.'},400);const result=livingAction(s,body.command,body);if(result.error)return json(result,400);await this.ctx.storage.put('pet',result.state);return json(result);}
 if(path==='/api/moments'){if(s)await this.ctx.storage.put('pet',s);const rows=[...await this.ctx.storage.list({prefix:'album:',reverse:true,limit:1000})].map(([,v])=>v);const records=[...(s?.daily?.photos||[]),...rows.flatMap(r=>r.photos||[])];const seen=new Set();return json({records:records.sort((a,b)=>b.at-a.at).filter(r=>{const id=r.pet.born+':'+r.id;if(seen.has(id))return false;seen.add(id);return true;}).slice(0,200)});}
 if(path==='/api/tree'){const rows=[...await this.ctx.storage.list({prefix:'album:',reverse:true,limit:1000})].map(([,v])=>v);return json({records:lineageRows(s,rows)});}
 if(path==='/api/companion'||path==='/api/world'||path==='/api/daily'||path==='/api/playroom'||path==='/api/cozy'){
 if(!s)return json({error:'Спочатку обери друга.'},400);const next=(path==='/api/cozy'?performCozy:path==='/api/playroom'?performPlayroom:path==='/api/daily'?performDaily:path==='/api/world'?performWorld:performCompanion)(s,body.command,body);if(next.error)return json({error:next.error},400);s=next.state;await this.ctx.storage.put('pet',s);if(prefs.userId){await this.ctx.storage.put('reminders',prefs);await this.schedule(s,prefs);}return json({...next,reminders:{enabled:!!prefs.enabled}});
 }
 if(path==='/api/album'){
 const options={prefix:'album:',reverse:true,limit:21};if(typeof body.cursor==='string'&&body.cursor.startsWith('album:')&&body.cursor.length<150)options.end=body.cursor;
 const entries=[...await this.ctx.storage.list(options)];const page=entries.slice(0,20);return json({records:page.map(([,v])=>v),cursor:page.at(-1)?.[0]||null,hasMore:entries.length>20});
 }
 if(path==='/api/family'){
 const next=nextGeneration(s,body.partnerId);if(next.error)return json({error:next.error},400);
 await this.archive(s,'family',next.record);s=next.state;prefs.pendingAt=0;await this.ctx.storage.put('pet',s);if(prefs.userId){await this.ctx.storage.put('reminders',prefs);await this.schedule(s,prefs);}return json({state:s,text:next.text,reminders:{enabled:!!prefs.enabled}});
 }
 if(path==='/api/reminders'){
 if(typeof body.enabled!=='boolean')return json({error:'Невідоме налаштування'},400);
 if(body.enabled&&!prefs.userId)return json({error:'Відкрий через Telegram'},400);
 prefs.enabled=body.enabled;prefs.timezone=safeZone(body.timezone);prefs.pendingAt=0;
 await this.ctx.storage.put('reminders',prefs);await this.schedule(s,prefs);return json({reminders:{enabled:prefs.enabled},text:prefs.enabled?'Нагадування увімкнено. Писатиму інколи й без нічних пригод.':'Нагадування вимкнено. Чекатиму тебе тихенько.'});
 }
 if(path==='/api/adopt'){
 if(s&&!s.dead)return json({error:'У тебе вже є друг.'},409);
 if(!species.some(p=>p.id===body.species))return json({error:'Невідомий вид'},400);
 if(s?.dead)await this.archive(s);s=fresh(body.species);prefs.pendingAt=0;if(typeof body.name==='string'&&body.name.trim())s.name=body.name.trim().slice(0,24);result={state:s,text:'У яйці хтось ворушиться. Годинник налаштовано, чекаємо 3 хвилини.'};
 }else if(path==='/api/state'){s=tick(s);if(s&&body.roomReturn){if(s.cozy)s.cozy.hide=null;if(s.lively)s.lively.secret=null;}const greeting=s&&!s.dead?visit(s,Date.now(),body.timezone):null;if(s&&!s.dead)petInitiative(s,Date.now());const story=s&&!s.dead?wakeStory(s):null;result={state:s||null,greeting:story||greeting};}
 else if(path==='/api/action'){if(!s)return json({error:'Спочатку обери друга'},400);result=act(s,body.action,Date.now(),{game:body.game,food:body.food,choice:body.choice,kind:body.kind,eventId:body.eventId});s=result.state||s;}
 else return json({error:'Not found'},404);
 if(s?.dead)await this.archive(s);if(s)await this.ctx.storage.put('pet',s);
 if(prefs.userId){await this.ctx.storage.put('reminders',prefs);await this.schedule(s,prefs);}
 result.reminders={enabled:!!prefs.enabled};return json(result);
 }
 async archive(s,outcome=s.endReason||'death',record=null){
 const key='album:'+String(s.born).padStart(16,'0')+':'+petId(s);if(!await this.ctx.storage.get(key))await this.ctx.storage.put(key,record||snapshot(s,outcome));
 }
 async schedule(s,p){
 const planned=planReminder(s,p);await this.ctx.storage.put('reminders',planned.prefs);
 if(planned.next!==null){await this.ctx.storage.setAlarm(Math.max(Date.now()+1000,planned.next));}else if(this.ctx.storage.deleteAlarm){await this.ctx.storage.deleteAlarm();}
 }
 async alarm(){
 const delivery=await this.ctx.blockConcurrencyWhile(async()=>{
 const now=Date.now();let s=tick(await this.ctx.storage.get('pet'),now);const p=await this.ctx.storage.get('reminders')||{enabled:false};
 if(s?.dead)await this.archive(s);if(s)await this.ctx.storage.put('pet',s);
 const planned=planReminder(s,p,now);let prefs=planned.prefs;
 if(!planned.key){await this.ctx.storage.put('reminders',prefs);if(planned.next!==null)await this.ctx.storage.setAlarm(Math.max(now+1000,planned.next));return;}
 if(!this.env.BOT_TOKEN){await this.ctx.storage.setAlarm(now+60*60000);return;}
 // Reserve before sending: alarm retries cannot duplicate a reminder.
 prefs.lastSent=now;prefs.day=localClock(now,prefs.timezone).day;prefs.count=(prefs.count||0)+1;prefs.pendingAt=0;
 await this.ctx.storage.put('reminders',prefs);await this.schedule(s,prefs);
 const list=reminderLines[planned.key],text=s.name+': '+list[Math.floor(Math.random()*list.length)];
 const body={chat_id:prefs.userId,text};
 if(prefs.appUrl&&/^https:\/\//.test(prefs.appUrl))body.reply_markup={inline_keyboard:[[{text:'🐾 До пета',web_app:{url:prefs.appUrl}}]]};
 return {body,sentAt:now};
 });
 if(!delivery)return;
 // External network latency must not block requests to this pet.
 try{const response=await fetch('https://api.telegram.org/bot'+this.env.BOT_TOKEN+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(delivery.body),signal:AbortSignal.timeout(10000)});const result=await response.json();if(result.error_code===403||result.error_code===400){await this.ctx.blockConcurrencyWhile(async()=>{const current=await this.ctx.storage.get('reminders');if(current?.lastSent===delivery.sentAt){current.enabled=false;await this.ctx.storage.put('reminders',current);await this.ctx.storage.deleteAlarm();}});}}catch{/* Reserved next window prevents duplicate sends. */}
 }

}
