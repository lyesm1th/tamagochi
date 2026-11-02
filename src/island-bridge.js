// Optional native iOS Live Activity bridge. No Mac, signing key, or Apple developer account required.
// The user supplies a scoped PushWard integration key inside the paired PWA, not in chat.
const BASE='https://api.pushward.app';
const SLUG='raaarrr-pet';
export const PUSHWARD_LIMIT_PER_DAY=6;
export const PUSHWARD_MIN_INTERVAL_MS=30*60*1000;
export const validPushWardKey=key=>typeof key==='string'&&/^hlk_[A-Za-z0-9]{32}$/.test(key);
const clean=s=>String(s||'').slice(0,80);
const pct=n=>Math.max(0,Math.min(100,Math.round(Number(n)||0)));
function stage(age){return ({'Яєчко':'baby','Малюк':'baby','Дитина':'child','Підліток':'teen','Дорослий':'adult','Старенький':'adult'})[age]||'teen';}
function serviceOrigin(origin){
 const url=new URL(origin);
 if(url.protocol!=='https:'||url.username||url.password)throw Error('HTTPS is required for Live Activities');
 return url.origin;
}
export function islandContent(pet,origin){
 const host=serviceOrigin(origin);
 const v=pet.mood||{},name=clean(pet.name||'Пет');
 const p=pct(v.happy),sleeping=Boolean(pet.sleeping);
 const state=sleeping?'💤 Дрімаю':p<30?'🥺 Сумую':pct(v.hunger)<40?'🍗 Хочу їсти':'🐾 Я тут!';
 const visual=sleeping?'sleep':stage(pet.age);
 const species=String(pet.species||'dino').replace(/[^a-z]/g,'');
 return {
  template:'generic',state,subtitle:'🍗 '+pct(v.hunger)+'% · 🧹 '+pct(v.clean)+'% · ❤️ '+p+'%',
  progress:p/100,accent_color:p<35?'orange':'green',
  image_url:host+'/assets/island/'+visual+'/'+species+'.png',
  image_shape:'square',compact_trailing_label:sleeping?'💤':p+'%'
 };
}
async function send(key,path,method,body){
 const controller=AbortSignal.timeout(8000);
 const response=await fetch(BASE+path,{
  method,headers:{'Authorization':'Bearer '+key,'Content-Type':method==='PATCH'?'application/merge-patch+json':'application/json'},
  body:body===undefined?undefined:JSON.stringify(body),
  signal:controller,redirect:'error'
 });
 let data;try{data=await response.json();}catch{data={};}
 return {status:response.status,ok:response.ok,detail:typeof data?.error==='string'?data.error:null};
}
export async function activateIsland(key,pet,origin){
 if(!validPushWardKey(key))return {ok:false,status:400,detail:'Недійсний формат ключа PushWard'};
 if(!pet||pet.dead)return {ok:false,status:400,detail:'Немає активного пета'};
 const profile=await send(key,'/auth/me','GET');
 if(!profile.ok)return {ok:false,status:profile.status,detail:'Не вдалось підтвердити ключ PushWard'};
 const created=await send(key,'/activities','POST',{slug:SLUG,name:clean(pet.name)});
 if(!created.ok&&created.status!==409)return {ok:false,status:created.status,detail:created.detail||'Не вдалось створити Live Activity'};
 return updateIsland(key,pet,origin);
}
export async function updateIsland(key,pet,origin){
 if(!validPushWardKey(key))return {ok:false,status:400,detail:'Invalid PushWard key'};
 if(!pet)return {ok:false,status:400,detail:'No active pet'};
 const result=await send(key,'/activities/'+SLUG,'PATCH',pet.dead?{state:'ended'}:{state:'ongoing',content:islandContent(pet,origin)});
 return result;
}
export async function endIsland(key){
 if(!validPushWardKey(key))return {ok:false,status:400};
 return send(key,'/activities/'+SLUG,'PATCH',{state:'ended'});
}
export function islandQuota(config,now=Date.now()){
 const day=new Date(now).toISOString().slice(0,10);
 const count=config.day===day?Number(config.count)||0:0;
 const lastSent=Number(config.lastSent)||0;
 return {day,count,allowed:count<PUSHWARD_LIMIT_PER_DAY&&now-lastSent>=PUSHWARD_MIN_INTERVAL_MS};
}
export const islandSlug=SLUG;
