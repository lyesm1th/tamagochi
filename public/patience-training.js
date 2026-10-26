import {ensureManners,disciplineScore} from './manners.js';
const DAY=86400000,HOUR=3600000;
export const patienceOptions=['Попросити зачекати','Дозволити одразу взяти','Завершити заняття'];
export function trainingView(s){const run=s?.manners?.patienceSession;if(!run)return null;return {phase:run.phase,expires:run.expires,text:run.phase===0?'Миска пахне так смачно! Я хочу зараз. Що робити?':'Р-р... Я чекаю! Можна вже їсти?',options:run.phase===0?patienceOptions:['Похвалити й дозволити їсти','Змусити чекати ще','Завершити заняття']};}
export function patienceTraining(s,choice=null,now=Date.now()){
 const m=ensureManners(s),run=m.patienceSession,day=Math.floor(now/DAY);
 if(m.day!==day){m.day=day;m.sessions=0;}
 if(run){if(now>run.expires){m.patienceSession=null;return {ok:false,text:'Заняття скінчилось. Повернемося до нього пізніше.'};}
 if(!Number.isInteger(choice)||choice<0||choice>2)return {ok:false,text:'Обери відповідь кнопками.'};
 if(choice===2){m.patienceSession=null;return {ok:true,text:'Гаразд, закінчимо. Наступного разу спробуємо ще.'};}
 if(run.phase===0){if(choice!==0){m.patienceSession=null;return {ok:true,text:'Хрум! Я не встиг навіть потренувати терпіння.'};}run.phase=1;return {ok:true,text:'Р-р-р... Добре, я спробую почекати.'};}
 m.patienceSession=null;
 if(choice!==0)return {ok:true,text:'Ще чекати? Я втомився від цієї гри. Давай потім.'};
 m.skills.patience.training=Math.min(100,m.skills.patience.training+10);s.discipline=disciplineScore(s);
 return {ok:true,text:'Я дочекався! Бачиш, можу, коли хочу. І тепер їжа, будь ласка!'};
 }
 if(choice!==null)return {ok:false,text:'Спершу розпочни заняття.'};
 if(m.lastTraining&&now-m.lastTraining<2*HOUR)return {ok:false,text:'Наступне тренування буде пізніше. Дві години між заняттями!'};
 if((m.sessions||0)>=4)return {ok:false,text:'Чотири заняття на сьогодні вже було. Відпочинемо.'};
 if(s.hunger<35||s.energy<30)return {ok:false,text:'Я надто голодний або втомлений для тренування.'};
 m.lastTraining=now;m.sessions=(m.sessions||0)+1;m.patienceSession={phase:0,expires:now+90_000};
 return {ok:true,text:'Тренування терпіння! Переді мною миска. Допоможеш не хапати їжу одразу?'};
}
