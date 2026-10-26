import test from 'node:test';
import assert from 'node:assert/strict';
import {walletChoiceContent} from '../public/wallet-choice-content.js';
const pet={coins:32};
test('wallet loading preserves its title and copy',()=>{
 assert.deepEqual(walletChoiceContent(null,pet),{title:'ГАМАНЕЦЬ І ПОДАРУНКИ',detail:'Завантажую гаманець…'});
});
test('wallet owner reports their balance and session',()=>{
 const view=walletChoiceContent({balance:100,telegramId:123,owner:true,ownerConfigured:true},pet);
 assert.equal(view.detail,'У гаманці: 100 монет.\nУ кишені пета: 32.\nТвій Telegram ID: 123\nВласника розпізнано ✓\nДля покупок переведи монети в кишеню пета. Гаманець зберігається між поколіннями.');
});
test('mismatched and unconfigured owners keep distinct warnings',()=>{
 assert.match(walletChoiceContent({balance:0,telegramId:1,owner:false,ownerConfigured:true},pet).detail,/ID власника не збігається/);
 assert.match(walletChoiceContent({balance:0,telegramId:1,owner:false,ownerConfigured:false},pet).detail,/OWNER_TELEGRAM_ID/);
});
