import {fresh,life,species} from './game.js';
import {itemMoves} from './room-life.js';
import {itemDesigns} from './item-designs.js';
import {emotionNames} from './emotions.js';
export const labAges=['Яєчко','Малюк','Дитина','Підліток','Дорослий','Старенький'];
// A new fixture per selection. Never read a real save, tick, buy or call an API.
export function labPet(options={},now=Date.now()){
 const id=species.some(p=>p.id===options.species)?options.species:'dino',s=fresh(id,now-life.teen-3600000);
 s.id='visual-lab-'+id;s.portraitStage=labAges.includes(options.age)?options.age:'Дорослий';s.updated=now;
 Object.assign(s,{hunger:85,happy:85,energy:85,health:85,clean:100,sleeping:!!options.sleeping});
 s.room={bed:true,bowl:true,plant:true,toy:true};
 s.cozy.owned={rug:true,shelf:true,lamp:true,tent:true,cushion:true,fountain:true,mirror:true,post:true,curtains:true,toybox:true};
 s.playroom.decor.layout=[0,1,2].includes(Number(options.layout))?Number(options.layout):0;
 const item=Object.hasOwn(itemMoves,options.item)?options.item:null;
 s.cozy.stored??={};s.cozy.items??={};
 if(item){
  s.cozy.items[item]={wear:options.condition==='broken'?0:100};
  s.cozy.stored[item]=options.condition==='stored';
  const variant=Number(options.variant),count=item==='bed'?3:(itemDesigns[item]?.length||1);
  s.living??={};s.living.furniture??={};s.living.furniture[item]=Number.isInteger(variant)&&variant>=0&&variant<count?variant:0;
 }
 s.cozy.nightMode=false;
 const allowed={body:['pajamas','sweater','raincoat'],head:['panama','crown'],neck:['scarf','bow'],eyes:['glasses']};s.cozy.wearing={};
 for(const [slot,ids]of Object.entries(allowed))if(ids.includes(options[slot]))s.cozy.wearing[slot]=options[slot];
 const kind=Object.hasOwn(emotionNames,options.emotion)?options.emotion:'calm';s.emotion={kind,reason:'Обрана емоція для перевірки',at:now,until:now+120000,strength:.85};
 if(options.scenario==='hungry'){s.hunger=10;s.emotion=null;}if(options.scenario==='lonely'){s.happy=15;s.emotion=null;}if(options.scenario==='unwell'){s.health=15;s.emotion=null;}
 return s;
}

// Manual reaction fixture uses the same pose resolver as the live room.
export function labMoment(options={},now=Date.now()){
 const item=Object.hasOwn(itemMoves,options.item)?options.item:null;
 if(!item||['stored','broken'].includes(options.condition))return null;
 const kind=options.action==='doze'&&item==='bed'?'doze':itemMoves[item];
 return {item:item==='ball'?'toy':item,kind,at:now,until:now+16000,origin:{x:100,feet:129},event:'use'};
}
