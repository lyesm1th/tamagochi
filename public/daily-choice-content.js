// Pure descriptions for daily pages. Photo composition remains in app.js.
export function dailyChoiceContent(mode,state,choice,{wishText,wishAnswers,treasures,messNames,messAnswers,celebrations}){
 const d=state.daily||{};
 if(mode==='wishes')return {
  title:'Чого хоче мій друг',
  detail:wishText(state)+(d.wish?'\n'+(d.wish.accepted?'Домовились! ':'')+'▶ '+wishAnswers[choice%3]:'')+(d.lastWish?'\nМинуле: '+d.lastWish.result:'')
 };
 if(mode==='stash'){
  const ids=Object.keys(d.stash||{}).filter(id=>d.stash[id]>0),item=treasures.find(t=>t.id===ids[choice%Math.max(1,ids.length)]);
  return {
   title:item?item.name+' ×'+d.stash[item.id]:'Поки порожня схованка',
   detail:item?'«Це мій скарб. Дуже важливий!»\nОК — покажи мені · ← → інша знахідка':'Пет знаходить дрібниці вдома й на прогулянках. З часом тут буде колекція.'
  };
 }
 if(mode==='mischief')return {
  title:d.mess?messNames[d.mess.kind]:'Зараз тихо. Підозріло тихо.',
  detail:(d.mess?'«Я просто перевіряв, як воно працює!»\n▶ '+messAnswers[choice%3]:'Друг поки нічого не накоїв.')+'\nЗвички: охайність '+(d.habits?.tidy||0)+' · пустощі '+(d.habits?.cheeky||0)
 };
 if(mode==='celebrations'){
  const events=celebrations(state),event=events[choice%Math.max(1,events.length)];
  return {
   title:event?.name||'Свята ще попереду',
   detail:event?(event.done?'Уже святкували! Фото є в альбомі.':'ОК — тортик, ковпачок і обійми!')+'\n← → інше свято':'Вилуплення, перший тиждень і десята прогулянка — кожен привід святкуємо разом.'
  };
 }
 if(mode==='human')return {
  title:'Твій маленький захисник',
  detail:(d.kind?.text||d.lastKind?.text||'Я теж за тобою приглядаю. Поїж, перепочинь і бережи себе, моя людино.')+'\n'+(d.kind?'ОК — дякую, друже':'Немає штрафів, якщо ти зайнятий. Просто знай: я поруч.')
 };
 return null;
}
