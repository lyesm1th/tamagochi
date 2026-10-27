// Owner-only lab display switch. Both renderers remain inside the existing /lab.html.
export function mountLabView(root=document){
 const mode=root.getElementById('lab-view-mode');
 if(!mode)return;
 const detailed=root.getElementById('lab-detailed-view');
 const pixel=root.getElementById('pixel25d');
 const update=()=>{
  const value=mode.value;
  detailed.hidden=value==='pixel25d';
  pixel.hidden=value==='detailed';
  root.body?.classList?.toggle('lab-compare',value==='compare');
 };
 mode.addEventListener('change',update);
 update();
 return {update};
}
if(typeof document!=='undefined'&&document.getElementById('lab-view-mode'))mountLabView();
