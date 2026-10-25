import fs from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import sharp from 'sharp';
const ids=['pig','sheep','fox','monkey','duck','penguin'],atlas=createCanvas(224*3,224*2),ac=atlas.getContext('2d'),cells={};
for(const [i,id]of ids.entries()){
 const base=await loadImage(`tmp/visual-repair/${id}-adults.png`),child=await loadImage(`tmp/visual-repair/${id}-children.png`),seam=base.height-13,donorHeight=32,tailHeight=Math.round(donorHeight*base.width/child.width),cv=createCanvas(base.width,seam+tailHeight),c=cv.getContext('2d');c.imageSmoothingEnabled=false;
 c.drawImage(base,0,0);const limits={pig:[.21,.80],sheep:[.20,.82],fox:[.17,.69],monkey:[.23,.76],duck:[.16,.86],penguin:[.14,.87]}[id];c.save();c.beginPath();c.rect(Math.round(base.width*limits[0]),seam,Math.round(base.width*(limits[1]-limits[0])),tailHeight);c.clip();c.clearRect(0,seam,base.width,tailHeight);c.drawImage(child,0,child.height-donorHeight,child.width,donorHeight,0,seam,base.width,tailHeight);c.restore();
 if(id==='monkey')c.clearRect(0,Math.floor(cv.height*.62),Math.ceil(cv.width*.12),cv.height);fs.writeFileSync(`tmp/visual-repair/${id}-adults.png`,cv.toBuffer('image/png'));ac.drawImage(cv,i%3*224,Math.floor(i/3)*224);cells[id]=[i%3*224,Math.floor(i/3)*224,cv.width,cv.height];
}
fs.mkdirSync('public/art/wardrobe',{recursive:true});await sharp(atlas.toBuffer('image/png')).webp({lossless:true}).toFile('public/art/wardrobe/originals-adults.webp');fs.writeFileSync('public/repaired-source-manifest.js','// Complete feet from the same species original child artwork; original adult faces unchanged.\nexport const repairedSources='+JSON.stringify(cells)+';\n');
