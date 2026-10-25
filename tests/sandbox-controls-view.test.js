import test from 'node:test';
import assert from 'node:assert/strict';
import {renderSandboxControls} from '../public/sandbox-controls-view.js';
import {sandboxControlModel} from '../public/sandbox-control-model.js';
import {readFileSync} from 'node:fs';

class Element{
 constructor(type='div'){this.type=type;this.hidden=false;this.disabled=false;this.children=[];this.attributes=new Map();this.textContent='';this.className='';}
 replaceChildren(...children){this.children=children;}
 append(...children){this.children.push(...children);}
 setAttribute(key,value){this.attributes.set(key,value);}
}
function harness(){
 const nodes=new Map();
 const query=selector=>{if(!nodes.has(selector))nodes.set(selector,new Element());return nodes.get(selector);};
 const events=[];
 const props={query,createElement:type=>new Element(type),busy:false,actionIcon:command=>new Element('icon:'+command),
  onChoosePeer:index=>events.push(['peer',index]),
  onChooseAction:(index,command,pet)=>events.push(['action',index,command,pet?.id]),
  onChooseGame:(game,pet)=>events.push(['game',game,pet?.id])};
 return {nodes,query,props,events};
}
const pets=[{id:'frog',name:'Жабка'},{id:'cat',name:'Кіт'}];
const games=[['tag','Квач'],['music','Музика']];
test('sandbox view preserves peer order, selected class, aria label, button icons and actions',()=>{
 const h=harness();
 renderSandboxControls(sandboxControlModel(pets,5,false,true,games),h.props);
 assert.equal(h.query('#sandbox-controls').hidden,false);
 const peers=h.query('#sandbox-peers').children,actions=h.query('#sandbox-actions').children;
 assert.deepEqual(peers.map(p=>p.textContent),['Жабка','Кіт']);
 assert.deepEqual(peers.map(p=>p.className),['sandbox-peer','sandbox-peer selected']);
 assert.equal(peers[1].attributes.get('aria-pressed'),'true');
 assert.equal(actions.length,6);
 assert.equal(actions[1].attributes.get('aria-label'),'Грати · Кіт');
 assert.equal(actions[1].className,'sandbox-action selected');
 assert.equal(actions[1].children[0].type,'icon:play');
 assert.equal(actions[1].children[1].textContent,'Грати');
 peers[0].onclick();actions[1].onclick();actions[4].onclick();
 assert.deepEqual(h.events,[['peer',0],['action',1,'play','cat'],['game','tag','cat']]);
});
test('empty sandbox leaves actions disabled and does not invent selected pet',()=>{
 const h=harness();
 renderSandboxControls(sandboxControlModel([],0,false,true,games),h.props);
 assert.equal(h.query('#sandbox-peers').children.length,0);
 const actions=h.query('#sandbox-actions').children;
 assert.equal(actions.length,6);
 assert.ok(actions.every(button=>button.disabled));
 assert.equal(actions[0].attributes.get('aria-label'),'Привітатись');
 actions[0].onclick();
 assert.deepEqual(h.events,[['action',0,'hello',undefined]]);
});
test('busy and offline states preserve button disable rules',()=>{
 for(const [busy,online] of [[true,true],[false,false]]){
  const h=harness();
  renderSandboxControls(sandboxControlModel(pets,0,busy,online,games),{...h.props,busy});
  assert.equal(h.query('#sandbox-peers').children[0].disabled,busy);
  assert.ok(h.query('#sandbox-actions').children.every(button=>button.disabled));
 }
});
test('hidden sandbox keeps pre-existing DOM children and only changes visibility',()=>{
 const h=harness(),peers=h.query('#sandbox-peers'),saved=new Element('saved');
 peers.append(saved);
 renderSandboxControls(null,h.props);
 assert.equal(h.query('#sandbox-controls').hidden,true);
 assert.deepEqual(peers.children,[saved]);
});
test('app keeps stateful event callbacks; extracted view never accesses globals',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 const source=readFileSync(new URL('../public/sandbox-controls-view.js',import.meta.url),'utf8');
 assert.match(app,/sandboxControlModel\(sandboxPets,choice,busy,online,socialGames\)/);
 assert.match(app,/void sandboxAction\(command,selected\.id\)/);
 assert.match(app,/void sandboxAction\('play',selected\.id,game\)/);
 assert.match(app,/renderSandboxControls\(controls,/);
 assert.doesNotMatch(source,/document\.|localStorage|window\.|Date\.now\(/);
});
