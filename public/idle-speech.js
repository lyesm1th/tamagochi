import {petInitiative} from './pet-initiative.js';
// Preserve the legacy speech priority chain, including lazy clock/random
// checks and wake-story persistence. Dependencies are explicit for QA.
export function selectIdleSpeech(s,{introHint,wakeStory,save,online,clothes,relationshipHint,needs,roomMoment,roomLine,ambient,dailyHint,ritualHint,routineHint,line,chooseDialogue,now,random}){
 const intro=introHint(s);if(intro)return intro;
 if(s.vacation)return 'Відпочиваю в готелі. Твої обійми заброньовані.';
 if(s.sleeping||s.napping)return s.world?.dream?'Сниться: '+s.world.dream.title+'…':'Хрр… обійми… хрр…';
 const story=wakeStory(s);if(story){if(!online)save();return story;}
 if(s.world?.wakeStoryPending===false&&s.world?.lastDream&&now()-s.world.lastDream.wokeAt<30000)return s.world.lastDream.text;
 if(s.cozy?.lastRemoved&&now()-s.cozy.lastRemoved.at<120000)return 'Зняв '+(clothes.find(i=>i.id===s.cozy.lastRemoved.id)?.name||'одяг').toLowerCase()+'. Мені незручно. Давай іншу річ?';
 const invitation=relationshipHint(s);if(invitation)return invitation;
 const urgent=needs(s);if(urgent)return urgent.text;
 const moment=roomMoment(s);if(moment?.auto&&random()<.7)return roomLine(s,moment.item);
 const auto=ambient(s);if(auto?.text&&(['hum','dance','thought'].includes(auto.kind)||random()<.6))return auto.text;
 const daily=dailyHint(s);if(daily&&random()<.5)return daily;
 const ritual=ritualHint(s);if(ritual&&random()<.3)return ritual;
 const hint=routineHint(s);if(hint)return hint;
 const pending=s.initiatives?.pending; if(pending&&now()<pending.expires)return pending.text+' Відповісти можна в меню «Запрошення».';
 const initiative=!online?petInitiative(s,now()):null;if(initiative){if(!online)save();return initiative;}
 if(s.adventure)return 'У мене маленька пригода! Заглянь у ◇.';
 const need=needs(s);if(need)return need.text;
 if(s.hunger<25)return line('hungry',s.species);
 if(s.clean<25)return line('dirty',s.species);
 return chooseDialogue(s);
}
