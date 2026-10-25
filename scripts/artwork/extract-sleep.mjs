import fs from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {detailedArt} from '../../public/detailed-art-manifest.js';
import {isolateSprite} from '../../public/sprite-cleanup.js';
global.document={createElement:()=>createCanvas(1,1)};
const ids=['dino','cat','chicken','frog','corgi','bear','dog','bunny','pig','sheep','fox','monkey','duck','penguin'],cv=createCanvas(768,768),c=cv.getContext('2d'),cells={};
for(const [i,id]of ids.entries()){const key=detailedArt.sleep.cells[id]?'sleep':'new_sleep',a=detailedArt[key],im=await loadImage('public'+a.src),base=isolateSprite(im,a.cells[id],[192,192],key==='new_sleep');fs.writeFileSync(`tmp/visual-repair/${id}-sleep.png`,base.toBuffer('image/png'));const x=i%4*192+(192-base.width)/2,y=Math.floor(i/4)*192+190-base.height;c.drawImage(base,Math.round(x),Math.round(y));cells[id]={x:Math.round(x),y:Math.round(y),w:base.width,h:base.height};}
fs.writeFileSync('tmp/visual-repair/reference-sleep.png',cv.toBuffer('image/png'));fs.writeFileSync('tmp/visual-repair/reference-sleep.json',JSON.stringify(cells));
