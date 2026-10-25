import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,life} from '../public/game.js';
import {emotionOf,needEmotion,feel,noteEmotion} from '../public/emotions.js';
const now=1800000000000;
function pet(patch={}){
 const s=fresh('cat',now-life.teen-60000);
 return {...s,hunger:100,happy:100,health:100,lastAction:0,emotion:null,...patch};
}
test('manual states and farewells outrank any stored emotion or unmet need',()=>{
 const s=pet({health:1,happy:1,hunger:1,born:now-99999});
 feel(s,'amused','test',now,.8,60000);
 assert.equal(emotionOf({...s,dead:true},now).kind,'calm');
 for(const key of ['sleeping','napping','vacation'])assert.equal(emotionOf({...s,[key]:true},now).kind,'calm',key);
 assert.equal(emotionOf({...s,farewellPreview:true},now).kind,'sad');
 assert.equal(emotionOf(null,now).kind,'calm');
});
test('active saved emotion remains higher priority than needs and fades unchanged',()=>{
 const s=pet({health:5,happy:5,hunger:5});
 feel(s,'amused','saved',now,.8,60000);
 assert.equal(emotionOf(JSON.parse(JSON.stringify(s)),now+1000).kind,'amused');
 assert.equal(emotionOf(s,now+45000).strength,.8*.75);
 assert.equal(emotionOf(s,now+60000).kind,'anxious');
});
test('automatic need priority preserves health, happiness, hunger and strict thresholds',()=>{
 assert.equal(needEmotion(pet({health:34,happy:0,hunger:0}),now).kind,'anxious');
 assert.equal(needEmotion(pet({health:35,happy:34,hunger:0}),now).kind,'sad');
 assert.equal(needEmotion(pet({health:35,happy:35,hunger:24}),now).kind,'annoyed');
 assert.deepEqual(needEmotion(pet({health:35,happy:35,hunger:25}),now),{kind:'calm',strength:0});
 assert.equal(emotionOf(pet({health:34}),now).kind,'anxious');
});
test('pride appears only after a recently learned skill with needs satisfied',()=>{
 const s=pet({world:{skills:{trick:3}},lastAction:now-100});
 assert.equal(needEmotion(s,now).kind,'proud');
 assert.equal(needEmotion({...s,lastAction:now-60000},now).kind,'calm');
 assert.equal(needEmotion({...s,health:34},now).kind,'anxious');
});
test('emotional response does not mutate unrelated saved progress or character',()=>{
 const s=pet({character:{playfulness:85,sensitivity:86},coins:123});
 for(let i=0;i<3;i++)noteEmotion(s,'play',now+i*1000);
 assert.equal(s.emotion.kind,'amused');
 noteEmotion(s,'play',now+3000);
 assert.equal(s.emotion.kind,'bored');
 assert.equal(s.coins,123);
 noteEmotion(s,'discipline',now+4000);
 assert.equal(s.emotion.kind,'hurt');
 assert.deepEqual(s.character,{playfulness:85,sensitivity:86});
});
