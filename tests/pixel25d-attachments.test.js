import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catAttachmentGraph,attachWardrobe,roomContact} from '../public/lab-attachments25d.js';
test('wardrobe remains attached to the appropriate anatomy on turning head',()=>{
 const left=catAttachmentGraph('Дорослий',{headYaw:-25});
 const right=catAttachmentGraph('Дорослий',{headYaw:25});
 assert.ok(left.head.x<right.head.x);
 assert.equal(left.body.x,right.body.x);
 assert.ok(left.head.scaleX<1);
 const worn=attachWardrobe({head:'panama',eyes:'glasses',neck:'scarf',body:'sweater'},left);
 assert.deepEqual(worn.map(x=>x.slot),['head','eyes','neck','body']);
 assert.equal(worn[0].transform,left.head);
 assert.equal(worn[3].transform,left.body);
});
test('bed, mirror and toy contacts use stable normalized coordinates',()=>{
 const graph=catAttachmentGraph('Малюк',{leftHand:80});
 assert.equal(graph.leftHand.angle,30);
 for(const kind of ['sleep','bed','mirror','play','walk']){
  const target=roomContact(kind,graph);
  assert.ok(target.anchor.x>=0&&target.anchor.x<=1);
  assert.ok(target.anchor.y>=0&&target.anchor.y<=1);
 }
 assert.equal(roomContact('bed',graph).target,'bed');
 assert.equal(roomContact('mirror',graph).target,'mirror');
});
