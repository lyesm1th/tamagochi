// РААААРРРАГОЧІ Scriptable v0.5 (zero-cost interactive launcher).
// Scriptable cannot directly run WidgetKit App Intents. This is an honest interactive menu,
// not a second offline pet save. To link your actual game, set GAME_URL to your existing
// Telegram Mini App URL (the URL you already use, no credentials).
const GAME_URL = ""; // example format only: https://t.me/YOUR_BOT/app (don't use this sample)
const SOURCE="https://raw.githubusercontent.com/lyesm1th/tamagochi/64be0f7913e0070d40afffa4d9b52dc3ce0ffc67/public/art/detailed/";
const old = {
 chicken:[419,11,121,181],cat:[192,11,182,176],corgi:[49,192,142,182],
 frog:[594,30,122,162],bear:[235,193,134,181],dog:[43,10,149,182],
 dino:[416,192,141,184],bunny:[600,192,115,184]
};
const six=["pig","sheep","fox","monkey","duck","penguin"];
const labels={chicken:"Квочка",cat:"Пан Сраколап",corgi:"Батон",frog:"Квасик",bear:"Буркотун",dog:"Мукалка",dino:"Кусьозавр",bunny:"Вухань",pig:"Хрюндель",sheep:"Хмаринка",fox:"Хитруля",monkey:"Бананич",duck:"Крякуша",penguin:"Плюх"};
const params=(args.widgetParameter||"dino").split("|").map(s=>s.trim().toLowerCase());
const id=labels[params[0]]?params[0]:"dino";
const hasNew=six.includes(id);
const atlas=hasNew?"new-teens.766f713547bf.webp":"teens.6bb3b431b38e.webp";
const rect=hasNew?[192*six.indexOf(id),0,192,192]:old[id];
const fm=FileManager.local(),folder=fm.joinPath(fm.documentsDirectory(),"raaarrragochi-v05");
if(!fm.fileExists(folder))fm.createDirectory(folder,true);
const imageFile=fm.joinPath(folder,id+"-teen.png");
async function actor(){
 if(fm.fileExists(imageFile))return fm.readImage(imageFile);
 const img=await new Request(SOURCE+atlas).loadImage();
 // The source atlas is drawn without scaling onto its own crop canvas.
 const crop=new DrawContext();crop.size=new Size(rect[2],rect[3]);crop.opaque=false;
 crop.respectScreenScale=false;
 crop.drawImageAtPoint(img,new Point(-rect[0],-rect[1]));
 const out=crop.getImage();fm.writeImage(imageFile,out);return out;
}
const runningAsWidget=config.runsInWidget;
if(!runningAsWidget){
 const m=new Alert();m.title=labels[id]+" 🐾";m.message="Вибери дію. Прогрес пета змінюється тільки в Telegram-грі.";
 ["🍗 Погодувати","🧹 Прибрати","❤️ Погладити","🎮 Погратися","🐾 Відкрити гру"].forEach(x=>m.addAction(x));
 m.addCancelAction("Закрити");
 const choice=await m.presentSheet();
 if(choice>=0){
  if(GAME_URL&&/^https:\/\//i.test(GAME_URL))Safari.open(GAME_URL);
  else {
   const alert=new Alert();alert.title="Підключення гри";alert.message="У скрипті заповни GAME_URL посиланням на нашу Telegram Mini App. Поки що без нього кнопки не змінюють стан пета.";
   alert.addAction("Гаразд");await alert.present();
  }
 }
 Script.complete();
}else{
 const w=new ListWidget();w.backgroundColor=new Color("#16202c");
 w.setPadding(8,8,8,8);
 const family=config.widgetFamily||"small";
 const title=w.addText("🐾 "+labels[id]);title.font=Font.semiboldSystemFont(12);title.textColor=Color.white();
 if(family!=="accessoryInline"){
  try{
   const pic=w.addImage(await actor());pic.centerAlignImage();
   const compact=family.startsWith("accessory");
   pic.imageSize=compact?new Size(38,46):new Size(110,110);
  }catch(e){const fail=w.addText("🐾");fail.textColor=Color.white();}
 }
 if(!family.startsWith("accessory")){
  const note=w.addText("Торкнись: їжа · гра · турбота");
  note.font=Font.systemFont(10);note.textColor=new Color("#c9d5dd");
 }
 // Actual tap launches THIS script with an actions sheet rather than its editor.
 const script=encodeURIComponent(Script.name());
 w.url="scriptable:///run?scriptName="+script+"&widgetParameter="+encodeURIComponent(id);
 w.refreshAfterDate=new Date(Date.now()+45*60000);
 Script.setWidget(w);Script.complete();
}
