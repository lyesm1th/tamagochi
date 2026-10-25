import test from 'node:test';
import assert from 'node:assert/strict';
import {ambientSlot} from '../public/calm-behavior.js';
import {updateEnrichment} from '../public/room-enrichment.js';
const now=1800000000000;
const build=id=>({id,species:'cat',born:now-86400000,health:96,happy:96,hunger:96,energy:96,living:{enrichment:{traces:[{item:'bed',kind:'blanket',at:now-90000,until:now+3600000}],tidyAt:now-1000}}});
test('automatic tidy requires room lane and respects other lanes',()=>{
 let roomCount=0,otherCount=0;
 for(let t=now;t<now+2700000;t+=5000){
  const s=build('tidy-sample'),lane=ambientSlot(s,t)?.lane;
  updateEnrichment(s,t);
  if(lane==='room'){roomCount++;assert.ok(s.living.enrichment.tidying, 'expected tidy in room lane');}
  else {otherCount++;assert.equal(s.living.enrichment.tidying,undefined);}
 }
 assert.ok(roomCount>0);assert.ok(otherCount>0);
});
test('tidy never interrupts manual activity, critical needs, vacation or sleep',()=>{
 const patches=[
  {sleeping:true},{napping:true},{dead:true},{vacation:{}},{health:10},
  {living:{motion:{until:now+3600000},enrichment:build('x').living.enrichment}},
  {living:{enrichment:{...build('x').living.enrichment,session:{until:now+3600000}}}},
  {living:{enrichment:{...build('x').living.enrichment,touch:{until:now+3600000}}}},
  {living:{enrichment:{...build('x').living.enrichment,home:{until:now+3600000}}}}
 ];
 for(let i=0;i<patches.length;i++)for(let t=now;t<now+300000;t+=30000){
  const s={...build('tidy-'+i),...structuredClone(patches[i])};
  updateEnrichment(s,t);
  assert.equal(s.living.enrichment.tidying,undefined,'case '+i+':'+t);
 }
});
