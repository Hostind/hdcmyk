// Service Worker for HD CMYK Pro LAB Color Match Studio
// Enhanced with ChatGPT-5 UI integration and HD features
// Requirements: 10.1, 10.2, 10.3 - PWA offline functionality

const CACHE_NAME = 'hd-cmyk-studio-v13';
const STATIC_CACHE_NAME = 'hd-cmyk-studio-static-v13';
const HD_MODULES_CACHE = 'hd-modules-v13';

// Core files needed for offline functionality
const CORE_FILES = [
  '/',
  '/index.html',
  '/src/css/styles.css',
  '/src/js/calculator.js',
  '/src/js/color-science.js',
  '/src/js/pantone-colors.js',
  '/src/js/storage.js',
  '/src/js/export.js',
  '/manifest.json'
];

// HD Color Engine modules for advanced functionality
const HD_MODULE_FILES = [
  '/src/js/hd-color-engine.js',
  '/src/js/csv-enhanced.js',
  '/src/js/heatmap-visualization.js',
  '/src/js/client-profiles.js',
  '/src/js/icc-profile-manager.js',
  '/src/js/hd-integration.js'
];

// Optional files that enhance the experience but aren't critical
const OPTIONAL_FILES = [
  '/src/assets/icons/icon.svg',
  '/src/assets/icons/icon-192.png',
  '/src/assets/icons/icon-512.png'
];

// API endpoints and data files that can be cached
const DATA_FILES = [
  // Add any data files or API endpoints that should be cached
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
      
      // Cache HD module files
      caches.open(HD_MODULES_CACHE).then(cache => {
        console.log('Service Worker: Caching HD modules');
        return cache.addAll(HD_MODULE_FILES);
      }),
      
      // Cache optional files (don't fail if these aren't available)
      caches.open(CACHE_NAME).then(cache => {
        console.log('Service Worker: Caching optional files');
        return Promise.allSettled(
          [...OPTIONAL_FILES, ...DATA_FILES].map(file => cache.add(file))
        );
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete - HD CMYK Studio ready');
      // Notify clients about successful installation
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_INSTALLED',
            version: CACHE_NAME,
            hdModulesCount: HD_MODULE_FILES.length
          });
        });
      });
      // Force activation of new service worker
      return self.skipWaiting();
    }).catch(error => {
      console.error('Service Worker: Installation failed', error);
      // Notify clients about installation failure
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_INSTALL_ERROR',
            error: error.message
          });
        });
      });
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
          // Delete old caches (keep current versions)
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME && 
              cacheName !== HD_MODULES_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete - HD CMYK Studio active');
      // Notify clients about successful activation
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_NAME,
            features: ['HD Color Engine', 'ChatGPT-5 UI', 'Extended Gamut', 'ICC Profiles']
          });
        });
      });
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
      // Track first fetch time
      if (!PERFORMANCE_METRICS.firstFetch) {
        PERFORMANCE_METRICS.firstFetch = Date.now();
      }
      
      // Return cached version if available
      if (cachedResponse) {
        PERFORMANCE_METRICS.cacheHits++;
        console.log('Service Worker: Cache HIT for', event.request.url);
        
        // For HD modules, verify they're still fresh
        if (HD_MODULE_FILES.some(file => event.request.url.endsWith(file))) {
          const cacheTime = cachedResponse.headers.get('date');
          const now = Date.now();
          const cacheAge = now - (cacheTime ? new Date(cacheTime).getTime() : 0);
          
          // If HD module is older than 1 hour, try to update it in background
          if (cacheAge > 3600000) {
            fetch(event.request).then(response => {
              if (response && response.ok) {
                caches.open(HD_MODULES_CACHE).then(cache => {
                  cache.put(event.request, response.clone());
                  console.log('Service Worker: Background updated HD module', event.request.url);
                });
              }
            }).catch(() => {
              // Ignore background update failures
            });
          }
        }
        
        return cachedResponse;
      }
      
      // Track cache miss
      PERFORMANCE_METRICS.cacheMisses++;
      
      // Try to fetch from network
      return fetch(event.request).then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response for caching
        const responseToCache = response.clone();
        
        // Determine appropriate cache based on file type
        let targetCache = CACHE_NAME;
        const url = event.request.url;
        
        if (HD_MODULE_FILES.some(file => url.endsWith(file))) {
          targetCache = HD_MODULES_CACHE;
        } else if (CORE_FILES.some(file => url.endsWith(file.replace('/', '')))) {
          targetCache = STATIC_CACHE_NAME;
        }
        
        // Cache the new response
        caches.open(targetCache).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch(error => {
        PERFORMANCE_METRICS.errors++;
        console.log('Service Worker: Network fetch failed for', event.request.url, error);
        
        // Enhanced offline fallback logic
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
        
        // For JS files, try to serve from any cache
        if (event.request.url.endsWith('.js')) {
          return caches.match(event.request.url);
        }
        
        // For CSS files, try to serve from any cache
        if (event.request.url.endsWith('.css')) {
          return caches.match(event.request.url);
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
    body: event.data ? event.data.text() : 'HD CMYK Studio notification',
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
        title: 'Open HD CMYK Studio',
        icon: '/src/assets/icons/icon.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('HD CMYK Studio', options)
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
      version: CACHE_NAME,
      staticVersion: STATIC_CACHE_NAME,
      hdModulesVersion: HD_MODULES_CACHE
    });
  }
  
  if (event.data && event.data.type === 'CACHE_STATUS') {
    Promise.all([
      caches.has(STATIC_CACHE_NAME),
      caches.has(HD_MODULES_CACHE),
      caches.has(CACHE_NAME)
    ]).then(([hasStatic, hasHD, hasOptional]) => {
      event.ports[0].postMessage({
        type: 'CACHE_STATUS_RESPONSE',
        cached: hasStatic && hasHD,
        details: {
          staticCache: hasStatic,
          hdModulesCache: hasHD,
          optionalCache: hasOptional
        }
      });
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    Promise.all([
      caches.delete(CACHE_NAME),
      caches.delete(STATIC_CACHE_NAME),
      caches.delete(HD_MODULES_CACHE)
    ]).then(() => {
      event.ports[0].postMessage({
        type: 'CACHE_CLEARED'
      });
    });
  }
  
  if (event.data && event.data.type === 'FORCE_UPDATE') {
    // Force update by clearing caches and reloading
    Promise.all([
      caches.delete(CACHE_NAME),
      caches.delete(STATIC_CACHE_NAME),
      caches.delete(HD_MODULES_CACHE)
    ]).then(() => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'RELOAD_REQUIRED' });
        });
      });
    });
  }
  
  if (event.data && event.data.type === 'GET_PERFORMANCE') {
    getCacheStats().then(cacheStats => {
      event.ports[0].postMessage({
        type: 'PERFORMANCE_DATA',
        metrics: PERFORMANCE_METRICS,
        cacheStats: cacheStats,
        timestamp: Date.now()
      });
    });
  }
  
  if (event.data && event.data.type === 'PRELOAD_HD_MODULES') {
    preloadHDModules().then(() => {
      event.ports[0].postMessage({
        type: 'HD_MODULES_PRELOADED'
      });
    });
  }
});

// Performance monitoring
const PERFORMANCE_METRICS = {
  installStart: null,
  activateStart: null,
  firstFetch: null,
  cacheHits: 0,
  cacheMisses: 0,
  errors: 0
};

// Enhanced error handling and reporting
self.addEventListener('error', event => {
  console.error('Service Worker: Uncaught error', event.error);
  PERFORMANCE_METRICS.errors++;
  
  // Report error to clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_ERROR',
        error: event.error.message,
        filename: event.filename,
        lineno: event.lineno
      });
    });
  });
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker: Unhandled promise rejection', event.reason);
  PERFORMANCE_METRICS.errors++;
  
  // Prevent the default handling (which would log to console)
  event.preventDefault();
  
  // Report to clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_PROMISE_REJECTION',
        reason: event.reason
      });
    });
  });
});

// Enhanced cache management
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {
    totalCaches: cacheNames.length,
    cacheDetails: {},
    totalSize: 0
  };
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats.cacheDetails[cacheName] = {
      entries: keys.length,
      urls: keys.map(req => req.url)
    };
  }
  
  return stats;
}

// Preload critical HD modules when idle
async function preloadHDModules() {
  if ('requestIdleCallback' in self) {
    return new Promise(resolve => {
      self.requestIdleCallback(async () => {
        try {
          const cache = await caches.open(HD_MODULES_CACHE);
          const promises = HD_MODULE_FILES.map(async file => {
            const response = await cache.match(file);
            if (!response) {
              console.log('Service Worker: Preloading HD module', file);
              const fetchResponse = await fetch(file);
              if (fetchResponse.ok) {
                await cache.put(file, fetchResponse);
              }
            }
          });
          
          await Promise.allSettled(promises);
          console.log('Service Worker: HD modules preloaded');
          resolve();
        } catch (error) {
          console.error('Service Worker: HD modules preload failed', error);
          resolve();
        }
      });
    });
  }
}

// Initialize performance tracking
PERFORMANCE_METRICS.installStart = Date.now();

console.log('Service Worker: HD CMYK Studio Service Worker v13 loaded');
console.log('Service Worker: Features - HD Color Engine, ChatGPT-5 UI, Extended Gamut');

// Start preloading HD modules if idle
if (self.registration && self.registration.active) {
  preloadHDModules();
}