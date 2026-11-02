import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto,createHmac} from 'node:crypto';
import {allowedPushEndpoint,validateSubscription,generateVapid,encodePushPayload,pushToDevice} from '../src/web-push.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const enc=new TextEncoder(),dec=new TextDecoder();
const b64=v=>Buffer.from(v).toString('base64url');
const from64=v=>new Uint8Array(Buffer.from(v,'base64url'));
const concat=(...xs)=>Buffer.concat(xs.map(x=>Buffer.from(x)));
const extract=(salt,ikm)=>createHmac('sha256',salt).update(ikm).digest();
const expand=(prk,info,n)=>createHmac('sha256',prk).update(concat(info,[1])).digest().subarray(0,n);
async function receiver(){
 const kp=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
 const raw=new Uint8Array(await crypto.subtle.exportKey('raw',kp.publicKey));
 const auth=crypto.getRandomValues(new Uint8Array(16));
 return {kp,auth,raw,subscription:{endpoint:'https://web.push.apple.com/fake-user-endpoint',keys:{p256dh:b64(raw),auth:b64(auth)}}};
}
test('reject SSRF destinations and malformed subscriptions',()=>{
 assert.equal(allowedPushEndpoint('https://127.0.0.1/'),false);
 assert.equal(allowedPushEndpoint('https://evil.push.apple.com/'),false);
 assert.equal(allowedPushEndpoint('https://web.push.apple.com/fake'),true);
 assert.equal(validateSubscription({endpoint:'https://web.push.apple.com/fake',keys:{p256dh:'bad',auth:'bad'}}),false);
});
test('VAPID keys and RFC8291 aes128gcm push payload round-trip',async()=>{
 const {kp,auth,raw,subscription}=await receiver();
 assert.ok(validateSubscription(subscription));
 const vapid=await generateVapid();
 assert.equal(from64(vapid.publicKey).length,65);
 const payload={title:'🐾 Чуча',body:'Голодна!',kind:'hunger',url:'/companion.html'};
 const bytes=await encodePushPayload(subscription,payload);
 const salt=bytes.slice(0,16);
 assert.equal(new DataView(bytes.buffer,bytes.byteOffset+16,4).getUint32(0),4096);
 assert.equal(bytes[20],65);
 const ephemeral=bytes.slice(21,86),cipher=bytes.slice(86);
 const publicKey=await crypto.subtle.importKey('raw',ephemeral,{name:'ECDH',namedCurve:'P-256'},false,[]);
 const shared=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:publicKey},kp.privateKey,256));
 const ikm=expand(extract(Buffer.from(auth),Buffer.from(shared)),concat(enc.encode('WebPush: info'),[0],raw,ephemeral),32);
 const prk=extract(Buffer.from(salt),ikm);
 const cek=expand(prk,enc.encode('Content-Encoding: aes128gcm\0'),16);
 const nonce=expand(prk,enc.encode('Content-Encoding: nonce\0'),12);
 const aes=await crypto.subtle.importKey('raw',cek,'AES-GCM',false,['decrypt']);
 const plain=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:nonce},aes,cipher));
 assert.equal(plain.at(-1),2);
 assert.deepEqual(JSON.parse(dec.decode(plain.slice(0,-1))),payload);
 const nativeFetch=globalThis.fetch;
 let sent;
 try{
  globalThis.fetch=async(url,opts)=>{sent={url,opts};return new Response(null,{status:201});};
  const res=await pushToDevice(subscription,vapid,payload,'https://example.com');
  assert.equal(res.status,201);
  assert.equal(sent.url,subscription.endpoint);
  assert.equal(sent.opts.headers['Content-Encoding'],'aes128gcm');
  assert.equal(sent.opts.redirect,'error');
  const jwt=sent.opts.headers.Authorization.match(/t=([^, ]+)/)[1];
  const chunks=jwt.split('.');
  assert.equal(chunks.length,3);
  const claims=JSON.parse(Buffer.from(chunks[1],'base64url').toString());
  assert.equal(claims.aud,'https://web.push.apple.com');
  assert.equal(claims.sub,'https://example.com');
  const pub=await crypto.subtle.importKey('raw',from64(vapid.publicKey),{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
  assert.equal(await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},pub,from64(chunks[2]),enc.encode(chunks[0]+'.'+chunks[1])),true);
 }finally{globalThis.fetch=nativeFetch;}
});
