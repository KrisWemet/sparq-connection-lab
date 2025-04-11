// Service Worker for Sparq Connect PWA

const CACHE_NAME = 'sparq-connect-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/vite.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[Service Worker] Cache failed:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  
  // Clean up old cache versions
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Ensure the service worker takes control immediately
  return self.clients.claim();
});

// Fetch event - serve from cache or network with cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip non-HTTP/HTTPS requests
  if (!event.request.url.startsWith('http')) return;
  
  // Skip cross-origin requests
  const url = new URL(event.request.url);
  if (url.origin !== location.origin && 
      !url.hostname.includes('googleapis.com') && 
      !url.hostname.includes('gstatic.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response so we can put one copy in cache and return the other
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return networkResponse;
          })
          .catch((error) => {
            console.log('[Service Worker] Fetch failed:', error);
            
            // For navigation requests, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            // Return nothing for other failed requests
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Handle background sync for deferred operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Function to sync data when back online
async function syncData() {
  try {
    // Get the stored sync queue from IndexedDB
    const syncQueue = await getSyncQueue();
    
    if (syncQueue && syncQueue.length > 0) {
      // Process each queued item
      for (const item of syncQueue) {
        try {
          // Try to send the data to the server
          const response = await fetch(item.url, {
            method: item.method,
            headers: item.headers,
            body: item.body,
          });
          
          if (response.ok) {
            // If successful, remove from queue
            await removeFromSyncQueue(item.id);
          }
        } catch (error) {
          console.error('[Service Worker] Sync failed for item:', item, error);
        }
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync error:', error);
  }
}

// Mock functions for sync queue management
// In a real app, these would use IndexedDB
async function getSyncQueue() {
  return [];
}

async function removeFromSyncQueue(id) {
  console.log('[Service Worker] Removed synced item:', id);
}

// Push notification support
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New notification from Sparq Connect',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: data.data || {},
    actions: data.actions || [],
    vibrate: [100, 50, 100],
    tag: data.tag || 'default'
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Sparq Connect',
      options
    )
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Handle action clicks
  if (event.action) {
    // Process specific actions
    console.log('[Service Worker] Notification action clicked:', event.action);
    return;
  }
  
  // Default action - open/focus app window
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // If we have an open window, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
