import {newPets} from './new-pets.js';
// LCD-sized gestures, aligned to the moving character; no emoji overlays.
export function drawIdle(ctx,pose,s,frame=0){if(!s||s.dead||s.sleeping||s.napping)return;const r=(x,y,w,h,c='#35482e')=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};const blink=Math.floor(frame/180)%2;
 if(pose.kind==='welcome'||pose.kind==='approach'){r(37,65-blink*4,8,3);r(84,65-blink*4,8,3);r(58,62,3,2);r(61,64,8,2);r(69,62,3,2);if(pose.kind==='welcome'){r(29,35-blink*3,3,3,'#b78594');r(94,29+blink*3,3,3,'#b78594');}}
 if(pose.kind==='tippy'){r(45,79-blink*3,11,4);r(72,76+blink*3,11,4);r(93,42,2,5);}
 if(pose.kind==='turned'){const colors={cat:'#bf9ae0',chicken:'#e9c954',corgi:'#e5a05a',frog:'#9bbf63',bear:'#b38a69',dog:'#f2eee1',dino:'#7cb3a0',bunny:'#e4bacb'};r(46,41,36,30,colors[s.species]||newPets[s.species]?.color);r(62,44,2,21,'#85916d');if(s.species==='chicken'){r(49,58,9,12,'#c7b04b');r(71,58,9,12,'#c7b04b');}else if(s.species==='frog'){r(44,68,10,8,'#85aa59');r(74,68,10,8,'#85aa59');}else{r(60,70,8,7,colors[s.species]||newPets[s.species]?.color);r(58,72,12,3);}}
 if(pose.kind==='scratch'){r(80,48+blink*4,6,3);r(83,44+blink*4,3,9);r(89,43,2,2);}
 if(pose.kind==='look'){const frog=s.species==='frog';r(frog?47:53,frog?36:48,2,3,'#e8ecc3');r(frog?77:73,frog?36:48,2,3,'#e8ecc3');r(91,37,3,3);}
 if(pose.kind==='yawn'){r(61,60,7,blink?6:3);r(67,59,4,3);}
 if(pose.kind==='sit'){r(45,79,12,3);r(74,79,12,3);}
 if(pose.kind==='disgust'){r(51,43,8,2);r(70,45,8,2);r(88,40,2,8);r(88,50,2,2);r(33,60+blink*3,6,3);}
 if(pose.kind==='toy'){r(21+blink*5,80-blink*3,6,6,'#b5828e');r(39,72,8,3);}
 if(pose.kind==='garden'){r(96,69,7,6,'#8da8af');r(103,72,7,2,'#8da8af');r(112,76+blink*3,2,3,'#8da8af');}
 if(pose.kind==='walk'){r(pose.x>0?35:88,86,4,2,'#728153');}
}
