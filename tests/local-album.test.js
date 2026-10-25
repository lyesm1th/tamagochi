import test from 'node:test';
import assert from 'node:assert/strict';
import {readLocalAlbum,writeLocalAlbum} from '../public/local-album.js';
const species=[{id:'cat'},{id:'dino'}];
test('reads and filters album records with the same legacy criteria and order',()=>{
 const rows=[{id:'one',species:'cat',ageMs:1},{id:'two',species:'dino',ageMs:0},{id:'bad-species',species:'fox',ageMs:1},{id:3,species:'cat',ageMs:1},{id:'bad-age',species:'cat',ageMs:'1'},null];
 const storage={getItem:()=>JSON.stringify(rows)};
 assert.deepEqual(readLocalAlbum(storage,species),rows.slice(0,2));
});
test('missing, malformed, inaccessible and nonarray data return empty album',()=>{
 for(const storage of [{getItem:()=>null},{getItem:()=>'{bad'},{getItem:()=>JSON.stringify({id:'x'})},{getItem:()=>{throw Error('blocked');}}])assert.deepEqual(readLocalAlbum(storage,species),[]);
});
test('writes remembered album record without changing record formation',()=>{
 let saved='';const storage={getItem:()=>JSON.stringify([{id:'old',species:'cat',ageMs:1}]),setItem:(_,value)=>{saved=value;}};
 let snapshotCalls=0,rememberCalls=0;
 const snapshot=(p,outcome)=>{snapshotCalls++;return {id:p.id,species:p.species,ageMs:2,outcome};};
 const remember=(rows,record)=>{rememberCalls++;return [...rows,record];};
 writeLocalAlbum(storage,species,remember,snapshot,{id:'new',species:'dino'},'death');
 assert.equal(snapshotCalls,1);assert.equal(rememberCalls,1);
 assert.deepEqual(JSON.parse(saved).map(r=>r.id),['old','new']);
 writeLocalAlbum(storage,species,remember,snapshot,{id:'ignore'},'family',{id:'provided',species:'cat',ageMs:4});
 assert.equal(snapshotCalls,1,'explicit record bypasses snapshot generation');
});
test('storage write failure preserves message and does not throw',()=>{
 let complaint='';
 const storage={getItem:()=>null,setItem:()=>{throw Error('quota');}};
 writeLocalAlbum(storage,species,(_,record)=>[record],()=>({id:'p',species:'cat',ageMs:1}),{},'death',null,text=>complaint=text);
 assert.equal(complaint,'На пристрої закінчилося місце для альбому.');
});
test('local-album module does not access global storage or mutate game state',async()=>{
 const {readFileSync}=await import('node:fs');
 const source=readFileSync(new URL('../public/local-album.js',import.meta.url),'utf8');
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/localStorage|document\.|window\./);
 assert.ok(app.includes('readLocalAlbum(localStorage,species)'));
 assert.ok(app.includes('writeLocalAlbum(localStorage,species,remember,snapshot,p,outcome,record,fail)'));
});
