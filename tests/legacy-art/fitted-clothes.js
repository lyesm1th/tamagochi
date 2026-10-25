import {tailoredFabric,restoreForepaws} from './tailored-wardrobe.js';
// The complete original pet is already on ctx. Tailor fabric to its body, then
// let curved foreground paws occlude it. Face/tail pixels are never repainted.
export function paintFittedClothes(ctx,base,species,age,sheet,worn={},pad=0,sleeping=false){
 if(sleeping)return;
 const layer=tailoredFabric(base,species,age,worn);if(!layer)return;
 ctx.drawImage(layer.canvas,pad,pad);
 if(worn.body)restoreForepaws(ctx,base,species,age,pad);
}
