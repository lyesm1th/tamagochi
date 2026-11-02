import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {detailedArt} from '../public/detailed-art-manifest.js';

// Export true original pixel sprites, not screenshots or invented stand-ins.
// Built by npm run build and uploaded along with Cloudflare static assets.
const base=new URL('../public/',import.meta.url);
const target=new URL('../public/assets/island/',import.meta.url);
const rows=[['baby','babies','new_babies'],['child','children','new_children'],['teen','teens','new_teens'],['adult','adults','new_adults'],['sleep','sleep','new_sleep'],['happy','happy','new_happy']];
let count=0;
for(const [state,classic,newer] of rows){
 await mkdir(fileURLToPath(new URL(state+'/',target)),{recursive:true});
 for(const key of [classic,newer]){
  const atlas=detailedArt[key];
  if(!atlas)throw Error('Missing sprite atlas '+key);
  const input=fileURLToPath(new URL('.'+atlas.src,base));
  for(const [species,coords] of Object.entries(atlas.cells)){
   const [left,top,width,height]=coords;
   const path=fileURLToPath(new URL(state+'/'+species+'.png',target));
   await sharp(input).extract({left,top,width,height}).resize(160,160,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}}).png({compressionLevel:9}).toFile(path);
   count++;
  }
 }
}
console.log('Island pixel sprites: '+count+' transparent PNG portraits');
