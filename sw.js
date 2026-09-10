const CACHE='ficha-autoescuela-v3';
const ASSETS=['./','index.html','styles.css','app.js','data.js','pdf-enhance.js','manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin===location.origin && url.pathname==='/api/dgt-pdf'){
    event.respondWith(fetch(event.request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
      return response;
    }).catch(()=>caches.match(event.request)));
    return;
  }
  if(event.request.method==='GET' && url.origin===location.origin){
    event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
      return response;
    })));
  }
});
