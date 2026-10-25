// Hand-authored age-specific dinosaur prototype. No bitmap stretching.
const forms={
 'Малюк':{head:[42,32,29,27],body:[45,72,24,19],snout:[27,48,23,15],tail:[69,76,17,8],leg:9,spikes:3,eyes:[38,52,57,51]},
 'Дитина':{head:[43,29,26,24],body:[47,69,25,29],snout:[25,45,27,16],tail:[71,76,24,10],leg:12,spikes:4,eyes:[38,49,58,48]},
 'Підліток':{head:[42,25,24,23],body:[51,65,24,38],snout:[22,43,30,14],tail:[75,77,30,10],leg:16,spikes:5,eyes:[37,44,57,44]},
 'Дорослий':{head:[43,27,26,25],body:[51,67,30,36],snout:[24,45,29,15],tail:[80,77,31,13],leg:15,spikes:6,eyes:[38,47,59,47]},
 'Старенький':{head:[38,39,27,24],body:[54,72,30,29],snout:[17,56,31,14],tail:[81,83,29,9],leg:11,spikes:5,eyes:[34,58,55,57]}
};
const colors={edge:'#344e49',green:'#77bda5',light:'#a5dac0',shade:'#4e9d88',belly:'#eadab0',pink:'#e7a6b3',eye:'#1c3434',shine:'#fff9e9'};
function ellipse(c,x,y,rx,ry,fill){c.fillStyle=colors.edge;c.beginPath();c.ellipse(x,y,rx+2,ry+2,0,0,7);c.fill();c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();}
function poly(c,points,fill){c.fillStyle=colors.edge;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.lineWidth=4;c.strokeStyle=colors.edge;c.stroke();c.fillStyle=fill;c.fill();}
export function drawDinoAge(c,age,emotion='calm',time=0){
 const f=forms[age]||forms['Дорослий'];c.save();c.imageSmoothingEnabled=false;
 const [tx,ty,tw,th]=f.tail;poly(c,[[tx-8,ty-3],[tx+tw,ty-8],[tx+tw-7,ty+th],[tx-5,ty+th]],colors.shade);
 for(let i=0;i<f.spikes;i++){const x=62+i*5,y=47+i*6;poly(c,[[x-4,y+4],[x,y-7-(age==='Дорослий'?2:0)],[x+5,y+5]],colors.shade);}
 const [bx,by,bw,bh]=f.body;ellipse(c,bx+4,by+bh/2,bw/2,bh/2,colors.green);
 ellipse(c,bx-6,by+bh*.55,bw*.29,bh*.37,colors.belly);
 const legY=by+bh-5;for(const x of [bx-5,bx+15]){ellipse(c,x,legY+f.leg/2,6,f.leg/2,colors.shade);ellipse(c,x-2,legY+f.leg,8,4,colors.green);}
 const [hx,hy,hw,hh]=f.head;ellipse(c,hx,hy+hh/2,hw,hh,colors.green);
 const [sx,sy,sw,sh]=f.snout;ellipse(c,sx+sw/2,sy+sh/2,sw/2,sh/2,colors.light);
 // The face is authored for each age. Eyes retain their original glossy identity.
 const amused=emotion==='amused',sad=emotion==='sad',angry=emotion==='angry',surprised=emotion==='surprised';
 for(const x of f.eyes){const y=f.eyes[2]===x?f.eyes[3]:f.eyes[1];}
 const ey=f.eyes[2],ey2=f.eyes[3];for(const [x,y] of [[f.eyes[0],ey],[f.eyes[1],ey2]]){
   ellipse(c,x,y,4.5,amused?2:angry?3:surprised?5.5:4.5,colors.eye);
   c.fillStyle=colors.shine;c.fillRect(x-2,y-3,2,2);
 }
 ellipse(c,sx+sw*.24,sy+sh*.9,5,3,colors.pink);
 ellipse(c,sx+sw*.85,sy+sh*.76,5,3,colors.pink);
 const mx=sx+sw*.53,my=sy+sh*.66;c.fillStyle=colors.edge;
 if(amused||surprised){ellipse(c,mx,my,amused?5:3,amused?4+Math.abs(Math.sin(time/180))*2:6,'#a85665');}
 else if(sad){c.fillRect(mx-4,my+3,9,2);c.fillRect(mx-3,my+1,2,2);c.fillRect(mx+3,my+1,2,2);}
 else{ellipse(c,mx,my,4,2,'#aa5b6b');}
 if(age==='Старенький'){c.fillStyle=colors.light;c.fillRect(hx-11,hy+8,4,3);c.fillRect(hx+8,hy+6,4,3);}
 c.restore();
}
