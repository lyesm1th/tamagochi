// Derive sandbox controls from current UI state without DOM or event handlers.
// The order, selected index, labels, and disabled conditions are unchanged.
const commands=[['hello','Привітатись'],['play','Грати'],['tease','Побурчати'],['avoid','Відійти']];
export function sandboxControlModel(pets,choice,busy,online,socialGames){
 const selectedIndex=Math.floor(choice/4),selected=pets[selectedIndex];
 const disabled=busy||!online||!selected;
 return {
  selected,
  peers:pets.map((pet,index)=>({pet,index,chosen:index===selectedIndex})),
  actions:commands.map(([command,label],index)=>({
   index,command,label,chosen:choice%4===index,
   ariaLabel:label+(selected?' · '+selected.name:''),disabled
  })),
  games:socialGames.map(([game,label])=>({game,label,disabled}))
 };
}
