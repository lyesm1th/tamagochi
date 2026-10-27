// Deterministic laboratory animation states. Never touches the game clock or player saves.
export const labClips=Object.freeze({
 idle:{duration:2400,tilt:2,yaw:4,bob:2},
 curious:{duration:1800,tilt:12,yaw:16,bob:1},
 wave:{duration:1400,tilt:6,yaw:8,bob:4},
 sleepy:{duration:3000,tilt:-9,yaw:3,bob:2},
 dance:{duration:1200,tilt:14,yaw:18,bob:7}
});
export function labClipPose(name,time=0,speed=1){
 const clip=labClips[name]||labClips.idle;
 const t=((Math.max(0,time)*Math.max(.01,speed))%clip.duration)/clip.duration;
 const phase=t*Math.PI*2;
 return {tilt:Math.sin(phase)*clip.tilt,yaw:Math.sin(phase)*clip.yaw,bob:Math.max(0,Math.sin(phase))*clip.bob,progress:t};
}
