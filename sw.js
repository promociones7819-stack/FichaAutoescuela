const CACHE='ficha-autoescuela-v19';
const ASSETS=['./','index.html','styles.css','app.js?v=19','data.js?v=19','compat.js?v=19','navigation-boot.js?v=19','students-ui.js?v=19','home-admin.js?v=19','ui-simplify.js?v=19','backup-enhance.js?v=19','pdf-center-fix.js?v=19','pdf-class-context.js?v=19','pdf-v11.js?v=19','history-enhance.js?v=19','session-reset.js?v=19','class-workflow.js?v=19','history-edit.js?v=19','pdf-enhance.js?v=19','manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))).then(()=>self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
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
    event.respondWith(fetch(event.request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put('index.html',copy));}
      return response;
    }).catch(()=>caches.match('index.html')));
    return;
  }
  if(event.request.method==='GET' && url.origin===location.origin){
    event.respondWith(fetch(event.request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
      return response;
    }).catch(()=>caches.match(event.request)));
  }
});