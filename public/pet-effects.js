const glyphs={heart:['01010','11111','11111','01110','00100'],z:['1111','0010','0100','1111'],poop:['001000','001100','011110','111111'],smile:['10001','01010','00100']};
function stamp(ctx,pattern,x,y,scale,color){ctx.fillStyle=color;pattern.forEach((row,j)=>[...row].forEach((v,i)=>{if(v==='1')ctx.fillRect(Math.round(x+i*scale),Math.round(y+j*scale),scale,scale);}));}
export function drawEffects(ctx,s,age,effect,now=Date.now(),reduced=false){
 if(!s||s.dead)return;const ink='#35482e',young=age==='Малюк';
 if(s.poop){for(let i=0;i<Math.min(4,s.poop);i++){stamp(ctx,glyphs.poop,10+i*19,85,2,'#765338');ctx.fillStyle='#f1dfb7';ctx.fillRect(15+i*19,91,2,2);ctx.fillRect(19+i*19,91,2,2);}}
 if(s.sleeping||s.napping){for(let i=0;i<3;i++){const cycle=reduced?0:((now/500+i)%3);stamp(ctx,glyphs.z,85+i*9,42-i*10-cycle*2,1+(i===2?1:0),ink);}return;}
 if(!effect||now>effect.until)return;
 const elapsed=now-effect.started,step=reduced?1:Math.floor(elapsed/180)%3;
 if(effect.kind==='pet'){
  // Smile replaces the tiny mouth; hearts rise in stepped LCD frames.
  ctx.fillStyle=s.species==='dog'?'#dc9ca4':s.species==='frog'?s.color||'#9bbf63':'#e8ecc3';ctx.fillRect(58,young?66:61,15,9);
  stamp(ctx,glyphs.smile,60,young?66:62,2,ink);
  for(let i=0;i<3;i++)stamp(ctx,glyphs.heart,35+i*24,37-((step+i)%3)*8,1+(i%2),'#b46c7c');
 }
 if(effect.kind==='feed'||effect.kind==='treat'){
  const milk=young,x=80-step*3,y=58+step;
  const r=(dx,dy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h);};
  if(milk){r(0,0,13,19,ink);r(2,2,9,15,'#f6f0d5');r(3,8+step*2,7,8-step*2,'#fffbed');r(3,-4,7,5,'#dca0a8');r(5,-7,3,4,'#c39160');r(5,4,5,2,'#8aabbd');}
  else{r(0,0,17,17,'#795431');r(2,2,13,13,'#c89b57');r(4,4,3,3,'#62462b');r(10,8,3,3,'#62462b');r(4,12,2,2,'#62462b');if(step>=1)r(-1,1,7,6,'#b7c294');if(step>=2)r(-1,6,10,8,'#b7c294');for(let i=0;i<3;i++)r(-8-i*4,14+(step+i)%3*3,2,2,'#c89b57');}
  ctx.fillStyle=ink;ctx.fillRect(62,young?66:63,step===1?7:4,step===1?5:2);
 }
 if(effect.kind==='clean'){for(let i=0;i<5;i++){ctx.fillStyle='#90b9be';ctx.fillRect(29+i*15,55+((step+i)%3)*9,3,3);}}
 if(effect.kind==='medicine'){ctx.fillStyle='#f0e6bc';ctx.fillRect(84,58,8,5);ctx.fillStyle='#bc808b';ctx.fillRect(88,58,4,5);}
}
