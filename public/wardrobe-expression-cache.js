// Reuse a derived expression only for an EXACT matching input snapshot.
// Weak keys never keep evicted outfit canvases alive.
const recent=new WeakMap();
export function cachedExpressionFrame(base,id,stage,appearance,pad,render){
 if(!appearance?.strength)return base;
 // These are all the appearance fields read by expressionFrame. Keep exact
 // numerical precision: rounding or bucketing can visibly freeze movement.
 const key=[id,stage,pad,appearance.kind,appearance.strength,
  appearance.gesture,appearance.blink,appearance.tear].join('|');
 const previous=recent.get(base);
 if(previous?.key===key)return previous.image;
 const image=render(base,id,stage,appearance,pad);
 recent.set(base,{key,image});
 return image;
}
