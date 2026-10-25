// Pure view model for room mini-game controls. No DOM or global clock.
export function roomGameControls(roomGames,run,traces,now){
 const entries=roomGames.map(([id,label])=>({
  label,request:{event:'start',kind:id},
  active:!!(run?.kind===id&&run.until>now)
 }));
 if(run?.until>now)entries.push({label:'↶ Закінчити',request:{event:'stop'},active:false});
 if(traces?.length)entries.push({label:'Прибрати сліди',request:{event:'clean'},active:false});
 return entries;
}
