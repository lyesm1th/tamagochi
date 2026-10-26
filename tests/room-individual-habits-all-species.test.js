import test from 'node:test';
import assert from 'node:assert/strict';
import {species} from '../public/game.js';
import {recordRoomExperience,roomExperienceChoice,roomHabitOf} from '../public/room-experience.js';
import {roomHabitLine,roomLine,roomMoment,roomMomentPose,drawRoomResponse,roomNeedPriority} from '../public/room-life.js';
import {ambientSlot} from '../public/calm-behavior.js';

const start=Date.parse('2026-10-26T12:00:00Z');
const pet=(species,id='habit-'+species)=>({
 id,species,born:start-8*3600000,health:95,hunger:95,energy:95,happy:95,
 room:{laser:true,toy:true},cozy:{items:{},preferences:{object:{}}}
});
const moment=(item,at)=>({auto:true,item,kind:'play',at,until:at+14000});
const learn=(s,item='laser',n=4)=>{
 for(let i=0;i<n;i++){
  const at=start+i*150000;
  assert.equal(recordRoomExperience(s,moment(item,at),'caught',at+13000),true);
 }
};

test('all 14 species develop personal habits from four successful autonomous activities',()=>{
 assert.equal(species.length,14);
 for(const {id} of species){
  const a=pet(id,'a-'+id),b=pet(id,'b-'+id);
  assert.equal(roomHabitOf(a),null,id);
  learn(a,'laser',3);
  assert.equal(roomHabitOf(a),null,id);
  learn(a,'toy',1); // A different activity cannot borrow laser experience.
  assert.equal(roomHabitOf(a),null,id);
  assert.equal(recordRoomExperience(a,moment('laser',start+450000),'caught',start+463000),true,id);
  assert.deepEqual(roomHabitOf(a),{item:'laser',score:4,count:4},id);
  assert.equal(roomHabitOf(b),null,id);
  assert.equal(roomHabitOf(a,['toy']),null,id);
  assert.equal(roomExperienceChoice(a,['laser','toy'],2),'laser',id);
 }
});

test('habits can fade after setbacks, or be replaced by an independently learned activity',()=>{
 const s=pet('cat');
 learn(s,'laser');
 assert.equal(roomHabitOf(s)?.item,'laser');
 for(let i=4;i<6;i++){
  const at=start+i*150000;
  recordRoomExperience(s,moment('laser',at),'miss',at+13000);
 }
 assert.equal(s.living.roomExperience.items.laser.score,2);
 assert.equal(roomHabitOf(s),null);
 learn(s,'toy',4);
 assert.equal(roomHabitOf(s)?.item,'toy');
 assert.equal(roomHabitOf(s)?.count,4);
});

test('a formed habit outranks a newer unproven score while retaining existing gates',()=>{
 const s=pet('fox');
 s.living={roomExperience:{items:{
  laser:{score:3,count:6,lastAt:start},
  toy:{score:4,count:1,lastAt:start+100}
 }}};
 assert.equal(roomExperienceChoice(s,['laser','toy'],2),'laser');
 for(const block of [0,1,3,4,5,6])assert.equal(roomExperienceChoice(s,['laser','toy'],block),null);
 assert.equal(roomExperienceChoice(s,['toy'],2),'toy'); // Learned interests still work without an available habit.
 assert.equal(roomNeedPriority({...s,energy:55},['bed','laser']),'bed');
 assert.equal(roomNeedPriority({...s,hunger:55},['bowl','laser']),'bowl');
});

test('habits add a line to existing room speech but never alter purchases or explicit dislikes',()=>{
 const s=pet('penguin');
 learn(s);
 const phrase=roomHabitLine(s,'laser');
 assert.ok(phrase?.includes('цяткою'));
 assert.equal(roomHabitLine(s,'toy'),null);
 assert.equal(roomHabitLine({species:'penguin'},'laser'),null);
 const lines=Array.from({length:500},(_,i)=>roomLine(s,'laser','use',start+i*2300));
 assert.ok(lines.includes(phrase));
 assert.notEqual(roomLine(s,'laser','new',start),phrase);
 s.cozy.preferences.object.annoy='laser';
 assert.equal(roomHabitLine(s,'laser'),null);
});

test('real room slots respect learned habit, user likes, and direct interactions',()=>{
 const s=pet('fox');learn(s);
 let slot=null;
 for(let i=0;i<4000;i++){
  const found=ambientSlot(s,start+1000000+i*5000);
  if(found?.lane==='room'&&found.block%7===2&&found.block%3!==0&&found.block%5!==1){
   slot=found;break;
  }
 }
 assert.ok(slot,'there should be a valid learned room lane');
 const now=slot.at+1000,baseline=structuredClone(s);
 const activity=roomMoment(s,now);
 assert.equal(activity?.item,'laser');
 assert.equal(activity?.habit,true);
 assert.deepEqual(s,baseline);
 s.cozy.preferences.object.love='toy';
 assert.equal(roomMoment(s,now)?.item,'toy');
 s.cozy.preferences.object={annoy:'laser'};
 assert.notEqual(roomMoment(s,now)?.item,'laser');
 s.cozy.preferences.object={};
 s.living.motion={item:'toy',kind:'use',at:now,until:now+7000};
 assert.equal(roomMoment(s,now)?.manual,true);
 s.sleeping=true;
 assert.equal(roomMoment(s,now),null);
});

test('habit flourish only appears during existing finales, in both graphic modes',()=>{
 const s=pet('duck');learn(s,'toy');
 const base={...moment('toy',start),origin:{x:96,feet:130}};
 const render=(m,style,reduced)=>{
  const p=roomMomentPose(s,m,style,start+13000,reduced),draws=[];
  const c={canvas:{width:style==='detailed'?384:192},
   fillRect(...v){assert.ok(v.every(Number.isFinite));draws.push(v);},
   fillText(txt,x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y));draws.push([txt,x,y]);}};
  drawRoomResponse(c,s,p,start+13000,reduced);return {p,draws};
 };
 for(const style of ['classic','detailed']){
  const normal=render(base,style,false),withHabit=render({...base,habit:true},style,false);
  assert.equal(normal.p.interaction.finale,'discover');
  assert.equal(withHabit.draws.length,normal.draws.length+2);
  const quiet=render({...base,habit:true},style,true);
  assert.deepEqual(quiet.draws,render(base,style,true).draws);
 }
});
