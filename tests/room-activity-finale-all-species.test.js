import test from 'node:test';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {roomActivityFinale,roomMoment,roomMomentPose,drawRoomResponse} from '../public/room-life.js';
import {ambientSlot} from '../public/calm-behavior.js';

const t=Date.parse('2026-10-26T12:00:00Z');
const makePet=id=>({
 id:'room-finale-'+id,species:id,born:t-8*3600000,
 hunger:94,health:93,energy:91,happy:95,
 room:{toy:true,bed:true},
 cozy:{owned:{laser:true,cushion:true},items:{},preferences:{object:{}}}
});
const moment=(item='laser',kind='play')=>({item,kind,auto:true,at:t,until:t+14000,origin:{x:96,feet:130}});
const render=(s,m,style='classic',reduced=false)=>{
 const pose=roomMomentPose(s,m,style,t+13000,reduced);
 const calls=[],c={canvas:{width:style==='detailed'?384:192},
   fillRect(...v){assert.ok(v.every(Number.isFinite));calls.push(v);},
   fillText(text,x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y));calls.push(['text',text,x,y]);}
 };
 drawRoomResponse(c,s,pose,t+13000,reduced);
 return {pose,calls};
};

test('every one of the fourteen species can show deterministic laser finales',()=>{
 assert.equal(species.length,14);
 for(const {id} of species){
  const s=makePet(id),before=structuredClone(s),m=moment();
  const outcome=roomActivityFinale(s,m,t+13000);
  assert.ok(['caught','miss'].includes(outcome),id);
  assert.equal(roomActivityFinale(s,m,t+13000),outcome);
  assert.equal(roomActivityFinale(s,m,t+11000),null);
  assert.equal(roomActivityFinale(s,m,t+14000),null);
  assert.equal(roomActivityFinale(s,{...m,auto:false},t+13000),null);
  assert.deepEqual(s,before);
 }
});

test('loved toys lead to fondness, quiet rest calms pets, play may discover things',()=>{
 for(const {id} of species){
  const s=makePet(id);
  s.cozy.preferences.object.love='toy';
  assert.equal(roomActivityFinale(s,moment('toy','play'),t+13000),'fond');
  assert.equal(roomActivityFinale(s,moment('bed','doze'),t+13000),'rest');
  assert.equal(roomActivityFinale(s,moment('toybox','search'),t+13000),'discover');
  assert.equal(roomActivityFinale(s,moment('music','dance'),t+13000),'proud');
  assert.equal(roomActivityFinale(s,moment('bed','ask'),t+13000),null);
 }
});

test('finale decorations are visible in classic and detailed rooms with static reduced-motion support',()=>{
 for(const {id} of species){
  const s=makePet(id),m=moment();
  for(const style of ['classic','detailed']){
   const base=render(s,{...m,auto:false},style);
   const enriched=render(s,m,style);
   assert.equal(enriched.pose.interaction.finale,roomActivityFinale(s,m,t+13000),id);
   assert.ok(enriched.calls.length>base.calls.length,id+' '+style);
   const still=render(s,m,style,true);
   assert.equal(still.pose.interaction.finale,enriched.pose.interaction.finale);
   assert.deepEqual(still.calls,render(s,m,style,true).calls);
  }
 }
});

test('real room slots show a brief finale without persisting any reward or emotion',()=>{
 const s=makePet('fox');
 s.room={toy:true};s.cozy.owned={};const original=structuredClone(s);
 let slot=null;
 for(let i=0;i<600;i++){
  const sampled=ambientSlot(s,t+i*5000);
  if(sampled?.lane==='room'){slot=sampled;break;}
 }
 assert.ok(slot);
 const m=roomMoment(s,slot.until-1000);
 assert.equal(m?.auto,true);
 assert.equal(m?.item,'toy');
 const response=roomMomentPose(s,m,'classic',slot.until-1000,false);
 assert.equal(response.interaction.finale,'discover');
 const over=roomMoment(s,slot.until);
 assert.equal(over,null);
 assert.deepEqual(s,original);
});
