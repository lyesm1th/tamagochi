import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {createHmac} from 'node:crypto';
import {fresh,life} from '../public/game.js';

test('SQLite Workers: authenticated owner mint, pocket, gift, retries, legacy codes and room recovery',async()=>{
 const bundled=await build({entryPoints:['src/worker.js'],bundle:true,format:'esm',write:false,platform:'browser'});
 const script=bundled.outputFiles[0].text+`\nexport class TestRoom extends PetRoom { async fetch(req){if(new URL(req.url).pathname==='/seed'){const data=await req.json();for(const [key,value]of Object.entries(data))await this.ctx.storage.put(key,value);return Response.json({ok:true});}return super.fetch(req);} }`;
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script,compatibilityDate:'2026-10-01',durableObjects:{PETS:{className:'TestRoom',useSQLite:true}},bindings:{BOT_TOKEN:'test-token',OWNER_TELEGRAM_ID:' 100\n'}}));
 try{
 const ns=await mf.getDurableObjectNamespace('PETS'),stub=id=>ns.get(ns.idFromName(id));
 const seed=(id,data)=>stub(id).fetch('https://pet/seed',{method:'POST',body:JSON.stringify(data)});
 const auth=id=>{const p=new URLSearchParams({auth_date:String(Math.floor(Date.now()/1000)),user:JSON.stringify({id:Number(id)})});const check=[...p].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+'='+v).join('\n');const key=createHmac('sha256','WebAppData').update('test-token').digest();p.set('hash',createHmac('sha256',key).update(check).digest('hex'));return p.toString();};
 const call=async(id,path,body={})=>{const res=await mf.dispatchFetch('https://game.test/api/'+path,{method:'POST',headers:{'X-Telegram-Init-Data':auth(id)},body:JSON.stringify(body)});const data=await res.json();assert.equal(res.status,200,JSON.stringify(data));return data;};
 const makePet=()=>{const p=fresh('dino',Date.now()-life.teen-3600000);p.updated=Date.now();return p;};
 await seed('100',{pet:makePet()});await seed('200',{pet:makePet()});
 let r=await call('100','wallet',{command:'status'});assert.equal(r.wallet.balance,1000000);assert.equal(r.wallet.owner,true);
 r=await call('100','wallet',{command:'status'});assert.equal(r.wallet.balance,1000000);
 r=await call('100','wallet',{command:'move',direction:'withdraw',amount:500});assert.equal(r.state.coins,520);assert.equal(r.wallet.balance,999500);
 const op=crypto.randomUUID();r=await call('100','wallet',{command:'gift',amount:250,op});const code=r.wallet.gifts[0].code;assert.match(code,/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{2}$/);assert.equal(r.wallet.balance,999250);
 r=await call('100','wallet',{command:'gift',amount:250,op});assert.equal(r.wallet.balance,999250);
 r=await call('200','wallet',{command:'redeem',code:code.toLowerCase().replaceAll('-',' ')});assert.equal(r.state.coins,270);assert.equal(r.wallet.balance,0);assert.equal(r.wallet.owner,false);
 r=await call('200','wallet',{command:'redeem',code});assert.equal(r.state.coins,270);
 const denied=await mf.dispatchFetch('https://game.test/api/wallet',{method:'POST',headers:{'X-Telegram-Init-Data':auth('200')},body:JSON.stringify({command:'refill',owner:true})});assert.equal(denied.status,400);
 const legacy='gift-'+crypto.randomUUID();await seed('shared-wallet-v1',{[legacy]:{issuer:'100',amount:10,recipient:null}});r=await call('200','wallet',{command:'redeem',code:legacy});assert.equal(r.state.coins,280);
 // Purchase using credited gift, without a separate transfer.
 r=await call('200','living',{command:'roomStyle',kind:'wall',index:1});assert.equal(r.state.coins,220);
 const p=makePet();p.cozy.hide={spot:'box',expires:Date.now()+300000};p.lively={secret:{kind:'box',at:Date.now(),until:Date.now()+300000}};await seed('100',{pet:p});r=await call('100','state',{roomReturn:true});assert.equal(r.state.cozy.hide,null);assert.equal(r.state.lively.secret,null);
 }finally{await mf.dispose();}
});
