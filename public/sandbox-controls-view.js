// Browser sandbox controls. Buttons are built here; game state and event
// side effects remain with the app through injected callbacks.
export function renderSandboxControls(controls,{query,createElement,busy,actionIcon,onChoosePeer,onChooseAction,onChooseGame}){
 const wrapper=query('#sandbox-controls');
 wrapper.hidden=!controls;
 if(!controls)return;
 const peers=query('#sandbox-peers'),actions=query('#sandbox-actions');
 peers.replaceChildren();actions.replaceChildren();
 for(const {pet,index,chosen} of controls.peers){
  const button=createElement('button');
  button.type='button';button.className='sandbox-peer'+(chosen?' selected':'');
  button.textContent=pet.name;button.disabled=busy;
  button.setAttribute('aria-pressed',String(chosen));
  button.onclick=()=>onChoosePeer(index);
  peers.append(button);
 }
 const selected=controls.selected;
 for(const {index,command,label,chosen,ariaLabel,disabled} of controls.actions){
  const button=createElement('button');
  button.type='button';button.className='sandbox-action'+(chosen?' selected':'');
  button.setAttribute('aria-label',ariaLabel);button.disabled=disabled;
  const text=createElement('span');text.textContent=label;
  button.append(actionIcon(command),text);
  button.onclick=()=>onChooseAction(index,command,selected);
  actions.append(button);
 }
 for(const {game,label,disabled} of controls.games){
  const button=createElement('button');
  button.type='button';button.className='sandbox-action';
  button.textContent=label;button.disabled=disabled;
  button.onclick=()=>onChooseGame(game,selected);
  actions.append(button);
 }
}
