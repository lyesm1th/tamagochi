// Generate browsable contact sheets from the actual classic and detailed actor assets.
// Each sheet displays every playable species at one age, with eight wardrobe combinations.
// Usage: npm run visual:matrix (outputs ignored PNGs under artifacts/visual-evolution).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {species} from '../public/game.js';
import {detailedArt} from '../public/detailed-art-manifest.js';
import {isolateSprite} from '../public/sprite-cleanup.js';
import {loadWardrobeAssets,dressedBody,wearHeadwear,wearNeckwear} from '../public/authored-wardrobe.js';
import {petAnatomy} from '../public/pet-anatomy.js';
import {drawClassicActor} from '../public/classic-actor.js';
import {applySeniorPatina} from '../public/age-appearance.js';

const root=fileURLToPath(new URL('../public/',import.meta.url));
const target=path.resolve(process.argv[2]||'artifacts/visual-evolution');
const stages={babies:'Малюк',children:'Дитина',teens:'Підліток',adults:'Дорослий',seniors:'Старенький'};
export const visualVariants=[
 {label:'Без одягу',wearing:{}},
 {label:'Светр',wearing:{body:'sweater'}},
 {label:'Дощовик',wearing:{body:'raincoat'}},
 {label:'Піжама',wearing:{body:'pajamas'}},
 {label:'Шарф',wearing:{neck:'scarf'}},
 {label:'Бант',wearing:{neck:'bow'}},
 {label:'Панама',wearing:{head:'panama'}},
 {label:'Корона й окуляри',wearing:{head:'crown',eyes:'glasses'}}
];
const sourceImage=src=>loadImage(path.join(root,src.replace(/^\//,'')));
const assetCache=new Map();
async function atlas(name){
 if(!assetCache.has(name))assetCache.set(name,await sourceImage(detailedArt[name].src));
 return assetCache.get(name);
}
function cropped(image,rect){
 const c=createCanvas(rect[2],rect[3]);
 c.getContext('2d').drawImage(image,...rect,0,0,rect[2],rect[3]);
 return c;
}
async function sourceSprite(id,sheet){
 const key=detailedArt[sheet].cells[id]?sheet:'new_'+sheet;
 const desc=detailedArt[key];
 return isolateSprite(await atlas(key),desc.cells[id],[192,192],key.startsWith('new_'));
}
async function clothesArt(name){
 const c=detailedArt.clothing.cells[name];return c?cropped(await atlas('clothing'),c):null;
}
function glasses(c,base,id,sheet,pad,art){
 const a=petAnatomy[id]?.[sheet];if(!a||!art)return;
 const eyes=a.eyes.map(b=>[(b[0]+b[2])/2,(b[1]+b[3])/2]);
 const gap=eyes[1][0]-eyes[0][0],ww=gap*2.1,hh=ww*art.height/art.width;
 c.drawImage(art,Math.round(pad+(eyes[0][0]+eyes[1][0])/2-ww/2),Math.round(pad+(eyes[0][1]+eyes[1][1])/2-hh*.43),Math.round(ww),Math.round(hh));
}
async function detailedActor(id,sheet,wearing,age){
 sheet=sheet==='seniors'?'adults':sheet;
 const base=await sourceSprite(id,sheet);
 const pad=42,c=createCanvas(base.width+pad*2,base.height+pad*2),ctx=c.getContext('2d');
 ctx.imageSmoothingEnabled=false;ctx.drawImage(dressedBody(base,id,sheet,wearing.body),pad,pad);
 if(wearing.neck)wearNeckwear(ctx,id,sheet,wearing.neck,pad,base);
 if(wearing.head)wearHeadwear(ctx,base,await clothesArt(wearing.head),id,sheet,wearing.head,pad);
 if(wearing.eyes==='glasses')glasses(ctx,base,id,sheet,pad,await clothesArt('glasses'));
 applySeniorPatina(c,age);
 return c;
}
function classicActor(id,age,wearing){
 const c=createCanvas(128,100),s={species:id,id:'visual-matrix-'+id,cozy:{wearing},happy:80,energy:80,health:90,born:0};
 drawClassicActor(c.getContext('2d'),id,age,'#a6ba80',0,s,true);
 return c;
}
export async function renderVisualMatrix(){
 fs.mkdirSync(target,{recursive:true});
 globalThis.document={createElement:()=>createCanvas(1,1)};
 await loadWardrobeAssets(sourceImage);
 const columns=visualVariants.length,cellW=170,cellH=184,header=78,labelWidth=112;
 const files=[];
 for(const [sheet,age] of Object.entries(stages))for(const style of ['classic','detailed']){
  const width=labelWidth+columns*cellW,height=header+species.length*cellH;
  const cv=createCanvas(width,height),c=cv.getContext('2d');
  c.fillStyle='#f5f0df';c.fillRect(0,0,width,height);
  c.fillStyle='#304b3e';c.font='bold 21px sans-serif';c.fillText('РААААРРРРРРАГОЧІ · '+age+' · '+style,16,29);
  c.font='13px sans-serif';c.fillText('14 видів · '+columns+' комплектів · джерельний силует без заміни',16,52);
  c.font='12px sans-serif';
  for(const [j,{label}] of visualVariants.entries())c.fillText(label,labelWidth+j*cellW+8,header-9);
  for(const [i,{id,name}] of species.entries()){
   const y=header+i*cellH;
   c.fillStyle=i%2?'#e8e7d9':'#f6f3e8';c.fillRect(0,y,width,cellH);
   c.fillStyle='#344e40';c.font='bold 13px sans-serif';c.fillText(name||id,8,y+28);
   c.font='11px monospace';c.fillText(id,8,y+44);
   for(const [j,{wearing}] of visualVariants.entries()){
    const sprite=style==='classic'?classicActor(id,age,wearing):await detailedActor(id,sheet,wearing,age);
    const scale=Math.min(155/sprite.width,153/sprite.height,style==='classic'?1.35:1);
    const sw=sprite.width*scale,sh=sprite.height*scale,x=labelWidth+j*cellW+(cellW-sw)/2;
    c.imageSmoothingEnabled=false;c.drawImage(sprite,Math.round(x),Math.round(y+8+(160-sh)/2),Math.round(sw),Math.round(sh));
   }
  }
  const outfile=path.join(target,sheet+'-'+style+'.png');
  fs.writeFileSync(outfile,cv.toBuffer('image/png'));files.push(outfile);
  process.stdout.write(outfile+'\n');
 }
 return files;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 renderVisualMatrix().catch(e=>{console.error(e);process.exitCode=1;});
}
