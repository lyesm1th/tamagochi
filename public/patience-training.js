import {ensureManners,disciplineScore} from './manners.js';
const DAY=86400000,HOUR=3600000;
export const lessonKinds=['patience','requests','food','belongings','tidy','friends'];
export const lessonNames={patience:'Терпіння',requests:'Чемне спілкування',food:'Охайне харчування',belongings:'Бережливість',tidy:'Прибирання',friends:'Дружба'};
export const patienceOptions=['Попросити зачекати','Дозволити одразу взяти','Завершити заняття'];
export function trainingView(s){const run=s?.manners?.patienceSession;if(!run)return null;const scripts={patience:[['Миска пахне так смачно! Я хочу зараз. Що робити?',['Попросити зачекати','Дозволити одразу взяти','Завершити заняття']],['Р-р... Я чекаю! Можна вже їсти?',['Похвалити й дозволити їсти','Змусити чекати ще','Завершити заняття']]],requests:[['Я не хочу виконувати прохання! Можна просто послати все під три чорти?',['Спокійно пояснити, як відмовити','Вимагати мовчазної покори','Завершити заняття']],['Тобто я можу сказати «ні», але без хамства?',['Похвалити ввічливу відповідь','Заборонити відмовляти','Завершити заняття']]],food:[['Ой, корм так і проситься на підлогу!',['Показати, як їсти охайно','Дозволити розкидати','Завершити заняття']],['Я тримаю миску. Ось так правильно?',['Похвалити охайність','Штовхнути миску','Завершити заняття']]],belongings:[['Цей вазон такий цікавий! А якщо я його перекину?',['Запропонувати іншу гру','Дозволити перекинути','Завершити заняття']],['Добре, я обрав іграшку замість вазона!',['Похвалити вибір','Запропонувати зламати вазон','Завершити заняття']],tidy:[['Тут іграшки всюди. Вони самі розбіглися!',['Запропонувати разом прибрати','Лаяти без пояснень','Завершити заняття']],['Одна іграшка вже на місці. Решту теж?',['Похвалити й допомогти закінчити','Кинути все на підлогу','Завершити заняття']]],friends:[['Друг хоче пограти з моєю іграшкою. А вона моя!',['Запропонувати домовитись','Сказати відібрати іграшку','Завершити заняття']],['А якщо я зараз не хочу ділитися?',['Пояснити, як чемно відмовити','Примусити віддати іграшку','Завершити заняття']]]};const part=(scripts[run.kind]||scripts.patience)[run.phase];return {kind:run.kind||'patience',phase:run.phase,expires:run.expires,text:part[0],options:part[1]};}
export function patienceTraining(s,choice=null,now=Date.now(),kind='patience'){
 const m=ensureManners(s),run=m.patienceSession,day=Math.floor(now/DAY);
 if(m.day!==day){m.day=day;m.sessions=0;}
 if(run){if(now>run.expires){m.patienceSession=null;return {ok:false,text:'Заняття скінчилось. Повернемося до нього пізніше.'};}
 if(!Number.isInteger(choice)||choice<0||choice>2)return {ok:false,text:'Обери відповідь кнопками.'};
 if(choice===2){m.patienceSession=null;return {ok:true,text:'Гаразд, закінчимо. Наступного разу спробуємо ще.'};}
 if(run.phase===0){if(choice!==0){m.patienceSession=null;return {ok:true,text:'Хрум! Я не встиг навіть потренувати терпіння.'};}run.phase=1;return {ok:true,text:'Р-р-р... Добре, я спробую почекати.'};}
 m.patienceSession=null;
 if(choice!==0)return {ok:true,text:'Ще чекати? Я втомився від цієї гри. Давай потім.'};
 const key=run.kind||'patience';m.skills[key].training=Math.min(100,m.skills[key].training+10);s.discipline=disciplineScore(s);
 return {ok:true,text:key==='requests'?'Я можу бути чемним і все одно мати свою думку. Бляха, це навіть приємно!':key==='food'?'Тепер їжа лишилася в мисці! Я молодець.':key==='belongings'?'Вазон живий, і я погрався. Усім добре!':key==='tidy'?'Я сам допоміг навести лад. Оце так!':key==='friends'?'Можна домовлятися й не сваритися. Запам’ятаю!':'Я дочекався! Бачиш, можу, коли хочу. І тепер їжа, будь ласка!'};
 }
 if(choice!==null)return {ok:false,text:'Спершу розпочни заняття.'};
 if(!lessonKinds.includes(kind))return {ok:false,text:'Такого заняття немає.'};
 if(m.lastTraining&&now-m.lastTraining<2*HOUR)return {ok:false,text:'Наступне тренування буде пізніше. Дві години між заняттями!'};
 if((m.sessions||0)>=4)return {ok:false,text:'Чотири заняття на сьогодні вже було. Відпочинемо.'};
 if(s.hunger<35||s.energy<30)return {ok:false,text:'Я надто голодний або втомлений для тренування.'};
 m.lastTraining=now;m.sessions=(m.sessions||0)+1;m.patienceSession={kind,phase:0,expires:now+90_000};
 return {ok:true,text:'Починаємо заняття: '+lessonNames[kind]+'. Я готовий спробувати!'};
}
