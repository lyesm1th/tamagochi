// РААААРРРАГОЧІ • free Scriptable iOS Home Screen widget, v0.1
// Install: Scriptable > + > paste this script > save > add a Scriptable widget.
// In Edit Widget, assign this script; set Parameter to e.g. "dino" or "cat|teen".
// This first version is a read-only visual companion, NOT a live synchronized game.
const BASE = "https://raw.githubusercontent.com/lyesm1th/tamagochi/64be0f7913e0070d40afffa4d9b52dc3ce0ffc67/public/art/detailed/";
const CONFIG = { species: "dino", age: "teen", refreshMinutes: 45 };
const originals = {
  chicken:[419,11,121,181], cat:[192,11,182,176], corgi:[49,192,142,182],
  frog:[594,30,122,162], bear:[235,193,134,181], dog:[43,10,149,182],
  dino:[416,192,141,184], bunny:[600,192,115,184]
};
const newer = ["pig","sheep","fox","monkey","duck","penguin"];
const names = {chicken:"Квочка",cat:"Пан Сраколап",corgi:"Батон",frog:"Квасик",bear:"Буркотун",dog:"Мукалка",dino:"Кусьозавр",bunny:"Вухань",pig:"Хрюндель",sheep:"Хмаринка",fox:"Хитруля",monkey:"Бананич",duck:"Крякуша",penguin:"Плюх"};
const atlasNames={
 teen:"teens.6bb3b431b38e.webp", baby:"babies.8683ba45b4dd.webp",
 child:"children.265722c3934d.webp", adult:"adults.803745932f0c.webp",
};
const newAtlasNames={
 teen:"new-teens.766f713547bf.webp", baby:"new-babies.e475fff12b09.webp",
 child:"new-children.173bdbe3aabf.webp", adult:"new-adults.fe3130d195c1.webp"
};
// Original cell coordinates vary by age; v0.1 pins first 8 species to the verified teen atlas.
// The new six species share a 192px-cell grid across the four age atlases.
const param=(args.widgetParameter||"").split("|").map(x=>x.trim().toLowerCase());
const id=names[param[0]]?param[0]:CONFIG.species;
const requestedAge=["teen","baby","child","adult"].includes(param[1])?param[1]:CONFIG.age;
const freshSpecies=newer.includes(id);
const age=freshSpecies?requestedAge:"teen";
const asset=freshSpecies?newAtlasNames[age]:atlasNames.teen;
const cell=freshSpecies?[newer.indexOf(id)*192,0,192,192]:originals[id];
const fm=FileManager.local(),dir=fm.joinPath(fm.documentsDirectory(),"raaarrragochi");
if(!fm.fileExists(dir))fm.createDirectory(dir,true);
const cache=fm.joinPath(dir,asset);
let source;
try{
  if(!fm.fileExists(cache)){
    const request=new Request(BASE+asset);
    request.timeoutInterval=12;
    const image=await request.loadImage();
    fm.writeImage(cache,image);
  }
  source=fm.readImage(cache);
}catch(e){
  if(fm.fileExists(cache))source=fm.readImage(cache);
}
const w=new ListWidget();
w.backgroundColor=new Color("#16202c");
w.setPadding(10,10,10,10);
const title=w.addText("🦖 РААААРРРАГОЧІ");
title.font=Font.boldSystemFont(11);
title.textColor=new Color("#f4dca5");
w.addSpacer(3);
if(source){
  // Crop the committed transparent atlas without changing the pet's original face.
  const size=128,scale=Math.min(size/cell[2],size/cell[3]);
  const ctx=new DrawContext();
  ctx.size=new Size(size,size);ctx.opaque=false;ctx.respectScreenScale=true;
  ctx.drawImageInRect(source,new Rect(
    (size-cell[2]*scale)/2-cell[0]*scale,
    (size-cell[3]*scale)/2-cell[1]*scale,
    source.size.width*scale,source.size.height*scale
  ));
  const pet=w.addImage(ctx.getImage());pet.imageSize=new Size(92,92);pet.centerAlignImage();
}else{
  const t=w.addText("🐾 Немає з'єднання");t.textColor=Color.white();
}
const caption=w.addText(names[id]);
caption.centerAlignText();caption.font=Font.semiboldSystemFont(13);
caption.textColor=Color.white();
w.addSpacer(3);
const info=w.addText("Твій пет поруч ♡");
info.centerAlignText();info.font=Font.systemFont(10);info.textColor=new Color("#c8d4dd");
w.refreshAfterDate=new Date(Date.now()+CONFIG.refreshMinutes*60000);
if(config.runsInWidget)Script.setWidget(w);
else await w.presentSmall();
Script.complete();
