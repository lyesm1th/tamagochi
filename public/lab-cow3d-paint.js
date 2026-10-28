// Owner lab: 3D surface paint derived from the *approved* black-and-ivory
// Detailed cow (the lower/reference image). Never sample facial features from
// a frontal atlas: projected eyes/nose become smeared when the mesh rotates.
// These solid pigment regions live in the cow's local 3D coordinates, so the
// markings remain attached during head turns, sleep, and full-body rotations.
export const originalCowPigments=Object.freeze({
 coat:'#faefdb',shadow:'#e9dbc7',patch:'#303039',patchLight:'#46434a',
 muzzle:'#f1b5aa',muzzleLight:'#f6c3b7',innerEar:'#ee9ba3',
 blush:'#f4aba8',horn:'#f0b66e',hornLight:'#ffce85',
 ink:'#201b20',hoof:'#2a2930',eye:'#151519',shine:'#fffefa'
});

const snap=(value,step)=>Math.round(value/step)*step;
const oval=(x,y,cx,cy,rx,ry)=>((x-cx)/rx)**2+((y-cy)/ry)**2<1;

// Pigment lookup per *raster pixel*, not per face. Prevents jagged polygon
// boundaries and makes body/head pattern independent of polygon tessellation.
export function paintOriginalCowSurface(part,p,normal,base){
 if(!p||p.length!==3)return base;
 const x=snap(p[0],.052),y=snap(p[1],.052),z=p[2];
 if(part==='head'){
  // Wide charcoal crown, asymmetric side bangs, ivory central forelock.
  const back=z<.06&&(y>.04||Math.abs(x)>.56);
  const cap=z>.08&&(
   (y>.36&&Math.abs(x)>.19)||
   (x<-.38&&y>.075&&y<.47&&oval(x,y,-.54,.28,.34,.35))||
   (x>.47&&y>.19&&oval(x,y,.59,.33,.33,.34))||
   (Math.abs(x)>.68&&y>.055)
  );
  const centreForelock=Math.abs(x)<.17&&y>.39;
  return (back||cap)&&!centreForelock?originalCowPigments.patch:base;
 }
 if(part==='body'){
  // The real sprite has an ivory centre/chest, dark flanks and patches around
  // the lower legs. Never put dark paint across the cream belly.
  const rear=z<-.66&&Math.abs(x)>.3;
  const side=z>-.32&&Math.abs(x)>.60&&y>.51&&y<1.54;
  const leftHip=z>-.18&&oval(x,y,-.66,.79,.28,.36);
  const rightHip=z>-.14&&oval(x,y,.72,.96,.22,.39);
  return rear||side||leftHip||rightHip?originalCowPigments.patch:base;
 }
 return base;
}
