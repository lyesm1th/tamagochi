// Device preference only: neither style changes the saved pet.
export const defaultGraphicsMode='classic';
export let graphicsMode=defaultGraphicsMode;
try{if(localStorage.getItem('hamagochi-graphics')==='detailed')graphicsMode='detailed';}catch{}
export function setGraphicsMode(value){graphicsMode=value==='detailed'?'detailed':'classic';try{localStorage.setItem('hamagochi-graphics',graphicsMode);}catch{}return graphicsMode;}
