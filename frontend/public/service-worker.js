// Service Worker using Workbox pattern without the library
const CACHE_NAME = 'lovable-app-v2'; // Version bump
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/assets/fonts/Inter-Regular.woff2',
  '/assets/fonts/Inter-Medium.woff2',
  '/assets/fonts/Inter-Bold.woff2',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json'
];

// Log for debugging
console.log('Service Worker Version v2 loaded');

// Should this request be handled by the service worker?
function shouldHandleRequest(url) {
  const urlObj = new URL(url);
  
  // Skip handling these requests
  if (
    // Skip Supabase Edge Functions
    urlObj.hostname.includes('supabase.co') ||
    urlObj.pathname.includes('/functions/') ||
    // Skip API requests
    urlObj.pathname.includes('/api/') ||
    // Skip browser-sync
    urlObj.pathname.includes('/browser-sync/') ||
    // Skip chrome extensions
    urlObj.hostname.includes('chrome-extension')
  ) {
    console.log('Service worker: Skipping interception for:', url);
    return false;
  }
  
  return true;
}

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  // Claim clients to take control immediately
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('lovable-app-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Service Worker: Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip requests that shouldn't be handled
  if (!shouldHandleRequest(request.url)) {
    return;
  }
  
  // Handle HTML navigation requests - Network first, fallback to cache
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response to store in cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache or to offline page
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If no cache, serve the offline page
              return caches.match('/');
            });
        })
    );
    return;
  }
  
  // For other assets - Cache first, fallback to network
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(request)
          .then(networkResponse => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // Cache the response
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
            
            return networkResponse;
          })
          .catch(error => {
            console.error('Service Worker: Fetch failed', error);
            throw error;
          });
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New update from Lovable',
      icon: '/logo192.png',
      badge: '/badge.png',
      data: data.url || '/',
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'close', title: 'Close' }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Lovable App', options)
    );
  } catch (error) {
    console.error('Service Worker: Error processing push notification', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        // If a window client already exists, focus it
        for (const client of clientList) {
          if (client.url === event.notification.data && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data);
        }
      })
  );
});

// Background sync - scheduled for when connection is restored
self.addEventListener('sync', event => {
  console.log('Service Worker: Sync event triggered', event.tag);
  
  if (event.tag === 'sync-reflections') {
    event.waitUntil(syncReflections());
  }
});

// Mock function for syncing data when back online
// In a real app, replace with actual implementation
async function syncReflections() {
  console.log('Service Worker: Attempting to sync reflections');
  
  try {
    // This would be implemented with actual IndexedDB and API calls
    console.log('Service Worker: Sync successful');
    return Promise.resolve();
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
    throw error;
  }
} 