import {generateVapid,validateSubscription,pushToDevice} from './web-push.js';
import {activateIsland,updateIsland,endIsland,validPushWardKey,islandQuota,islandSlug,checkPushWardHealth} from './island-bridge.js';
import {newIslandCareToken,careButtons} from './island-care.js';
import {mobilePetSnapshot} from '../public/mobile-pet-snapshot.js';
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
 if(url.pathname.startsWith('/api/island/care/')){
  if(req.method!=='POST')return json({error:'Method not allowed'},405);
  const owner=url.pathname.slice('/api/island/care/'.length);
  const secret=req.headers.get('X-Pet-Care-Key')||'';
  if(!/^[0-9]{1,18}$/.test(owner))return json({error:'Not found'},404);
  if(!/^[a-f0-9]{64}$/.test(secret))return json({error:'Not authorized'},401);
  let raw;
  try{raw=await req.text();if(raw.length>256)return json({error:'Too large'},413);}catch{return json({error:'Bad request'},400);}
  let action;try{action=JSON.parse(raw).action;}catch{return json({error:'Bad JSON'},400);}
  if(!['feed','pet','clean','sleep'].includes(action))return json({error:'Unsupported action'},400);
  return env.PETS.get(env.PETS.idFromName(owner)).fetch(new Request('https://pet/internal/island/care',{method:'POST',headers:{'X-Pet-Care-Key':secret},body:JSON.stringify({action})}));
 }
 if(url.pathname.startsWith('/api/widget/')){
  if(req.method!=='POST')return json({error:'Method not allowed'},405);
  if(url.pathname==='/api/widget/pair'){
   const u=await validate(req.headers.get('X-Telegram-Init-Data'),env.BOT_TOKEN);
   if(!u)return json({error:'Telegram auth required'},401);
   return env.PETS.get(env.PETS.idFromName(String(u.id))).fetch(new Request('https://pet/internal/widget/pair',{method:'POST',headers:{'X-Pet-Owner':String(u.id)}}));
  }
  const token=req.headers.get('Authorization')?.replace(/^Bearer /i,'')||'';
  const match=/^([0-9]+)[.]([a-f0-9]{64})$/.exec(token);
  if(!match)return json({error:'Pair the widget in Telegram first'},401);
  if(!['/api/widget/state','/api/widget/action','/api/widget/push-key','/api/widget/push-subscribe','/api/widget/push-unsubscribe','/api/widget/push-test','/api/widget/island/connect','/api/widget/island/status','/api/widget/island/sync','/api/widget/island/disconnect','/api/widget/island/diagnostics'].includes(url.pathname))return json({error:'Not found'},404);
  let body;try{body=await req.text();if(body.length>8192)return json({error:'Too large'},413);}catch{return json({error:'Bad request'},400);}
  const uid=match[1];
  return env.PETS.get(env.PETS.idFromName(uid)).fetch(new Request('https://pet/internal/widget/'+url.pathname.slice('/api/widget/'.length),{method:'POST',headers:{'X-Widget-Token':token,'X-Companion-Origin':url.origin,'X-Request-ID':req.headers.get('X-Request-ID')||''},body}));
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
 const asset=await env.ASSETS.fetch(req);if(url.pathname==='/'||url.pathname==='/index.html'||url.pathname==='/companion.html'){const headers=new Headers(asset.headers);headers.set('Cache-Control','no-store');return new Response(asset.body,{status:asset.status,headers});}return asset;
}};
export class PetRoom{
 constructor(ctx,env={}){this.ctx=ctx;this.env=env;}
 async fetch(req){
 return this.ctx.blockConcurrencyWhile(async()=>{
 let body;try{const raw=await req.text();if(raw.length>8192)return json({error:'Too large'},413);body=JSON.parse(raw||'{}');}catch{return json({error:'Bad JSON'},400);}
 if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Bad JSON'},400);
 const path=new URL(req.url).pathname,id=req.headers.get('X-Request-ID');
 if(path==='/internal/widget/pair'){
  const bytes=crypto.getRandomValues(new Uint8Array(32));
  const secret=Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');
  const token=req.headers.get('X-Pet-Owner')+'.'+secret;
  await this.ctx.storage.put('widget-access',{hash:await requestSignature('widget',secret),created:Date.now()});
  // Pairing a different phone revokes the former phone's notification subscription.
  await this.ctx.storage.delete('push-subscription');
  // Connecting a second iPhone must not take control of the previous owner's Live Activity.
  const island=await this.ctx.storage.get('island-bridge');
  if(island?.enabled)this.ctx.waitUntil(endIsland(island.key).catch(()=>{}));
  await this.ctx.storage.delete('island-bridge');
  const pushPrefs=await this.ctx.storage.get('push-reminders')||{};pushPrefs.enabled=false;
  await this.ctx.storage.put('push-reminders',pushPrefs);
  await this.schedule(await this.ctx.storage.get('pet'),await this.ctx.storage.get('reminders')||{enabled:false});
  return json({token});
 }
 if(path==='/internal/island/care'){
  const config=await this.ctx.storage.get('island-bridge');
  const secret=req.headers.get('X-Pet-Care-Key')||'';
  if(!config?.enabled||!/^[a-f0-9]{64}$/.test(secret)||!config.careToken||await requestSignature('island-care',secret)!==config.careHash)return json({error:'Care action has expired. Reconnect PushWard.'},401);
  const now=Date.now();
  if(now-(await this.ctx.storage.get('island-care-last')||0)<8000)return json({error:'Wait a moment before another action'},429);
  if(!['feed','pet','clean','sleep'].includes(body.action))return json({error:'Unsupported action'},400);
  const pet=tick(await this.ctx.storage.get('pet'),now);
  if(!pet||pet.dead)return json({error:'No active pet'},400);
  const result=act(pet,body.action,now,{});
  if(result.error)return json({error:result.error},400);
  await this.ctx.storage.put('island-care-last',now);
  await this.ctx.storage.put('pet',result.state);
  await this.queueIslandUpdate(result.state,true);
  await this.schedule(result.state,await this.ctx.storage.get('reminders')||{enabled:false});
  return json({ok:true,text:result.text});
 }
 if(['/internal/widget/state','/internal/widget/action','/internal/widget/push-key','/internal/widget/push-subscribe','/internal/widget/push-unsubscribe','/internal/widget/push-test','/internal/widget/island/connect','/internal/widget/island/status','/internal/widget/island/sync','/internal/widget/island/disconnect','/internal/widget/island/diagnostics'].includes(path)){
  const token=req.headers.get('X-Widget-Token')||'';
  const secret=token.split('.')[1]||'';
  const record=await this.ctx.storage.get('widget-access');
  if(!record||Date.now()-record.created>90*86400000||await requestSignature('widget',secret)!==record.hash)return json({error:'Widget access expired; pair again'},401);
  if(path==='/internal/widget/push-key'){
   return json({publicKey:(await this.vapid()).publicKey});
  }
  if(path==='/internal/widget/push-subscribe'){
   if(!validateSubscription(body.subscription))return json({error:'Invalid push subscription'},400);
   const appOrigin=req.headers.get('X-Companion-Origin')||'';
   if(!/^https:\/\/[^/]+$/.test(appOrigin))return json({error:'Invalid app origin'},400);
   await this.vapid();
   const previous=await this.ctx.storage.get('push-subscription');
   const unchanged=previous?.endpoint===body.subscription.endpoint&&previous?.keys?.p256dh===body.subscription.keys.p256dh;
   await this.ctx.storage.put('push-subscription',{endpoint:body.subscription.endpoint,keys:{p256dh:body.subscription.keys.p256dh,auth:body.subscription.keys.auth},origin:appOrigin});
   const prefs=await this.ctx.storage.get('push-reminders')||{enabled:false,timezone:'Europe/Kyiv'};
   prefs.enabled=true;prefs.timezone=safeZone(body.timezone||prefs.timezone||'Europe/Kyiv');if(!unchanged)prefs.pendingAt=0;
   await this.ctx.storage.put('push-reminders',prefs);
   await this.schedule(await this.ctx.storage.get('pet'),await this.ctx.storage.get('reminders')||{enabled:false});
   return json({ok:true,enabled:true});
  }
  if(path==='/internal/widget/push-unsubscribe'){
   await this.ctx.storage.delete('push-subscription');
   const prefs=await this.ctx.storage.get('push-reminders')||{};prefs.enabled=false;prefs.pendingAt=0;
   await this.ctx.storage.put('push-reminders',prefs);
   await this.schedule(await this.ctx.storage.get('pet'),await this.ctx.storage.get('reminders')||{enabled:false});
   return json({ok:true,enabled:false});
  }
  if(path==='/internal/widget/push-test'){
   const sub=await this.ctx.storage.get('push-subscription');
   if(!sub)return json({error:'Увімкни сповіщення на домашньому екрані'},400);
   const now=Date.now(),last=await this.ctx.storage.get('push-test-last')||0;
   if(now-last<60000)return json({error:'Тест можна надсилати раз на хвилину'},429);
   await this.ctx.storage.put('push-test-last',now);
   try{
    const res=await pushToDevice(sub,await this.vapid(),{title:'🐾 РААААРРРАГОЧІ',body:'Я тут! І так, це справжнє сповіщення від твого пета.',url:'/companion.html'},sub.origin);
    if(res.status===404||res.status===410){await this.ctx.storage.delete('push-subscription');return json({error:'Підписка застаріла. Увімкни сповіщення знову.'},410);}
    return json({ok:res.ok,status:res.status},res.ok?200:502);
   }catch(e){console.error('Push test failed',e?.name,e?.message);return json({error:'Служба сповіщень не прийняла повідомлення'},503);}
  }
  if(path==='/internal/widget/island/diagnostics'){
   return json({provider:'PushWard',connection:await checkPushWardHealth()});
  }
  if(path==='/internal/widget/island/status'){
   const config=await this.ctx.storage.get('island-bridge');
   const quota=config?islandQuota(config):null;
   return json({enabled:!!config?.enabled,provider:'PushWard',updatesToday:quota?.count||0,limit:6,lastSent:config?.lastSent||null});
  }
  if(path==='/internal/widget/island/connect'){
   if(!validPushWardKey(body.key))return json({error:'Неправильний ключ PushWard. Створи окремий ключ із правом activity:manage.'},400);
   const pet=tick(await this.ctx.storage.get('pet'));if(!pet||pet.dead)return json({error:'Спочатку потрібен живий пет'},400);
   const origin=req.headers.get('X-Companion-Origin')||'';
   const ownerId=token.split('.')[0],careToken=newIslandCareToken();
   const buttons=careButtons(origin,ownerId,careToken,mobilePetSnapshot(pet).pet);
   let outcome;try{outcome=await activateIsland(body.key,mobilePetSnapshot(pet).pet,origin,buttons);}
   catch(e){
    console.error('Island connect failed',{stage:e?.stage||'unknown',reason:e?.reason||'unknown',type:e?.name||'Error'});
    const stage=typeof e?.stage==='string'?e.stage:'unknown';
    const reason=e?.reason==='timeout'?'timeout':e?.reason==='network'?'network':'runtime';
    return json({error:reason==='timeout'?'PushWard не відповів за 8 секунд.':reason==='network'?'Cloudflare не зміг зв’язатися з PushWard.':'Помилка виконання на сервері РАААРРРАГОЧІ.',stage,reason},503);
   }
   if(!outcome.ok)return json({error:outcome.detail||'PushWard відхилив підключення',providerStatus:outcome.status,stage:outcome.stage||'provider',code:outcome.code||null},502);
   const quota=islandQuota({});
   await this.ctx.storage.put('island-bridge',{enabled:true,key:body.key,origin,slug:islandSlug,day:quota.day,count:1,lastSent:Date.now(),ownerId,careToken,careHash:await requestSignature('island-care',careToken)});
   await this.ctx.storage.delete('island-care-last');
   return json({enabled:true,provider:'PushWard',note:'Live Activity запущено. Якщо острівець порожній, відкрий PushWard і дозволь Live Activities.'});
  }
  if(path==='/internal/widget/island/sync'){
   const config=await this.ctx.storage.get('island-bridge');
   if(!config?.enabled)return json({error:'Спершу підключи PushWard'},400);
   const quota=islandQuota(config);if(!quota.allowed)return json({error:'Наступне оновлення доступне пізніше. Ліміт безкоштовного тарифу: 6 на день.',updatesToday:quota.count},429);
   const pet=tick(await this.ctx.storage.get('pet'));if(!pet)return json({error:'Немає пета'},400);
   const activePet=mobilePetSnapshot(pet).pet,careToken=config.careToken||newIslandCareToken(),ownerId=config.ownerId||token.split('.')[0];
   const buttons=careButtons(config.origin,ownerId,careToken,activePet);
   let result;try{result=await updateIsland(config.key,activePet,config.origin,buttons);}
   catch(e){console.error('Island sync failed',e?.name);return json({error:'PushWard недоступний'},503);}
   if(!result.ok)return json({error:'PushWard не прийняв оновлення',providerStatus:result.status},502);
   await this.ctx.storage.put('island-bridge',{...config,ownerId,careToken,careHash:await requestSignature('island-care',careToken),day:quota.day,count:quota.count+1,lastSent:Date.now()});
   return json({ok:true,updatesToday:quota.count+1});
  }
  if(path==='/internal/widget/island/disconnect'){
   const config=await this.ctx.storage.get('island-bridge');
   if(!config?.enabled)return json({enabled:false});
   let outcome;try{outcome=await endIsland(config.key);}catch{return json({error:'Не вдалося завершити Live Activity. Спробуй ще раз.'},503);}
   if(!outcome.ok)return json({error:'PushWard відхилив завершення',providerStatus:outcome.status},502);
   await this.ctx.storage.delete('island-bridge');
   return json({enabled:false});
  }
  if(path==='/internal/widget/state'){
   const pet=tick(await this.ctx.storage.get('pet'));
   if(pet)await this.ctx.storage.put('pet',pet);
   return json(mobilePetSnapshot(pet));
  }
  const operationId=id||body.requestId;
  if(!validRequestId(operationId))return json({error:'Widget requestId is required'},400);
  if(!['feed','clean','pet','sleep'].includes(body.action))return json({error:'Unsupported widget action'},400);
  return requestOnce(this.ctx.storage,operationId,await requestSignature(path,{action:body.action}),async()=>{
   let pet=tick(await this.ctx.storage.get('pet'));
   if(!pet||pet.dead)return json({error:'No active pet'},400);
   const outcome=act(pet,body.action,Date.now(),{});
   if(outcome.error)return json({error:outcome.error},400);
   await this.ctx.storage.put('pet',outcome.state);
   await this.queueIslandUpdate(outcome.state);
   await this.schedule(outcome.state,await this.ctx.storage.get('reminders')||{enabled:false});
   return json({text:outcome.text,...mobilePetSnapshot(outcome.state)});
  });
 }

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
 if(path==='/api/action'&&s)await this.queueIslandUpdate(s);
 if(prefs.userId){await this.ctx.storage.put('reminders',prefs);await this.schedule(s,prefs);}
 result.reminders={enabled:!!prefs.enabled};return json(result);
 }
 async archive(s,outcome=s.endReason||'death',record=null){
 const key='album:'+String(s.born).padStart(16,'0')+':'+petId(s);if(!await this.ctx.storage.get(key))await this.ctx.storage.put(key,record||snapshot(s,outcome));
 }
 async queueIslandUpdate(pet,interactive=false){
  const config=await this.ctx.storage.get('island-bridge');
  if(!config?.enabled)return;
  const quota=islandQuota(config);
  if(!quota.allowed&&!(interactive&&quota.count<6&&Date.now()-config.lastSent>=12000))return;
  await this.ctx.storage.put('island-bridge',{...config,day:quota.day,count:quota.count+1,lastSent:Date.now()});
  const snapshot=mobilePetSnapshot(pet).pet;
  const buttons=config.careToken&&config.ownerId?careButtons(config.origin,config.ownerId,config.careToken,snapshot):null;
  this.ctx.waitUntil(updateIsland(config.key,snapshot,config.origin,buttons).then(result=>{
   if(!result.ok)console.error('Island update declined',result.status);
  }).catch(e=>console.error('Island update failed',e?.name)));
 }
 async vapid(){
  let pair=await this.ctx.storage.get('push-vapid');
  if(!pair){pair=await generateVapid();await this.ctx.storage.put('push-vapid',pair);}
  return pair;
 }
 async schedule(s,p){
  const now=Date.now();
  const telegram=planReminder(s,p,now);await this.ctx.storage.put('reminders',telegram.prefs);
  const pushPrefs=await this.ctx.storage.get('push-reminders')||{enabled:false,timezone:'Europe/Kyiv'};
  const subscribed=await this.ctx.storage.get('push-subscription');
  if(!subscribed)pushPrefs.enabled=false;
  const push=planReminder(s,pushPrefs,now);await this.ctx.storage.put('push-reminders',push.prefs);
  const times=[telegram.next,push.next].filter(t=>t!==null&&Number.isFinite(t));
  if(times.length)await this.ctx.storage.setAlarm(Math.max(now+1000,Math.min(...times)));
  else if(this.ctx.storage.deleteAlarm)await this.ctx.storage.deleteAlarm();
 }
 async alarm(){
  const due=await this.ctx.blockConcurrencyWhile(async()=>{
   const now=Date.now(),pet=tick(await this.ctx.storage.get('pet'),now);
   if(pet?.dead)await this.archive(pet);
   if(pet)await this.ctx.storage.put('pet',pet);
   const tgPrefs=await this.ctx.storage.get('reminders')||{enabled:false};
   const pushPrefs=await this.ctx.storage.get('push-reminders')||{enabled:false,timezone:'Europe/Kyiv'};
   const subscription=await this.ctx.storage.get('push-subscription');
   const t=planReminder(pet,tgPrefs,now);
   const p=planReminder(pet,subscription?pushPrefs:{...pushPrefs,enabled:false},now);
   const reserve=(result)=>{
    const prefs=result.prefs;
    prefs.lastSent=now;prefs.day=localClock(now,prefs.timezone).day;
    prefs.count=(prefs.count||0)+1;prefs.pendingAt=0;
    return prefs;
   };
   const sendTelegram=t.key&&this.env.BOT_TOKEN&&t.prefs.userId;
   const sendPush=Boolean(p.key&&subscription);
   const telegram=sendTelegram?{key:t.key,prefs:reserve(t)}:null;
   const push=sendPush?{key:p.key,prefs:reserve(p)}:null;
   await this.ctx.storage.put('reminders',telegram?.prefs||t.prefs);
   await this.ctx.storage.put('push-reminders',push?.prefs||p.prefs);
   await this.schedule(pet,telegram?.prefs||t.prefs);
   if(!telegram&&!push)return null;
   const pick=key=>reminderLines[key][Math.floor(Math.random()*reminderLines[key].length)];
   return {
    telegram:telegram?{body:{chat_id:telegram.prefs.userId,text:pet.name+': '+pick(telegram.key)},sentAt:now,appUrl:telegram.prefs.appUrl}:null,
    push:push?{subscription,payload:{title:'🐾 '+pet.name,body:pick(push.key),url:'/companion.html',kind:push.key},sentAt:now}:null
   };
  });
  if(!due)return;
  // External HTTP requests run outside blockConcurrencyWhile.
  if(due.telegram){
   const msg=due.telegram;
   if(msg.appUrl&&/^https:\/\//.test(msg.appUrl))msg.body.reply_markup={inline_keyboard:[[{text:'🐾 До пета',web_app:{url:msg.appUrl}}]]};
   try{
    const response=await fetch('https://api.telegram.org/bot'+this.env.BOT_TOKEN+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(msg.body),signal:AbortSignal.timeout(10000)});
    const result=await response.json();
    if(result.error_code===403||result.error_code===400)await this.ctx.blockConcurrencyWhile(async()=>{
     const prefs=await this.ctx.storage.get('reminders');
     if(prefs?.lastSent===msg.sentAt){prefs.enabled=false;await this.schedule(await this.ctx.storage.get('pet'),prefs);}
    });
   }catch{/* Reserved window prevents duplicate sends. */}
  }
  if(due.push){
   try{
    const pair=await this.ctx.storage.get('push-vapid');
    const res=await pushToDevice(due.push.subscription,pair,due.push.payload,due.push.subscription.origin);
    if(res.status===404||res.status===410)await this.ctx.blockConcurrencyWhile(async()=>{
     const saved=await this.ctx.storage.get('push-subscription');
     if(saved?.endpoint===due.push.subscription.endpoint){
      await this.ctx.storage.delete('push-subscription');
      const pp=await this.ctx.storage.get('push-reminders')||{};pp.enabled=false;
      await this.ctx.storage.put('push-reminders',pp);
      await this.schedule(await this.ctx.storage.get('pet'),await this.ctx.storage.get('reminders')||{enabled:false});
     }
    });
   }catch(e){console.error('Web Push delivery failure',e?.name,e?.message);}
  }
 }


}
