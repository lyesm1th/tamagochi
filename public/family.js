import {ensureCompanion} from './companionship.js';
import {fresh,stage,temperament,care,species} from './game.js';
import {traits,traitOf,stableHash} from './traits.js';
export function petId(s){return s.id||`${s.born}-${s.species}`;}
export function familyEligibility(s,now=Date.now()){
 if(!s||s.dead||stage(s,now)!=='Дорослий')return 'Пару можна обрати дорослому пету.';
 if(s.vacation)return 'Друг у відпустці. Спочатку забери його додому.';
 if(s.sleeping||s.napping)return 'Нехай спочатку прокинеться.';
 if(s.health<60||s.hunger<50||s.happy<50||s.clean<50||s.energy<40)return 'Спочатку подбай про друга: здоров’я ≥60%, їжа, настрій і чистота ≥50%, енергія ≥40%.';
 return null;
}
const names=['Зірочка','Карамелька','Пончик','Хмаринка','Жужа','Піксель','Кнопка','Кексик'];
export function candidates(s){const seed=stableHash(petId(s));return [0,1,2].map(i=>({id:`${petId(s)}-match-${i}`,species:s.species,name:names[(seed+i*3)%names.length],trait:Object.keys(traits)[(seed+i*2)%5],appearance:{mark:['spot','stripe','star'][(seed+i)%3],color:['#b57a7d','#89aeb4','#baa15a'][(seed+i*2)%3]}}));}
export function snapshot(s,outcome,now=Date.now(),partner=null){return {id:petId(s),name:s.name,species:s.species,born:s.born,ended:now,ageMs:Math.max(0,Math.min(s.diedAt||now,s.vacation?.started??Infinity)-s.born),stage:stage(s,s.diedAt||now),trait:traitOf(s),character:temperament(s),care:Math.round(care(s)),adultCare:s.adultCare,generation:s.generation||1,outcome,partner,parents:s.parents||[],heirloom:s.heirloom||null,appearance:s.appearance||null,bond:s.bond||0,room:s.room||{},world:s.world?{skills:s.world.skills,lastDream:s.world.lastDream}:null};}
export function nextGeneration(parent,partnerId,now=Date.now()){
 const error=familyEligibility(parent,now);if(error)return {error};const partner=candidates(parent).find(p=>p.id===partnerId);if(!partner)return {error:'Обери пару зі списку.'};
 const child=fresh(parent.species,now);child.generation=(parent.generation||1)+1;child.parents=[{id:petId(parent),name:parent.name},{id:partner.id,name:partner.name}];child.trait=stableHash(partner.id)%2?traitOf(parent):partner.trait;child.coins=parent.coins;child.room=structuredClone(parent.room||{});child.routine=structuredClone(parent.routine||child.routine);child.routine.samples={};child.heirloom={name:parent.heirloom?.name||parent.souvenir||(parent.room?.toy?'Сімейна іграшка':'Сімейний ґудзик'),from:parent.heirloom?.from||parent.name,generation:parent.heirloom?.generation||parent.generation||1};child.appearance=structuredClone(stableHash(partner.id+'look')%2?parent.appearance||child.appearance:partner.appearance);
 return {state:child,record:snapshot(parent,'family',now,partner),text:`${parent.name} і ${partner.name} залишили нове яйце. Покоління ${child.generation}!`};
}
export function remember(records,record){return records.some(r=>r.id===record.id)?records:[record,...records];}
export function portraitState(record,now=Date.now()){return {species:record.species,name:record.name,born:now-record.ageMs,updated:now,hunger:85,happy:85,energy:85,clean:100,health:100,poop:0,dead:false,sleeping:false,careScore:record.care,discipline:record.care,adultCare:record.adultCare,trait:record.trait,portraitStage:record.stage,appearance:record.appearance,heirloom:record.heirloom,world:record.world};}

export function lineageRows(current,records,limit=50){
 const index=new Map(records.map(r=>[r.id,r]));const root=current?snapshot(current,current.dead?'death':'living'):records[0];if(!root)return [];const rows=[],queue=[root],seen=new Set();
 while(queue.length&&rows.length<limit){const r=queue.shift();if(seen.has(r.id))continue;seen.add(r.id);rows.push(r);for(const parent of r.parents||[]){if(seen.has(parent.id))continue;queue.push(index.get(parent.id)||{id:parent.id,name:parent.name,species:r.species,generation:Math.max(1,(r.generation||2)-1),parents:[],partner:null,stage:'Дорослий',character:'Член родини',ageMs:0,trait:r.partner?.id===parent.id?r.partner.trait:null});}}
 return rows;
}
