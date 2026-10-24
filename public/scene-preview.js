import {clothes,homeGoods,dishes,additionsFor} from './cozy-life.js';
import {furnishings,foodsFor} from './companionship.js';
import {belongingChoices,variants} from './living.js';
import {nextDesign,designKey} from './item-designs.js';
import {toys,recipes} from './playroom.js';
import {walks,activities,worldPages} from './little-world.js';
import {stage} from './game.js';

export const sceneModes=new Set(['room','shop','wardrobe','belongings','food','memory','routine','adventure','tree','games','world','walk','activity','ritual','weather','dreams','forms','stories','secrets','kitchen','peace','night','toys','craft','decorate','wishes','stash','mischief','celebrations','human']);
// Preview only: never run a purchase/action, tick the pet, or write to the save.
export function scenePreview(state,mode,choice=0,now=Date.now(),selection=null){
 if(!state||!sceneModes.has(mode))return null;
 if(mode==='world'){const target=worldPages[choice]?.[0];return scenePreview(state,sceneModes.has(target)?target:'stories',0,now);}
 const s=structuredClone(state),view={state:s,mode,focus:null,effect:null,label:'',game:null};
 s.world??={};s.cozy??={};s.cozy.owned??={};s.cozy.wearing??={};s.cozy.stored??={};s.room??={};s.playroom??={};s.playroom.toys??={};s.playroom.crafted??={};s.living??={};s.living.furniture??={};
 // Selected things stay visible even if the real pet is hiding or out walking.
 s.world.walk=null;s.cozy.hide=null;s.playroom.session=null;s.living.motion=null;if(s.living.enrichment){s.living.enrichment.session=null;s.living.enrichment.touch=null;s.living.enrichment.home=null;}s.journal&&delete s.journal.gesture;
 const fx=(kind,food)=>view.effect={kind,food,started:now-now%1600,until:now+2000};
 const place=id=>{delete s.cozy.stored[id];if(['bed','bowl','plant','toy','box'].includes(id))s.room[id]=true;else if(['ball','laser','music'].includes(id))s.playroom.toys[id]=true;else s.cozy.owned[id]=true;view.focus=id;};
 const wear=item=>{s.sleeping=false;s.napping=false;s.vacation=null;s.dead=false;s.cozy.wearing[item.slot]=item.id;view.focus='pet';view.label='ПРИМІРКА · ОК — ОБРАТИ';if(stage(s,now)==='Яєчко'){s.portraitStage='Дорослий';view.label='ПРИМІРКА ДОРОСЛОЇ ФОРМИ';}};
 if(mode==='room'||mode==='shop'){const item=(mode==='room'?furnishings:homeGoods)[choice];if(item){place(item.id);view.label='ПЕРЕГЛЯД У КІМНАТІ';}}
 if(mode==='wardrobe'){const item=clothes[choice%clothes.length];if(item)wear(item);}
 if(mode==='belongings'){const row=selection||belongingChoices(state)[choice];if(row){const {item,action}=row;if(item.slot)wear(item);else{place(item.id);if(action[0]==='replace'){const index=((state.living?.furniture?.bed||0)+1)%variants.length,next=item.id==='bed'?{...variants[index],index}:nextDesign(state,item.id);if(next){s.living.furniture[designKey(item.id)]=next.index;if(item.id==='bed'){s.cozy.items??={};s.cozy.items.bed={...s.cozy.items.bed,wear:100};}view.label='НАСТУПНИЙ ДИЗАЙН · '+next.name;}}else view.label='ВИБРАНА РІЧ';}}}
 if(mode==='toys'){const active=state.playroom?.session?.expires>now?state.playroom.session:null,toy=toys.find(t=>t.id===active?.kind)||toys[choice%toys.length];if(toy){s.playroom.session=active?structuredClone(active):{kind:toy.id,target:4,pet:2,expires:now+60000};view.focus=toy.id==='ball'?'toy':toy.id;view.label=active?'':'ПЕРЕГЛЯД ІГРАШКИ';}}
 if(mode==='food'){s.sleeping=false;s.napping=false;fx('feed',foodsFor(state,stage(state,now))[choice]);}
 if(mode==='kitchen'){const options=(dishes[state.species]||dishes.cat).flatMap(d=>additionsFor(state).map(()=>d)),dish=options[choice];fx('cook',dish?.base);view.label=dish?'ГОТУЄМО РАЗОМ':'КОМОРА';}
 if(mode==='craft'){const recipe=recipes[choice%recipes.length];if(recipe){s.playroom.crafted[recipe.id]=true;if(recipe.id==='mobile')place('bed');view.label='ПЕРЕГЛЯД ВИРОБУ';fx('craft');}}
 if(mode==='walk'){s.sleeping=false;s.napping=false;s.vacation=null;s.world.walk=state.world?.walk?.expires>now?structuredClone(state.world.walk):{place:walks[choice%walks.length].id,expires:now+60000};view.label='';}
 if(mode==='activity'){const run=state.world?.activity?.expires>now?state.world.activity:null;fx((activities.find(a=>a.id===run?.kind)||activities[choice%activities.length]).id);s.sleeping=false;s.napping=false;}
 if(mode==='ritual'||mode==='peace')fx('pet');
 if(mode==='celebrations')fx('party');
 if(mode==='human')fx('human');
 if(mode==='stash')fx('treasure');
 if(mode==='mischief'&&state.daily?.mess)fx('mischief');
 if(mode==='stories'&&s.living.story?.chapter===1)s.world.walk={place:'pond',expires:now+60000};
 if(mode==='stories'&&s.living.story?.chapter===2)view.label='НАШЕ СУЗІР’Я';
 if(mode==='night'){s.cozy.nightMode=true;}
 if(mode==='dreams'&&state.world?.lastDream&&!state.sleeping){s.sleeping=true;s.world.dream=structuredClone(state.world.lastDream);}
 if(mode==='games')view.game=choice;
 return view;
}
