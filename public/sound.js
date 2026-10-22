export function createSound(makeContext,enabled=true){
 let context=null,on=enabled;
 function unlock(){if(!on)return Promise.resolve(false);try{context ||= makeContext();if(context.state==='closed')context=makeContext();return Promise.resolve(context.state==='running'?undefined:context.resume()).then(()=>context.state==='running').catch(()=>false);}catch{return Promise.resolve(false);}}
 async function beep(freq=660){if(!on||!await unlock())return false;try{const o=context.createOscillator(),g=context.createGain(),t=context.currentTime;o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(.055,t);g.gain.exponentialRampToValueAtTime(.001,t+.075);o.connect(g);g.connect(context.destination);o.start(t);o.stop(t+.08);o.onended=()=>{o.disconnect();g.disconnect();};return true;}catch{return false;}}
 return {unlock,beep,get enabled(){return on;},set enabled(v){on=!!v;},suspend(){if(context?.state==='running')return context.suspend().catch(()=>{});}};
}
