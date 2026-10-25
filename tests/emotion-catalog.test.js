import test from 'node:test';
import assert from 'node:assert/strict';
import {emotionNames,emotionOf} from '../public/emotions.js';
import {emotionKinds,expressionRecipe,emotionFrame} from '../public/emotion-frames.js';

const expected=['sad','angry','annoyed','amused','bored','curious','surprised','shy','anxious','hurt','proud','grateful','content'];

test('animated emotion catalog matches emotion engine in unchanged historical order',()=>{
 assert.deepEqual(emotionKinds,expected);
 assert.deepEqual(emotionKinds,Object.keys(emotionNames).filter(kind=>kind!=='calm'));
 assert.ok(!emotionKinds.includes('calm'));
});

test('every catalog emotion retains authored expression recipes in all frames',()=>{
 for(const kind of emotionKinds)for(let frame=0;frame<4;frame++){
  assert.ok(expressionRecipe(kind,frame),kind+':'+frame);
 }
});

test('emotion frame clock retains exact old behavior',()=>{
 const e={strength:.8,at:1800000000000};
 assert.deepEqual([0,400,800,1200,1600].map(delta=>emotionFrame(e,e.at+delta)),[0,1,2,1,0]);
 assert.equal(emotionFrame(e,e.at+2000,true),0);
});
