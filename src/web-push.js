// RFC 8291 / RFC 8188 payload encryption and VAPID for zero-cost Web Push.
// Keys are generated per user's Durable Object and persisted privately. Never expose a private key.
const utf8=s=>new TextEncoder().encode(s);
const concat=(...parts)=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.byteLength,0));let offset=0;for(const p of parts){out.set(p,offset);offset+=p.byteLength;}return out;};
const base64=bytes=>btoa(Array.from(bytes,x=>String.fromCharCode(x)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
const decode=text=>{if(typeof text!=='string'||!/^[A-Za-z0-9_-]+$/.test(text))throw Error('Invalid base64url');return Uint8Array.from(atob(text.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-text.length%4)%4)),c=>c.charCodeAt(0));};

export function allowedPushEndpoint(raw){
 try{
  const u=new URL(raw);
  return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&u.pathname.length<1600&&
  (u.hostname==='web.push.apple.com'||u.hostname==='fcm.googleapis.com'||u.hostname==='updates.push.services.mozilla.com');
 }catch{return false;}
}
export function validateSubscription(s){
 if(!s||typeof s!=='object'||!allowedPushEndpoint(s.endpoint)||!s.keys)return false;
 try{return decode(s.keys.p256dh).length===65&&decode(s.keys.auth).length===16;}catch{return false;}
}
export async function generateVapid(){
 const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
 return {privateJwk:await crypto.subtle.exportKey('jwk',pair.privateKey),
  publicKey:base64(new Uint8Array(await crypto.subtle.exportKey('raw',pair.publicKey)))};
}
async function extract(salt,ikm){
 const key=await crypto.subtle.importKey('raw',salt,{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return new Uint8Array(await crypto.subtle.sign('HMAC',key,ikm));
}
async function expand(prk,info,n){
 const key=await crypto.subtle.importKey('raw',prk,{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return new Uint8Array(await crypto.subtle.sign('HMAC',key,concat(info,new Uint8Array([1])))).slice(0,n);
}
export async function encodePushPayload(subscription,payload){
 if(!validateSubscription(subscription))throw Error('Invalid push subscription');
 const receiver=decode(subscription.keys.p256dh),auth=decode(subscription.keys.auth);
 const ephemeral=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
 const sender=new Uint8Array(await crypto.subtle.exportKey('raw',ephemeral.publicKey));
 const remote=await crypto.subtle.importKey('raw',receiver,{name:'ECDH',namedCurve:'P-256'},false,[]);
 const shared=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:remote},ephemeral.privateKey,256));
 const ikm=await expand(await extract(auth,shared),concat(utf8('WebPush: info'),new Uint8Array([0]),receiver,sender),32);
 const salt=crypto.getRandomValues(new Uint8Array(16)),prk=await extract(salt,ikm);
 const cek=await expand(prk,utf8('Content-Encoding: aes128gcm\0'),16);
 const nonce=await expand(prk,utf8('Content-Encoding: nonce\0'),12);
 const message=concat(utf8(JSON.stringify(payload)),new Uint8Array([2]));
 if(message.length>3800)throw Error('Push payload too large');
 const key=await crypto.subtle.importKey('raw',cek,'AES-GCM',false,['encrypt']);
 const cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce},key,message));
 return concat(salt,new Uint8Array([0,0,16,0]),new Uint8Array([sender.length]),sender,cipher);
}
export async function pushToDevice(subscription,vapid,payload,contact){
 if(!validateSubscription(subscription))throw Error('Invalid push endpoint');
 const endpoint=new URL(subscription.endpoint);
 const aud=endpoint.origin;
 if(!/^https:\/\/[^/]+\/?$/.test(contact))throw Error('Invalid VAPID contact');
 const head=base64(utf8(JSON.stringify({typ:'JWT',alg:'ES256'})));
 const claims=base64(utf8(JSON.stringify({aud,exp:Math.floor(Date.now()/1000)+3600,sub:contact})));
 const data=head+'.'+claims;
 const key=await crypto.subtle.importKey('jwk',vapid.privateJwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const sig=new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,utf8(data)));
 const jwt=data+'.'+base64(sig);
 const body=await encodePushPayload(subscription,payload);
 return fetch(endpoint.href,{method:'POST',redirect:'manual',headers:{
  'Authorization':'vapid t='+jwt+', k='+vapid.publicKey,
  'Content-Encoding':'aes128gcm','Content-Type':'application/octet-stream',
  'TTL':'3600','Urgency':'normal'
 },body,signal:AbortSignal.timeout(10000)});
}
