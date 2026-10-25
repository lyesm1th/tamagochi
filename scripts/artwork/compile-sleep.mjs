import fs from 'node:fs';
import sharp from 'sharp';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {wardrobeSprites} from '../../public/wardrobe-sprite-manifest.js';
const body=process.env.GARMENT||'pajamas',input=process.env.SLEEP_ART||'../generated_images/exec-8d8a68f6-9555-46d6-98ad-d417a6c92469.png';
const refs=JSON.parse(fs.readFileSync('tmp/visual-repair/reference-sleep.json')),gen=await loadImage(await sharp(input).resize(768,768,{kernel:'nearest'}).png().toBuffer()),atlas=createCanvas(768,768),ac=atlas.getContext('2d'),review=createCanvas(768,896),rc=review.getContext('2d');wardrobeSprites.sleep={};
const purple=(d,q)=>{if(d[q+3]<128)return false;const [r,g,b]=[d[q],d[q+1],d[q+2]];return body==='pajamas'?b-g>12&&b-r>7&&r>55:body==='sweater'?r-g>22&&b-g> -8&&r-b>8&&r<215:r-g>10&&g-b>24&&r>100;};
for(const [i,[id,ref]]of Object.entries(refs).entries()){
 const base=await loadImage(`tmp/visual-repair/${id}-sleep.png`),w=base.width,h=base.height,cell=createCanvas(192,192),cc=cell.getContext('2d');cc.drawImage(gen,i%4*192,Math.floor(i/4)*192,192,192,0,0,192,192);const gd=cc.getImageData(0,0,192,192).data,original=createCanvas(w,h),oc=original.getContext('2d');oc.drawImage(base,0,0);const sd=oc.getImageData(0,0,w,h).data,lx=ref.x-i%4*192,ly=ref.y-Math.floor(i/4)*192;
 let best={score:Infinity,dx:0,dy:0};
 for(let dy=-7;dy<=7;dy++)for(let dx=-7;dx<=7;dx++){
  let score=0,n=0;for(let y=Math.floor(h*.25);y<h*.70;y+=3)for(let x=Math.floor(w*.15);x<w*.75;x+=3){const q=(y*w+x)*4,gx=Math.round(lx+x+dx),gy=Math.round(ly+y+dy);if(gx<0||gx>=192||gy<0||gy>=192||!sd[q+3])continue;const p=(gy*192+gx)*4;if(!gd[p+3]||purple(gd,p))continue;for(let k=0;k<3;k++)score+=Math.abs(sd[q+k]-gd[p+k]);n++;}
  if(n&&score/n<best.score)best={score:score/n,dx,dy};
 }
 const aligned=createCanvas(w,h),c=aligned.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(cell,-lx-best.dx,-ly-best.dy);const d=c.getImageData(0,0,w,h).data,mask=new Uint8Array(w*h),near=new Uint8Array(w*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
 const q=y*w+x;let allowed=true;
 if(id==='cat')allowed=x>w*.64&&y>h*.42&&y<h*.85;
 if(['dino','chicken','frog','bear','bunny'].includes(id))allowed=x>w*.55&&y>h*.40;
 if(['corgi','dog'].includes(id))allowed=x<w*.47&&y>h*.40;
 if(['pig','sheep','fox','monkey','duck','penguin'].includes(id))allowed=y>h*.63;
 if(allowed&&purple(d,q*4))mask[q]=1;
 }
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(mask[y*w+x])for(let yy=Math.max(0,y-2);yy<Math.min(h,y+3);yy++)for(let xx=Math.max(0,x-2);xx<Math.min(w,x+3);xx++)near[yy*w+xx]=1;
 const result=createCanvas(w,h),r=result.getContext('2d');r.drawImage(base,0,0);const p=r.getImageData(0,0,w,h);
 for(let q=0;q<w*h;q++){if(!near[q])continue;const k=q*4,[red,g,b]=[d[k],d[k+1],d[k+2]],cream=red>170&&g>155&&b>120&&red>=b,ink=Math.max(red,g,b)<105;if(d[k+3]<128||!mask[q]&&!cream&&!ink)continue;for(let j=0;j<3;j++)p.data[k+j]=d[k+j];p.data[k+3]=255;}
 r.putImageData(p,0,0);const face={dino:[0,0,.63,.83],cat:[.05,0,.73,.82],chicken:[0,0,.75,.85],frog:[.04,0,.82,.85],corgi:[.35,0,1,.88],bear:[0,0,.71,.88],dog:[.25,0,1,.87],bunny:[.22,0,.94,.89],pig:[.12,0,.88,.85],sheep:[.12,0,.85,.80],fox:[0,0,.80,.87],monkey:[.15,0,.87,.80],duck:[.16,0,.85,.83],penguin:[.12,0,.89,.80]}[id],fx=Math.floor(face[0]*w),fy=0,fw=Math.ceil((face[2]-face[0])*w),fh=Math.ceil(face[3]*h);r.drawImage(base,fx,fy,fw,fh,fx,fy,fw,fh);if(id==='cat')r.clearRect(0,0,12,h);ac.drawImage(result,i%4*192,Math.floor(i/4)*192);wardrobeSprites.sleep[id]=[i%4*192,Math.floor(i/4)*192,w,h];
 rc.fillStyle='#ded9cb';rc.fillRect(i%4*192,Math.floor(i/4)*224,192,224);rc.drawImage(result,i%4*192,Math.floor(i/4)*224+20);rc.fillStyle='#304d43';rc.font='14px sans-serif';rc.fillText(id,i%4*192+5,Math.floor(i/4)*224+215);
}
await sharp(atlas.toBuffer('image/png')).webp({lossless:true}).toFile(`public/art/wardrobe/sleep-${body}.webp`);fs.writeFileSync(`tmp/visual-repair/review-sleep-${body}.png`,review.toBuffer('image/png'));fs.writeFileSync('public/wardrobe-sprite-manifest.js','// Whole dressed sprites, compiled from original pets and authored fabric.\nexport const wardrobeSprites='+JSON.stringify(wardrobeSprites)+';\n');
