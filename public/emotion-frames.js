// Four authored expression frames, followed by a long quiet hold.
export const emotionKinds=['sad','angry','annoyed','amused','bored','curious','surprised','shy','anxious','hurt','proud','grateful','content'];
export function emotionFrame(e,now=Date.now(),reduced=false){
 if(reduced||!e?.strength)return 0;
 const elapsed=Math.max(0,now-(e.at||0)),phase=elapsed%12000;
 if(elapsed<1600)return [0,1,2,1][Math.min(3,Math.floor(elapsed/400))];
 if(phase<1200)return [0,1,2,3][Math.floor(phase/300)];
 return 0;
}
export function expressionRecipe(kind,frame=0){
 const blink=frame===3;
 return {
 sad:{eyes:'droop',mouth:'frown',brow:'sad',tear:frame===1?0:frame===2?1:-1},
 hurt:{eyes:'droop',mouth:'frown',brow:'sad',tear:frame===2?0:-1},
 angry:{eyes:'slant',mouth:'grit',brow:'angry'},
 annoyed:{eyes:'half',mouth:'flat',brow:'angry'},
 amused:{eyes:'arc',mouth:frame===1?'laughWide':'laugh',brow:null},
 bored:{eyes:frame===2?'closed':'half',mouth:frame===2?'yawn':'flat',brow:'flat'},
 curious:{eyes:'look',mouth:'small',brow:'raised'},
 surprised:{eyes:'wide',mouth:'oh',brow:'raised'},
 shy:{eyes:blink?'closed':'side',mouth:'smile',blush:true},
 anxious:{eyes:'wide',mouth:'small',brow:'sad'},
 proud:{eyes:'half',mouth:'smirk',brow:'raised'},
 grateful:{eyes:'arc',mouth:'smile',blush:true},
 content:{eyes:blink?'closed':'soft',mouth:'smile'}
 }[kind]||null;
}
