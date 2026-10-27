// One owner-only laboratory, seven editing workspaces. Panels reuse the current controls.
const tabs=[
 ['scene','Scene','Сцена'],['pet','Pet Studio','Пет'],['rig','Rig & Anatomy','Анатомія'],
 ['wardrobe','Wardrobe Studio','Одяг'],['furniture','Furniture Studio','Меблі'],
 ['animation','Animation Studio','Анімація'],['qa','Graphic QA','Перевірки']
];
export function mountLabTabs(root=document){
 const nav=root.getElementById('lab-tabs');if(!nav)return;
 const panels=[...root.querySelectorAll('[data-lab-panel]')];
 const buttons=[];
 function activate(id){
  if(!tabs.some(t=>t[0]===id))id='scene';
  for(const p of panels){const groups=(p.dataset.labPanel||'').split(/\s+/);p.hidden=!groups.includes(id);}
  for(const b of buttons){const selected=b.dataset.target===id;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;}
  root.getElementById('lab-active-name').textContent=tabs.find(t=>t[0]===id)[1];
 }
 for(const [id,title,label] of tabs){
  const button=root.createElement('button');button.type='button';button.textContent=title;button.dataset.target=id;
  button.setAttribute('role','tab');button.setAttribute('aria-controls','lab-workspace');
  button.addEventListener('click',()=>activate(id));nav.append(button);buttons.push(button);
 }
 nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Pixel 2.5D laboratory workspaces');
 nav.addEventListener('keydown',event=>{
  if(!['ArrowRight','ArrowLeft'].includes(event.key))return;
  const at=buttons.findIndex(b=>b.getAttribute('aria-selected')==='true');
  const next=buttons[(at+(event.key==='ArrowRight'?1:buttons.length-1))%buttons.length];
  next.click();next.focus();event.preventDefault();
 });
 activate('scene');return {activate};
}
if(typeof document!=='undefined'&&document.getElementById('lab-tabs'))mountLabTabs();
