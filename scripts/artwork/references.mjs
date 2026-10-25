import fs from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const ids=['dino','cat','chicken','frog','corgi','bear','dog','bunny','pig','sheep','fox','monkey','duck','penguin'];
for(const stage of ['adults','babies','children','teens']){
 const cv=createCanvas(768,768),c=cv.getContext('2d');c.imageSmoothingEnabled=false;const cells={};
 for(const [i,id]of ids.entries()){const im=await loadImage(`tmp/visual-repair/${id}-${stage}.png`),x=i%4*192+(192-im.width)/2,y=Math.floor(i/4)*192+190-im.height;c.drawImage(im,Math.round(x),Math.round(y));cells[id]={x:Math.round(x),y:Math.round(y),w:im.width,h:im.height};}
 fs.writeFileSync(`tmp/visual-repair/reference-${stage}.png`,cv.toBuffer('image/png'));fs.writeFileSync(`tmp/visual-repair/reference-${stage}.json`,JSON.stringify(cells));
}
