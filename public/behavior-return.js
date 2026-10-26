// Return summaries report existing persisted events; they never create extra offline penalties.
const HOUR=3600000;
const names={food:'розсипав корм',pot:'розкопав вазон',puddle:'залишив калюжу',brush:'сховав щіточку'};
export function returnBehaviorSummary(s,since,now=Date.now()){
 if(!s||s.dead||s.vacation||!Number.isFinite(since)||since<=0||now-since<30*60000)return null;
 const d=s.daily||{};const events=[];
 const mess=d.mess;if(mess&&mess.at>=since&&mess.at<=now)events.push({id:mess.id,at:mess.at,text:'Я тут '+(names[mess.kind]||'трохи побешкетував')+'. Вибачиш?'});
 const resolved=d.lastMess;if(resolved&&resolved.at>=since&&resolved.at<=now)events.push({id:'resolved-'+resolved.id,at:resolved.at,text:resolved.repaired?'Я допоміг прибрати після витівки.': 'Ми вже розібралися з однією витівкою.'});
 const item=d.lastFind;if(item&&item.at>=since&&item.at<=now)events.push({id:'find-'+item.at,at:item.at,text:'Я знайшов маленький скарб!'});
 const seen=new Set();const selected=events.sort((a,b)=>a.at-b.at).filter(e=>{if(seen.has(e.id))return false;seen.add(e.id);return true;}).slice(0,3);
 if(!selected.length)return null;
 s.behaviorReturn??={};const token=String(since)+':'+String(now);if(s.behaviorReturn.lastWindowStart===since)return null;
 s.behaviorReturn.lastWindowStart=since;s.behaviorReturn.lastAt=now;
 return 'Поки тебе не було: '+selected.map(x=>x.text).join(' ');
}
