import test from 'node:test';
import assert from 'node:assert/strict';
import {mischiefDecision,mischiefRule} from '../public/mischief-behavior.js';
import {mannersDialogue,speechBalance,ensureManners} from '../public/manners.js';
import {makeDialogueChooser} from '../public/pet-dialogue.js';

const now=1800000000000;
const pet=(discipline,extra={})=>({
  id:'balancing-dino',species:'dino',born:now-7*86400000,trait:'stubborn',
  discipline,hunger:80,calm:80,energy:80,happy:80,health:100,...extra
});
const frequencies=(d,n=1200)=>{
  const s=pet(d);
  const attempts=Array.from({length:n},(_,i)=>mischiefDecision(s,now+i*15*60000));
  return {chance:attempts.filter(x=>x.happens).length/n,
    perHour:attempts.reduce((sum,x)=>sum+(x.impulse*3600000/(x.nextAt-(now+attempts.indexOf(x)*15*60000))),0)/n};
};
const samples=(s,n=1800)=>Array.from({length:n},(_,i)=>mannersDialogue(s,now+i*90000,'idle')).filter(Boolean);

test('10%, 50% and 90% education create distinct mischief frequencies',()=>{
 const low=frequencies(10),medium=frequencies(50),high=frequencies(90);
 assert.ok(low.chance>medium.chance,JSON.stringify({low,medium,high}));
 assert.ok(medium.chance>high.chance,JSON.stringify({low,medium,high}));
 assert.ok(low.chance>high.chance*2,JSON.stringify({low,medium,high}));
 assert.ok(low.perHour>medium.perHour&&medium.perHour>high.perHour);
});

test('learning the actual rule reduces matching mischief even with similar overall education',()=>{
 const initial=pet(50);ensureManners(initial);
 const target=mischiefDecision(initial,now).rule;
 const poor=structuredClone(initial),skilled=structuredClone(initial);
 poor.manners.skills[target]={training:5,practice:5};
 skilled.manners.skills[target]={training:95,practice:95};
 const a=mischiefDecision(poor,now),b=mischiefDecision(skilled,now);
 assert.equal(a.rule,target);assert.equal(b.rule,target);
 assert.ok(a.impulse>b.impulse);
 assert.ok(a.nextAt<=b.nextAt);
});

test('critical needs and sleep never turn into destructive antics',()=>{
 for(const extra of [{energy:4},{health:10},{sleeping:true},{vacation:{started:now}},{dead:true}]){
   assert.equal(mischiefDecision(pet(0,extra),now).happens,false);
 }
 const calm=mischiefDecision(pet(40),now),stressed=mischiefDecision(pet(40,{hunger:5,calm:5}),now);
 assert.ok(stressed.impulse>calm.impulse);
});

test('speech tone is rude when untrained, polite when learned, with rare profanity',()=>{
 const low=pet(10),mid=pet(50),high=pet(90);
 const pLow=speechBalance(low),pMid=speechBalance(mid),pHigh=speechBalance(high);
 assert.ok(pLow.rude>pMid.rude&&pMid.rude>pHigh.rude);
 const lowLines=samples(low),midLines=samples(mid),highLines=samples(high);
 const spicy=x=>/^(Блять|Пиздець|Сука|Я такий чемний, аж страшно)/i.test(x);
 const lowCurses=lowLines.filter(spicy).length/1800,highCurses=highLines.filter(spicy).length/1800;
 assert.ok(lowCurses>highCurses&&lowCurses<.10,JSON.stringify({lowCurses,highCurses}));
 assert.ok(highCurses>0&&highCurses<.04,JSON.stringify({lowCurses,highCurses}));
 assert.ok(highLines.some(x=>/означає слово|слово «пиздець»|чому дорослі/.test(x)));
 assert.ok(midLines.length>100);
});

test('full idle chooser stays varied and avoids legacy profanity bypass',()=>{
 const chooser=makeDialogueChooser(),s=pet(90);
 const lines=Array.from({length:600},(_,i)=>chooser(s,now+i*90000,'idle'));
 assert.ok(new Set(lines).size>40);
 const explicit=lines.filter(x=>/^(Блять|Пиздець|Сука|Я такий чемний, аж страшно)/i.test(x)).length;
 assert.ok(explicit/lines.length<.04,'explicit swearing '+explicit+'/600');
});
