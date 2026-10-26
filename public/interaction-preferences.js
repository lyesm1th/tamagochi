import {traitOf} from './traits.js';
import {ensureInteractionMemory} from './interaction-memory.js';
const clamp=n=>Math.max(0,Math.min(100,n));
const defaults={affectionate:[85,58,72],playful:[50,88,55],sleepy:[48,42,92],glutton:[60,63,71],stubborn:[40,62,76]};
export const preferenceNames={touch:'Ласка',play:'Спільні ігри',quiet:'Тихий відпочинок'};
export function interactionPreferences(s){
 const m=ensureInteractionMemory(s),trait=traitOf(s),base=defaults[trait]||defaults.affectionate;
 const p=m.preferences??={touch:base[0],play:base[1],quiet:base[2],lastByKind:{}};
 p.lastByKind??={};for(const k of ['touch','play','quiet'])p[k]=clamp(p[k]??base[['touch','play','quiet'].indexOf(k)]);
 m.preferences=p;return p;
}
export function experiencePreference(s,kind,now=Date.now()){
 const p=interactionPreferences(s);if(!['touch','play','quiet'].includes(kind))return false;
 if(p.lastByKind[kind]&&now-p.lastByKind[kind]<30*60000)return false;
 p.lastByKind[kind]=now;p[kind]=clamp(p[kind]+2);return true;
}
export function preferenceSummary(s){
 const p=interactionPreferences(s),entries=['touch','play','quiet'].map(k=>[k,p[k]]).sort((a,b)=>b[1]-a[1]);
 return 'Любить найбільше: '+preferenceNames[entries[0][0]]+' ('+Math.round(entries[0][1])+'%). Інші вподобання: '+entries.slice(1).map(([k,v])=>preferenceNames[k]+' '+Math.round(v)+'%').join(', ')+'.';
}
