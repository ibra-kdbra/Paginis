/**
 * Service Worker Registration and Management
 * Handles PWA functionality and caching
 */

// Register service worker when page loads
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('[SW] Service Worker registered successfully:', registration.scope);

                    // Handle updates
                    registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New version available
                                if (confirm('A new version of Paginis is available. Reload to update?')) {
                                    window.location.reload();
                                }
                            }
                        });
                    });

                    // Listen for messages from service worker
                    navigator.serviceWorker.addEventListener('message', function(event) {
                        if (event.data && event.data.type) {
                            handleServiceWorkerMessage(event.data);
                        }
                    });
                })
                .catch(function(error) {
                    console.error('[SW] Service Worker registration failed:', error);
                });
        });
    } else {
        console.warn('[SW] Service Workers not supported in this browser');
    }
}

// Handle messages from service worker
function handleServiceWorkerMessage(data) {
    switch (data.type) {
        case 'CACHE_STATUS':
            console.log('[SW] Cache status:', data.status);
            break;
        case 'CACHE_ERROR':
            console.error('[SW] Cache error:', data.error);
            break;
        default:
            console.log('[SW] Unknown message type:', data.type);
    }
}

// Cache management functions
window.CacheManager = {
    // Get cache size information
    async getCacheSize() {
        return new Promise((resolve, reject) => {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const channel = new MessageChannel();
                channel.port1.onmessage = function(event) {
                    resolve(event.data.cacheSize || 0);
                };

                navigator.serviceWorker.controller.postMessage({
                    type: 'GET_CACHE_SIZE'
                }, [channel.port2]);
            } else {
                resolve(0);
            }
        });
    },

    // Clear specific cache
    async clearCache(cacheName) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CLEAR_CACHE',
                cacheName: cacheName
            });
        }
    },

    // Pre-cache a PDF
    async cachePDF(url) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CACHE_PDF',
                url: url
            });
        }
    }
};

// Force unregister any existing service workers and clear all caches
function resetServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Unregister all existing service workers
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
                console.log('[SW] Unregistering old service worker:', registration.scope);
                registration.unregister().then(success => {
                    console.log('[SW] Unregistration successful:', success);
                });
            });
        });
    }

    // Clear all caches
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => {
                console.log('[SW] Deleting cache:', name);
                caches.delete(name);
            });
        });
    }
}

// Reset service worker and caches first
resetServiceWorker();

// Wait a bit for cleanup, then register fresh
setTimeout(() => {
    registerServiceWorker();
}, 1000);

// Clear any cached 404 errors for deleted files
function clearCachedErrors() {
    if ('caches' in window) {
        caches.open('paginis-cache-v1').then(cache => {
            // Remove cached 404 responses for deleted files
            const urlsToRemove = [
                '/lib/js/features/search/search-engine.js'
            ];

            urlsToRemove.forEach(url => {
                cache.delete(url).then(deleted => {
                    if (deleted) {
                        console.log('[SW] Cleared cached 404 for:', url);
                    }
                });
            });
        }).catch(error => {
            console.warn('[SW] Error clearing cached errors:', error);
        });
    }
}

// Clear cached errors on page load
clearCachedErrors();

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerServiceWorker, handleServiceWorkerMessage };
}
