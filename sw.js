const CACHE='ficha-autoescuela-v21';
const ASSETS=['./','index.html','styles.css','app.js?v=21','data.js?v=21','compat.js?v=21','students-ui.js?v=21','ui-simplify.js?v=21','pdf-center-fix.js?v=21','pdf-v11.js?v=21','history-enhance.js?v=21','session-reset.js?v=21','class-workflow.js?v=21','history-edit.js?v=21','pdf-enhance.js?v=21','manifest.webmanifest'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin===location.origin && url.pathname==='/api/dgt-pdf'){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
      return response;
    }).catch(()=>caches.match(event.request)));
    return;
  }
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put('index.html',copy));}
      return response;
    }).catch(()=>caches.match('index.html')));
    return;
  }
  if(event.request.method==='GET' && url.origin===location.origin){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
      return response;
    }).catch(()=>caches.match(event.request)));
  }
});