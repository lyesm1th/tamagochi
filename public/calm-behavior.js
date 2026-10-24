import {stableHash} from './traits.js';
export const calmTiming={period:150000,active:14000,recovery:30000,speechMin:95000,speechJitter:65000};
export function manualActivity(s,now=Date.now()){
 if(!s)return false;const e=s.living?.enrichment;
 return !!(s.sleeping||s.napping||s.dead||s.vacation||s.world?.walk?.expires>now||s.world?.activity?.expires>now||s.cozy?.hide?.expires>now||s.cozy?.cooking?.expires>now||s.playroom?.session?.expires>now||s.journal?.together||s.journal?.gesture?.until>now||s.living?.motion?.until>now||s.living?.reaction?.until>now||s.lively?.secret?.until>now||s.lively?.welcome?.until>now||e?.session?.until>now||e?.touch?.until>now||e?.home?.until>now||e?.tidying?.until>now);
}
export function calmUntil(s){const e=s?.living?.enrichment;return Math.max(s?.lastAction||0,s?.living?.calmAt||0,s?.living?.motion?.until||0,s?.living?.reaction?.until||0,s?.journal?.gesture?.until||0,s?.lively?.welcome?.until||0,e?.touch?.until||0,e?.home?.until||0,e?.tidying?.until||0)+calmTiming.recovery;}
// One shared slot chooses a single autonomous provider. Everything else rests.
export function ambientSlot(s,now=Date.now()){
 if(!s||manualActivity(s,now)||now<calmUntil(s)||now-s.born<180000||Math.min(s.hunger??100,s.energy??100,s.health??100)<35)return null;
 const clock=now+stableHash(s.id||s.species)%calmTiming.period,block=Math.floor(clock/calmTiming.period),phase=clock%calmTiming.period,start=22000+stableHash((s.id||s.species)+':pause:'+block)%18000;
 if(phase<start||phase>=start+calmTiming.active)return null;
 const lane=['room','habit','weather','chatter'][(block+stableHash((s.id||s.species)+':lane-order'))%4];
 return {lane,id:block+':'+lane,block,at:now-(phase-start),until:now-(phase-start)+calmTiming.active,progress:(phase-start)/calmTiming.active};
}
export function noteCalm(s,now=Date.now(),interrupt=false){s.living??={};s.living.calmAt=now;if(interrupt){s.living.motion=null;s.living.reaction=null;const e=s.living.enrichment;if(e){e.session=null;e.touch=null;e.home=null;e.tidying=null;}if(s.journal)s.journal.gesture=null;}}
export function idleSpeechDue(s,last,now=Date.now()){return !manualActivity(s,now)&&now>=calmUntil(s)&&now-last>=calmTiming.speechMin+stableHash((s.id||s.species)+':speech:'+Math.floor(last/1000))%calmTiming.speechJitter;}
