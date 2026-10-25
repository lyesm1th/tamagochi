import fs from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import sharp from 'sharp';
import {wardrobeSprites as existing} from '../../public/wardrobe-sprite-manifest.js';
import {petAnatomy} from '../../public/pet-anatomy.js';
const inputs={babies:'../generated_images/exec-79e32ede-4eea-4040-97f3-ffd93cb29ec3.png',teens:'../generated_images/exec-d3914b14-2d68-483e-9d92-6ae7a8dd79d6.png'};
const ids=['dino','cat','chicken','frog','corgi','bear','dog','bunny','pig','sheep','fox','monkey','duck','penguin'];
const bounds={dino:[.56,.84,.11,.68],cat:[.62,.86,.15,.77],chicken:[.61,.85,.12,.87],frog:[.55,.85,.12,.86],corgi:[.63,.86,.12,.89],bear:[.59,.84,.12,.88],dog:[.64,.87,.12,.89],bunny:[.69,.89,.14,.89],pig:[.64,.88,.14,.88],sheep:[.65,.89,.13,.90],fox:[.68,.88,.11,.77],monkey:[.64,.88,.18,.77],duck:[.61,.87,.12,.88],penguin:[.62,.89,.08,.92]};
const youngTop={dino:[.64,.61,.50],cat:[.66,.65,.59],chicken:[.65,.63,.57],frog:[.63,.60,.51],corgi:[.66,.65,.57],bear:[.64,.64,.56],dog:[.67,.66,.59],bunny:[.71,.70,.65],pig:[.70,.65,.60],sheep:[.71,.68,.65],fox:[.73,.71,.65],monkey:[.68,.66,.62],duck:[.66,.64,.57],penguin:[.67,.64,.60]};
function eyeCenter(d,w,h,ex,ey){
 const seen=new Uint8Array(w*h),parts=[];for(let yy=Math.max(0,Math.floor(ey-22));yy<Math.min(h,ey+22);yy++)for(let xx=Math.max(0,Math.floor(ex-22));xx<Math.min(w,ex+22);xx++){
 const q=yy*w+xx;if(seen[q]||d[q*4+3]<128||Math.max(d[q*4],d[q*4+1],d[q*4+2])>100)continue;const list=[q];seen[q]=1;let l=w,r=0,t=h,b=0;
 for(let k=0;k<list.length;k++){const p=list[k],x=p%w,y=Math.floor(p/w);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);for(const n of [x>0?p-1:-1,x<w-1?p+1:-1,y>0?p-w:-1,y<h-1?p+w:-1])if(n>=0&&!seen[n]&&d[n*4+3]>=128&&Math.max(d[n*4],d[n*4+1],d[n*4+2])<=100){seen[n]=1;list.push(n);}}
 if(list.length>=9&&r-l<28&&b-t<28)parts.push({x:(l+r)/2,y:(t+b)/2,d:Math.hypot((l+r)/2-ex,(t+b)/2-ey)});
 }return parts.sort((a,b)=>a.d-b.d)[0]||{x:ex,y:ey};
}
const body=process.env.GARMENT||'pajamas',manifest=structuredClone(existing);const dir='public/art/wardrobe';fs.mkdirSync(dir,{recursive:true});
for(const stage of ['babies','children','teens','adults']){
 const file=process.env['SHIRT_'+stage.toUpperCase()]||(body==='pajamas'?inputs[stage]:null);if(!file)continue;
 const refs=JSON.parse(fs.readFileSync(`tmp/visual-repair/reference-${stage}.json`)),gen=await loadImage(await sharp(file).resize(768,768,{kernel:'nearest'}).png().toBuffer());
 const atlas=createCanvas(224*4,224*4),ac=atlas.getContext('2d'),review=createCanvas(192*4,224*4),rc=review.getContext('2d');rc.imageSmoothingEnabled=false;
 for(const [i,id]of ids.entries()){
  const ref=refs[id],base=await loadImage(`tmp/visual-repair/${id}-${stage}.png`),w=base.width,h=base.height,a=petAnatomy[id][stage],cell=createCanvas(192,192),cc=cell.getContext('2d');cc.drawImage(gen,i%4*192,Math.floor(i/4)*192,192,192,0,0,192,192);const gd=cc.getImageData(0,0,192,192).data;
  const sex=a.eyes.map(e=>(e[0]+e[2])/2),sey=a.eyes.reduce((v,e)=>v+(e[1]+e[3])/4,0),found=sex.map(x=>eyeCenter(gd,192,192,ref.x-i%4*192+x,ref.y-Math.floor(i/4)*192+sey));
  const scale=(sex[1]-sex[0])/(found[1].x-found[0].x),gcx=(found[0].x+found[1].x)/2,gcy=(found[0].y+found[1].y)/2,scx=(sex[0]+sex[1])/2,syScale=(190-(ref.y-Math.floor(i/4)*192+sey))/(190-gcy);
  const aligned=createCanvas(w,h),al=aligned.getContext('2d');al.imageSmoothingEnabled=false;al.drawImage(cell,scx-gcx*scale,sey-gcy*syScale,192*scale,192*syScale);const ad=al.getImageData(0,0,w,h).data;
  let [top,bottom,left,right]=bounds[id];if(stage!=='adults')top=youngTop[id][['babies','children','teens'].indexOf(stage)];top*=ref.h/h;bottom*=ref.h/h;
  const layer=createCanvas(w,h),lc=layer.getContext('2d'),p=lc.createImageData(w,h),mask=new Uint8Array(w*h),near=new Uint8Array(w*h),original=createCanvas(w,h),oc=original.getContext('2d');oc.drawImage(base,0,0);const sd=oc.getImageData(0,0,w,h).data;
  const isPurple=q=>{if(ad[q+3]<128)return false;const [r,g,b]=[ad[q],ad[q+1],ad[q+2]];return body==='pajamas'?b-g>12&&b-r>7&&r>55:body==='sweater'?r-g>22&&b-g> -8&&r-b>8&&r<215:r-g>10&&g-b>24&&r>100;};
  for(let y=Math.floor(h*top);y<h*bottom;y++)for(let x=Math.floor(w*left);x<w*right;x++){const q=y*w+x;if(isPurple(q*4))mask[q]=1;}
  // Keep connected shirt fabric, then its nearby cream trims and dark seams.
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const q=y*w+x;if(!mask[q])continue;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(x+dx>=0&&x+dx<w&&y+dy>=h*top&&y+dy<h*bottom)near[(y+dy)*w+x+dx]=1;}
  for(let q=0;q<w*h;q++){const k=q*4;if(!near[q]||ad[k+3]<128)continue;const [r,g,b]=[ad[k],ad[k+1],ad[k+2]],cream=r>170&&g>155&&b>120&&r>=b,ink=Math.max(r,g,b)<105; if(!mask[q]&&!cream&&!ink)continue;
   // Preserve the source face and every pixel outside the authored shirt region.
   p.data[k]=r;p.data[k+1]=g;p.data[k+2]=b;p.data[k+3]=255;
  }
  lc.putImageData(p,0,0);const dressed=createCanvas(w,h),dc=dressed.getContext('2d');dc.drawImage(base,0,0);dc.drawImage(layer,0,0);
  // Explicit cut boundary protects the unchanged original head, including muzzle.
  dc.drawImage(base,0,0,w,Math.floor(top*h),0,0,w,Math.floor(top*h));
  ac.drawImage(dressed,i%4*224,Math.floor(i/4)*224);manifest[stage]??={};manifest[stage][id]=[i%4*224,Math.floor(i/4)*224,w,h];
  rc.fillStyle='#ded9cb';rc.fillRect(i%4*192,Math.floor(i/4)*224,192,224);rc.drawImage(dressed,i%4*192+(192-w)/2,Math.floor(i/4)*224+8);rc.fillStyle='#304d43';rc.font='14px sans-serif';rc.fillText(id+' '+stage,i%4*192+5,Math.floor(i/4)*224+215);
  fs.writeFileSync(`tmp/visual-repair/${id}-${stage}-${body}-dressed.png`,dressed.toBuffer('image/png'));fs.writeFileSync(`tmp/visual-repair/${id}-${stage}-${body}-fabric.png`,layer.toBuffer('image/png'));
 }
 await sharp(atlas.toBuffer('image/png')).webp({lossless:true}).toFile(`${dir}/${stage}-${body}.webp`);fs.writeFileSync(`tmp/visual-repair/review-${stage}-${body}.png`,review.toBuffer('image/png'));
}
fs.writeFileSync('public/wardrobe-sprite-manifest.js','// Whole dressed sprites, compiled from original pets and authored fabric.\nexport const wardrobeSprites='+JSON.stringify(manifest)+';\n');
