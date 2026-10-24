import {stableHash,traitOf} from './traits.js';
export const emotionNames={calm:'Спокій',sad:'Сум',angry:'Злість',annoyed:'Невдоволення',amused:'Сміх',bored:'Нудьга',curious:'Цікавість',surprised:'Здивування',shy:'Збентеження',anxious:'Тривога',hurt:'Образа',proud:'Гордість',grateful:'Вдячність',content:'Задоволення'};
const axes=['affection','independence','curiosity','playfulness','sensitivity','stubbornness'];
export function characterOf(s){const seed=s.id||s.species+':'+s.born,values=Object.fromEntries(axes.map(k=>[k,25+stableHash(seed+':'+k)%51]));const boost={affectionate:'affection',playful:'playfulness',sleepy:'independence',glutton:'curiosity',stubborn:'stubbornness'}[traitOf(s)];if(boost)values[boost]=85;return {...values,...s.character};}
export function feel(s,kind,reason,now=Date.now(),strength=.7,duration=60000){if(!emotionNames[kind])return;s.emotion={kind,reason,at:now,until:now+duration,strength};}
export function emotionOf(s,now=Date.now()){
 if(!s||s.dead||s.sleeping||s.napping||s.vacation)return {kind:'calm',strength:0};
 if(s.farewellPreview)return {kind:'sad',reason:'Ти відкрив прощання',strength:.9,at:s.born||0};
 const e=s.emotion;if(e&&emotionNames[e.kind]&&e.at<=now&&e.until>now)return {...e,strength:e.strength*Math.min(1,(e.until-now)/20000)};
 if((s.health??100)<35)return {kind:'anxious',reason:'Погано почуваюся',strength:.55};
 if((s.happy??100)<35)return {kind:'sad',reason:'Мені бракує приємних занять',strength:.5};
 if((s.hunger??100)<25)return {kind:'annoyed',reason:'Хочу їсти',strength:.4};
 const skill=s.world?.skills&&Math.max(0,...Object.values(s.world.skills).filter(Number.isFinite));if(skill>=3&&(s.lastAction||0)>now-60000)return {kind:'proud',reason:'Я навчився нового',strength:.4};
 return {kind:'calm',strength:0};
}
export function emotionalRefusal(s,action,now){
 const h=s.emotionHistory||[],same=h.filter(e=>e.action===action&&now-e.at<45000),critical=Math.min(s.hunger??100,s.health??100,s.clean??100)<35;
 if(critical||!['pet','play','discipline','treat'].includes(action)||same.length<Math.max(3,Math.round(3+(characterOf(s).affection-characterOf(s).independence)/40))||now-(s.refusalAt||0)<120000)return null;
 s.refusalAt=now;const reason=action==='pet'?'Ти мене вже до блиску затер. Давай хвилинку просто поруч.':'Давай щось інше, людино. Це ми щойно робили.';
 feel(s,characterOf(s).stubbornness>70?'angry':'annoyed',reason,now,.65,45000);return reason;
}
export function noteEmotion(s,action,now,context={}){
 s.emotionHistory=(s.emotionHistory||[]).filter(e=>now-e.at<300000).slice(-11);s.emotionHistory.push({action,at:now});
 const c=characterOf(s),duration=30000+c.sensitivity*700;
 const repeats=s.emotionHistory.filter(e=>e.action===action&&now-e.at<90000).length;
 if(action==='medicine'||action==='clean')feel(s,'grateful','Ти подбав про мене',now,.6,45000);
 else if(action==='discipline')feel(s,characterOf(s).sensitivity>65?'hurt':'annoyed','Мене щойно насварили',now,.6,60000);
 else if(action==='feed')feel(s,context.food===s.favoriteFood?'grateful':'content','Смачно поїв',now,.6,45000);
 else if(action==='pet')feel(s,repeats>=3?'shy':'content',repeats>=3?'Стільки уваги, аж ніяково':'Приємно бути поруч',now,.6,45000);
 else if(action==='play')feel(s,repeats>=(characterOf(s).playfulness>70?4:3)?'bored':'amused',repeats>=3?'Хочеться іншої гри':'Ми гарно пограли',now,.7,60000);
 else if(action==='treat')feel(s,'grateful','Смаколик від моєї людини',now,.6,duration);
 if(s.emotion?.at===now)s.emotion.until=now+duration;
}
export const emotionLines={content:'Добре мені з тобою. Все, сиди поруч.',grateful:'Дякую, моя людино. Бурчу, але ціную.',amused:'Ха! Ну ти й видав, людино!',bored:'Це вже було. Може, іншу забавку?',shy:'Ой, досить ніжностей… Хоча ще трошки можна.',hurt:'Я зрозумів. Тільки не сварися так, добре?',annoyed:'Бурчу. Мені треба трохи спокою.'};

export function characterLabel(s){const c=characterOf(s),labels={affection:'ніжний',independence:'самостійний',curiosity:'допитливий',playfulness:'грайливий',sensitivity:'чутливий',stubbornness:'упертий'};return Object.entries(c).filter(([k])=>labels[k]).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>labels[k]).join(', ');}
