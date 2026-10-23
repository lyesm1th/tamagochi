// LCD-sized gestures, aligned to the moving character; no emoji overlays.
export function drawIdle(ctx,pose,s,frame=0){if(!s||s.dead||s.sleeping||s.napping)return;const r=(x,y,w,h,c='#35482e')=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};const blink=Math.floor(frame/180)%2;
 if(pose.kind==='scratch'){r(80,48+blink*4,6,3);r(83,44+blink*4,3,9);r(89,43,2,2);}
 if(pose.kind==='look'){const frog=s.species==='frog';r(frog?47:53,frog?36:48,2,3,'#e8ecc3');r(frog?77:73,frog?36:48,2,3,'#e8ecc3');r(91,37,3,3);}
 if(pose.kind==='yawn'){r(61,60,7,blink?6:3);r(67,59,4,3);}
 if(pose.kind==='sit'){r(45,79,12,3);r(74,79,12,3);}
 if(pose.kind==='disgust'){r(51,43,8,2);r(70,45,8,2);r(88,40,2,8);r(88,50,2,2);r(33,60+blink*3,6,3);}
 if(pose.kind==='walk'){r(pose.x>0?35:88,86,4,2,'#728153');}
}
