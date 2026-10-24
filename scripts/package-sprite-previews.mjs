import fs from 'node:fs';
import sharp from 'sharp';
const root=new URL('../docs/detailed-preview/',import.meta.url),dir=new URL('animation-qa/',root);
for(const style of ['classic','detailed'])for(const kind of ['sad','angry','amused']){
 const raw=[];let info;
 for(let f=0;f<7;f++){const r=await sharp(new URL(`${style}-${kind}-${f}.png`,dir).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});raw.push(r.data);info=r.info;}
 await sharp(Buffer.concat(raw),{raw:{width:info.width,height:info.height*7,channels:4,pageHeight:info.height}}).gif({loop:0,delay:[400,400,400,800,3000,4000,3000],effort:7}).toFile(new URL(`${style}-${kind}.gif`,dir).pathname);
}
for(const file of fs.readdirSync(dir))if(file.endsWith('.png'))fs.unlinkSync(new URL(file,dir));
const qa=new URL('sprite-qa/',root);for(const file of fs.readdirSync(qa))if(file.endsWith('.png')){await sharp(new URL(file,qa).pathname).jpeg({quality:88,chromaSubsampling:'4:4:4'}).toFile(new URL(file.replace('.png','.jpg'),qa).pathname);fs.unlinkSync(new URL(file,qa));}
const scenes=new URL('emotions-check/',root);for(const file of fs.readdirSync(scenes))if(file.endsWith('.png')){const p=new URL(file,scenes).pathname,b=await sharp(p).png({palette:true,colours:128,dither:0,compressionLevel:9}).toBuffer();fs.writeFileSync(p,b);}
// Keep the comparison in sync with the final game scenes.
const kinds=['sad','angry','amused','bored','grateful','curious'],composite=[];for(let i=0;i<kinds.length;i++)for(let j=0;j<2;j++){const b=await sharp(new URL(`${['classic','detailed'][j]}-${kinds[i]}-room.png`,scenes).pathname).resize(384,288,{kernel:'nearest'}).toBuffer();composite.push({input:b,left:j*392,top:i*296});}
await sharp({create:{width:776,height:1768,channels:3,background:'#f6f0e3'}}).composite(composite).jpeg({quality:88,chromaSubsampling:'4:4:4'}).toFile(new URL('comparison.jpg',scenes).pathname);
console.log('Packed six animated room previews, four age contact sheets and 72 outfit variants');
