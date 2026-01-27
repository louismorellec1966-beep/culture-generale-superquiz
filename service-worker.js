// ========== SERVICE WORKER - SUPERQUIZ PWA ==========

const CACHE_NAME = 'superquiz-cache-v3';
const STATIC_CACHE = 'superquiz-static-v3';
const DYNAMIC_CACHE = 'superquiz-dynamic-v3';
const QUESTIONS_CACHE = 'superquiz-questions-v1';

// Ressources statiques à mettre en cache
const urlsToCache = [
    '/',
    '/Accueil.html',
    '/Quiz.html',
    '/quiz-dynamique.html',
    '/Profil.html',
    '/Classement.html',
    '/revision.html',
    '/tournois.html',
    '/clubs.html',
    '/parametres.html',
    '/mode-survie.html',
    '/Auth.html',
    '/404.html',
    '/CSS/style.css',
    '/CSS/multiplayer.css',
    '/js/script.js',
    '/js/menu.js',
    '/js/daily-rewards.js',
    '/js/notifications.js',
    '/js/profile-system.js',
    '/js/quiz-loader.js',
    '/js/auth-menu.js',
    '/js/social-system.js',
    '/js/streaks-system.js',
    '/js/titles-system.js',
    '/js/seasons-system.js',
    '/js/themes-system.js',
    '/js/betting-system.js',
    '/js/tournaments-system.js',
    '/js/clubs-system.js',
    '/js/culture-cards-system.js',
    '/firebase-config.js',
    '/questions.json',
    '/manifest.json'
];

// Pages de catégories
const categoryPages = [
    '/Histoire.html',
    '/Géographie.html',
    '/Science.html',
    '/Littérature.html',
    '/Art.html',
    '/Musique.html',
    '/Cinéma.html',
    '/Sport.html',
    '/Gastronomie.html',
    '/Philosophie.html',
    '/Politique.html'
];

// Installation du Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker: Installation v3...');
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Service Worker: Mise en cache des fichiers statiques');
                return cache.addAll(urlsToCache).catch(err => {
                    console.log('Erreur cache statique (non bloquant):', err);
                });
            }),
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Service Worker: Mise en cache des pages catégories');
                return cache.addAll(categoryPages).catch(err => {
                    console.log('Erreur cache catégories (non bloquant):', err);
                });
            })
        ])
    );
    self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker: Activation v3...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (![STATIC_CACHE, DYNAMIC_CACHE, QUESTIONS_CACHE].includes(cache)) {
                        console.log('Service Worker: Suppression ancien cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Interception des requêtes
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
        'identitytoolkit.googleapis.com',
        'firestore.googleapis.com'
    ];
    
    if (externalDomains.some(domain => url.hostname.includes(domain))) {
        return; // Laisser passer sans intercepter
    }

    // Stratégie pour les questions (Cache First)
    if (url.pathname.includes('questions.json')) {
        event.respondWith(cacheFirstThenNetwork(event.request, QUESTIONS_CACHE));
        return;
    }

    // Stratégie pour les fichiers statiques (Cache First)
    if (isStaticResource(url.pathname)) {
        event.respondWith(cacheFirstThenNetwork(event.request, STATIC_CACHE));
        return;
    }

    // Stratégie pour les pages HTML (Network First avec fallback)
    if (url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.')) {
        event.respondWith(networkFirstWithFallback(event.request));
        return;
    }

    // Stratégie par défaut (Network First)
    event.respondWith(networkFirstStrategy(event.request));
});

// Vérifier si c'est une ressource statique
function isStaticResource(pathname) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
    return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Stratégie Cache First puis Network
async function cacheFirstThenNetwork(request, cacheName) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        // Mettre à jour en arrière-plan
        fetchAndCache(request, cacheName);
        return cachedResponse;
    }
    return fetchAndCache(request, cacheName);
}

// Stratégie Network First avec fallback
async function networkFirstWithFallback(request) {
    try {
        const networkResponse = await fetch(request);
        // Mettre en cache
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Mode hors-ligne pour', request.url);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        // Page hors-ligne de secours
        return caches.match('/404.html') || new Response(getOfflinePage(), {
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// Stratégie Network First standard
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        if (request.method === 'GET') {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return caches.match(request);
    }
}

// Fetch et mise en cache
async function fetchAndCache(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        throw error;
    }
}

// Page hors-ligne de secours
function getOfflinePage() {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hors ligne - CultureLudo</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 20px;
        }
        .container {
            max-width: 400px;
        }
        .icon {
            font-size: 5em;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 1.8em;
            margin-bottom: 15px;
        }
        p {
            opacity: 0.9;
            margin-bottom: 25px;
            line-height: 1.6;
        }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            border: none;
            font-size: 1em;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📡</div>
        <h1>Vous êtes hors ligne</h1>
        <p>Pas de connexion Internet détectée. Vérifiez votre connexion et réessayez.</p>
        <button class="btn" onclick="location.reload()">Réessayer</button>
    </div>
</body>
</html>
    `;
}

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
