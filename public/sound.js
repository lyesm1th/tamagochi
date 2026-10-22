// Short, synthesized pocket-pet sounds: no downloads or network latency.
// [start seconds, duration, start Hz, end Hz, volume, waveform]
export const reactions={
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
export function createSound(makeContext,enabled=true){
 let context=null,on=enabled;const active=new Set();
 function stop(){for(const o of active){try{o.stop();}catch{}}active.clear();}
 function unlock(){if(!on)return Promise.resolve(false);try{context ||= makeContext();if(context.state==='closed')context=makeContext();return Promise.resolve(context.state==='running'?undefined:context.resume()).then(()=>context.state==='running').catch(()=>false);}catch{return Promise.resolve(false);}}
 function tone([delay,duration,from,to,volume,type],pitch=1){const o=context.createOscillator(),g=context.createGain(),t=context.currentTime+delay;o.type=type;o.frequency.setValueAtTime(from*pitch,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,to*pitch),t+duration);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(volume,t+Math.min(.015,duration/3));g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(context.destination);active.add(o);o.onended=()=>{active.delete(o);o.disconnect();g.disconnect();};o.start(t);o.stop(t+duration+.01);}
 async function beep(freq=660){if(!on||!await unlock()||!on)return false;try{tone([0,.075,freq,freq,.035,'square']);return true;}catch{return false;}}
 async function react(action,species){const recipe=reactions[action];if(!recipe||!on||!await unlock()||!on)return false;try{stop();const pitch={chicken:1.35,cat:1.05,corgi:.95,frog:.7,bear:.65,dog:.75,dino:.6,bunny:1.25}[species]||1;for(const note of recipe)tone(note,pitch);return true;}catch{stop();return false;}}
 return {unlock,beep,react,get enabled(){return on;},set enabled(v){on=!!v;if(!on)stop();},suspend(){stop();if(context?.state==='running')return context.suspend().catch(()=>{});}};
}
