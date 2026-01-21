// ========== SERVICE WORKER - SUPERQUIZ PWA ==========

const CACHE_NAME = 'superquiz-cache-v1';
const urlsToCache = [
    '/',
    '/Accueil.html',
    '/Quiz.html',
    '/Profil.html',
    '/CSS/style.css',
    '/js/script.js',
    '/js/daily-rewards.js',
    '/js/notifications.js'
];

// Installation du Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker: Installation...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Mise en cache des fichiers');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.log('Erreur cache:', err))
    );
    self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker: Activation...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Suppression ancien cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Interception des requêtes (stratégie Network First)
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Ignorer les requêtes externes (Firebase, Google Analytics, etc.)
    const externalDomains = [
        'firebaseio.com',
        'googleapis.com',
        'gstatic.com',
        'googletagmanager.com',
        'google-analytics.com',
        'firebasedatabase.app',
        'identitytoolkit.googleapis.com'
    ];
    
    if (externalDomains.some(domain => url.hostname.includes(domain))) {
        return; // Laisser passer sans intercepter
    }
    
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cloner la réponse pour la mettre en cache
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => {
                        // Ne mettre en cache que les requêtes GET
                        if (event.request.method === 'GET') {
                            cache.put(event.request, responseClone);
                        }
                    });
                return response;
            })
            .catch(() => {
                // Si offline, utiliser le cache
                return caches.match(event.request);
            })
    );
});

// Réception des notifications Push
self.addEventListener('push', event => {
    console.log('Service Worker: Notification Push reçue');

    let data = {
        title: '🎯 SuperQuiz',
        body: 'Vous avez une nouvelle notification !',
        icon: '/Images/logo-192.png',
        badge: '/Images/badge-72.png',
        url: '/Accueil.html'
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [200, 100, 200],
        data: {
            url: data.url
        },
        actions: [
            { action: 'open', title: 'Ouvrir' },
            { action: 'close', title: 'Fermer' }
        ],
        tag: data.tag || 'superquiz-notification',
        renotify: true
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Clic sur une notification
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Clic sur notification');

    event.notification.close();

    if (event.action === 'close') return;

    const url = event.notification.data?.url || '/Accueil.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Si une fenêtre est déjà ouverte, la focus
                for (const client of clientList) {
                    if (client.url.includes('superquiz') && 'focus' in client) {
                        client.navigate(url);
                        return client.focus();
                    }
                }
                // Sinon, ouvrir une nouvelle fenêtre
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// Fermeture d'une notification
self.addEventListener('notificationclose', event => {
    console.log('Service Worker: Notification fermée');
});

// Sync en arrière-plan (pour les actions offline)
self.addEventListener('sync', event => {
    console.log('Service Worker: Sync', event.tag);

    if (event.tag === 'sync-scores') {
        event.waitUntil(syncScores());
    }
});

// Synchroniser les scores en attente
async function syncScores() {
    // Récupérer les scores en attente du IndexedDB ou localStorage
    // et les envoyer au serveur
    console.log('Synchronisation des scores en arrière-plan...');
}
