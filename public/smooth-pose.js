// Pure transition orchestration. Maintains the original smoothing math and
// deliberately updates the previous scene object during interpolation.
export function advanceSmoothPose(previous,target,frame,id,reduced=false){
 if(target.interaction){return {scene:{...target,id,t:frame},pose:target};}
 if(!previous||previous.id!==id||reduced){return {scene:{...target,id,t:frame},pose:target};}
 const k=Math.min(1,Math.max(0,(frame-previous.t)/(target.enriched?.mood==='sleepy'?1200:700)));
 for(const key of ['x','feet','scale'])previous[key]+=(target[key]-previous[key])*k;
 previous.t=frame;
 return {scene:previous,pose:{...target,x:previous.x,feet:previous.feet,scale:previous.scale}};
}
