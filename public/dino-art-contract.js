// Pixel-perfect dinosaur art contract. All poses are authored, never scaled or warped
// to simulate anatomical age or emotion. Teen art is the immutable visual reference.
export const DINO_ART_VERSION=1;
export const DINO_STAGES=Object.freeze(['Малюк','Дитина','Підліток','Дорослий','Старенький']);
export const DINO_EXPRESSIONS=Object.freeze(['calm','amused','sad','angry','surprised','sleep']);
export const DINO_POSES=Object.freeze(['idle','blink','walk-a','walk-b','sit','sleep','eat','pet']);
export const DINO_WARDROBE_SLOTS=Object.freeze(['body','head','neck','eyes']);
export const DINO_CANVAS=Object.freeze({width:192,height:192,feetY:182});
export const DINO_REFERENCE=Object.freeze({sheet:'teens',species:'dino',immutable:true});
export const dinoStageKey=age=>({
 'Малюк':'baby','Дитина':'child','Підліток':'teen',
 'Дорослий':'adult','Старенький':'elder'
})[age]||'teen';
export function validateDinoAtlas(manifest){
 const errors=[];
 if(!manifest||manifest.version!==DINO_ART_VERSION)errors.push('Unsupported atlas version');
 if(manifest?.canvas?.width!==192||manifest?.canvas?.height!==192)errors.push('Every frame must be 192×192; no age-specific scaling');
 if(manifest?.reference!=='original-teen-dino')errors.push('Original teenage dinosaur must remain the identity reference');
 for(const age of DINO_STAGES){
  const key=dinoStageKey(age),entry=manifest?.stages?.[key];
  if(!entry){errors.push('Missing stage '+key);continue;}
  if(!entry.frames?.idle)errors.push('Missing authored idle frame '+key);
  for(const pose of Object.keys(entry.frames||{})){
   const frame=entry.frames[pose];
   if(!frame?.src||!Number.isInteger(frame.x)||!Number.isInteger(frame.y)||frame.width!==192||frame.height!==192)
    errors.push('Invalid pixel-perfect frame '+key+'/'+pose);
  }
  for(const slot of DINO_WARDROBE_SLOTS)if(!entry.anchors?.[slot])
   errors.push('Missing wardrobe anchor '+key+'/'+slot);
  if(!entry.face?.eyes||!entry.face?.mouth||!entry.face?.cheeks)
   errors.push('Missing face landmarks '+key);
 }
 return errors;
}
export function resolveDinoFrame(manifest,age,pose='idle',emotion='calm'){
 const stage=manifest?.stages?.[dinoStageKey(age)];
 if(!stage)return null;
 const key=emotion==='calm'?pose:pose+'-'+emotion;
 return stage.frames?.[key]||stage.frames?.[pose]||stage.frames?.idle||null;
}
