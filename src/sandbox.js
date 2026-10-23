// Stored in a separate instance of the existing Durable Object namespace.
const TTL=45000;
export async function sandboxFetch(storage,owner,body,now=Date.now()){
 if(!/^\d+$/.test(owner||''))return {error:'Потрібна авторизована сесія.'};const room=await storage.get('sandbox')||{pets:{},pairs:{}};
 for(const [id,p]of Object.entries(room.pets))if(now-p.at>TTL)delete room.pets[id];
 for(const [id,p]of Object.entries(room.pairs))if(now-p.at>7*86400000)delete room.pairs[id];
 room.scenes??=[];room.scenes=room.scenes.filter(s=>s.until>now&&s.actors.every(id=>Object.values(room.pets).some(p=>p.id===id)));
 const publicPet=p=>({id:p.id,name:p.name,species:p.species,x:p.x,look:p.look,relationship:room.pairs[[owner,p.owner].sort().join(':')]?.score||0});
 let text='',delta=0,mental=0;
 if(body.command==='leave'){delete room.pets[owner];}
 else{
 const p=body.pet;if(!p||!['chicken','cat','corgi','frog','bear','dog','dino','bunny'].includes(p.species))return {error:'Спочатку приведи друга.'};
 if(!room.pets[owner]&&Object.keys(room.pets).length>=30)return {error:'На майданчику людно. Спробуй трохи пізніше.'};
 const mine=room.pets[owner]||{id:crypto.randomUUID(),x:20+Object.keys(room.pets).length%7*23,last:0};Object.assign(mine,{owner,species:p.species,name:String(p.name).slice(0,24),look:p.look,at:now});room.pets[owner]=mine;
 if(['hello','play','tease','avoid'].includes(body.command)){
 const entry=Object.entries(room.pets).find(([id,p])=>id!==owner&&p.id===body.target);if(!entry)return {error:'Друг уже пішов. Обери когось на майданчику.'};
 if(body.command==='avoid'){room.scenes=room.scenes.filter(scene=>!scene.actors.includes(mine.id));mine.avoiding??={};mine.avoiding[entry[0]]=now+30*60000;text='Відійшов від цього пета. Пів години він мене не турбуватиме.';}else if(entry[1].avoiding?.[owner]>now||mine.avoiding?.[entry[0]]>now){text='Побудьмо окремо. Компанія знайдеться.';}else if(now-mine.last<15000){text='Побудьмо поруч. Друг ще відповідає.';}else{
 mine.last=now;const [otherId,other]=entry,key=[owner,otherId].sort().join(':'),pair=room.pairs[key]||{score:0,at:0};
 if(body.command==='play'){const kind=['ball','hide','swing'].includes(body.game)?body.game:['ball','hide','swing'][(pair.plays||0)%3];pair.plays=(pair.plays||0)+1;room.scenes=room.scenes.filter(s=>!s.actors.includes(mine.id)&&!s.actors.includes(other.id));room.scenes.push({kind,actors:[mine.id,other.id],at:now,until:now+24000,score:Math.min(5,pair.score+1)});}
 const score=body.command==='tease'?-1:1;pair.score=Math.max(-5,Math.min(5,pair.score+score));pair.at=now;room.pairs[key]=pair;
 const reward=now-(pair.rewardAt||0)>=5*60000;if(reward)pair.rewardAt=now;delta=reward?(score>0?3:-2):0;mental=reward?(score>0?2:-2):0;text=body.command==='tease'?'Побурчали одне на одного. Краще трохи відійти.':pair.score>=3?'Уже впізнаємо одне одного! Разом веселіше.':'Понюхались і пограли. Здається, знайшов компанію.';
 if(reward&&now-(other.incomingAt||0)>=60000){other.incomingAt=now;other.inbox={delta,mental,text:score>0?'Зі мною познайомились і пограли!':'Хтось побурчав. Я відійшов у тихий куточок.'};}
 }
 }
 if(mine.inbox){delta+=mine.inbox.delta;mental+=mine.inbox.mental;text=text||mine.inbox.text;delete mine.inbox;}
 }
 await storage.put('sandbox',room);
 return {selfId:room.pets[owner]?.id,scenes:room.scenes.filter(s=>s.actors.every(id=>Object.values(room.pets).some(p=>p.id===id))),pets:Object.entries(room.pets).filter(([id])=>id!==owner).map(([,p])=>publicPet(p)),text,delta,mental};
}
