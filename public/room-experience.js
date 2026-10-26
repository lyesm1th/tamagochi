import {stableHash} from './traits.js';

// Compact, backwards-compatible room experience; independent from explicit furniture taste.
const boundedScore=value=>Math.max(-4,Math.min(4,value));
const positiveFinales=new Set(['fond','caught','discover','proud','rest']);
export function recordRoomExperience(s,m,outcome,now=Date.now()){
 if(!s||!m?.auto||!m.item||!Number.isFinite(m.at)||!Number.isFinite(m.until)||!Number.isFinite(now)||now<m.until-2200||now>=m.until)return false;
 if(!positiveFinales.has(outcome)&&outcome!=='miss')return false;
 const key=m.at+':'+m.until+':'+m.item;
 if(s.living?.roomExperience?.lastEvent===key)return false;
 s.living??={};
 const memory=s.living.roomExperience??={items:{},lastEvent:null};
 const items=memory.items??={};
 const previous=items[m.item]||{score:0,count:0};
 const delta=outcome==='miss'?-1:1;
 items[m.item]={score:boundedScore((previous.score||0)+delta),count:Math.min(20,(previous.count||0)+1),lastAt:now};
 memory.lastEvent=key;
 // Keep memory small even if old or modified saves contain many arbitrary keys.
 const keys=Object.keys(items);
 if(keys.length>16){
  keys.sort((a,b)=>(items[a]?.lastAt||0)-(items[b]?.lastAt||0));
  for(const id of keys.slice(0,keys.length-16))delete items[id];
 }
 return true;
}

// Memory influences only an occasional neutral room choice, never explicit likes/dislikes.
export function roomExperienceChoice(s,available,block=0){
 if(!s||!Array.isArray(available)||!Number.isInteger(block)||block%7!==2)return null;
 const items=s.living?.roomExperience?.items;
 if(!items||!available.length)return null;
 const learned=available.filter(id=>Number.isFinite(items[id]?.score)&&items[id].score>=2);
 if(!learned.length)return null;
 const peak=Math.max(...learned.map(id=>items[id].score));
 const top=learned.filter(id=>items[id].score===peak);
 return top[stableHash((s.id||s.species)+':room-experience:'+block)%top.length];
}
