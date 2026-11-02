import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validPushWardKey,islandContent,islandQuota,activateIsland,updateIsland,endIsland,checkPushWardHealth,PushWardTransportError} from '../src/island-bridge.js';
const KEY='hlk_'+'B'.repeat(32);
const pet={name:'Чуча',species:'dog',age:'Дорослий',sleeping:false,dead:false,mood:{happy:23,hunger:96,clean:97,energy:78}};
test('island bridge accepts only scoped format; never leaks keys into picture URL',()=>{
 assert.equal(validPushWardKey(KEY),true);
 assert.equal(validPushWardKey('hlk_abc'),false);
 const payload=islandContent(pet,'https://pixel-pets.example.workers.dev');
 assert.equal(payload.template,'steps');
 assert.equal(payload.total_steps,4);
 assert.equal(payload.current_step,4);
 assert.equal(payload.progress,.23);
 assert.equal(payload.image_url,'https://pixel-pets.example.workers.dev/assets/island/adult/dog.png');
 assert.equal(payload.compact_trailing_label,'23%');
 assert.ok(!JSON.stringify(payload).includes(KEY));
 assert.equal(islandContent({...pet,sleeping:true},'https://pixel-pets.example.workers.dev').image_url,'https://pixel-pets.example.workers.dev/assets/island/sleep/dog.png');
 assert.throws(()=>islandContent(pet,'http://localhost'));
});
test('hard maximum 6 PushWard updates per UTC day; at least 30 min between sends',()=>{
 const now=Date.parse('2026-11-02T21:00:00Z');
 assert.equal(islandQuota({day:'2026-11-02',count:6,lastSent:0},now).allowed,false);
 assert.equal(islandQuota({day:'2026-11-02',count:2,lastSent:now-300000},now).allowed,false);
 assert.equal(islandQuota({day:'2026-11-02',count:2,lastSent:now-2000000},now).allowed,true);
 assert.equal(islandQuota({day:'2026-11-01',count:6,lastSent:now-2000000},now).count,0);
});
test('PushWard REST integration starts, updates and ends an activity without leaking token',async()=>{
 const original=globalThis.fetch,calls=[];
 try{
  globalThis.fetch=async(url,options)=>{
   calls.push({url,options});
   if(url.endsWith('/auth/me'))return Response.json({id:'test'}, {status:200});
   if(options.method==='POST')return Response.json({slug:'raaarrr-pet'}, {status:201});
   return Response.json({state:'ongoing'},{status:200});
  };
  const started=await activateIsland(KEY,pet,'https://pixel-pets.example.workers.dev');
  assert.equal(started.ok,true);
  assert.deepEqual(calls.map(c=>c.options.method),['GET','POST','PATCH']);
  assert.deepEqual(calls.map(c=>new URL(c.url).hostname),['api.pushward.app','api.pushward.app','api.pushward.app']);
  assert.equal(calls[2].options.headers['Content-Type'],'application/merge-patch+json');
  assert.ok(calls.every(c=>c.options.redirect==='manual'),'Cloudflare Workers only support manual/follow redirect modes');
  const pushed=JSON.parse(calls[2].options.body);
  assert.equal(pushed.state,'ongoing');
  assert.equal(pushed.content.image_url,'https://pixel-pets.example.workers.dev/assets/island/adult/dog.png');
  assert.equal(pushed.content.template,'steps');
  assert.equal((await endIsland(KEY)).ok,true);
  assert.equal(JSON.parse(calls.at(-1).options.body).state,'ended');
  assert.equal((await updateIsland(KEY,{...pet,dead:true},'https://pixel-pets.example.workers.dev')).ok,true);
  assert.equal(JSON.parse(calls.at(-1).options.body).state,'ended');
 }finally{globalThis.fetch=original}
});

test('PushWard health probe safely reports success, timeout and transport errors without credentials',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async()=>Response.json({status:'ok'});
  assert.deepEqual(await checkPushWardHealth(),{ok:true,status:200,reason:null});
  globalThis.fetch=async()=>{throw new DOMException('request aborted','TimeoutError')};
  const timeout=await checkPushWardHealth();
  assert.equal(timeout.ok,false);assert.equal(timeout.reason,'timeout');assert.equal(timeout.stage,'health');
  globalThis.fetch=async()=>{throw Error('upstream debug detail may contain secrets')};
  const result=await checkPushWardHealth();
  assert.equal(result.reason,'network');
  assert.ok(!JSON.stringify(result).includes('debug detail'));
 }finally{globalThis.fetch=original}
});
test('PushWard auth failure identifies which provider step failed without reflecting bearer token',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async()=>Response.json({code:'integration_key.permission_denied',detail:'requires activities:manage'}, {status:403});
  const error=await activateIsland(KEY,pet,'https://pixel-pets.example.workers.dev');
  assert.equal(error.ok,false);assert.equal(error.stage,'authentication');
  assert.equal(error.status,403);assert.ok(!JSON.stringify(error).includes(KEY));
  globalThis.fetch=async()=>{throw new TypeError('failed to fetch')};
  await assert.rejects(()=>activateIsland(KEY,pet,'https://pixel-pets.example.workers.dev'),e=>
   e instanceof PushWardTransportError&&e.stage==='authentication'&&e.reason==='network');
 }finally{globalThis.fetch=original}
});

test('PushWard provider redirects never forward integration token to another host',async()=>{
 const original=globalThis.fetch,requests=[];
 try{
  globalThis.fetch=async(url,options)=>{
   requests.push({url,redirect:options.redirect});
   return new Response(null,{status:302,headers:{Location:'https://malicious.example/steal'}});
  };
  const health=await checkPushWardHealth();
  assert.equal(health.ok,false);
  assert.equal(health.status,302);
  assert.equal(health.reason,'provider_http_error');
  const result=await activateIsland(KEY,pet,'https://pixel-pets.example.workers.dev');
  assert.equal(result.ok,false);
  assert.equal(result.status,302);
  assert.deepEqual(requests,[
   {url:'https://api.pushward.app/health',redirect:'manual'},
   {url:'https://api.pushward.app/auth/me',redirect:'manual'}
  ]);
 }finally{globalThis.fetch=original}
});

test('Steps Live Activity accepts two native background webhook action objects',async()=>{
 const primary={url:'https://pets.example/api/island/care/777',method:'POST',foreground:false,headers:{'X-Pet-Care-Key':'x'},body:'{"action":"feed"}',title:'Годувати',icon:'fork.knife'};
 const secondary={...primary,body:'{"action":"pet"}',title:'Погладити'};
 const content=islandContent(pet,'https://pets.example',{primary,secondary});
 assert.equal(content.template,'steps');
 assert.deepEqual(content.url_action,primary);
 assert.deepEqual(content.secondary_url_action,secondary);
 assert.equal(content.tap_action.url,'https://pets.example/companion.html');
});
