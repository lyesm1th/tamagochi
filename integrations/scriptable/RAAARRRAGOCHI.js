// РААААРРРАГОЧІ • Scriptable v1.0: real Telegram synced pet and care.
// Setup: Run inside Scriptable once, paste pairing from Telegram game button.
const fm=FileManager.local(),file=fm.joinPath(fm.documentsDirectory(),"raaarrragochi-pairing.json");
const names={chicken:"Курочка",cat:"Котик",corgi:"Коргі",frog:"Жабка",bear:"Ведмедик",dog:"Корівка",dino:"Динозаврик",bunny:"Кролик",pig:"Порося",sheep:"Вівця",fox:"Лисичка",monkey:"Мавпа",duck:"Качка",penguin:"Пінгвін"};
const old={chicken:[419,11,121,181],cat:[192,11,182,176],corgi:[49,192,142,182],frog:[594,30,122,162],bear:[235,193,134,181],dog:[43,10,149,182],dino:[416,192,141,184],bunny:[600,192,115,184]};
const six=["pig","sheep","fox","monkey","duck","penguin"];
const assets="https://raw.githubusercontent.com/lyesm1th/tamagochi/64be0f7913e0070d40afffa4d9b52dc3ce0ffc67/public/art/detailed/";
let cfg={};try{cfg=JSON.parse(fm.readString(file));}catch{}
const delay=ms=>new Promise(resolve=>Timer.schedule(ms,false,resolve));
function parsePairing(value){
 const i=value.indexOf("|");if(i<0)throw Error("Скопіюй повний код із Telegram, разом із адресою.");
 const origin=value.slice(0,i),token=value.slice(i+1);
 let validOrigin=false;
 try{const parsed=new URL(origin);validOrigin=parsed.protocol==="https:"&&parsed.origin===origin;}catch{}
 if(!validOrigin||!/^[0-9]+[.][a-f0-9]{64}$/.test(token))throw Error("Неправильний код прив'язки");
 return {origin,token};
}
async function call(path,body={},requestId=null){
 const r=new Request(cfg.origin+"/api/widget/"+path);
 r.method="POST";r.timeoutInterval=15;
 r.headers={"Authorization":"Bearer "+cfg.token,"Content-Type":"application/json"};
 if(requestId)r.headers["X-Request-ID"]=requestId;
 r.body=JSON.stringify(body);
 const json=await r.loadJSON();
 if(!json||json.error)throw Error(json?.error||"Сервер не відповів");
 return json;
}
async function askLink(){
 const alert=new Alert();alert.title="Підключення РААААРРРАГОЧІ";
 alert.message="У Telegram-грі натисни «📱 Підключити віджет iPhone» та скопіюй отриманий код.";
 alert.addTextField("Встав код із Telegram", "");
 alert.addAction("Підключити");alert.addCancelAction("Скасувати");
 if(await alert.presentAlert()!==0)return false;
 cfg=parsePairing(alert.textFieldValue(0).trim());
 await call("state");fm.writeString(file,JSON.stringify(cfg));return true;
}
function atlasFor(p){
 const extra=six.includes(p.species);
 const age={"Яєчко":"baby","Малюк":"baby","Дитина":"child","Підліток":"teen","Дорослий":"adult","Старенький":"adult"}[p.age]||"teen";
 const oldNames={baby:"babies.8683ba45b4dd.webp",child:"children.265722c3934d.webp",teen:"teens.6bb3b431b38e.webp",adult:"adults.803745932f0c.webp"};
 const newNames={baby:"new-babies.e475fff12b09.webp",child:"new-children.173bdbe3aabf.webp",teen:"new-teens.766f713547bf.webp",adult:"new-adults.fe3130d195c1.webp"};
 // Old-species source cells vary by age; safe reference is original teen sprite.
 return extra?{file:newNames[age],cell:[six.indexOf(p.species)*192,0,192,192]}:{file:oldNames.teen,cell:old[p.species]||old.dino};
}
async function portrait(p){
 const a=atlasFor(p),cache=fm.joinPath(fm.documentsDirectory(),"pet-"+a.file+"-"+p.species+".png");
 if(fm.fileExists(cache))return fm.readImage(cache);
 const r=new Request(assets+a.file);r.timeoutInterval=12;
 const source=await r.loadImage(),c=new DrawContext();c.size=new Size(a.cell[2],a.cell[3]);
 c.opaque=false;c.respectScreenScale=false;
 c.drawImageAtPoint(source,new Point(-a.cell[0],-a.cell[1]));
 const img=c.getImage();fm.writeImage(cache,img);return img;
}
async function show(){
 let status;try{status=await call("state");}catch(e){return notice("З'єднання",e.message);}
 if(!status.pet)return notice("РААААРРРАГОЧІ","Спочатку обери друга в Telegram.");
 const p=status.pet;
 const buttons=["🍗 Погодувати","🧹 Прибрати","❤️ Погладити","💤 Сон / пробудження","🔄 Оновити","🔗 Переприв'язати"];
 const alert=new Alert();alert.title=p.name+" · "+p.age;
 alert.message="Голод: "+p.mood.hunger+"% · Настрій: "+p.mood.happy+"%\nЕнергія: "+p.mood.energy+"% · Чистота: "+p.mood.clean+"%";
 buttons.forEach(x=>alert.addAction(x));alert.addCancelAction("Закрити");
 const choice=await alert.presentSheet();
 if(choice===5){if(await askLink())await notice("Готово","Віджет прив'язаний.");return;}
 if(choice===4){await show();return;}
 if(choice>=0&&choice<=3){
  const action=["feed","clean","pet","sleep"][choice];
  const id=UUID.string().replace(/-/g,"");
  try{const updated=await call("action",{action},id);await notice(p.name,updated.text||"Готово!");}
  catch(e){await notice("Дію не підтверджено",e.message+"\nПовтори перевірку стану в Telegram перед новою спробою.");}
 }
}
async function notice(title,message){const a=new Alert();a.title=title;a.message=message;a.addAction("ОК");await a.presentAlert();}
if(!config.runsInWidget){
 try{if(!cfg.token&&!await askLink())Script.complete();else await show();}
 catch(e){await notice("Помилка",e.message);}
 Script.complete();
}else{
 const widget=new ListWidget();widget.backgroundColor=new Color("#192936");
 widget.setPadding(7,8,7,8);
 let pet=null,error="";
 try{if(cfg.token)pet=(await call("state")).pet;else error="Спочатку запусти скрипт";}catch(e){error="Немає зв'язку";} 
 const family=config.widgetFamily||"small";
 if(pet){
  const title=widget.addText("🐾 "+pet.name);title.font=Font.boldSystemFont(12);title.textColor=Color.white();
  if(family!=="accessoryInline"){
   try{const im=widget.addImage(await portrait(pet));im.centerAlignImage();im.imageSize=family.startsWith("accessory")?new Size(36,44):new Size(93,98);}catch{}
  }
  if(!family.startsWith("accessory")){
   const status=widget.addText("🍗 "+pet.mood.hunger+"%   🧹 "+pet.mood.clean+"%");
   status.font=Font.mediumSystemFont(11);status.textColor=new Color("#e4ebd5");
  }
 }else{const t=widget.addText("🐾 "+(error||"Немає пета"));t.textColor=Color.white();}
 widget.url="scriptable:///run?scriptName="+encodeURIComponent(Script.name());
 widget.refreshAfterDate=new Date(Date.now()+30*60000);
 Script.setWidget(widget);Script.complete();
}
