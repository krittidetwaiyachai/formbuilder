


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(function(success) {
        if(success) {
          console.log('Service worker unregistered successfully');
        } else {
          console.log('Service worker unregistration failed');
        }
      });
    }
  });
  
  
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        return caches.delete(cacheName);
      })
    );
  }).then(function() {
    console.log('All caches cleared');
  });
}

