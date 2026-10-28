// Runtime attachment graph for the reference cat. Normalized coordinates follow existing Detailed anatomy.
// Pure transforms are shared by preview, garment checks and furniture contact alignment.
import {wardrobeAnatomy} from './detailed-wardrobe.js';
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
export function catAttachmentGraph(age='Дорослий',pose={}){
 const a=wardrobeAnatomy('cat',age),yaw=clamp(pose.headYaw,-30,30)*Math.PI/180;
 const headOffset=Math.sin(yaw)*.025;
 const headScale=1-.22*Math.abs(yaw)/(Math.PI/6);
 const head={x:a.cx+headOffset,y:a.neck,scaleX:headScale,yaw};
 const hand=(i)=>{const r=a.hands[i];return r?{x:r[0]+r[2]/2,y:r[1]+r[3]/2,angle:clamp(i?pose.rightHand:pose.leftHand,-30,30)}:null;};
 return {
  head,eyes:{x:head.x,y:a.eyes,scaleX:headScale},
  neck:{x:head.x,y:a.neck+.01},
  body:{x:a.cx,y:a.top+a.height/2},
  leftHand:hand(0),rightHand:hand(1),
  floor:{x:.5,y:1},bed:{x:.5,y:.76},mirror:{x:.7,y:.55},toy:{x:.32,y:.78}
 };
}
export function attachWardrobe(wearing={},graph=catAttachmentGraph()){
 return Object.entries({head:'head',eyes:'eyes',neck:'neck',body:'body'})
  .filter(([slot])=>Boolean(wearing[slot]))
  .map(([slot,joint])=>({slot,id:wearing[slot],joint,transform:graph[joint]}));
}
export function roomContact(action,graph=catAttachmentGraph()){
 const target=({sleep:'bed',bed:'bed',mirror:'mirror',play:'toy',toy:'toy',walk:'floor'})[action]||'floor';
 return {target,anchor:graph[target]};
}
