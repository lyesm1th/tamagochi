// Generate browsable contact sheets from the actual classic and detailed actor assets.
// Each sheet displays every playable species at one age, with eight wardrobe combinations.
// Usage: npm run visual:matrix (outputs ignored PNGs under artifacts/visual-evolution).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas,Image} from '@napi-rs/canvas';
import {species} from '../public/game.js';
import {drawClassicActor} from '../public/classic-actor.js';
import {loadDetailedAssets,drawDetailedPortrait} from '../public/detailed-renderer.js';
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
function detailedActor(id,sheet,wearing,age){
 const canvas=createCanvas(160,160),pet={species:id,portraitStage:age,cozy:{wearing},happy:85,energy:85,health:85};
 drawDetailedPortrait(canvas,id,pet,0,true,null,true);
 return canvas;
}
function classicActor(id,age,wearing){
 const c=createCanvas(128,100),s={species:id,id:'visual-matrix-'+id,cozy:{wearing},happy:80,energy:80,health:90,born:0};
 drawClassicActor(c.getContext('2d'),id,age,'#a6ba80',0,s,true);
 return c;
}
export async function renderVisualMatrix(){
 fs.mkdirSync(target,{recursive:true});
 const previous={document:globalThis.document,Image:globalThis.Image};
 try{
 globalThis.document={createElement:()=>createCanvas(1,1)};
 class LocalImage extends Image{set src(src){super.src=path.join(root,src.replace(/^\//,''));}}
 globalThis.Image=LocalImage;
 if(!await loadDetailedAssets())throw Error('Detailed assets unavailable for visual matrix');
 const columns=visualVariants.length,cellW=170,cellH=184,header=78,labelWidth=112;
 const files=[];
 for(const [sheet,age] of Object.entries(stages))for(const style of ['classic','detailed']){
  const width=labelWidth+columns*cellW,height=header+species.length*cellH;
  const cv=createCanvas(width,height),c=cv.getContext('2d');
  c.fillStyle='#f5f0df';c.fillRect(0,0,width,height);
  c.fillStyle='#304b3e';c.font='bold 21px sans-serif';c.fillText('РААААРРРРРРАГОЧІ · '+age+' · '+style,16,29);
  c.font='13px sans-serif';c.fillText('14 видів · '+columns+' комплектів · той самий рендер, що й у грі',16,52);
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
 }finally{globalThis.document=previous.document;globalThis.Image=previous.Image;}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 renderVisualMatrix().catch(e=>{console.error(e);process.exitCode=1;});
}
