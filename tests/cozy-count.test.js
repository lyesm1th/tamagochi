import test from 'node:test';
import assert from 'node:assert/strict';
import {countCozyOptions} from '../public/ui-choices.js';
import {readFileSync} from 'node:fs';
const time=1800000000000;
const count=(mode,state={},lists={})=>countCozyOptions(mode,{cozy:{},...state},time,
 lists.goods||[1,2,3],lists.clothes||[1,2],
 ()=>lists.belongings||[],()=>lists.spots||[1,2,3],()=>lists.meals||[1,2]);
test('shop, wardrobe, belongings and peace retain exact counts',()=>{
 assert.equal(count('shop'),3);assert.equal(count('wardrobe'),2);
 assert.equal(count('belongings'),1);assert.equal(count('belongings',{}, {belongings:[1,2,3]}),3);
 assert.equal(count('peace'),4);assert.equal(count('unknown'),1);
});
test('hiding and cooking boundaries preserve legacy exclusive expiry',()=>{
 assert.equal(count('hide',{cozy:{hide:{expires:time+1}}}),3);
 assert.equal(count('hide',{cozy:{hide:{expires:time}}}),1);
 assert.equal(count('kitchen',{cozy:{cooking:{expires:time+1}}}),1);
 assert.equal(count('kitchen',{cozy:{cooking:{expires:time}}}),3);
 assert.equal(count('kitchen',{}, {meals:[]}),1);
});
test('counts avoid unrelated list preparation and are independent of DOM',()=>{
 let calls=0;
 const opts=countCozyOptions('shop',{cozy:{}},time,[1],[1],()=>{calls++;return [];},()=>{calls++;return [];},()=>{calls++;return [];});
 assert.equal(opts,1);assert.equal(calls,0);
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.ok(app.includes('countCozyOptions(mode,state,Date.now(),homeGoods,clothes,uiBelongingChoices,hideSpots,kitchenOptions)'));
});
