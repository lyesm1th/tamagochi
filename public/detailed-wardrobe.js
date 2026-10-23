// Coordinates refer to the visible, cropped sprite. Tails and ears are not torso centers.
const anatomy={
 dog:{cx:.50,eyes:.42,neck:.69,top:.65,width:.62,height:.25,hat:.02,hands:[[.26,.80,.12,.12],[.63,.80,.12,.12]]},
 cat:{cx:.46,eyes:.43,neck:.66,top:.64,width:.60,height:.26,hat:.06,hands:[[.25,.80,.12,.13],[.56,.80,.12,.13]]},
 chicken:{cx:.50,eyes:.41,neck:.64,top:.61,width:.68,height:.25,hat:.04,hands:[]},
 frog:{cx:.49,eyes:.19,neck:.58,top:.58,width:.59,height:.29,hat:.00,hands:[[.16,.70,.14,.15],[.68,.70,.14,.15]]},
 corgi:{cx:.48,eyes:.44,neck:.67,top:.65,width:.63,height:.25,hat:.11,hands:[[.24,.80,.12,.12],[.60,.80,.12,.12]]},
 bear:{cx:.49,eyes:.41,neck:.61,top:.60,width:.67,height:.28,hat:.04,hands:[[.12,.65,.15,.15],[.72,.65,.15,.15]]},
 dino:{cx:.39,eyes:.40,neck:.60,top:.57,width:.60,height:.31,hat:.07,hands:[[.12,.64,.17,.12],[.46,.64,.17,.12]]},
 bunny:{cx:.49,eyes:.53,neck:.73,top:.71,width:.62,height:.20,hat:.29,hands:[[.22,.76,.18,.14],[.59,.76,.18,.14]]}
};
export function wardrobeAnatomy(species,age,sheet='adults'){
 const base=anatomy[species]||anatomy.cat,a={...base,hands:base.hands.map(r=>[...r])};
 if(age==='Малюк'||age==='Дитина'){
  // Juvenile heads are larger, leaving less room below their muzzle.
  const baby=age==='Малюк',young={dog:[.45,.72,.70,.20],cat:[.45,.71,.70,.21],chicken:[.42,.68,.67,.22],frog:[.20,.64,.63,.25],corgi:[.45,.71,.70,.21],bear:[.43,.67,.66,.24],dino:[.43,.65,.63,.27],bunny:[.52,.75,.74,.18]}[species]||[.45,.70,.69,.21];
  [a.eyes,a.neck,a.top,a.height]=young;a.width*=baby?.90:.96;
 }
 if(sheet==='happy'){a.width*=.94;a.hands=[];}
 return a;
}
export function wardrobeLayout(species,age,sheet,box,worn={},sleeping=false){
 const a=wardrobeAnatomy(species,age,sheet),out=[],rect=(slot,id,left,top,width,height)=>out.push({slot,id,x:box.x+left*box.w,y:box.y+top*box.h,w:width*box.w,h:height*box.h});
 if(worn.body&&!sleeping)rect('body',worn.body,a.cx-a.width/2,a.top,a.width,a.height);
 if(worn.neck){const scarf=worn.neck==='scarf',width=scarf?.45:.35;rect('neck',worn.neck,a.cx-width/2,sleeping?.83:a.neck,width,sleeping?.11:scarf?.20:.13);}
 if(worn.head&&!sleeping)rect('head',worn.head,a.cx-.29,a.hat-.12,.58,.23);
 if(worn.eyes&&!sleeping)rect('eyes',worn.eyes,a.cx-.32,a.eyes-.065,.64,.13);
 return {pieces:out,hands:!sleeping&&worn.body&&sheet!=='happy'?a.hands.map(([x,y,w,h])=>({x:box.x+x*box.w,y:box.y+y*box.h,w:w*box.w,h:h*box.h})):[]};
}
