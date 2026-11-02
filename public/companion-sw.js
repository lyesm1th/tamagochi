// RAARRRAHOCHI iPhone PWA service worker: notifications only, never caches pet state.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
 let payload={};
 try{payload=event.data?.json()||{};}catch{payload={body:event.data?.text()||''};}
 const title=String(payload.title||'🐾 РААААРРРАГОЧІ').slice(0,80);
 const body=String(payload.body||'Твій пет чекає на тебе!').slice(0,240);
 event.waitUntil(self.registration.showNotification(title,{
  body,tag:'raaarrr-pet-'+String(payload.kind||'care'),renotify:true,
  icon:'/companion-icon.png',badge:'/companion-icon.png',
  data:{url:'/companion.html'},vibrate:[120,60,120]
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const url=new URL('/companion.html',self.location.origin).href;
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows){
   if(new URL(client.url).pathname==='/companion.html'){await client.focus();return;}
  }
  await self.clients.openWindow(url);
 })());
});
