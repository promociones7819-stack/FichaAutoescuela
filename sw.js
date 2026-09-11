const CACHE='ficha-autoescuela-v11';
const ASSETS=['./','index.html','styles.css','app.js?v=11','data.js?v=11','compat.js?v=11','students-ui.js?v=11','ui-simplify.js?v=11','vehicle-type.js?v=11','pdf-v11.js?v=11','history-enhance.js?v=11','session-reset.js?v=11','class-workflow.js?v=11','pdf-enhance.js?v=11','manifest.webmanifest'];
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