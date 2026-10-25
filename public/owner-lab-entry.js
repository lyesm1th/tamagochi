// No user ID from the browser is trusted: the server validates Telegram's signature.
const entry=document.getElementById('owner-lab');
const initData=window.Telegram?.WebApp?.initData;
async function authorize(){
 if(!initData)return false;
 try{const response=await fetch('/api/owner/access',{method:'POST',headers:{'X-Telegram-Init-Data':initData},credentials:'same-origin'});return response.ok&&(await response.json()).owner===true;}catch{return false;}
}
async function init(){
if(entry&&await authorize()){
 entry.hidden=false;
 entry.querySelector('a').onclick=async event=>{
  event.preventDefault();
  if(await authorize())location.assign('/lab.html');
  else{entry.hidden=true;window.Telegram?.WebApp?.showAlert?.('Не вдалося підтвердити доступ овнера. Перевідкрий гру через Telegram.');}
 };
}

}
void init();
