// Two scoped, revocable Live Activity webhooks. They can only operate on the
// paired pet and never grant access to inventory, Telegram or administration.
export function newIslandCareToken(){
 const bytes=crypto.getRandomValues(new Uint8Array(32));
 return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
}
const icons={feed:'fork.knife',pet:'heart.fill',clean:'sparkles',sleep:'sun.max.fill'};
const labels={feed:'🍗 Годувати',pet:'❤️ Погладити',clean:'🧹 Прибрати',sleep:'☀️ Розбудити'};
export function careButtons(origin,ownerId,careToken,pet){
 const u=new URL(origin);
 if(u.protocol!=='https:'||u.username||u.password)throw Error('Invalid companion origin');
 if(!/^[0-9]{1,18}$/.test(String(ownerId))||!/^[a-f0-9]{64}$/.test(String(careToken)))throw Error('Invalid care pairing');
 const first=pet.sleeping?'sleep':Number(pet.mood?.clean)<35?'clean':'feed';
 const make=action=>({
  url:u.origin+'/api/island/care/'+ownerId,
  foreground:false,method:'POST',
  headers:{'X-Pet-Care-Key':careToken,'Content-Type':'application/json'},
  body:JSON.stringify({action}),title:labels[action],icon:icons[action]
 });
 return {primary:make(first),secondary:make('pet')};
}
