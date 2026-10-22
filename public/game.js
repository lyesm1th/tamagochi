export const species = [
 {id:'chicken',name:'Курочка',nick:'Квочка',color:'#e9c954'},
 {id:'cat',name:'Котик',nick:'Пан Сраколап',color:'#bf9ae0'},
 {id:'corgi',name:'Коргі',nick:'Батон',color:'#e5a05a'},
 {id:'frog',name:'Жабка',nick:'Квасик',color:'#9bbf63'},
 {id:'bear',name:'Ведмедик',nick:'Буркотун',color:'#b38a69'},
 {id:'dog',name:'Корівка',nick:'Мукалка',color:'#f2eee1'},
 {id:'dino',name:'Динозаврик',nick:'Кусьозавр',color:'#7cb3a0'},
 {id:'bunny',name:'Кролик',nick:'Вухань',color:'#e4bacb'}
];
export const fresh = (id,now=Date.now()) => ({species:id,name:species.find(s=>s.id===id)?.nick||'Малюк',born:now,updated:now,hunger:85,happy:85,energy:90,clean:100,health:100,poop:0,sleeping:false,coins:20,xp:0,dead:false,lastAction:0});
const clamp=n=>Math.max(0,Math.min(100,n));
export function tick(s,now=Date.now()) {
 if(!s||s.dead)return s;
 const h=Math.max(0,now-s.updated)/3600000;
 s.hunger=clamp(s.hunger-h*6);s.happy=clamp(s.happy-h*4);s.clean=clamp(s.clean-h*5);
 s.energy=clamp(s.energy+h*(s.sleeping?18:-5));
 s.poop=Math.min(3,s.poop+Math.max(0,Math.floor((now-s.born)/7200000)-Math.floor((s.updated-s.born)/7200000)));
 const bad=s.hunger<15||s.clean<15||s.energy<5;
 s.health=clamp(s.health+h*(bad?-8:2));s.dead=s.health<=0;s.updated=now;return s;
}
export const phrases={
 feed:['О, сніданок. Ти мій улюблений персонал.','Дякую, сонечко. Тепер можна й обійняти.','Хрум. Нічого ти так куховариш, людино.','Нарешті їжа, бляха. Іди сюди, обійму.'],
 treat:['Підкуп зараховано. Ти хороша людина.','За таке можеш почухати пузо.','Оце я розумію — турбота, а не оці твої розмови.','Смачно, зараза. Люблю тебе.'],
 clean:['Дякую. Я тут трохи натворив справ.','Чисто! Ти золотко. Моє особисте золотко.','Прибрав? Молодець. Тепер сиди зі мною.','От халепа. Насрав я, а соромно чомусь тобі.'],
 pet:['Мур… Ще трохи. Не зазнавайся тільки.','Ти мій улюблений дурко. Чухай далі.','Отак. Бачиш, можеш, коли хочеш.','Люблю тебе, засранця. Не розповідай нікому.'],
 medicine:['Фу. Гірке. Але дякую, що доглядаєш.','Ти мене рятуєш, а я бурчу. Ми гарна команда.','Обійми після ліків входять у вартість?'],
 play:['От бачиш, умієш! Тримай 3 монетки.','Гарно пограли. Тепер їсти й обійматися.','Ми з тобою гроза жуків. +3 монети.','Жук офігів. А ми молодці. +3 монети.'],
 idle:['Іди сюди. Будемо нічого не робити разом.','Ти моє улюблене непорозуміння.','Чухай за вушком. Так, оце твоя робота.','Я грізний. Але можеш взяти на ручки.','Ти поїв? Бо за мною стежиш, а сам як?','Обійняв би тебе. Та лапи короткі.','Я тут головний. Ти головний по обіймах.','Не йди надовго, добре? Я ж бурчу від любові.','Дивлюся на тебе. Нормальна в мене людина.','Я тебе люблю. Все, досить ніжностей.','Бляха, як же добре, коли ти поруч.','Маленький засранець — це я. А ти мій.'],
 hungry:['Погодуй мене, сонечко. Я вже бурчу животом.','Людино, у нас тут миска без їжі. Непорядок.','Я тебе люблю, але вечерю люблю теж.'],
 dirty:['Тут треба трохи прибрати. Я ні на що не натякаю.','У мене лапки. А в тебе — прибиральна місія.','Я тут накоїв. Не сварися, краще допоможи.']};
export function line(key,rng=Math.random){const list=phrases[key]||phrases.idle;return list[Math.floor(rng()*list.length)%list.length];}
export function act(state,action,now=Date.now()) {
 const s=tick(structuredClone(state),now);
 if(!s)return {error:'Спочатку обери друга.'};
 if(s.dead)return {state:s,error:'Друг уже на веселці. Можна обрати нового.'};
 if(now-s.lastAction<650)return {state:s,error:'Не поспішай, у мене лапки.'};
 if(action==='endLife'){s.health=0;s.dead=true;s.sleeping=false;s.updated=now;s.lastAction=now;return {state:s,text:'Прощавай, людино. У нас були хороші обійми. ♡'};}
 if(s.sleeping&&action!=='sleep')return {state:s,error:'Я сплю. Дай ще п’ять хвилиночок, буркотун.'};
 let text='';
 switch(action){
 case 'feed':if(s.hunger>95)return {state:s,error:'Я вже ситий. Обійняти ще можу, їсти — ні.'};s.hunger=clamp(s.hunger+24);s.clean=clamp(s.clean-4);text=line('feed');break;
 case 'treat':if(s.coins<5)return {state:s,error:'Треба 5 монет. Ходімо заробимо у грі?'};s.coins-=5;s.hunger=clamp(s.hunger+10);s.happy=clamp(s.happy+18);text=line('treat');break;
 case 'clean':s.clean=100;s.poop=0;text=line('clean');break;
 case 'pet':s.happy=clamp(s.happy+9);text=line('pet');break;
 case 'sleep':s.sleeping=!s.sleeping;text=s.sleeping?'Я в люлю. Посидь поруч, тільки не шаруди.':'Я прокинувся! Де моя людина й мій сніданок?';break;
 case 'medicine':if(s.coins<10)return {state:s,error:'Ліки коштують 10 монет. Заробимо у грі.'};s.coins-=10;s.health=clamp(s.health+35);text=line('medicine');break;
 case 'play':if(s.energy<12)return {state:s,error:'Я втомився, сонечко. Дай поспати.'};s.energy-=8;s.hunger=clamp(s.hunger-4);s.happy=clamp(s.happy+15);s.coins+=3;s.xp+=5;text=line('play');break;
 default:return {state:s,error:'Не зрозумів, чого ти хочеш. Обіймів?'};
 }
 s.xp+=1;s.lastAction=now;return {state:s,text};
}
export function stage(s,now=Date.now()){const h=(now-s.born)/3600000;return h<.05?'Яєчко':h<24?'Малюк':h<72?'Підліток':'Дорослий';}
