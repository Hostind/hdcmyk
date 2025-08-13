// Service Worker for LAB Color Matching Calculator
// Requirements: 10.1, 10.2, 10.3 - PWA offline functionality

const CACHE_NAME = 'lab-calculator-v2';
const STATIC_CACHE_NAME = 'lab-calculator-static-v2';

// Core files needed for offline functionality
const CORE_FILES = [
  '/',
  '/index.html',
  '/src/css/styles.css',
  '/src/js/calculator.js',
  '/src/js/color-science.js',
  '/src/js/storage.js',
  '/src/js/export.js',
  '/manifest.json'
];

// Optional files that enhance the experience but aren't critical
const OPTIONAL_FILES = [
  '/src/assets/icons/icon.svg'
];

// Install event - cache core files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache core files
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('Service Worker: Caching core files');
        return cache.addAll(CORE_FILES);
      }),
      
      // Cache optional files (don't fail if these aren't available)
      caches.open(CACHE_NAME).then(cache => {
        console.log('Service Worker: Caching optional files');
        return Promise.allSettled(
          OPTIONAL_FILES.map(file => cache.add(file))
        );
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      // Force activation of new service worker
      return self.skipWaiting();
    }).catch(error => {
      console.error('Service Worker: Installation failed', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached version if available
      if (cachedResponse) {
        console.log('Service Worker: Serving from cache', event.request.url);
        return cachedResponse;
      }
      
      // Try to fetch from network
      return fetch(event.request).then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response for caching
        const responseToCache = response.clone();
        
        // Cache the new response
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch(error => {
        console.log('Service Worker: Network fetch failed', error);
        
        // Return offline fallback for HTML requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
        
        // For other requests, just fail
        throw error;
      });
    })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform any background tasks when connection is restored
      syncOfflineData()
    );
  }
});

// Handle push notifications (future enhancement)
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'LAB Calculator notification',
    icon: '/src/assets/icons/icon.svg',
    badge: '/src/assets/icons/icon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open Calculator',
        icon: '/src/assets/icons/icon.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('LAB Color Calculator', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Utility function to sync offline data when connection is restored
async function syncOfflineData() {
  try {
    console.log('Service Worker: Syncing offline data...');
    
    // Check if we have any offline data to sync
    const offlineData = await getOfflineData();
    
    if (offlineData && offlineData.length > 0) {
      // Process offline data (this would depend on your specific needs)
      console.log('Service Worker: Found offline data to sync', offlineData.length);
      
      // Clear offline data after successful sync
      await clearOfflineData();
    }
    
    console.log('Service Worker: Offline data sync complete');
  } catch (error) {
    console.error('Service Worker: Offline data sync failed', error);
  }
}

// Get offline data from IndexedDB or localStorage
async function getOfflineData() {
  try {
    // For this simple implementation, we'll use localStorage
    const offlineData = localStorage.getItem('offlineCalculations');
    return offlineData ? JSON.parse(offlineData) : [];
  } catch (error) {
    console.error('Service Worker: Failed to get offline data', error);
    return [];
  }
}

// Clear offline data after sync
async function clearOfflineData() {
  try {
    localStorage.removeItem('offlineCalculations');
    console.log('Service Worker: Offline data cleared');
  } catch (error) {
    console.error('Service Worker: Failed to clear offline data', error);
  }
}

// Message handling for communication with main thread
self.addEventListener('message', event => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: CACHE_NAME
    });
  }
  
  if (event.data && event.data.type === 'CACHE_STATUS') {
    caches.has(STATIC_CACHE_NAME).then(hasCache => {
      event.ports[0].postMessage({
        type: 'CACHE_STATUS_RESPONSE',
        cached: hasCache
      });
    });
  }
});

console.log('Service Worker: Script loaded');