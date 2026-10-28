// Owner lab: 3D surface paint derived from the *approved* black-and-ivory
// Detailed cow (the lower/reference image). Never sample facial features from
// a frontal atlas: projected eyes/nose become smeared when the mesh rotates.
// These solid pigment regions live in the cow's local 3D coordinates, so the
// markings remain attached during head turns, sleep, and full-body rotations.
export const originalCowPigments=Object.freeze({
 coat:'#fff2df',shadow:'#eedcc8',patch:'#2d2a30',patchLight:'#414047',
 muzzle:'#f3a4ac',muzzleLight:'#f8bbc0',innerEar:'#ed99a1',
 blush:'#f3a1a5',horn:'#eeb567',hornLight:'#ffcf86',
 ink:'#241c22',hoof:'#302c30',eye:'#1e1c21',shine:'#fffefa'
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
   (x<-.36&&y>-.14&&y<.46&&oval(x,y,-.51,.20,.37,.47))||
   (x>.43&&y>.10&&oval(x,y,.57,.30,.35,.43))||
   (Math.abs(x)>.67&&y>-.14)
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
