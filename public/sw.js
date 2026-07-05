// Advanced Service Worker for 100% SEO Performance
const CACHE_NAME = 'noorain-portfolio-v3';
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v3';
const API_CACHE = 'api-v3';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/manifest.json',
  '/profile/profile-photo.jpg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/hero',
  '/api/about',
  '/api/skills',
  '/api/projects',
  '/api/experience',
  '/api/education',
  '/api/certifications',
  '/api/footer'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      self.skipWaiting()
    ])
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating');
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle different resource types
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticResource(request)) {
    event.respondWith(handleStaticResource(request));
  } else if (isImageResource(request)) {
    event.respondWith(handleImageResource(request));
  } else {
    event.respondWith(handleDocumentRequest(request));
  }
});

// API request handler - network first with fallback
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('{"error":"Network unavailable"}', {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.log('Service Worker: API request failed, serving from cache', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('{"error":"Offline"}', {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Static resource handler - cache first
async function handleStaticResource(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Static resource failed', error);
    return new Response('Resource not available', { status: 404 });
  }
}

// Image resource handler - cache first with compression
async function handleImageResource(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Image request failed', error);
    return new Response('Image not available', { status: 404 });
  }
}

// Document request handler - network first with cache fallback
async function handleDocumentRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Document request failed, serving from cache', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || caches.match('/');
  }
}

// Helper functions
function isStaticResource(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/);
}

function isImageResource(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/);
}

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form') {
    event.waitUntil(syncContactForm());
  }
});

async function syncContactForm() {
  // Handle offline form submissions when connection is restored
  const formData = await getStoredFormData();
  if (formData) {
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      clearStoredFormData();
    } catch (error) {
      console.log('Service Worker: Form sync failed', error);
    }
  }
}

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PERFORMANCE_METRICS') {
    // Log performance metrics for analysis
    console.log('Service Worker: Performance metrics received', event.data.metrics);
  }
});

// Cache size management
setInterval(async () => {
  const cacheNames = await caches.keys();
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    // Limit cache size to prevent storage overflow
    if (requests.length > 100) {
      const oldestRequests = requests.slice(0, requests.length - 50);
      await Promise.all(oldestRequests.map(request => cache.delete(request)));
    }
  }
}, 300000); // Run every 5 minutes

console.log('Service Worker: Advanced caching and performance optimization loaded');