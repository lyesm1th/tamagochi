// Prepare labels for companionship pages without DOM or global state.
export function companionChoiceContent(mode,state,choice,treeRecords,treeIndex,{
 foodsFor,stage,foodNames,memorySummary,furnishings,routineFields,adventureOf
}){
 if(mode==='food'){
  const list=foodsFor(state,stage(state)),food=list[choice];
  return {
   title:(choice+1)+'/'+list.length+' · '+foodNames[food],
   detail:(state.memory?.discoveries.includes(food)?'♡ Уже знаємо: це улюблена їжа!':'Який смак оберемо сьогодні?')+'\nОК — погодувати'
  };
 }
 if(mode==='memory')return {
  title:state.name+' пам’ятає',
  detail:memorySummary(state)+(state.memory.lastAdventure?'\nПригода: '+state.memory.lastAdventure.title:'')+(state.heirloom?'\nСпадок: '+state.heirloom.name:'')
 };
 if(mode==='room'){
  const item=furnishings[choice],owned=state.room?.[item.id];
  return {
   title:item.name+(owned?' · Є В КІМНАТІ':' · '+item.price+' монет'),
   detail:item.benefit+'\n'+(owned?'ОК — скористатися':'ОК — придбати'),
   showPortrait:true
  };
 }
 if(mode==='routine'){
  const [field,name]=routineFields[choice];
  return {
   title:name,
   detail:(field==='enabled'?(state.routine.enabled?'УВІМКНЕНО':'ВИМКНЕНО'):String(state.routine[field]).padStart(2,'0')+':00')+'\nОК — '+(field==='enabled'?'увімкнути / вимкнути':'додати 1 годину')+'\n← → інший пункт · ↶ назад'
  };
 }
 if(mode==='adventure'){
  const event=adventureOf(state);
  return {
   title:event?.title||'Зараз спокійно',
   detail:event?event.question+'\n▶ '+event.choices[choice].label+'\nОК — відповісти':'Пригоди часом трапляються самі. А поки можна обійнятися.'
  };
 }
 if(mode==='tree'){
  const row=treeRecords[treeIndex];
  return {
   title:row?row.name+' · покоління '+row.generation:'Родинне дерево',
   detail:row?((row.parents?.length?'Батьки: '+row.parents.map(p=>p.name).join(' + '):'Початок цієї гілки родини')+(row.heirloom?'\nСпадок: '+row.heirloom.name+' від '+row.heirloom.from:'')+'\n'+(treeIndex+1)+'/'+treeRecords.length+' · ← → родичі'):'У нас ще все попереду.'
  };
 }
 return null;
}
