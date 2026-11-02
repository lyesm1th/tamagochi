import {stage} from './pet-life.js';
import {species} from './game.js';

// Read-only, platform-neutral projection. Never mutate a saved pet or run tick/visit.
const clamp = value => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
export function mobilePetSnapshot(pet, now = Date.now()) {
  if (!pet) return {schema:1,pet:null};
  const known=species.find(item=>item.id===pet.species);
  const age=stage(pet,now);
  return {schema:1,pet:{
    id:String(pet.id||''),species:known?.id||pet.species,name:String(pet.name||known?.name||'Пет').slice(0,24),
    age,dead:Boolean(pet.dead),sleeping:Boolean(pet.sleeping||pet.napping),
    appearance:pet.appearance||null,wearing:pet.cozy?.wearing||{},
    mood:{happy:clamp(pet.happy),energy:clamp(pet.energy),hunger:clamp(pet.hunger),health:clamp(pet.health),clean:clamp(pet.clean)},
    updatedAt:Number(pet.updated||now)
  }};
}
