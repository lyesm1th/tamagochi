// Photograph composition extracted verbatim; dependencies are supplied by the
// app so neither graphics mode nor DOM state changes here.
export function composePhotoScene(cv,p,{detailedReady,drawDetailedMain,drawExpandedRoom,drawClassic,drawLighting,createCanvas}){
 if(detailedReady()){drawDetailedMain(cv,p,p.species,1000,true,{x:96,feet:128,scale:.9},null);return;}
 cv.width=192;cv.height=144;
 const c=cv.getContext('2d');
 drawExpandedRoom(c,p,1000,true);
 const layer=createCanvas();layer.width=128;layer.height=100;
 drawClassic(layer,p.species,1000,p,false,true);
 c.drawImage(layer,39,43,115,90);
 drawLighting(c,p);
}
