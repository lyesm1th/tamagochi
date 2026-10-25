// UI scene-derived data, separate from DOM and animation side effects.
export function roomStyleOptions(styles){
 return Object.entries(styles).flatMap(([kind,items])=>items.map((_,i)=>[kind,i]));
}
export function sceneActionOrigin(scene){
 return {fromX:scene?.x??96,fromY:scene?.feet??130};
}
