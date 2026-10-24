const reads=new Set(['state','album','tree','moments']);
export const isEphemeral=(path,b)=>path==='sandbox'||path==='living'&&['roomPlay','gesture'].includes(b.command)||path==='playroom'&&b.command==='toyTurn';
export const isRead=(path,b)=>reads.has(path)||path==='wallet'&&(!b.command||b.command==='status');
const transientStatus=s=>[408,425,429,500,502,503,504,520,521,522,523,524].includes(s);
function transportError(message){return Object.assign(new Error(message),{transport:true});}
export function createApiClient({getInitData,getTimezone=()=>Intl.DateTimeFormat().resolvedOptions().timeZone||'Europe/Kyiv',fetchImpl=(...a)=>fetch(...a),timeoutMs=15000,retryTimeoutMs=20000,retryDelayMs=500,pendingStore=null,onStatus=()=>{},idFactory=()=>crypto.randomUUID?.()||[...crypto.getRandomValues(new Uint8Array(16))].map(n=>n.toString(16).padStart(2,'0')).join(''),now=()=>Date.now()}={}){
 let active=0;const pending=new Map(),readFlights=new Map();try{for(const row of JSON.parse(pendingStore?.getItem('pet-pending-requests')||'[]'))if(now()-row.at<15*60000)pending.set(row.key,row);}catch{}
 const persist=()=>{try{pendingStore?.setItem('pet-pending-requests',JSON.stringify([...pending.values()].slice(-32)));}catch{}};
 const hash=async value=>{const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');};
 async function perform(path,body,options){
 active++;try{const read=isRead(path,body),ephemeral=isEphemeral(path,body),key=read||ephemeral?path:await hash(path+'\n'+JSON.stringify(body));let item=pending.get(key);
 if(!item||now()-item.at>15*60000){item={key,id:idFactory(),at:now()};if(!read&&!ephemeral){pending.set(key,item);persist();}}
 const payload=JSON.stringify({...body,timezone:getTimezone()}),attempts=ephemeral||options.background?1:2;
 for(let attempt=0;attempt<attempts;attempt++){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),options.background?6000:attempt?retryTimeoutMs:timeoutMs);let slow;
 try{if(!options.background)slow=setTimeout(()=>onStatus('waiting'),1800);
 const response=await fetchImpl('/api/'+path,{method:'POST',headers:{'Content-Type':'application/json','X-Telegram-Init-Data':getInitData(),'X-Request-ID':item.id},body:payload,signal:controller.signal});
 let data;try{data=await response.json();}catch{throw transportError('Сервер тимчасово не відповідає коректно.');}
 if(!response.ok){if(transientStatus(response.status)&&!data.permanent)throw transportError('З’єднання із сервером тимчасово перервалось.');pending.delete(key);persist();throw new Error(data.error||'Не вдалося виконати дію.');}
 pending.delete(key);persist();onStatus('connected');return data;
 }catch(error){const network=error.transport||error.name==='AbortError'||error.name==='TimeoutError'||error instanceof TypeError;if(!network)throw error;}
 finally{clearTimeout(timer);clearTimeout(slow);}
 if(attempt+1<attempts){onStatus('retrying');await new Promise(r=>setTimeout(r,retryDelayMs*(attempt+1)));}
 }
 onStatus('offline');throw transportError(read?'Не вдалося оновити стан. Перевір з’єднання — апка спробує відновитись сама.':ephemeral?'З’єднання перервалось. Відновлюю стан пета.':'Не вдалося підтвердити дію. Відновлюю зв’язок і перевіряю стан пета.');
 }finally{active--;}}
 return {busy:()=>active>0,request(path,body={},options={}){
 if(options.background&&active)return Promise.resolve(null);
 const key=path+'\n'+JSON.stringify(body);if(isRead(path,body)&&readFlights.has(key))return readFlights.get(key);
 const promise=perform(path,body,options);if(isRead(path,body)){readFlights.set(key,promise);promise.finally(()=>{if(readFlights.get(key)===promise)readFlights.delete(key);}).catch(()=>{});}return promise;
 }};
}
