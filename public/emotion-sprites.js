import {emotionSprites} from './emotion-sprite-manifest.js';
import {emotionOf} from './emotions.js';
import {emotionFrame} from './emotion-frames.js';
const atlases=new Map(),loading=new Map(),retryAt=new Map();
export const emotionStage=age=>age==='Малюк'?'babies':age==='Дитина'?'children':age==='Підліток'?'teens':'adults';
export function loadEmotionSprite(id){
 if(atlases.has(id))return Promise.resolve(atlases.get(id));if(loading.has(id))return loading.get(id);
 if((retryAt.get(id)||0)>Date.now()||!emotionSprites[id]||typeof Image==='undefined')return Promise.resolve(null);
 const p=new Promise(resolve=>{const image=new Image(),timer=setTimeout(()=>{loading.delete(id);retryAt.set(id,Date.now()+60000);resolve(null);},15000);image.onload=()=>{clearTimeout(timer);atlases.set(id,image);loading.delete(id);while(atlases.size>2)atlases.delete(atlases.keys().next().value);resolve(image);};image.onerror=()=>{clearTimeout(timer);loading.delete(id);retryAt.set(id,Date.now()+60000);resolve(null);};image.src=emotionSprites[id].src;});loading.set(id,p);return p;
}
export function expressionSelection(s,age,now=Date.now(),reduced=false){
 const e=emotionOf(s,now),stage=emotionStage(age),asset=emotionSprites[s?.species]?.stages[stage];if(!asset||!e.strength||age==='Яєчко')return null;
 const frame=emotionFrame(e,now,reduced),cell=asset.cells[e.kind+':'+frame];return cell?{kind:e.kind,frame,strength:e.strength,cell,asset}:null;
}
// This canvas is a naked sprite, never a room or a screen. Clothes are added later.
export function paintExpression(ctx,s,age,pad=0,now=Date.now(),reduced=false){
 const selection=expressionSelection(s,age,now,reduced);if(!selection)return;
 const image=atlases.get(s.species);if(!image){loadEmotionSprite(s.species);return;}
 const {cell,asset,strength}=selection;ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=Math.min(1,strength/.4);ctx.globalCompositeOperation='source-atop';ctx.drawImage(image,...cell,pad+asset.box[0],pad+asset.box[1],asset.box[2],asset.box[3]);ctx.restore();
}
export function expressionReady(id){return atlases.has(id);}
