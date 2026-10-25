import test from 'node:test';
import assert from 'node:assert/strict';
import {createWalletOperationId} from '../public/wallet-operation-id.js';
import {readFileSync} from 'node:fs';
test('native randomUUID is returned unchanged and preferred',()=>{
 let fallback=0;
 const id=createWalletOperationId({randomUUID:()=> 'native-test-uuid',getRandomValues:()=>{fallback++;throw Error('should not run');}});
 assert.equal(id,'native-test-uuid');assert.equal(fallback,0);
});
test('fallback produces correctly formatted version-4 variant UUID with unchanged byte mapping',()=>{
 const seed=Uint8Array.from({length:16},(_,i)=>i);
 let calls=0;
 const id=createWalletOperationId({getRandomValues:bytes=>{calls++;bytes.set(seed);return bytes;}});
 assert.equal(calls,1);
 assert.equal(id,'00010203-0405-4607-8809-0a0b0c0d0e0f');
 assert.match(id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
test('random values propagate failure instead of making insecure fallback IDs',()=>{
 assert.throws(()=>createWalletOperationId({getRandomValues:()=>{throw Error('crypto unavailable');}}),/crypto unavailable/);
});
test('app delegates to isolated cryptographic helper without changing action call sites',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.ok(app.includes('function walletOperationId(){return createWalletOperationId(crypto);}'));
 assert.ok(app.includes('walletOperationId()'));
 const mod=readFileSync(new URL('../public/wallet-operation-id.js',import.meta.url),'utf8');
 assert.doesNotMatch(mod,/document\.|localStorage|Math\.random/);
});
