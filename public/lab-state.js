import {fresh,life,species} from './game.js';
import {emotionNames} from './emotions.js';
export const labAges=['Яєчко','Малюк','Дитина','Підліток','Дорослий','Старенький'];
// A new fixture per selection. Never read a real save, tick, buy or call an API.
export function labPet(options={},now=Date.now()){
 const id=species.some(p=>p.id===options.species)?options.species:'dino',s=fresh(id,now-life.teen-3600000);
 s.id='visual-lab-'+id;s.portraitStage=labAges.includes(options.age)?options.age:'Дорослий';s.updated=now;
 Object.assign(s,{hunger:85,happy:85,energy:85,health:85,clean:100,sleeping:!!options.sleeping});
 s.room={bed:true,bowl:true,plant:true,toy:true};s.cozy.nightMode=false;
 const allowed={body:['pajamas','sweater','raincoat'],head:['panama','crown'],neck:['scarf','bow'],eyes:['glasses']};s.cozy.wearing={};
 for(const [slot,ids]of Object.entries(allowed))if(ids.includes(options[slot]))s.cozy.wearing[slot]=options[slot];
 const kind=Object.hasOwn(emotionNames,options.emotion)?options.emotion:'calm';s.emotion={kind,reason:'Обрана емоція для перевірки',at:now,until:now+120000,strength:.85};
 if(options.scenario==='hungry'){s.hunger=10;s.emotion=null;}if(options.scenario==='lonely'){s.happy=15;s.emotion=null;}if(options.scenario==='unwell'){s.health=15;s.emotion=null;}
 return s;
}
