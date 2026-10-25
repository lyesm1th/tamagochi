import {test} from 'node:test';import assert from 'node:assert/strict';import {createCanvas,Image} from '@napi-rs/canvas';import {fileURLToPath} from 'node:url';
test('lab page renders, pauses and scrubs using real assets without any save or API access',async()=>{
 const keys=['document','Image','requestAnimationFrame','localStorage','fetch'],before=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));let next;
 class Node{constructor(value=''){this.value=value;this.checked=false;this.style={};this.children=[];this.disabled=false;}append(x){this.children.push(x);}addEventListener(type,fn){this['on'+type]=fn;}click(){}}
 const canvas=createCanvas(384,288),nodes=new Map([['scene',canvas],['style',new Node('detailed')],['scenario',new Node('manual')]]);const get=id=>{if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id);};
 class LocalImage extends Image{set src(src){super.src=fileURLToPath(new URL('../public'+src,import.meta.url));}}
 Object.assign(globalThis,{document:{getElementById:get,createElement:tag=>tag==='canvas'?createCanvas(1,1):new Node()},Image:LocalImage,requestAnimationFrame:fn=>{next=fn;},localStorage:new Proxy({},{get(){throw Error('real save accessed');}}),fetch:()=>{throw Error('API accessed');}});
 try{await import('../public/lab.js?test');assert.equal(get('save').disabled,false);assert.equal(typeof next,'function');next(performance.now());assert.ok(canvas.getContext('2d').getImageData(0,0,384,288).data.some(v=>v));get('pause').onclick();assert.equal(get('pause').textContent,'Продовжити');get('time').value='3000';get('time').oninput();next(performance.now());assert.equal(get('clock').textContent,'3.0 с');get('species').value='frog';get('species').onchange();next(performance.now());get('style').value='classic';next(performance.now());assert.ok(get('status').textContent);}
 finally{Object.assign(globalThis,before);}
});
