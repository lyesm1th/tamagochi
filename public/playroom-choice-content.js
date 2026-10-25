// Prepare playroom labels without touching DOM or changing gameplay.
export function playroomChoiceContent(mode,state,choice,now,{toys,recipes,decorFields,treasures,layouts,bedding,favoriteCorner}){
 if(!['toys','craft','decorate'].includes(mode))return null;
 const p=state.playroom;
 let title,detail;
 if(mode==='toys'){const run=p.session?.expires>now?p.session:null,toy=toys.find(t=>t.id===run?.kind)||toys[choice%toys.length];title=toy.name+(run?' · '+run.hits+'/'+(run.kind==='music'?3:5):p.toys[toy.id]?' · НАША':' · '+toy.price+' монет');detail=toy.hint+'\n'+(run?'↶ — завершити гру без нагороди':p.toys[toy.id]?'ОК — почати · ← → інша іграшка':'ОК — придбати · ← → інша іграшка')+'\nРазом грали: '+(p.skills[toy.id]||0)+((p.skills[toy.id]||0)>=3?' · власний прийом вивчено!':'');return {title,detail};}
 if(mode==='craft'){const recipe=recipes[choice%recipes.length];title=recipe.name+(p.crafted[recipe.id]?' · ГОТОВО':'');detail=Object.entries(recipe.cost).map(([id,n])=>{const item=treasures.find(t=>t.id===id);return item.name+': '+(state.daily.stash[id]||0)+'/'+n;}).join(' · ')+'\n'+recipe.hint+'\nОК — зробити · ← → інший рецепт';return {title,detail};}
 if(mode==='decorate'){const [field,name]=decorFields[choice%decorFields.length];title=name;detail=(field==='layout'?layouts[p.decor.layout]:field==='bedding'?bedding[p.decor.bedding].name:field==='display'?(treasures.find(t=>t.id===p.decor.display)?.name||'Поки без експоната'):favoriteCorner(state).name)+'\n'+(field==='corner'?'Пет сам обрав місце за характером.':'ОК — наступний варіант')+'\n← → інше налаштування';}
 return {title,detail};
}
