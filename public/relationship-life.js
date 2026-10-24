import {ambientSlot,manualActivity,calmUntil} from './calm-behavior.js';
import {personality} from './pet-personality.js';
export function ensureRelationship(s){s.memory??={};s.memory.relationship??={};const r=s.memory.relationship;r.events??=[];r.bedtime??={};r.bedtime.days??=[];return r;}
export function rememberThing(s,item,event,now=Date.now()){
 const r=ensureRelationship(s),last=r.events.find(e=>e.item===item&&e.event===event);
 if(last&&now-last.at<3600000)return;
 r.events.unshift({item,event,at:now});r.events=r.events.slice(0,24);
}
export function thingMemory(s,item,now=Date.now()){
 const events=s?.memory?.relationship?.events||[],e=events.find(e=>e.item===item&&now-e.at>60000);
 if(!e)return null;
 if(e.event==='repair')return 'Це ми разом полагодили. Тепер бережу. Ну, стараюся.';
 if(e.event==='new')return 'Пам’ятаю, як ти мені це подарував. Моє, не забирай.';
 if(e.event==='broken')return 'Пам’ятаю цей тріск. Давай цього разу обережніше.';
 return null;
}
export function noteRelationshipCare(s,action,now=Date.now()){
 const r=ensureRelationship(s);
 if(action==='pet')r.petAt=now;
 if(action!=='sleep'||!s.sleeping||!r.petAt||now-r.petAt>10*60000||now<r.petAt)return;
 const b=r.bedtime,day=new Intl.DateTimeFormat('en-CA',{timeZone:s.routine?.timezone||'Europe/Kyiv',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
 if(!b.days.includes(day)){b.days.push(day);b.days=b.days.slice(-14);}
 b.hour=new Intl.DateTimeFormat('en-GB',{timeZone:s.routine?.timezone||'Europe/Kyiv',hour:'numeric',hourCycle:'h23'}).format(new Date(now))*1;
 b.last=now;
}
export function bedtimeInvitation(s,now=Date.now()){
 const b=s?.memory?.relationship?.bedtime;
 if(!b||b.days.length<3||now-b.last<18*3600000||manualActivity(s,now)||now<calmUntil(s)||(s.energy??100)>65||Math.min(s.hunger??100,s.health??100,s.clean??100)<35)return false;
 const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:s.routine?.timezone||'Europe/Kyiv',hour:'numeric',hourCycle:'h23'}).format(new Date(now)));
 return Math.min((hour-b.hour+24)%24,(b.hour-hour+24)%24)<=1;
}
export function relationshipHint(s,now=Date.now()){return bedtimeInvitation(s,now)?`Погладиш ${personality(s.species).touch}, як перед сном? Я вже вмостився.`:null;}
export function quietBody(s,now=Date.now()){
 if(s?.farewellPreview)return 'withdrawn';
 if(!s||manualActivity(s,now)||now<calmUntil(s)||now-s.born<180000||s.world?.activity?.expires>now)return null;
 if((s.health??100)<35)return 'unwell';
 if((s.energy??100)<40)return 'sleepy';
 if((s.happy??100)<40)return 'withdrawn';
 if(bedtimeInvitation(s,now)&&ambientSlot(s,now)?.lane==='room')return 'ask';
 return (s.happy??0)>=80?'content':null;
}
// Static, subtle silhouettes; no extra autonomous animation or wardrobe layer.
export function withQuietBody(c,pose,paint,reduced=false){
 const kind=pose?.quietBody,e=pose?.emotion;if((!kind&&!e?.strength)||!pose.quiet||reduced){paint();return;}
 c.save();c.translate(pose.x,pose.feet);
 if(kind==='content')c.scale(1.055,.94);
 if(kind==='sleepy'||kind==='unwell'){c.rotate(.065);c.scale(1.02,.95);}
 if(kind==='withdrawn'){c.scale(.96,.94);c.rotate(-.07+Math.sin(Date.now()/1400)*.015);}
 if(kind==='ask')c.rotate(-.12);
 if(e?.strength){const onset=Math.max(0,Date.now()-(e.at||0)),beat=onset<3000?Math.sin(onset/170)*Math.max(0,1-onset/3000):0;
 if(['sad','hurt','bored'].includes(e.kind)){c.scale(1,1-.035*e.strength);c.rotate(-.035*e.strength);}
 if(e.kind==='angry')c.translate(beat*2,0);
 if(e.kind==='amused'){c.rotate(beat*.035);c.scale(1,1-Math.abs(beat)*.025);}
 if(['curious','surprised','shy'].includes(e.kind))c.rotate((e.kind==='shy'?-1:1)*.045*e.strength);
 }c.translate(-pose.x,-pose.feet);paint();c.restore();
}
