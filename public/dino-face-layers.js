// Separate, authored transparent facial sprite per emotion; no runtime pixel warping.
const names=['body','calm','happy','laugh','sad','angry','surprised','fear','sleepy','tender','offense','cry','tired'];
const images=new Map();
let pending=null;
export const dinoFaceBase=()=>images.get('body')||null;
export const dinoFaceLayer=name=>images.get(name)||images.get('calm')||null;
export function loadDinoFaceAssets(){
 if(typeof Image==='undefined')return Promise.resolve(false);
 if(pending)return pending;
 pending=Promise.all(names.map(name=>new Promise((resolve,reject)=>{
  const img=new Image();
  img.onload=()=>{images.set(name,img);resolve();};
  img.onerror=()=>reject(Error('Dinosaur face asset unavailable: '+name));
  img.src='/art/dino-faces/teen/'+name+'.png';
 }))).then(()=>true).catch(()=>{images.clear();pending=null;return false;});
 return pending;
}
export function dinoFaceEmotionKey(pet,now=Date.now()){
 if(pet?.sleeping||pet?.napping)return 'sleepy';
 if(pet?.farewellPreview)return 'cry';
 const e=pet?.emotion;
 let kind=e&&e.at<=now&&e.until>now?e.kind:null;
 if(!kind){
  if((pet?.health??100)<35)kind='anxious';
  else if((pet?.happy??100)<35)kind='sad';
  else if((pet?.hunger??100)<25)kind='annoyed';
 }
 switch(kind){
  case 'amused':return 'laugh';
  case 'content':case 'grateful':case 'shy':return 'tender';
  case 'sad':return e?.strength>=.8?'cry':'sad';
  case 'hurt':return e?.strength>=.8?'cry':'offense';
  case 'angry':return 'angry';
  case 'annoyed':return 'offense';
  case 'surprised':return 'surprised';
  case 'anxious':return 'fear';
  case 'bored':return 'tired';
  case 'curious':case 'proud':return 'happy';
  default:return 'calm';
 }
}
