// Declarative interaction-to-animation bridge. Pure, deterministic, no player-state writes.
export const animationLibrary=Object.freeze({
 idle:{duration:2400,head:3,hand:1,bob:2,blink:true},
 greet:{duration:1400,head:9,hand:23,bob:4,blink:true},
 pet:{duration:1100,head:12,hand:4,bob:3,blink:true},
 cuddle:{duration:1800,head:10,hand:17,bob:2,blink:true},
 reject:{duration:1200,head:-13,hand:-10,bob:1,blink:false},
 eat:{duration:900,head:6,hand:12,bob:2,blink:true},
 drink:{duration:1200,head:10,hand:8,bob:2,blink:true},
 sleep:{duration:3000,head:-5,hand:0,bob:1,blink:false},
 wake:{duration:1200,head:12,hand:7,bob:5,blink:true},
 walk:{duration:780,head:4,hand:20,bob:5,blink:true},
 dance:{duration:1150,head:15,hand:25,bob:8,blink:true},
 play:{duration:1300,head:11,hand:22,bob:5,blink:true},
 mirror:{duration:1750,head:18,hand:9,bob:3,blink:true},
 bed:{duration:1600,head:-10,hand:7,bob:4,blink:true},
 inspect:{duration:1800,head:17,hand:6,bob:2,blink:true},
 sad:{duration:2400,head:-9,hand:-4,bob:1,blink:true},
 angry:{duration:1150,head:-16,hand:-13,bob:4,blink:true}
});
export const interactionAnimations=Object.freeze({
 feed:'eat',food:'eat',milk:'drink',water:'drink',sleep:'sleep',wake:'wake',
 pet:'pet',stroke:'pet',cuddle:'cuddle',hug:'cuddle',reject:'reject',
 greeting:'greet',hello:'greet',walk:'walk',dance:'dance',
 toy:'play',play:'play',mirror:'mirror',bed:'bed',inspect:'inspect',
 sad:'sad',angry:'angry',idle:'idle'
});
export function animationForInteraction(action){return interactionAnimations[action]||'inspect';}
export function interactionPose(name,time=0){
 const clip=animationLibrary[name]||animationLibrary.idle;
 const phase=2*Math.PI*((Math.max(0,time)%clip.duration)/clip.duration);
 const wave=Math.sin(phase),pulse=(1-Math.cos(phase))/2;
 const blink=clip.blink&&((Math.max(0,time)%clip.duration)>=clip.duration-120);
 return {headYaw:clip.head*wave,leftHand:clip.hand*wave,
 rightHand:-clip.hand*wave,bob:clip.bob*pulse,blink,
 garmentAnchors:Object.freeze(['head','eyes','neck','body','leftHand','rightHand']),
 roomAnchors:Object.freeze(['floor','bed','mirror','toy']),
 contacts:Object.freeze({floor:{x:0,y:1},bed:{x:0,y:.72},mirror:{x:.28,y:.55},toy:{x:-.2,y:.76}})};
}
