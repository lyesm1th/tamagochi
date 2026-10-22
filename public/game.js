export const species = [
 {id:'chicken',name:'Курочка',nick:'Квочка',color:'#e9c954'},
 {id:'cat',name:'Котик',nick:'Пан Сраколап',color:'#bf9ae0'},
 {id:'corgi',name:'Коргі',nick:'Батон',color:'#e5a05a'},
 {id:'frog',name:'Жабка',nick:'Квасик',color:'#9bbf63'},
 {id:'bear',name:'Ведмедик',nick:'Буркотун',color:'#b38a69'},
 {id:'dog',name:'Песик',nick:'Бублик',color:'#d6b690'},
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
export function act(state,action,now=Date.now()) {
 const s=tick(structuredClone(state),now);
 if(!s)return {error:'Спочатку обери друга.'};
 if(s.dead)return {state:s,error:'Малюк пішов на веселку. Можна почати нове життя.'};
 if(now-s.lastAction<650)return {state:s,error:'Не дрочи кнопки, я не встигаю!'};
 if(s.sleeping&&action!=='sleep')return {state:s,error:'Я сплю, бляха. Відʼїбись до ранку.'};
 let text='';
 switch(action){
 case 'feed':if(s.hunger>95)return {state:s,error:'Куди ще пхати? Я вже обожрався, бляха!'};s.hunger=clamp(s.hunger+24);s.clean=clamp(s.clean-4);text='Нарешті хавчик. А то я вже збирався жерти тебе.';break;
 case 'treat':if(s.coins<5)return {state:s,error:'Де гроші, Лебовські? Треба 5 монет.'};s.coins-=5;s.hunger=clamp(s.hunger+10);s.happy=clamp(s.happy+18);text='О, підкуп! Працює, зараза. Давай ще.';break;
 case 'clean':s.clean=100;s.poop=0;text='Підтер? Красавчик. Скоро знов насру.';break;
 case 'pet':s.happy=clamp(s.happy+9);text='Мур, бляха… Не зупиняйся. Ти мені потрібен, засранець.';break;
 case 'sleep':s.sleeping=!s.sleeping;text=s.sleeping?'Все, я спати. Хто розбудить — той мудак.':'Я встав. Де сніданок, обслуго?';break;
 case 'medicine':if(s.coins<10)return {state:s,error:'Ліки коштують 10 монет. Зароби у грі.'};s.coins-=10;s.health=clamp(s.health+35);text='Гірке гівно. Але дякую, що витягнув, придурку.';break;
 case 'play':if(s.energy<12)return {state:s,error:'Я заїбався. Сам бігай, дай поспати.'};s.energy-=8;s.hunger=clamp(s.hunger-4);s.happy=clamp(s.happy+15);s.coins+=3;s.xp+=5;text='Ха! Наїбали жука! +3 монети, бізнесмени хрінові.';break;
 default:return {state:s,error:'Не зрозумів, що ти хочеш.'};
 }
 s.xp+=1;s.lastAction=now;return {state:s,text};
}
export function stage(s,now=Date.now()){const h=(now-s.born)/3600000;return h<.05?'Яєчко':h<24?'Малюк':h<72?'Підліток':'Дорослий';}
