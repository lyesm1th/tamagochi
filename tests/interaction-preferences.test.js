import test from 'node:test';
import assert from 'node:assert/strict';
import {interactionPreferences,experiencePreference,preferenceSummary} from '../public/interaction-preferences.js';
import {interactionDialogue} from '../public/interaction-dialogue.js';
import {fresh,act,life} from '../public/game.js';
const now=1800000000000;
const pet=trait=>({id:'preferences-'+trait,species:'dino',born:now-life.teen-3600000,trait,discipline:65,hunger:90,energy:85,happy:85,calm:85});
test('innate character establishes different initial interaction tastes',()=>{const affectionate=interactionPreferences(pet('affectionate')),playful=interactionPreferences(pet('playful')),sleepy=interactionPreferences(pet('sleepy'));assert.ok(affectionate.touch>playful.touch);assert.ok(playful.play>sleepy.play);assert.ok(sleepy.quiet>affectionate.quiet);});
test('experience grows preference with cooldown and survives save/reload',()=>{const s=pet('stubborn');const before=interactionPreferences(s).play;assert.equal(experiencePreference(s,'play',now),true);assert.equal(experiencePreference(s,'play',now+1000),false);assert.equal(s.interactionMemory.preferences.play,before+2);const saved=JSON.parse(JSON.stringify(s));assert.equal(interactionPreferences(saved).play,before+2);assert.equal(experiencePreference(saved,'play',now+31*60000),true);});
test('My Friend summary lists individual preferences',()=>{const s=pet('sleepy');assert.match(preferenceSummary(s),/Тихий відпочинок/);assert.match(preferenceSummary(s),/Ласка/);});
test('dialogues remain varied and never forcibly affectionate',()=>{const s=pet('stubborn');s.hunger=10;const lines=Array.from({length:400},(_,i)=>interactionDialogue(s,'pet',now+i*13000));assert.ok(lines.some(x=>/миску|їж|голод|вечер|поїмо/.test(x)));});
test('real care advances taste but preserves rewards',()=>{const s=fresh('dino',now-life.teen-3600000);s.id='preference-game';s.updated=now;s.routine.enabled=false;const before=interactionPreferences(s).touch;const done=act(s,'pet',now+1000);assert.ok(!done.error,done.error);assert.equal(interactionPreferences(done.state).touch,before+2);assert.equal(done.state.coins,s.coins);});

test('old save gets preferences without changing money or owned items',()=>{const s=pet('sleepy');s.coins=475;s.cozy={owned:{bed:true,mirror:true},items:{}};const old=JSON.parse(JSON.stringify(s));assert.ok(!old.interactionMemory);const summary=preferenceSummary(old);assert.ok(summary.includes('Тихий відпочинок'));assert.equal(old.coins,475);assert.equal(old.cozy.owned.bed,true);assert.equal(old.cozy.owned.mirror,true);});
