const make=names=>names.map((name,i)=>({name,price:i===0?0:8+(i%3)*4}));
export const itemDesigns={
 bowl:make(['Класична мисочка','Для корівки','Для котика','Для курочки','Для жабки','Для коргі','Для ведмедика','Для динозаврика','Для кролика']),
 toy:make(['Плямистий м’яч','Клубочок','Кісточка','Гумове кільце','Качечка','Зоряний м’яч']),
 plant:make(['Листяна рослина','Кактус','Квітучий кущик','Бонсай','Сукулент']),
 rug:make(['Листочки','Смугастий','Зоряний','Квітковий']),shelf:make(['Книжкова','Веселкова','Квіти й книжки']),lamp:make(['Квіткова','Зоряний абажур','Смугастий абажур']),
 tent:make(['Затишний намет','Зоряний будиночок','Лісовий будиночок']),cushion:make(['Класична','У смужку','Із сердечком','Зоряна']),fountain:make(['Квітковий','Зоряний','З лататтям']),
 mirror:make(['Дерев’яне','Квіткова рама','Зоряна рама']),post:make(['Класичний','З м’ячиком','З пір’їнкою']),curtains:make(['Квіткові','У смужку','Зоряні','У горошок']),toybox:make(['Дерев’яна скринька','Піратська скриня','Хмарна скринька']),box:make(['Картонна','Будиночок','Подарункова']),
 laser:make(['Червона цятка','Зелена цятка','Зоряна цятка']),music:make(['Класична скринька','Квіткова скринька','Зоряна скринька'])};
export const designKey=id=>id==='ball'?'toy':id;
export const designsFor=id=>itemDesigns[designKey(id)]||[];
export function designIndex(s,id){const key=designKey(id),n=Number(s?.living?.furniture?.[key]??s?.living?.furniture?.[id]??0);return Number.isInteger(n)&&n>=0&&n<designsFor(id).length?n:0;}
export function designName(s,id){return designsFor(id)[designIndex(s,id)]?.name||'';}
export function nextDesign(s,id){const key=designKey(id),list=designsFor(id),index=(designIndex(s,id)+1)%list.length,item=list[index];return item?{...item,index,price:index===0||s?.living?.designs?.[key]?.includes(index)?0:item.price}:null;}
const colors=['#bda3c7','#d5b17c','#83aa92','#92a9c5','#cd9e9b'];
export function designFilter(s,id){const i=designIndex(s,id);return i?`hue-rotate(${[0,28,-28,60][i%4]}deg)`:undefined;}
function painter(c,x,y,w,h){return (xx,yy,ww,hh,color)=>{c.fillStyle=color;c.fillRect(Math.round(x+xx*w/32),Math.round(y+yy*h/32),Math.max(1,Math.round(ww*w/32)),Math.max(1,Math.round(hh*h/32)));};}
function disk(r,x,y,rad,col){for(let yy=-rad;yy<=rad;yy++)for(let xx=-rad;xx<=rad;xx++)if(xx*xx+yy*yy<=rad*rad)r(x+xx,y+yy,1,1,col);}
const badges={dog:['10000001','11011011','01111110','01011010','01111110','00111100','00100100'],cat:['11000011','11100111','01111110','01011010','01111110','00100100','00011000'],chicken:['00011000','00111100','01111110','01011010','00111100','00011000','00100100'],frog:['01100110','11111111','10111101','01111110','01100110','00111100','01100110'],corgi:['11000011','11100111','01111110','01011010','01111110','00111100','00100100'],bear:['01100110','11111111','01111110','01011010','01111110','00111100','00011000'],dino:['00111000','01111100','01011010','01111111','00111110','01111100','01100110'],bunny:['01100110','01100110','01100110','01111110','01011010','01111110','00111100']};
export function drawItemVariant(c,s,id,x,y,w,h){const i=designIndex(s,id),r=painter(c,x,y,w,h),ink='#405747';if(!i)return false;
 if(id==='bowl'){const species=['dog','cat','chicken','frog','corgi','bear','dino','bunny'][i-1],col=colors[(i-1)%colors.length];r(5,9,22,3,ink);r(3,12,26,15,ink);r(1,19,30,8,ink);r(3,16,26,10,col);r(5,12,22,5,'#ece4cf');r(7,13,18,3,'#77553d');r(6,17,20,2,'#f0dfc7');r(5,26,22,2,ink);const mask=badges[species];for(let yy=0;yy<mask.length;yy++)for(let xx=0;xx<8;xx++)if(mask[yy][xx]==='1')r(12+xx,19+yy,1,1,ink);return true;}
 if(id==='plant'){r(10,21,13,10,'#7b634e');r(11,22,11,8,colors[i%5]);r(8,20,17,3,'#d6b58b');r(13,24,2,5,'#ead8b8');
  if(i===1){r(12,5,9,16,ink);r(13,5,7,15,'#85ae72');r(13,6,2,14,'#b2c78b');r(7,11,7,4,ink);r(6,7,4,8,'#85ae72');r(20,14,7,4,ink);r(24,9,4,9,'#85ae72');for(let k=0;k<4;k++)r(16,7+k*3,1,1,'#d7d7a4');disk(r,16,4,2,'#dc9caa');}
  if(i===2){disk(r,15,17,8,'#547c51');disk(r,14,16,6,'#86a56d');r(15,10,2,11,'#587c50');for(const [xx,yy]of [[10,11],[21,8],[16,5]]){disk(r,xx,yy,4,'#b87591');disk(r,xx,yy,3,'#e4a8b7');disk(r,xx,yy,1,'#ead38b');r(xx,yy+4,1,10-yy/2,'#75935e');}}
  if(i===3){r(13,11,4,10,'#816348');r(16,8,7,3,'#816348');disk(r,20,7,7,'#53794e');disk(r,19,6,5,'#85a469');disk(r,10,12,6,'#53794e');disk(r,10,11,4,'#92b079');}
  if(i===4){for(const [xx,yy]of [[8,14],[21,13],[13,8],[18,8]]){r(xx,yy,4,12,'#4f7968');r(xx+1,yy+1,2,9,'#97ba94');}r(13,16,8,5,'#6d9982');}return true;}
 return false;
}
export function drawToyVariant(c,s,x,y,w,h){const i=designIndex(s,'toy');if(!i)return false;const r=painter(c,x,y,w,h);return drawToyPixels(r,i);}
function drawToyPixels(r,i){const ink='#43594c';if(i===1||i===5){disk(r,16,16,13,ink);disk(r,16,16,11,i===1?'#b798c7':'#849bb9');for(let yy=8;yy<26;yy+=4)r(7,yy,18,1,'#e1c9dc');if(i===5){r(15,7,3,17,'#eed48e');r(9,13,15,3,'#eed48e');}return true;}
 if(i===2){r(7,13,18,7,ink);for(const xx of [6,25])for(const yy of [12,20])disk(r,xx,yy,5,ink);r(7,14,18,5,'#eee1bd');for(const xx of [6,25])for(const yy of [12,20])disk(r,xx,yy,3,'#eee1bd');return true;}
 if(i===3){for(let yy=1;yy<31;yy++)for(let xx=1;xx<31;xx++){const d=(xx-16)**2+(yy-16)**2;if(d<190&&d>55)r(xx,yy,1,1,d>155||d<75?'#476e7b':'#8db7bf');}return true;}
 if(i===4){disk(r,15,20,10,ink);disk(r,15,19,8,'#e4c66f');disk(r,19,10,7,ink);disk(r,19,10,5,'#efd582');r(23,11,7,3,'#bd874c');r(19,8,2,2,ink);r(9,19,9,4,'#c8a858');return true;}return false;}
export function drawDesignAccent(c,s,id,x,y,w,h){const i=designIndex(s,id);if(!i||['plant','bowl','toy','ball'].includes(id))return;const r=painter(c,x,y,w,h),col=colors[i%colors.length],ink='#55654e';
 const star=(xx,yy)=>{r(xx,yy-2,1,5,col);r(xx-2,yy,5,1,col);},flower=(xx,yy)=>{disk(r,xx,yy,3,col);r(xx,yy,1,1,'#f1d58b');};
 if(id==='cushion'&&i===2){r(9,10,5,5,'#dc9ca4');r(18,10,5,5,'#dc9ca4');r(11,14,10,5,'#dc9ca4');r(14,19,4,3,'#dc9ca4');}
 else if(['rug','cushion','curtains','tent'].includes(id)){for(let k=0;k<6;k++){const xx=4+k*5,yy=8+(k%2)*9;if(id==='tent'){if(i===1)star(xx,yy);else {r(xx,yy,2,6,'#8eac78');r(xx-1,yy+1,4,2,'#8eac78');}}else if(id==='rug'&&i===3)flower(xx,yy);else if(i%3===1)r(xx,4,2,23,col);else if(i%3===2)star(xx,yy);else disk(r,xx,yy,2,col);}}
 else if(id==='shelf'){for(let k=0;k<5;k++)r(3+k*5,5+k%2,3,10,colors[(k+i)%5]);if(i===2){r(22,10,5,5,'#b99a73');disk(r,24,7,4,'#7d9c68');}}
 else if(id==='lamp'){for(let k=0;k<4;k++){r(7+k*5,7,2,7,col);if(i===1)r(6+k*5,9,4,2,'#ece1ae');}}
 else if(id==='mirror'){for(let k=0;k<4;k++){if(i===1)flower(k%2?29:2,5+k*7);else star(k%2?29:2,5+k*7);}}
 else if(id==='fountain'){if(i===1)star(16,6);else{disk(r,16,13,7,'#83a97a');flower(16,9);}}
 else if(id==='post'){r(20,5,1,12,ink);if(i===1)disk(r,20,19,4,col);else{r(19,13,2,13,col);for(let k=0;k<4;k++)r(17+k%2,14+k*2,5-k,2,col);}}
 else if(['toybox','box','music'].includes(id)){r(4,12,24,2,col);r(15,3,3,25,col);if(id==='box'&&i===1){r(10,13,12,14,'#86674b');r(8,12,16,2,'#86674b');r(11,10,10,2,'#86674b');r(15,19,4,8,'#d8c59e');}else if(id==='toybox'&&i===1){r(12,12,9,8,'#e8d8af');r(13,14,2,2,ink);r(18,14,2,2,ink);r(15,19,3,3,ink);}else if(i===2){r(12,13,9,5,'#eee0bb');r(14,11,5,2,'#eee0bb');}if(id==='music'){if(i===1)flower(16,18);else star(16,18);}}
}

export function drawBowlBadge(c,s,x,y,w,h){const i=designIndex(s,'bowl');if(!i)return;const r=painter(c,x,y,w,h),mask=badges[['dog','cat','chicken','frog','corgi','bear','dino','bunny'][i-1]];disk(r,16,16,15,'#e9ddbd');disk(r,16,16,13,'#f5ead4');for(let yy=0;yy<mask.length;yy++)for(let xx=0;xx<8;xx++)if(mask[yy][xx]==='1')r(4+xx*3,5+yy*3,3,3,'#46554a');}
