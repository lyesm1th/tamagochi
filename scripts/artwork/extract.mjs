import fs from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {detailedArt} from '../../public/detailed-art-manifest.js';
import {isolateSprite} from '../../public/sprite-cleanup.js';
global.document={createElement:()=>createCanvas(1,1)};
const all=createCanvas(14*192,4*224),c=all.getContext('2d');c.imageSmoothingEnabled=false;
const ids=['dino','cat','chicken','frog','corgi','bear','dog','bunny','pig','sheep','fox','monkey','duck','penguin'];
for(const [j,stage]of ['adults','babies','children','teens'].entries())for(const [i,id]of ids.entries()){
 const a=detailedArt[stage].cells[id]?detailedArt[stage]:detailedArt['new_'+stage];const im=await loadImage('public'+a.src),b=isolateSprite(im,a.cells[id],[192,192],!detailedArt[stage].cells[id]);
 if(id==='monkey')b.getContext('2d').clearRect(0,Math.floor(b.height*.62),Math.ceil(b.width*.12),b.height);fs.writeFileSync(`tmp/visual-repair/${id}-${stage}.png`,b.toBuffer('image/png'));
 c.fillStyle='#e0d9c9';c.fillRect(i*192,j*224,192,224);c.drawImage(b,i*192+(192-b.width)/2,j*224+20);c.fillStyle='#304539';c.font='14px sans-serif';c.fillText(`${id} ${stage} ${b.width}x${b.height}`,i*192+2,j*224+216);
}
fs.writeFileSync('tmp/visual-repair/originals.png',all.toBuffer('image/png'));
