// Experimental owner-only 3D study. It does not read or modify game state.
import * as THREE from 'three';
const $=id=>document.getElementById(id), canvas=$('view'), status=$('status');
let renderer;
try { renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:false,preserveDrawingBuffer:true}); }
catch { status.textContent='На цьому пристрої не вдалося запустити WebGL. Повернись до звичайної тестової кімнати.'; throw new Error('WebGL unavailable'); }
renderer.setPixelRatio(1);renderer.setSize(320,240,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color('#f0e6d0');
const camera=new THREE.OrthographicCamera(-3.55,3.55,2.66,-2.66,.1,100);camera.position.set(0,4.4,9);camera.lookAt(0,1.35,0);
scene.add(new THREE.HemisphereLight('#fff3dc','#777c75',2));const sun=new THREE.DirectionalLight('#fff3df',2);sun.position.set(-4,8,6);scene.add(sun);
const mat=c=>new THREE.MeshLambertMaterial({color:c});
const colors={fur:mat('#b6a1cf'),light:mat('#eee2ee'),dark:mat('#594860'),pink:mat('#edb5bc'),eye:mat('#342b3a'),white:mat('#fff4e5'),red:mat('#a7464c'),red2:mat('#773941'),hat:mat('#dfc693'),band:mat('#a87d5c'),floor:mat('#ad845e'),wall:mat('#d8cbb1'),bowl:mat('#a4bcb0'),water:mat('#d2e8da')};
const ballGeo=new THREE.SphereGeometry(1,16,10), cubeGeo=new THREE.BoxGeometry(1,1,1);
function mesh(parent,geo,material,pos,scale){const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.scale.set(...scale);parent.add(m);return m;}
const ball=(p,m,pos,s)=>mesh(p,ballGeo,m,pos,s), box=(p,m,pos,s)=>mesh(p,cubeGeo,m,pos,s);
// Room and props use intentionally simple geometric placeholders, not final art.
box(scene,colors.floor,[0,-.15,0],[12,.25,10]);box(scene,colors.wall,[0,2,-2.7],[12,4,.15]);
const bowl=new THREE.Group();bowl.position.set(2.05,.05,.15);scene.add(bowl);
mesh(bowl,new THREE.CylinderGeometry(.43,.31,.23,16),colors.bowl,[0,.12,0],[1,1,1]);mesh(bowl,new THREE.CylinderGeometry(.32,.32,.012,16),colors.water,[0,.245,0],[1,1,1]);
const actor=new THREE.Group();actor.position.set(-.55,0,.15);scene.add(actor);
const body=new THREE.Group();actor.add(body);ball(body,colors.fur,[0,.74,0],[.65,.73,.43]);
const sweater=new THREE.Group();body.add(sweater);ball(sweater,colors.red,[0,.72,.01],[.67,.51,.445]);box(sweater,colors.red2,[0,1.09,.02],[.66,.13,.68]);
for(const x of [-.49,.49])ball(body,colors.fur,[x,.70,.06],[.25,.42,.26]);
for(const x of [-.34,.34])ball(body,colors.light,[x,.16,.25],[.30,.18,.33]);
const tailPivot=new THREE.Group();tailPivot.position.set(-.48,.35,-.18);body.add(tailPivot);const tail=ball(tailPivot,colors.fur,[-.35,.27,0],[.22,.57,.22]);tail.rotation.z=-.75;
const headPivot=new THREE.Group();headPivot.position.set(0,1.34,0);body.add(headPivot);
ball(headPivot,colors.fur,[0,.40,0],[.83,.67,.52]);
for(const x of [-.59,.59]){const e=mesh(headPivot,new THREE.ConeGeometry(.31,.55,4),colors.fur,[x,.93,0],[1,1,.8]);e.rotation.z=x<0?.15:-.15;const inner=mesh(headPivot,new THREE.ConeGeometry(.17,.32,4),colors.pink,[x,.94,.205],[1,1,.5]);inner.rotation.z=e.rotation.z;}
ball(headPivot,colors.light,[0,.22,.43],[.43,.25,.12]);
const eyes=[];for(const x of [-.30,.30]){const eye=ball(headPivot,colors.eye,[x,.47,.46],[.11,.14,.075]);eyes.push(eye);ball(headPivot,colors.white,[x-.03,.52,.525],[.035,.04,.02]);}
ball(headPivot,colors.pink,[0,.29,.55],[.09,.06,.045]);
const hat=new THREE.Group();headPivot.add(hat);hat.position.set(0,.91,-.02);
mesh(hat,new THREE.CylinderGeometry(.47,.58,.15,16),colors.hat,[0,.06,0],[1,1,.83]);mesh(hat,new THREE.CylinderGeometry(.33,.41,.33,16),colors.hat,[0,.28,0],[1,1,.83]);mesh(hat,new THREE.CylinderGeometry(.405,.41,.055,16),colors.band,[0,.14,0],[1,1,.83]);
const state={action:'idle',hat:true,sweater:true,paused:false,time:0,last:performance.now()};
function update(t){const dt=Math.min(.05,Math.max(0,(t-state.last)/1000));state.last=t;if(!state.paused)state.time+=dt;const q=state.time,cycle=q%8;let progress=0;
 if(state.action==='bowl'){progress=cycle<2?cycle/2:cycle<5?1:cycle<7?1-(cycle-5)/2:0;actor.position.x=-.55+progress*1.50;actor.rotation.y=progress*(cycle<5?.55:0);headPivot.rotation.x=progress*(cycle>2&&cycle<5?.27:0);}
 else{actor.position.x=-.55;actor.rotation.y=state.action==='turn'?Math.sin(q*.7)*1.05:0;headPivot.rotation.x=0;}
 headPivot.rotation.y=state.action==='look'?Math.sin(q*1.1)*.65:state.action==='idle'?Math.sin(q*.7)*.12:0;
 body.position.y=Math.sin(q*2)*.025;tailPivot.rotation.z=Math.sin(q*2.4)*.15;
 const blink=(q%4.8>4.68&&q%4.8<4.78);for(const e of eyes)e.scale.y=blink?.015:.14;
 hat.visible=state.hat;sweater.visible=state.sweater;renderer.render(scene,camera);requestAnimationFrame(update);
}
$('action').onchange=e=>{state.action=e.target.value;state.time=0;};$('hat').onchange=e=>state.hat=e.target.checked;$('sweater').onchange=e=>state.sweater=e.target.checked;
$('pause').onclick=()=>{state.paused=!state.paused;$('pause').textContent=state.paused?'Продовжити':'Пауза';};
status.textContent='Експериментальна об’ємна модель кота. Це технічний прототип, не фінальна графіка.';requestAnimationFrame(update);
