// Short, synthesized pocket-pet sounds: no downloads or network latency.
// [start seconds, duration, start Hz, end Hz, volume, waveform]
export const reactions={
 bath:[[0,.08,450,1000,.02,'sine'],[.12,.09,600,1400,.025,'sine'],[.28,.13,350,900,.02,'sine'],[.48,.1,750,1600,.02,'sine']],
 groom:[[0,.12,210,140,.025,'triangle'],[.2,.12,230,150,.025,'triangle'],[.4,.15,260,180,.02,'sine']],
 blanket:[[0,.3,180,260,.025,'sine'],[.35,.4,260,120,.02,'sine']],
 trick:[[0,.1,440,660,.03,'square'],[.15,.1,660,880,.03,'square'],[.3,.18,880,1100,.025,'sine']],
 walk:[[0,.07,240,180,.025,'triangle'],[.2,.07,270,200,.025,'triangle'],[.4,.07,240,180,.025,'triangle']],
 gift:[[0,.12,500,750,.03,'sine'],[.17,.18,750,1000,.025,'sine']],
 sun:[[0,.1,900,1400,.02,'sine'],[.14,.1,1200,850,.02,'sine'],[.36,.15,1000,1500,.02,'sine']],
 rain:Array.from({length:12},(_,i)=>[i*.07,.04,450+(i*137)%900,200,.012,'sine']),
 cloud:[[0,.5,240,180,.015,'sine'],[.3,.4,200,260,.012,'triangle']],
 storm:[[0,.3,90,40,.025,'triangle'],[.15,.5,60,25,.02,'sawtooth'],[.6,.3,45,25,.015,'triangle']],
 milk:[[0,.12,260,160,.04,'sine'],[.18,.13,290,150,.04,'sine'],[.38,.16,230,100,.04,'triangle'],[.6,.12,310,210,.03,'sine']],
 feed:[[0,.09,180,80,.07,'triangle'],[.13,.07,240,110,.06,'sine'],[.26,.09,170,75,.07,'triangle'],[.39,.08,260,100,.06,'sine'],[.55,.13,310,240,.04,'sine']],
 treat:[[0,.08,230,100,.06,'triangle'],[.12,.08,270,110,.06,'triangle'],[.28,.12,500,700,.035,'sine'],[.43,.16,700,850,.03,'sine']],
 sleep:[[0,.45,180,430,.035,'sine'],[.32,.5,430,115,.04,'triangle'],[.9,.22,100,65,.025,'sine']],
 wake:[[0,.18,180,350,.04,'sine'],[.22,.17,350,530,.04,'sine'],[.42,.22,530,660,.03,'sine']],
 pet:Array.from({length:9},(_,i)=>[i*.09,.11,90+(i%2)*25,75,.035,'triangle']),
 clean:[[0,.09,850,1800,.025,'sine'],[.11,.1,1600,450,.03,'sine'],[.25,.1,600,1400,.025,'sine'],[.39,.12,1300,280,.03,'sine'],[.56,.16,800,1500,.025,'sine']],
 play:[[0,.1,520,650,.04,'triangle'],[.13,.1,650,820,.04,'triangle'],[.26,.1,820,1040,.035,'triangle'],[.4,.22,1040,1300,.03,'sine']],
 medicine:[[0,.12,170,80,.045,'triangle'],[.17,.1,210,100,.04,'triangle'],[.36,.22,260,420,.03,'sine']],
 adopt:[[0,.12,400,500,.035,'sine'],[.16,.12,500,670,.035,'sine'],[.33,.2,670,800,.03,'sine']],
 endLife:[[0,.2,400,300,.025,'sine'],[.25,.25,300,200,.025,'sine'],[.55,.35,200,100,.02,'sine']],
 miss:[[0,.13,200,120,.025,'triangle']]
};
export const affectionSounds={
 cat:reactions.pet,
 chicken:[[0,.07,680,1000,.035,'sine'],[.11,.08,820,620,.035,'sine'],[.25,.12,720,1050,.03,'sine']],
 corgi:[[0,.1,210,420,.045,'triangle'],[.16,.13,250,480,.04,'triangle'],[.35,.14,380,260,.03,'sine']],
 dog:[[0,.22,120,190,.045,'sine'],[.2,.4,190,95,.04,'triangle']],
 frog:[[0,.13,190,90,.04,'triangle'],[.17,.13,210,100,.04,'triangle'],[.35,.18,160,70,.035,'sine']],
 bear:[[0,.3,90,65,.035,'triangle'],[.35,.32,110,75,.035,'triangle']],
 dino:[[0,.2,120,240,.04,'sawtooth'],[.22,.26,200,75,.03,'triangle']],
 bunny:[[0,.08,360,250,.025,'sine'],[.12,.08,420,300,.025,'sine'],[.26,.1,350,270,.02,'sine']]
};
export function createSound(makeContext,enabled=true){
 let context=null,on=enabled;const active=new Set();
 function stop(){for(const o of active){try{o.stop();}catch{}}active.clear();}
 function unlock(){if(!on)return Promise.resolve(false);try{context ||= makeContext();if(context.state==='closed')context=makeContext();return Promise.resolve(context.state==='running'?undefined:context.resume()).then(()=>context.state==='running').catch(()=>false);}catch{return Promise.resolve(false);}}
 function tone([delay,duration,from,to,volume,type],pitch=1){const o=context.createOscillator(),g=context.createGain(),t=context.currentTime+delay;o.type=type;o.frequency.setValueAtTime(from*pitch,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,to*pitch),t+duration);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(volume,t+Math.min(.015,duration/3));g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(context.destination);active.add(o);o.onended=()=>{active.delete(o);o.disconnect();g.disconnect();};o.start(t);o.stop(t+duration+.01);}
 async function beep(freq=660){if(!on||!await unlock()||!on)return false;try{tone([0,.075,freq,freq,.035,'square']);return true;}catch{return false;}}
 async function react(action,species){const recipe=['pet','ritual'].includes(action)?(affectionSounds[species]||reactions.pet):reactions[action];if(!recipe||!on||!await unlock()||!on)return false;try{stop();const pitch={chicken:1.35,cat:1.05,corgi:.95,frog:.7,bear:.65,dog:.75,dino:.6,bunny:1.25}[species]||1;for(const note of recipe)tone(note,pitch);return true;}catch{stop();return false;}}
 return {unlock,beep,react,get enabled(){return on;},set enabled(v){on=!!v;if(!on)stop();},suspend(){stop();if(context?.state==='running')return context.suspend().catch(()=>{});}};
}
