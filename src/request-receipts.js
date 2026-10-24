const mutationPaths=new Set(['/api/action','/api/adopt','/api/family','/api/reminders','/api/living','/api/companion','/api/cozy','/api/world','/api/daily','/api/playroom']);
export const validRequestId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{16,80}$/.test(id);
export function ephemeralRequest(path,b){return path==='/api/living'&&['roomPlay','gesture'].includes(b.command)||path==='/api/playroom'&&b.command==='toyTurn';}
export function protectedRequest(path,body){return mutationPaths.has(path)&&!ephemeralRequest(path,body);}
export async function requestSignature(path,body){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(path+'\n'+JSON.stringify(body)));return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');}
// SQLite transaction covers both the game mutation and its small receipt.
// Never wrap shared-wallet/sandbox network calls inside this transaction.
export async function requestOnce(storage,id,signature,apply,now=Date.now()){
 return storage.transaction(async()=>{
 const key='request-receipt:'+id,old=await storage.get(key);
 if(old){if(old.signature!==signature)return Response.json({error:'Ідентифікатор запиту вже використаний для іншої дії.'},{status:409});const state=await storage.get('pet');return Response.json({...old.data,...(old.hasState?{state:state||null}:{}),replayed:true},{status:old.status,headers:{'Cache-Control':'no-store'}});}
 const response=await apply();if(response.status>=500)throw new Error('Unconfirmed mutation');
 const data=await response.clone().json(),hasState=Object.hasOwn(data,'state');delete data.state;
 await storage.put(key,{signature,at:now,status:response.status,hasState,data});await pruneReceipts(storage,'request-receipt:',now);return response;
 });
}

export async function pruneReceipts(storage,prefix,now=Date.now()){
 if(!storage.list||!storage.delete)return;const gcKey='receipt-gc:'+prefix,gc=await storage.get(gcKey)||{at:0,cursor:null};if(now-gc.at<5*60000)return;
 const rows=await storage.list({prefix,limit:64,...(gc.cursor?{startAfter:gc.cursor}:{})});for(const [key,row]of rows)if(now-row.at>86400000)await storage.delete(key);
 await storage.put(gcKey,{at:now,cursor:rows.size===64?[...rows.keys()].at(-1):null});
}
