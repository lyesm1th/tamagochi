// Pure menu data and builders, independent of app state and DOM.
export const routineFields=[['enabled','Автоматичний сон'],['bed','Лягати спати'],['wake','Прокидатися'],['meal1','Перший перекус'],['meal2','Другий перекус'],['play','Вечірня гра']];
export const allMenu=[['feed','♨','Годувати'],['sleep','☾','Сон / підйом'],['play','✥','Грати'],['medicine','✚','Ліки · 10'],['clean','≈','Прибрати'],['pet','♡','Погладити'],['discipline','!','Виховати'],['treat','✦','Смаколик · 5'],['status','▦','Мій друг'],['album','▤','Альбом поколінь'],['memory','⌘','Пам’ять і прив’язаність'],['adventure','◇','Маленька пригода'],['room','⌂','Кімнатка'],['vacation','⏸','Відпустка'],['routine','◷','Розпорядок дня'],['tree','⋈','Родинне дерево'],['family','♥','Пара й нове яйце'],['sound','♪','Звук'],['reminders','♧','Нагадування'],['graphics','▧','Графіка'],['rules','?','Правила'],['world','☀','Маленький світ'],['endLife','☠','Завершити життя']];
export function groupEntries(groups){
 return groups.map(([id,icon,name])=>['group:'+id,icon,name]);
}
export function groupItems(id,groups,journalPages,worldPages){
 const group=groups.find(g=>g[0]===id);
 const names={roomStyle:'Настрій кімнати',wallet:'Гаманець і подарунки',...Object.fromEntries(journalPages),...Object.fromEntries(worldPages),sandbox:'Спільна пісочниця',stories:'Наші маленькі історії',secrets:'Секрети кімнати'};
 const items=group[3].filter(x=>!['ritual','peace','pet','kitchen','decorate'].includes(x)).map(key=>allMenu.find(m=>m[0]===key)||[key,{sandbox:'♧',stories:'✿'}[key]||'·',names[key]||key]);
 return items.map(row=>row[0]==='activity'?[row[0],row[1],'Догляд і обійми']:row[0]==='roomStyle'?[row[0],row[1],'Вигляд і облаштування']:row);
}

export function createMenuModes({journalPages,worldPages,dailyPages,playroomPages,cozyPages}){
 const journalModes=journalPages.map(([id])=>id);
 const worldModes=['roomStyle','wallet',...journalModes,'secrets','world','stories','sandbox',...worldPages.map(([id])=>id)];
 const panelModes=['roomStyle','wallet',...journalModes,'secrets','stories','sandbox','games','album','family','food','memory','room','routine','adventure','tree','world','ritual','weather','walk','activity','dreams','forms',...dailyPages.map(([id])=>id),...playroomPages.map(([id])=>id),...cozyPages.map(([id])=>id)];
 return {journalModes,worldModes,panelModes};
}
export function groomName(s){return {chicken:'Пригладити пір’ячко',frog:'Зволожити спинку',dino:'Почистити луску',dog:'Почистити шерстку'}[s.species]||'Розчесати шерстку';}
