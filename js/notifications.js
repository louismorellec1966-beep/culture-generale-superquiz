// ========== SYSTÈME DE NOTIFICATIONS PUSH (PWA) ==========

const PushNotifications = {
    // Clé publique VAPID (à remplacer par la vôtre)
    // Générez-la sur https://vapidkeys.com/ ou via Firebase Cloud Messaging
    VAPID_PUBLIC_KEY: '',

    // Vérifier si les notifications sont supportées
    isSupported: function() {
        // Désactivé tant que la clé VAPID n'est pas configurée
        if (!this.VAPID_PUBLIC_KEY || this.VAPID_PUBLIC_KEY === '' || this.VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY_HERE') {
            return false;
        }
        return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    },

    // Demander la permission
    requestPermission: async function() {
        if (!this.isSupported()) {
            console.log('Notifications non supportées');
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    },

    // Obtenir le statut actuel
    getPermissionStatus: function() {
        if (!this.isSupported()) return 'unsupported';
        return Notification.permission; // 'granted', 'denied', 'default'
    },

    // Enregistrer le service worker
    registerServiceWorker: async function() {
        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker non supporté');
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker enregistré:', registration);
            return registration;
        } catch (error) {
            console.error('Erreur enregistrement Service Worker:', error);
            return null;
        }
    },

    // S'abonner aux notifications push
    subscribeToPush: async function() {
        const permission = await this.requestPermission();
        if (!permission) {
            console.log('Permission refusée');
            return null;
        }

        const registration = await navigator.serviceWorker.ready;

        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY)
            });

            // Sauvegarder l'abonnement dans Firestore
            await this.saveSubscription(subscription);

            return subscription;
        } catch (error) {
            console.error('Erreur abonnement push:', error);
            return null;
        }
    },

    // Sauvegarder l'abonnement dans Firestore
    saveSubscription: async function(subscription) {
        if (!firebase.auth().currentUser) return;

        const userId = firebase.auth().currentUser.uid;
        await firebase.firestore().collection('pushSubscriptions').doc(userId).set({
            subscription: JSON.stringify(subscription),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    // Convertir la clé VAPID
    urlBase64ToUint8Array: function(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    },

    // Envoyer une notification locale (pour test)
    sendLocalNotification: function(title, options = {}) {
        if (Notification.permission !== 'granted') {
            console.log('Notifications non autorisées');
            return;
        }

        const defaultOptions = {
            icon: '/Images/logo-192.png',
            badge: '/Images/badge-72.png',
            vibrate: [200, 100, 200],
            tag: 'superquiz-notification',
            renotify: true,
            ...options
        };

        const notification = new Notification(title, defaultOptions);

        notification.onclick = function() {
            window.focus();
            if (options.url) {
                window.location.href = options.url;
            }
            notification.close();
        };

        return notification;
    },

    // Types de notifications prédéfinis
    notifications: {
        // Rappel quotidien
        dailyReminder: function() {
            return PushNotifications.sendLocalNotification('🎯 SuperQuiz', {
                body: 'Votre série est en danger ! Faites au moins 1 quiz aujourd\'hui pour continuer.',
                url: '/quiz-dynamique.html',
                tag: 'daily-reminder'
            });
        },

        // Nouveau quiz disponible
        newQuiz: function(quizName) {
            return PushNotifications.sendLocalNotification('🆕 Nouveau quiz disponible !', {
                body: `"${quizName}" - Soyez le premier à le tester.`,
                url: '/Quiz.html',
                tag: 'new-quiz'
            });
        },

        // Défi reçu
        challengeReceived: function(fromUser, quizName, score) {
            return PushNotifications.sendLocalNotification(`⚔️ ${fromUser} vous a défié !`, {
                body: `Quiz : "${quizName}" - Son score : ${score}/10`,
                url: '/Social.html?tab=challenges',
                tag: 'challenge'
            });
        },

        // Badge débloqué
        badgeUnlocked: function(badgeName) {
            return PushNotifications.sendLocalNotification('🏆 Bravo !', {
                body: `Vous avez débloqué le badge "${badgeName}" - Continuez comme ça !`,
                url: '/Profil.html',
                tag: 'badge'
            });
        },

        // Récompense quotidienne disponible
        dailyRewardAvailable: function() {
            return PushNotifications.sendLocalNotification('🎁 Récompense disponible !', {
                body: 'Votre récompense quotidienne vous attend. Connectez-vous pour la récupérer !',
                url: '/Accueil.html',
                tag: 'daily-reward'
            });
        },

        // Ami accepté
        friendAccepted: function(friendName) {
            return PushNotifications.sendLocalNotification('👥 Nouvel ami !', {
                body: `${friendName} a accepté votre demande d'ami.`,
                url: '/Social.html',
                tag: 'friend'
            });
        },

        // Niveau atteint
        levelUp: function(newLevel) {
            return PushNotifications.sendLocalNotification('⬆️ Niveau supérieur !', {
                body: `Félicitations ! Vous êtes maintenant niveau ${newLevel} !`,
                url: '/Profil.html',
                tag: 'level-up'
            });
        }
    },

    // Afficher le bouton d'activation des notifications
    showEnableButton: function() {
        if (!this.isSupported()) return;
        if (this.getPermissionStatus() === 'granted') return;

        // Créer le bouton flottant
        const buttonHTML = `
            <div id="notification-prompt" class="notification-prompt">
                <div class="notification-prompt-content">
                    <span class="notification-icon">🔔</span>
                    <div class="notification-text">
                        <strong>Activer les notifications</strong>
                        <p>Recevez des rappels et défis</p>
                    </div>
                    <button onclick="PushNotifications.enableAndHide()">Activer</button>
                    <button class="close-btn" onclick="PushNotifications.hidePrompt()">×</button>
                </div>
            </div>
        `;

        // Styles
        if (!document.getElementById('notification-prompt-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-prompt-styles';
            styles.textContent = `
                .notification-prompt {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    max-width: 400px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
                    z-index: 9999;
                    animation: slideUp 0.5s ease;
                }

                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .notification-prompt-content {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    gap: 15px;
                }

                .notification-icon {
                    font-size: 2em;
                }

                .notification-text {
                    flex: 1;
                }

                .notification-text strong {
                    display: block;
                    color: #2c3e50;
                }

                .notification-text p {
                    margin: 0;
                    font-size: 0.85em;
                    color: #7f8c8d;
                }

                .notification-prompt button {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-weight: bold;
                }

                .notification-prompt button:hover {
                    transform: scale(1.05);
                }

                .notification-prompt .close-btn {
                    background: transparent;
                    color: #7f8c8d;
                    padding: 5px 10px;
                    font-size: 1.2em;
                }
            `;
            document.head.appendChild(styles);
        }

        // Ne pas afficher si déjà refusé récemment
        const lastDismissed = localStorage.getItem('notificationPromptDismissed');
        if (lastDismissed) {
            const daysSince = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
            if (daysSince < 7) return; // Attendre 7 jours avant de redemander
        }

        // Afficher après un délai
        setTimeout(() => {
            document.body.insertAdjacentHTML('beforeend', buttonHTML);
        }, 5000);
    },

    // Activer et masquer
    enableAndHide: async function() {
        const btn = document.querySelector('#notification-prompt button');
        btn.textContent = '⏳...';
        
        const success = await this.requestPermission();
        
        if (success) {
            await this.subscribeToPush();
            btn.textContent = '✅ Activé !';
        } else {
            btn.textContent = '❌ Refusé';
        }

        setTimeout(() => this.hidePrompt(), 1500);
    },

    // Masquer le prompt
    hidePrompt: function() {
        const prompt = document.getElementById('notification-prompt');
        if (prompt) {
            prompt.style.animation = 'slideUp 0.3s ease reverse';
            setTimeout(() => prompt.remove(), 300);
        }
        localStorage.setItem('notificationPromptDismissed', Date.now().toString());
    },

    // Programmer un rappel quotidien (utilise l'API de notification locale)
    scheduleDailyReminder: function() {
        // Vérifier la dernière activité
        const checkActivity = async () => {
            if (!firebase.auth().currentUser) return;

            const userId = firebase.auth().currentUser.uid;
            const profile = await firebase.firestore().collection('profiles').doc(userId).get();
            
            if (profile.exists) {
                const lastPlay = profile.data().stats?.dernierJeuDate;
                const today = new Date().toISOString().split('T')[0];
                
                // Si pas joué aujourd'hui, envoyer un rappel
                if (lastPlay !== today) {
                    this.notifications.dailyReminder();
                }
            }
        };

        // Vérifier à 20h chaque jour (si l'app est ouverte)
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(20, 0, 0, 0);

        if (now > reminderTime) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const delay = reminderTime - now;
        setTimeout(() => {
            checkActivity();
            // Répéter chaque jour
            setInterval(checkActivity, 24 * 60 * 60 * 1000);
        }, delay);
    },

    // Initialiser
    init: async function() {
        if (!this.isSupported()) {
            console.log('Notifications non supportées sur ce navigateur');
            return;
        }

        // Enregistrer le service worker
        await this.registerServiceWorker();

        // Afficher le prompt si pas encore autorisé
        if (this.getPermissionStatus() === 'default') {
            this.showEnableButton();
        }

        // Si déjà autorisé, programmer les rappels
        if (this.getPermissionStatus() === 'granted') {
            this.scheduleDailyReminder();
        }
    }
};

// Exposer globalement
window.PushNotifications = PushNotifications;

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    // Délai pour ne pas ralentir le chargement initial
    setTimeout(() => PushNotifications.init(), 3000);
});
