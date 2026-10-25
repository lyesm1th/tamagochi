// A tiny Map-based LRU for assembled outfit canvases. No changes to artwork.
export function getRecent(cache,key){
 if(!cache.has(key))return undefined;
 const value=cache.get(key);
 cache.delete(key);
 cache.set(key,value);
 return value;
}
export function storeRecent(cache,key,value,limit){
 if(cache.has(key))cache.delete(key);
 cache.set(key,value);
 while(cache.size>limit)cache.delete(cache.keys().next().value);
 return value;
}
