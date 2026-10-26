import {loadWardrobeAssets,repairedOriginal,dressedBody,wearHeadwear,wearNeckwear} from './authored-wardrobe.js';
import {getRecent,storeRecent} from './wardrobe-cache.js';
import {cachedExpressionFrame} from './wardrobe-expression-cache.js';
import {emotionalAppearance,expressionFrame,withEmotionalPose} from './pet-expression.js';
import {petAnatomy} from './pet-anatomy.js';
import {enrichmentPose,enrichPose,drawEnrichment,transformEnriched} from './room-enrichment.js';
import {roomRects,roomMoment,roomMomentPose,drawRoomResponse,withRoomGesture} from './room-life.js';
import {drawBanana} from './new-pet-art.js';
import {drawItemVariant,drawToyVariant,drawDesignAccent,designFilter,designIndex,drawBowlBadge} from './item-designs.js';
import {drawMood,drawLighting} from './room-mood.js';
import {drawRoomJournal,drawDoodle} from './journal-effects.js';
import {wardrobeAnatomy} from './detailed-wardrobe.js';
import {socialScene,drawSocialScene} from './social-scenes.js';
import {drawLively} from './lively.js';
import {isolateSprite} from './sprite-cleanup.js';
import {detailedArt} from './detailed-art-manifest.js';
import {stage} from './game.js';
import {foodFor} from './pet-personality.js';
import {isNight} from './cozy-life.js';
import {sceneFurniture} from './cozy-effects.js';
import {careForm,weatherAt} from './little-world.js';
const sprites=new Map(),dressedSprites=new Map();
const images=new Map();let loaded=false,loading=null;
export const detailedReady=()=>loaded;
export function loadDetailedAssets(){if(typeof Image==='undefined')return Promise.resolve(false);if(loading)return loading;loading=Promise.all(Object.entries(detailedArt).map(([name,asset])=>new Promise((resolve,reject)=>{const image=new Image(),timer=setTimeout(()=>reject(Error('art timeout '+name)),20000);image.onload=()=>{clearTimeout(timer);try{images.set(name,image);const grid=name==='props'?[128,128]:name==='furniture'?[192,asset.height/4]:[192,192];if(!['walks'].includes(name))for(const [key,rect]of Object.entries(asset.cells)){const sprite=isolateSprite(image,rect,name==='furniture'?null:grid,name.startsWith('new_'));if(key==='monkey')sprite.getContext('2d').clearRect(0,Math.floor(sprite.height*.62),Math.ceil(sprite.width*.12),sprite.height);if(name==='sleep'&&key==='cat')sprite.getContext('2d').clearRect(0,0,12,sprite.height);sprites.set(name.replace(/^new_/,'')+':'+key,sprite);};resolve();}catch(error){reject(error);}};image.onerror=()=>{clearTimeout(timer);reject(Error('art missing '+name));};image.src=asset.src;}))).then(()=>loadWardrobeAssets()).then(()=>{for(const id of ['pig','sheep','fox','monkey','duck','penguin']){const base=repairedOriginal(id);if(base)sprites.set('adults:'+id,base);}return loaded=true;}).catch(()=>{loading=null;return false;});return loading;}
const active=(effect,now)=>effect&&effect.until>now?effect.kind:null;
function stamp(c,sheet,key,x,y,w,h,options={}){const image=sprites.get(sheet+':'+key)||images.get(sheet),rect=sprites.has(sheet+':'+key)?[0,0,image.width,image.height]:detailedArt[sheet]?.cells?.[key];if(!image||!rect)return false;c.save();c.imageSmoothingEnabled=false;if(options.alpha!=null)c.globalAlpha=options.alpha;if(options.filter)c.filter=options.filter;if(options.rotate){c.translate(Math.round(x+w/2),Math.round(y+h/2));c.rotate(options.rotate);x=-w/2;y=-h/2;}c.drawImage(image,...rect,Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));c.restore();return true;}
function background(c,key,w=384,h=288){const image=images.get(key);if(!image)return;c.imageSmoothingEnabled=false;c.drawImage(image,0,0,image.width,image.height,0,0,w,h);}
export const proceduralProps=new Set(['banana']);
function prop(c,key,x,y,size=36,h=size,options){if(key==='banana'){drawBanana(c,x,y,size,h);return true;}return stamp(c,'props',key,x,y,size,h,options);}
function shade(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}

const treasureMasks={cap:['0011111100','0112222110','1123333211','1232222321','1232222321','1123333211','0112222110','0011111100'],stone:['0001110000','0012221100','0122333210','1223333321','1222333321','0122222210','0011111100','0000000000'],feather:['0000011100','0000122210','0001233210','0012332100','0123321000','0123210000','0012100000','0001000000'],button:['0011111100','0122222210','1223323321','1221121121','1223323321','1221121121','0122222210','0011111100'],shell:['0011111100','0122222210','1232323231','1232323231','0123232310','0012323100','0001111000','0000000000']};
function treasure(c,id,x,y,size=22){if(id==='leaf'){prop(c,'leaf',x,y,size);return;}const mask=treasureMasks[id]||treasureMasks.stone,pal={cap:['#67596d','#aa94b6','#d3bfdc'],stone:['#65716b','#9eafa4','#cdd5c7'],feather:['#8c795a','#c5b17e','#eee2b5'],button:['#856373','#bf94a7','#edd0d5'],shell:['#987966','#d7b29b','#f2ddbf']}[id]||['#65716b','#9eafa4','#cdd5c7'],unit=size/10;for(let yy=0;yy<mask.length;yy++)for(let xx=0;xx<10;xx++){const bit=Number(mask[yy][xx]);if(bit)shade(c,x+xx*unit,y+yy*unit,Math.ceil(unit),Math.ceil(unit),pal[bit-1]);}}

function ageOf(s){return s?.portraitStage||s&&stage(s)||'Дорослий';}
function sheetOf(s,effect,now){const age=ageOf(s);if(s?.sleeping||s?.napping)return 'sleep';if(age==='Малюк')return 'babies';if(age==='Дитина')return 'children';if(age==='Підліток')return 'teens';if(s?.sleeping||s?.napping)return 'sleep';return 'adults';} // Keep the original face and fitted silhouette during care actions.
const ageScale=age=>age==='Малюк'?.40:age==='Дитина'?.64:age==='Підліток'?.84:age==='Старенький'?.94:1;
// Clothing positions are normalized to each atlas sprite, not the old rectangular body.
export function detailedAnchors(species,age){const a=wardrobeAnatomy(species,age);return {eyes:a.eyes,neck:a.neck,torso:a.top+a.height/2,head:a.hat,age};}
// Compose one complete dressed actor. All scene movement uses this bitmap.
export function dressedSprite(pet,id,age,sheet,now=Date.now(),reduced=false,expressive=true,sharedAppearance=null){
 const base=sprites.get(sheet+':'+id);if(!base)return null;
 const wearing=pet.cozy?.wearing||{},sleep=!!(pet.sleeping||pet.napping),key=JSON.stringify([id,age,sheet,sleep,...['body','neck','head','eyes'].map(slot=>wearing[slot])]);
 let result=getRecent(dressedSprites,key);
 if(!result){
  const pad=Math.ceil(base.height*.40),cv=document.createElement('canvas');cv.width=base.width+pad*2;cv.height=base.height+pad*2;const ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
  ctx.drawImage(dressedBody(base,id,sheet,wearing.body),pad,pad);
  if(!sleep){wearNeckwear(ctx,id,sheet,wearing.neck,pad,base);wearHeadwear(ctx,base,sprites.get('clothing:'+wearing.head),id,sheet,wearing.head,pad);
   if(wearing.eyes==='glasses'){const a=petAnatomy[id]?.[sheet];if(a){const eyes=a.eyes.map(b=>[(b[0]+b[2])/2,(b[1]+b[3])/2]),gap=eyes[1][0]-eyes[0][0],art=sprites.get('clothing:glasses'),ww=gap*2.1,hh=ww*art.height/art.width;ctx.drawImage(art,Math.round(pad+(eyes[0][0]+eyes[1][0])/2-ww/2),Math.round(pad+(eyes[0][1]+eyes[1][1])/2-hh*.43),Math.round(ww),Math.round(hh));}}
  }
  result={image:cv,pad,width:base.width,height:base.height};storeRecent(dressedSprites,key,result,128);
 }
 if(!expressive||sleep||id==='dino')return result;
 const appearance=sharedAppearance??emotionalAppearance(pet,now,reduced);if(!appearance.strength)return result;
 // Expression transforms sample only the already dressed actor's original pixels.
 return {...result,image:cachedExpressionFrame(result.image,id,sheet,appearance,result.pad,expressionFrame)};
}
function sparkles(c,x,y,frame,reduced){for(let i=0;i<3;i++){const yy=y-i*12-(reduced?0:Math.floor(frame/300+i)%3*3);shade(c,x+i*13,yy,2,7,'#dfbb66');shade(c,x+i*13-2,yy+2,6,2,'#dfbb66');}}
function dreamCloud(c,x,y,frame,reduced){c.save();c.fillStyle='#f5f0db';c.strokeStyle='#b7bea4';c.lineWidth=1;const bob=reduced?0:Math.sin(frame/700);for(const [dx,dy,r]of [[10,39,2],[16,33,3]]){c.beginPath();c.arc(x+dx,y+dy+bob,r,0,Math.PI*2);c.fill();}c.beginPath();c.moveTo(x+11,y+30);c.bezierCurveTo(x-4,y+29,x-1,y+13,x+10,y+12);c.bezierCurveTo(x+8,y-1,x+29,y-3,x+33,y+7);c.bezierCurveTo(x+47,y-1,x+60,y+9,x+56,y+18);c.bezierCurveTo(x+69,y+30,x+51,y+40,x+42,y+33);c.bezierCurveTo(x+31,y+41,x+18,y+35,x+11,y+30);c.fill();c.stroke();c.restore();}
function effects(c,s,box,effect,frame,reduced){const now=Date.now(),kind=active(effect,now),{x,y,w,h}=box,beat=reduced?1:Math.floor(frame/220)%3;
 if(s.sleeping||s.napping){for(let i=0;i<3;i++){c.fillStyle='#8d7baf';c.font=`bold ${10+i*3}px monospace`;c.fillText('z',x+w*.8+i*12,y+h*.2-i*15-(reduced?0:beat*2));}if(s.world?.dream){const bx=Math.max(4,Math.min(c.canvas.width-64,x+w*.4)),by=Math.max(5,y-53+(reduced?0:Math.sin(frame/900)*2));dreamCloud(c,bx,by,frame,reduced);const icon=s.world.dream.icon==='pond'?'water':['heart','fish','ball','berry','cookie','carrot','grain','grass'].includes(s.world.dream.icon)?s.world.dream.icon:'leaf';prop(c,icon,bx+20,by+9,24,24);}return;}
 if(kind==='pet'||kind==='ritual'||kind==='gift'){for(let i=0;i<2;i++)prop(c,'heart',x-4+i*(w+3),y+h*.2-beat*8-i*8,23);}
 if(kind==='feed'||kind==='treat'){const food=effect.food||foodFor(s.species,ageOf(s),kind),fw=food==='milk'?w*.30:w*.27,fh=food==='milk'?h*.38:h*.25;prop(c,food,x+w*.52-beat*2,y+h*.42+beat,fw,fh);if(food!=='milk')for(let i=0;i<3;i++)shade(c,x+w*.6-i*6,y+h*.63+beat*2+i*3,2,2,'#c39c66');}
 if(kind==='medicine')prop(c,'medicine',x+w*.75,y+h*.55,27,34);
 if(kind==='clean'||kind==='bath'){prop(c,'tub',x-w*.15,y+h*.7,w*1.3,h*.35);for(let i=0;i<7;i++){c.strokeStyle='#dce8df';c.lineWidth=1;c.strokeRect(Math.round(x+i*w/7),Math.round(y+h*.45-(i+beat)%3*8),4,4);}}
 if(kind==='groom')prop(c,s.species==='frog'?'sponge':'brush',x+w*.67-beat*4,y+h*.22+beat*5,w*.35,h*.24);
 if(kind==='blanket')prop(c,'blanket',x-w*.05,y+h*.63,w*1.1,h*.36);
 if(kind==='cook'){prop(c,'pot',x+w*.65,y+h*.66,50,40);shade(c,x+w*.9,y+h*.54-beat*3,2,12,'#e8e6ca');}
 if(kind==='party'){stamp(c,'clothing','crown',x+w*.28,y-18,w*.45,24);for(let i=0;i<10;i++)shade(c,x-w*.3+i*w*.17,y-15+(i+beat)%3*9,3,4,['#dfb7cb','#a9c48d','#e2c47e'][i%3]);prop(c,'cookie',x-w*.5,y+h*.75,34);}if(kind==='human'){prop(c,'blanket',x-w*.2,y+h*.8,w*1.4,h*.25);prop(c,'heart',x+w*.9,y+12,22);}if(kind==='treasure'||kind==='mischief'){treasure(c,s.daily?.lastFind?.id||'stone',x+w*.75,y+h*.4,25);}if(kind==='music'){prop(c,'music',x+w*.8,y+h*.7,38);for(let i=0;i<3;i++){shade(c,x+w*.85+i*9,y+h*.45-(i+beat)%3*7,2,9,'#9782b5');shade(c,x+w*.85+i*9-3,y+h*.45+7-(i+beat)%3*7,5,3,'#9782b5');}}
 if(kind==='craft'||kind==='trick')sparkles(c,x-10,y+10,frame,reduced);
 if(kind==='hide')prop(c,'heart',x+w*.8,y-5,18);
}
export function drawDetailedPet(c,s,id,x,feet,height,effect,frame=0,reduced=false){const pet=s||{species:id,portraitStage:'Дорослий'},age=ageOf(pet);if(pet.dead){prop(c,'tombstone',x-height*.32,feet-height*.65,height*.64,height*.65);prop(c,'angel',x-height*.20,feet-height*.95,height*.40,height*.33);return;}
 if(age==='Яєчко'){const wobble=reduced?0:Math.sin(frame/230)*.05;prop(c,'egg',x-height*.23,feet-height*.60,height*.46,height*.60,{rotate:wobble});return;}
 const now=Date.now(),sheet=sheetOf(pet,effect,now),rect=detailedArt[sheet]?.cells?.[id]||detailedArt['new_'+sheet]?.cells?.[id];if(!rect)return;const sprite=sprites.get(sheet+':'+id),ratio=sprite?sprite.width/sprite.height:rect[2]/rect[3],w=Math.min(height*1.3,height*ratio)*(age==='Малюк'?1.14:age==='Дитина'?1.08:age==='Підліток'?.88:1),h=height,box={x:x-w/2,y:feet-h,w,h};
 // A single atlas style is used everywhere, including albums and the sandbox.
 const appearance=emotionalAppearance(pet,now,reduced);withEmotionalPose(c,id==='dino'?{...appearance,strength:0}:appearance,x,feet,()=>{const dressed=dressedSprite(pet,id,age,sheet,now,reduced,!active(effect,now),appearance);if(dressed){c.save();c.imageSmoothingEnabled=false;if(age==='Старенький'&&id!=='dino')c.filter='grayscale(.72) saturate(.6)';const px=dressed.pad*w/dressed.width,py=dressed.pad*h/dressed.height;c.drawImage(dressed.image,0,0,dressed.image.width,dressed.image.height,Math.round(box.x-px),Math.round(box.y-py),Math.round(w+px*2),Math.round(h+py*2));c.restore();}else stamp(c,sheet,id,box.x,box.y,w,h);
 if(pet.appearance){const col=pet.appearance.color||'#bba16b';shade(c,box.x+w*.25,box.y+h*.79,3,3,col);if(pet.appearance.mark==='stripe')shade(c,box.x+w*.25,box.y+h*.83,4,1,col);}
 if(!pet.sleeping&&!pet.napping&&careForm(pet)==='radiant')sparkles(c,box.x-8,box.y+h*.2,frame,reduced);if(careForm(pet)==='scruffy'){shade(c,box.x+w*.72,box.y+h*.82,4,3,'#9a8a70');shade(c,box.x+w*.76,box.y+h*.86,3,2,'#9a8a70');}
 effects(c,pet,box,effect,frame,reduced);},reduced);
}
function layout(s){return Object.fromEntries(Object.entries(roomRects(s,'detailed')).map(([id,rect])=>[id,rect.map(n=>n*2)]));}
export function detailedFurnitureKey(id,variant=0){const beds=['bed','bedSoft','bedCloud'];return id==='bed'?beds[Number.isInteger(variant)&&variant>=0&&variant<beds.length?variant:0]:id;}
export function detailedFurniturePolicy(id){return {base:'detailed-atlas',variant:id==='plant'||id==='shelf'?'full-replacement':id==='bowl'?'atlas-badge':'accent-only'};}
// Detailed plant design variants use volume, ink outlines and shaded facets,
// rather than substituting the classic 32px block-painted plant sprite.
function drawDetailedPlantVariant(c,s,x,y,w,h){
 const variant=designIndex(s,'plant');if(!variant)return;
 // Preserve the atlas pot and soil under the variant canopy.
 const cx=x+w*.51,top=y+h*.07,base=y+h*.72,thick=Math.max(5,w*.115);
 const drawStem=(px,py,ww,hh)=>{
  c.fillStyle='#344f43';c.fillRect(Math.round(px-2),Math.round(py-2),Math.round(ww+4),Math.round(hh+4));
  c.fillStyle='#5b8d68';c.fillRect(Math.round(px),Math.round(py),Math.round(ww),Math.round(hh));
  c.fillStyle='#add19a';c.fillRect(Math.round(px+ww*.24),Math.round(py+2),Math.max(1,Math.round(ww*.20)),Math.max(1,Math.round(hh-4)));
 };
 c.save();c.beginPath();c.rect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));c.clip();
 // One freshly drawn pot; do not retain the incompatible plant from the atlas.
 c.fillStyle='#51493a';c.fillRect(Math.round(x+w*.23),Math.round(y+h*.68),Math.round(w*.54),Math.round(h*.29));
 c.fillStyle='#aa8966';c.fillRect(Math.round(x+w*.26),Math.round(y+h*.71),Math.round(w*.48),Math.round(h*.23));
 c.fillStyle='#d6b68c';c.fillRect(Math.round(x+w*.22),Math.round(y+h*.66),Math.round(w*.56),Math.max(3,Math.round(h*.07)));
 if(variant===1){
  drawStem(cx-thick*.6,top,thick,base-top);
  drawStem(cx-thick*1.8,top+(base-top)*.37,thick*.76,(base-top)*.32);
  drawStem(cx+thick*.6,top+(base-top)*.48,thick*.76,(base-top)*.30);
  c.fillStyle='#e3a7af';c.fillRect(Math.round(cx-thick*.2),Math.round(top-3),Math.round(thick*.8),4);
 }else if(variant===2){
  for(const [dx,dy,r] of [[-.20,.30,.18],[.12,.23,.19],[0,.10,.16]]){
   c.fillStyle='#344f43';c.beginPath();c.arc(cx+dx*w,top+dy*h,r*w+2,0,Math.PI*2);c.fill();
   c.fillStyle='#74a17a';c.beginPath();c.arc(cx+dx*w,top+dy*h,r*w,0,Math.PI*2);c.fill();
   c.fillStyle='#b2cd93';c.beginPath();c.arc(cx+dx*w-r*w*.26,top+dy*h-r*w*.22,r*w*.46,0,Math.PI*2);c.fill();
  }
 }else if(variant===3){
  drawStem(cx-thick*.5,top+(base-top)*.20,thick,base-top);
  for(const [dx,dy,rad] of [[-.14,.24,.16],[.14,.13,.19],[.06,.34,.15]]){
   c.fillStyle='#344f43';c.beginPath();c.arc(cx+dx*w,top+dy*h,rad*w+2,0,Math.PI*2);c.fill();
   c.fillStyle='#7aa673';c.beginPath();c.arc(cx+dx*w,top+dy*h,rad*w,0,Math.PI*2);c.fill();
  }
 }else{
  for(const dx of [-.25,-.08,.1,.25])drawStem(cx+dx*w,top+(Math.abs(dx)*h*.2),thick*.65,base-top-h*.10);
 }
 c.restore();
}
// Alternative shelves are complete detailed objects, never classical accents over a shelf.
export function detailedVariantRenderMode(id,variant){return variant>0&&['plant','shelf'].includes(id)?'replacement':'atlas';}
function drawDetailedShelfVariant(c,s,x,y,w,h,variant){
 c.save();
 const X=v=>Math.round(x+v*w),Y=v=>Math.round(y+v*h);
 const rect=(a,b,ww,hh,color)=>shade(c,X(a),Y(b),Math.max(1,Math.round(ww*w)),Math.max(1,Math.round(hh*h)),color);
 // Full shaded wood frame, shelf edge and brackets.
 rect(.035,.70,.93,.17,'#4c3c39');rect(.045,.70,.91,.10,variant===1?'#9c779c':'#9a7557');
 rect(.06,.71,.88,.035,'#e6c79a');rect(.08,.81,.14,.13,'#55443a');rect(.77,.81,.14,.13,'#55443a');
 rect(.09,.83,.11,.065,'#bb9477');rect(.79,.83,.11,.065,'#bb9477');
 const books=variant===1?['#bd87a3','#7fa3b3','#d2b382','#91ac90','#bf91b9']:['#b88b98','#b5aa80','#88a6a0','#d1b58f','#b19bc1'];
 const widths=[.105,.085,.116,.09,.103],heights=[.49,.58,.44,.54,.37];let px=.13;
 for(let i=0;i<books.length;i++){
  const bh=heights[i],bw=widths[i],top=.70-bh;
  rect(px-.01,top-.025,bw+.025,bh+.045,'#504a43');
  rect(px,top,bw,bh,books[i]);rect(px+.014,top+.045,.022,bh-.07,'#e6d7b6');
  rect(px,top+.10,bw,.025,'#e5cfaa');rect(px,top+bh-.085,bw,.032,'#705f56');
  px+=bw+.035;
 }
 // Variant 2 includes one *separate* tiny flower pot beside the books.
 if(variant===2){
  rect(.78,.49,.13,.19,'#514a3d');rect(.80,.52,.09,.13,'#b78d67');
  rect(.76,.46,.17,.046,'#e0bd8c');
  rect(.83,.25,.025,.22,'#52795e');
  for(const [dx,dy]of [[.79,.35],[.87,.30],[.82,.21]]){rect(dx-.025,dy-.022,.072,.08,'#435949');rect(dx-.012,dy-.008,.045,.05,'#85aa7c');}
  rect(.827,.195,.025,.03,'#d6a0af');
 }
 c.restore();
}
function furniture(c,s,id,rect,frame,reduced){if(!rect||rect.length!==4||!rect.every(Number.isFinite))return;const [x,y,w,h]=rect,wear=s.cozy?.items?.[id]?.wear??100,variant=s.living?.furniture?.[id]||0,key=detailedFurnitureKey(id,variant);
 c.save();if(wear<=0){c.translate(x+w*.5,y+h);c.rotate((id==='shelf'||id==='mirror'?.16:-.12));stamp(c,'furniture',key,-w*.5,-h*.72,w,h*.72,{filter:'saturate(.65) brightness(.85)'});}else {
 // Detailed mode must NEVER replace a textured atlas sprite with the
 // 32x32 procedural classic variant (especially plant/cactus and bowl).
 // Each item owns exactly one body. Plant variants replace the canopy, not overlay it.
 if(id==='plant'&&designIndex(s,'plant'))drawDetailedPlantVariant(c,s,x,y,w,h);
 else if(id==='shelf'&&designIndex(s,'shelf'))drawDetailedShelfVariant(c,s,x,y,w,h,designIndex(s,'shelf'));
 else stamp(c,'furniture',key,x,y,w,h,{filter:wear<35?'saturate(.75) brightness(.9)':id==='bed'?undefined:designFilter(s,id)});
 if(id==='bowl')drawBowlBadge(c,s,x+w*.31,y+h*.42,w*.39,h*.48);
 if(id!=='shelf'&&id!=='plant')drawDesignAccent(c,s,id,x,y,w,h);
}c.restore();
 if(wear<65){shade(c,x+w*.54,y+h*.5,2,8,'#6f5847');shade(c,x+w*.56,y+h*.56,4,2,'#6f5847');}if(wear<30){prop(c,'debris',x+w*.4,y+h-4,w*.4,16);if(['bed','cushion','tent','rug','curtains'].includes(id))prop(c,'cotton',x+w*.12,y+h+4,18,12);}
 if(s.living?.motion?.item===id&&s.living.motion.until>Date.now()&&!reduced){const b=Math.floor(frame/180)%2;if(s.living.motion.kind==='gentle')sparkles(c,x+w*.5,y,frame,reduced);if(id==='fountain'||id==='bowl'){shade(c,x+w*.3,y-3-b*5,2,4,'#bad8d9');shade(c,x+w*.7,y-7+b*4,2,4,'#bad8d9');}if(id==='mirror')prop(c,'heart',x+w*.35,y+h*.35,14);}
}
// Detailed scenes retain journal data but never paint enlarged classic doodles.
export function drawDetailedWallKeepsakes(c,s){
 const j=s?.journal;if(!j)return;
 const framed=(x,y,w,h,drawing)=>{
  // Preserve the authored drawing's actual subject (pet + friend, food, or
  // owner). A wall painting is intentionally illustrated, not a pet portrait.
  c.save();c.imageSmoothingEnabled=false;
  c.fillStyle='#57463a';c.fillRect(x-4,y-4,w+8,h+8);
  c.fillStyle='#cfae7b';c.fillRect(x-2,y-2,w+4,h+4);
  drawDoodle(c,drawing,x+2,y+2,w-4,h-4);
  c.restore();
 };
 const row=j.drawings?.find(d=>d.id===j.pinned);
 if(row)framed(280,34,86,66,row);
 if(j.familyArt)framed(294,116,56,44,j.familyArt);
}
// Render transient marks from the detailed prop atlas instead of scaled classic pixels.
export function drawDetailedRoomTraces(c,s,now=Date.now()){
 const traces=s?.living?.enrichment?.traces||[],rects=roomRects(s,'detailed');
 for(const trace of traces){if(trace.until<=now||trace.item==='rug')continue;
  const a=rects[trace.item]||rects.rug||[70,105,40,20];
  const x=Math.round((a[0]+a[2]/2)*2),y=Math.min(270,Math.round((a[1]+a[3])*2));
  const key=trace.kind==='book'?'heart':trace.kind==='wet'?'water':trace.kind==='blanket'||trace.kind==='pillow'?'blanket':'leaf';
  prop(c,key,x-11,y-19,22,19);
 }
}
export function drawDetailedRoom(c,s,frame=0,reduced=false,now=Date.now()){background(c,'empty-room');drawMood(c,s,384,288,true);const pos=layout(s),owned=id=>s?.room?.[id]||s?.cozy?.owned?.[id];stamp(c,'furniture','window',27,17,103,98);if(s?.room?.box!==false){shade(c,65,255,48,26,'#9e805e');shade(c,67,257,44,22,'#c6ab83');shade(c,67,257,12,22,'#b0946f');shade(c,84,257,8,22,'#e0caa1');shade(c,64,251,50,7,'#d3bc95');shade(c,103,265,6,3,'#876f54');drawDesignAccent(c,s,'box',65,251,48,29);}
 for(const id of ['rug','curtains','shelf','mirror','bed','tent','plant','lamp','cushion','post','fountain','bowl','toybox'])if(owned(id))furniture(c,s,id,pos[id],frame,reduced);
 // Current mechanics remain visible: poop, messes, handmade items, souvenirs, stories.
 if(s?.playroom?.crafted?.stoneArt){c.save();c.fillStyle='#584a3d';c.fillRect(211,11,51,43);c.fillStyle='#d4c3a5';c.fillRect(215,15,43,35);stamp(c,'props','leaf',220,19,20,25);stamp(c,'props','heart',240,24,13,12);c.restore();}
 if(s?.playroom?.crafted?.mobile){shade(c,pos.bed[0]+53,10,1,36,'#997d5b');shade(c,pos.bed[0]+32,44,42,1,'#997d5b');prop(c,'leaf',pos.bed[0]+30,45,12,18);treasure(c,'shell',pos.bed[0]+62,45,16);}
 if(s?.playroom?.decor?.display)treasure(c,s.playroom.decor.display,326,255,18);
 if(s?.heirloom)prop(c,'gift',259,68,19);
 if(s?.living?.finished?.[0]||s?.living?.story?.step&&!(s.living.story.chapter>0)){stamp(c,'props','pot',280,246,32,28);prop(c,'leaf',283,219,21,32);if(s.living.finished?.[0]||s.living.story.step>=3)prop(c,'heart',288,211,16);}
 const stash=Object.keys(s?.daily?.stash||{}).filter(id=>s.daily.stash[id]>0);for(let i=0;i<Math.min(4,stash.length);i++)treasure(c,stash[i],11+i*15,270-i%2*3,14);if(s?.daily?.kind?.kind==='warm')prop(c,'blanket',258,269,101,22);
 if(s?.daily?.mess)for(let i=0;i<5;i++){if(s.daily.mess.kind==='puddle')shade(c,66+i*44,269+i%2*5,14,3,'#9dbbbb');else prop(c,'debris',66+i*44,267+i%2*5,17,8);}
 if(s?.poop)for(let i=0;i<Math.min(4,s.poop);i++)prop(c,'poop',28+i*32,263,25,22);
 const run=s?.playroom?.session;if(run?.expires>now){const x=68+run.target*30;if(run.kind==='laser'){shade(c,x,245,4,4,['#d28687','#82b680','#d8c47a'][designIndex(s,'laser')]);shade(c,x-1,246,6,1,'#efb2a4');}else{if(run.kind==='music'){prop(c,'music',x,240,43);drawDesignAccent(c,s,'music',x,240,43,43);}else if(!drawToyVariant(c,s,x,240,19,19))prop(c,'ball',x,240,19);if(run.kind==='ball'&&s.playroom.crafted?.featherToy)treasure(c,'feather',x+10,229,15);}}
 else if((s?.room?.toy||s?.playroom?.toys?.ball)&&!(s?.living?.enrichment?.session?.until>now)&&!(s?.journal?.gesture?.kind==='ball'&&s.journal.gesture.until>now)){if(!drawToyVariant(c,s,264,253,23,23))prop(c,'ball',264,253,23);}
 if(s?.daily?.celebration)for(let i=0;i<7;i++)prop(c,'heart',38+i*48,12+i%2*8,10);
 c.save();c.scale(2,2);drawRoomJournal(c,s,{drawPictures:false});c.restore();drawDetailedWallKeepsakes(c,s);drawDetailedRoomTraces(c,s,now);const weather=weatherAt(now);if(weather.id!=='sun'){shade(c,42,33,70,27,'#c4d0c166');if(weather.id==='rain'||weather.id==='storm')for(let i=0;i<8;i++)shade(c,39+i*9,61+(reduced?i%3:Math.floor(frame/220+i)%3)*7,1,6,'#799eab');}
 if(s?.cozy?.nightMode&&isNight(s,now)){shade(c,0,0,384,288,'#253b5455');const moon=['0011100','0110000','1100000','1100001','1110011','0111110','0011100'];for(let yy=0;yy<7;yy++)for(let xx=0;xx<7;xx++)if(moon[yy][xx]==='1')shade(c,103+xx*2,32+yy*2,2,2,'#eee3af');if(owned('lamp')){c.fillStyle='#f4dca822';c.beginPath();c.arc(pos.lamp[0]+pos.lamp[2]/2,pos.lamp[1]+22,43,0,Math.PI*2);c.fill();}if(!reduced)for(let i=0;i<5;i++)shade(c,38+i*68,220+Math.sin(frame/1100+i)*16,2,2,'#dfdc96');}
}
function outdoor(c,s){if(s.world?.walk?.expires>Date.now()){const key=s.world.walk.place==='forest'?'forest':s.world.walk.place==='pond'?'pond':null;if(key)stamp(c,'walks',key,0,0,384,288);else background(c,'playground');return true;}return false;}
// Render live room effects in native detailed pixels, not scaled classic
// fillRect overlays. This applies to every species and age without retouching
// their authored bodies or integrated wardrobe.
export function drawDetailedInteractionFeedback(c,s,pose,now=Date.now(),reduced=false){
 const action=pose?.interaction,step=reduced?0:Math.floor(now/250)%3;
 const ambient=pose?.ambient;if(ambient&&['scratch','dig','stomp','slide','waddle','swing','prowl'].includes(ambient.kind)){prop(c,'leaf',Math.round(pose.x*2+15),Math.round(pose.feet*2-55),14,14);}
 if(action?.acting){
  const x=Math.round(pose.x*2),y=Math.round(pose.feet*2);
  const symbol={faces:'heart',drink:'water',splash:'water',gentle:'water',sniff:'leaf',
   read:'leaf',play:'ball',search:'gift',peek:'gift',shadow:'heart',
   stretch:'leaf',roll:'blanket',jump:'heart',ask:'heart',outfit:'heart',
   nest:'blanket',repair:'heart',doze:'blanket'}[action.kind];
  if(symbol)prop(c,symbol,Math.min(354,x+25+step*2),Math.max(8,y-86-step*3),22,22);
 }
 const v=pose?.enriched||{},run=s?.living?.enrichment?.session;
 if(run?.until>now&&v.point){
  const x=Math.round(v.point.x*2),y=Math.round(v.point.y*2);
  const key=run.kind==='feather'?'leaf':run.kind==='yarn'?'blanket':'ball';
  if(key==='ball'&&!drawToyVariant(c,s,x-14,y-16,28,28))prop(c,'ball',x-14,y-16,28,28);
  else if(key!=='ball')prop(c,key,x-14,y-16,28,28);
 }
 if(v.kind==='stroke'||v.kind==='tickle'||v.kind==='nose')
  prop(c,'heart',Math.round(pose.x*2+30),Math.round(pose.feet*2-92-step*3),18,18);
}
export function drawDetailedMain(canvas,s,id,frame=0,reduced=false,pos=null,effect=null){canvas.width=384;canvas.height=288;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;const pet=s||{species:id,portraitStage:'Дорослий'};if(!outdoor(c,pet))drawDetailedRoom(c,pet,frame,reduced);
 if(pet.vacation){prop(c,'blanket',105,188,170,62);drawDetailedPet(c,pet,id,192,244,126,null,frame,reduced);c.fillStyle='#f4ebd3';c.fillRect(112,17,160,27);c.fillStyle='#4e6555';c.font='bold 13px monospace';c.fillText('HOTEL · PAUSE',131,36);return;}
 const point=pos||{x:96,feet:128,scale:1},age=ageOf(pet),asleep=(pet.sleeping||pet.napping)&&!!pet.room?.bed&&!(pet.world?.walk?.expires>Date.now()),bed=layout(pet).bed,height=asleep?Math.min(142*point.scale*ageScale(age),bed[3]*.85):142*point.scale*ageScale(age),x=asleep?bed[0]+bed[2]/2:point.x*2,feet=asleep?bed[1]+bed[3]-12:point.feet*2;
 if(asleep&&pet.cozy?.wearing?.head)stamp(c,'clothing',pet.cozy.wearing.head,bed[0]+bed[2]+4,bed[1]+bed[3]-25,34,23);
 if(pet.cozy?.hide?.expires>Date.now()){const p=layout(pet),target=p[pet.cozy.hide.spot]||[8,234,52,40];c.save();c.beginPath();c.rect(target[0]-8,target[1]-22,target[2]+16,24);c.clip();drawDetailedPet(c,pet,id,target[0]+target[2]*.6,target[1]+65,78,null,frame,reduced);c.restore();return;}
 c.fillStyle='#635a4226';c.beginPath();c.ellipse(x,feet-2,height*.27,Math.max(3,height*.045),0,0,Math.PI*2);c.fill();if(point.ambient?.kind==='warm'){c.save();c.translate(x,feet-height*.30);c.rotate(-Math.PI/2);drawDetailedPet(c,pet,id,0,height*.4,height*.8,effect,frame,reduced);c.restore();}else if(point.ambient?.kind!=='turned')transformEnriched(c,pet,{...point,x,feet},()=>withRoomGesture(c,{...point,x,feet},()=>drawDetailedPet(c,pet,id,x,feet-(!point.quiet&&!reduced&&!pet.sleeping&&!pet.napping?Math.round(Math.sin(frame/650)*1):0),height,effect,point.quiet?1200:frame,reduced),Date.now(),reduced),Date.now(),reduced);// Detailed mode owns its gestures: never scale the classic floor scratches by 2x.{c.save();drawDetailedInteractionFeedback(c,pet,point,Date.now(),reduced);c.restore();}drawLighting(c,pet,384,288);if(pet.cozy?.nightMode&&isNight(pet))shade(c,0,0,384,288,'#253b541a');
}
export function drawDetailedPortrait(canvas,id,s,frame=0,preview=false,effect=null,reduced=false){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;drawDetailedPet(c,s,id,canvas.width/2,canvas.height*.95,canvas.height*.9*ageScale(ageOf(s)),preview?null:effect,frame,reduced);}
export function drawDetailedSandbox(canvas,s,pets,selected=0,frame=0,reduced=false,scenes=[],selfId=null){canvas.width=384;canvas.height=288;const c=canvas.getContext('2d');background(c,'playground');const scene=socialScene(scenes),roster=[{id:selfId,species:s.species,look:s},...pets];const page=Math.floor(selected/6),shown=pets.slice(page*6,page*6+6);for(const [i,p]of shown.entries()){if(scene?.actors.includes(p.id))continue;const x=56+i%3*135,y=170+Math.floor(i/3)*73;drawDetailedPet(c,{...p.look,species:p.species,portraitStage:p.look?.portraitStage||'Дорослий'},p.species,x,y,72*ageScale(p.look?.portraitStage),null,frame,reduced);if(page*6+i===selected)prop(c,'heart',x-7,y-86,15);}
 if(!scene?.actors.includes(selfId))drawDetailedPet(c,s,s.species,195,282,85*ageScale(ageOf(s)),null,frame,reduced);if(scene){c.save();c.scale(2,1.85);drawSocialScene(c,scene,roster,(p,x,y,h)=>drawDetailedPet(c,{...p.look,species:p.species},p.species,x,y,h,null,frame,reduced),Date.now(),reduced);c.restore();}
}
export function drawDetailedMiniGame(canvas,g,s,now=Date.now()){canvas.width=384;canvas.height=198;const c=canvas.getContext('2d');background(c,'playground',384,198);const phase=Math.max(0,Math.min(1,(now-g.roundAt)/2600));if(g.kind==='direction'){c.fillStyle='#344e42';c.font='bold 65px monospace';c.fillText(g.target%2===0?'←':'→',158,104);drawDetailedPet(c,s,s.species,g.chosen===-1?105:g.chosen===1?280:192,191,67,null,now,true);}else if(g.kind==='jump'){drawDetailedPet(c,s,s.species,87,183-(now<(g.jumpUntil||0)?43:0),71,null,now,true);prop(c,'debris',345-phase*295,147,34,35);}else{prop(c,g.kind==='bug'?'fly':'apple',46+g.target*123,g.kind==='food'?15+phase*130:72,38,34);drawDetailedPet(c,s,s.species,63+g.cursor*123,192,65,null,now,true);}}

export function drawDetailedFamily(canvas,s,scene,frame=0,reduced=false){canvas.width=384;canvas.height=288;const c=canvas.getContext('2d');drawDetailedRoom(c,s,frame,reduced);c.imageSmoothingEnabled=false;c.drawImage(scene.parent,41,127,145,114);c.drawImage(scene.partner,199,127,145,114);prop(c,'heart',170,93,42);}

export function detailedPose(s,pose,reduced=false){if(s?.farewellPreview)return pose;return enrichPose(s,enrichmentPose(s,roomRects(s,'detailed'),Date.now(),reduced)||roomMomentPose(s,roomMoment(s),'detailed',Date.now(),reduced)||pose,Date.now(),reduced);}

export function drawDetailedDreamProp(c,key,x,y,w,h=w){return prop(c,key,x,y,w,h);}

export function detailedSelectionBounds(s,id){return id==='toy'||id==='ball'?[258,247,38,36]:id==='laser'?[164,233,40,32]:id==='music'?[160,233,56,50]:layout(s)[id]||null;}
