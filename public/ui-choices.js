// Pure option preparation shared by the UI. No DOM, storage or network state.
export function countDailyOptions(mode,state,momentRecords,celebrations){
 return Math.max(1,mode==='wishes'?3:mode==='photos'?momentRecords.length:mode==='stash'?Object.keys(state.daily?.stash||{}).filter(id=>state.daily.stash[id]>0).length:mode==='mischief'?3:mode==='celebrations'?celebrations(state).length:1);
}
export function mealOptions(state,dishes,additionsFor){
 return (dishes[state.species]||dishes.cat).flatMap(d=>additionsFor(state).map(addition=>({dish:d,addition})));
}
export function belongingOptions(state,selectedItem,belongingChoices,ownedThings){
 const rows=belongingChoices(state);
 if(selectedItem)return rows.filter(row=>row.item.id===selectedItem);
 return ownedThings(state).map(item=>({item,action:['select','Відкрити дії']}));
}
