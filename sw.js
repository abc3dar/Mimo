// Mimo y el camino a casa - funciona sin internet una vez instalado.
// Con internet siempre baja la última versión; sin internet usa la copia guardada.
// Si actualizás direcciones.html, cambiá el número de versión de abajo (v6 -> v7).
var CACHE='mimo-v6';
var FILES=['direcciones.html','manifest.webmanifest','icon-192.png','icon-512.png'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(new Promise(function(resolve){
    var done=false;
    function fromCache(){
      return caches.match(e.request,{ignoreSearch:true}).then(function(hit){return hit||caches.match('direcciones.html');});
    }
    function answer(r){if(!done&&r){done=true;resolve(r);}}
    var timer=setTimeout(function(){fromCache().then(answer);},3000);   // red lenta: usa la copia guardada
    fetch(e.request,{cache:'no-cache'}).then(function(r){
      clearTimeout(timer);
      if(r&&r.ok){var copy=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,copy);});}
      answer(r);
    }).catch(function(){
      clearTimeout(timer);
      fromCache().then(function(hit){if(hit)answer(hit);else if(!done){done=true;resolve(Response.error());}});
    });
  }));
});
