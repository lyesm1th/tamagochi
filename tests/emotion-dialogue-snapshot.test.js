import test from 'node:test';
import assert from 'node:assert/strict';
import {emotionOf,feel} from '../public/emotions.js';
import {emotionLine,emotionLineFor,emotionalWords} from '../public/emotion-dialogue.js';
import {speciesEmotionLines} from '../public/species-emotion-lines.js';
import {stableHash} from '../public/traits.js';
const now=1800000000000;
const base={id:'test-pet',species:'dino',born:now-900000,health:100,happy:100,hunger:100};
test('snapshot selector is identical to legacy dialogue formula for all authored emotions',()=>{
 for(const species of ['dino','cat','frog','penguin'])for(const [kind,words]of Object.entries(emotionalWords)){
  const s={...base,species},e={kind,at:now-1500,strength:.72},special=speciesEmotionLines[species]?.[kind];
  const lines=special?[special,...words]:words;
  const seed=stableHash((s.id||s.species)+':'+kind+':'+(e.at||s.born));
  assert.equal(emotionLineFor(s,e),lines[seed%lines.length],species+':'+kind);
 }
});
test('wrapper and snapshot selector agree across episodes and reload',()=>{
 const s={...base};feel(s,'amused','test',now,.85,60000);
 const saved=JSON.parse(JSON.stringify(s));
 const snapshot=emotionOf(saved,now+1500);
 assert.equal(emotionLine(saved,now+1500),emotionLineFor(saved,snapshot));
 assert.equal(emotionLineFor(saved,snapshot),emotionLineFor(saved,snapshot));
 assert.equal(emotionLineFor(saved,{kind:'calm',strength:0}),null);
 assert.equal(emotionLineFor(null,snapshot),null);
 assert.equal(emotionLine({...saved,sleeping:true},now+1500),null);
});
