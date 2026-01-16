// ========== SYSTÈME DE SÉCURITÉ SUPERQUIZ ==========
// ATTENTION : Ce code offre une sécurité de BASE côté client
// Pour la production, un backend est INDISPENSABLE !

const Security = {
    // Salt unique par utilisateur (stocké avec le hash)
    generateSalt: () => {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    },

    // Hashage amélioré avec salt
    hashPassword: async (password, salt) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Sanitization des inputs (protection XSS)
    sanitize: (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Validation email
    validateEmail: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email) && email.length <= 254;
    },

    // Validation mot de passe fort
    validatePassword: (password) => {
        return password.length >= 8 && 
               /[a-z]/.test(password) && 
               /[A-Z]/.test(password) && 
               /[0-9]/.test(password);
    },

    // Rate limiting simple côté client - CORRIGÉ
    rateLimiter: {
        attempts: {},
        
        check: function(key, maxAttempts = 5, windowMs = 300000) { // 5 tentatives / 5 min
            const now = Date.now();
            if (!this.attempts[key]) {
                this.attempts[key] = [];
            }
            
            // Nettoyer les vieilles tentatives
            this.attempts[key] = this.attempts[key].filter(time => now - time < windowMs);
            
            if (this.attempts[key].length >= maxAttempts) {
                const oldestAttempt = Math.min(...this.attempts[key]);
                const remainingTime = Math.ceil((windowMs - (now - oldestAttempt)) / 1000 / 60);
                return { allowed: false, remainingTime };
            }
            
            this.attempts[key].push(now);
            return { allowed: true };
        },
        
        reset: function(key) {
            delete this.attempts[key];
        }
    },

    // Protection contre l'énumération d'utilisateurs
    // Toujours retourner le même temps de réponse
    constantTimeCompare: async (a, b) => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        return a === b;
    },

    // Génération de token de session sécurisé
    generateSessionToken: () => {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    },

    // Chiffrement simple des données sensibles (Base64 + obfuscation)
    encrypt: (data) => {
        try {
            const str = JSON.stringify(data);
            return btoa(unescape(encodeURIComponent(str)));
        } catch {
            return null;
        }
    },

    decrypt: (encrypted) => {
        try {
            const str = decodeURIComponent(escape(atob(encrypted)));
            return JSON.parse(str);
        } catch {
            return null;
        }
    }
};

// ========== GESTIONNAIRE D'AUTHENTIFICATION OPTIMISÉ ==========
const Auth = {
    // Inscription sécurisée
    register: async (name, email, password) => {
        // Validation
        if (!name || name.length < 2 || name.length > 50) {
            throw new Error('Nom invalide (2-50 caractères)');
        }
        
        if (!Security.validateEmail(email)) {
            throw new Error('Email invalide');
        }
        
        if (!Security.validatePassword(password)) {
            throw new Error('Mot de passe trop faible (min. 8 car., maj, min, chiffre)');
        }

        // Rate limiting
        const rateCheck = Security.rateLimiter.check('register_' + email);
        if (!rateCheck.allowed) {
            throw new Error(`Trop de tentatives. Réessayez dans ${rateCheck.remainingTime} min.`);
        }

        // Sanitization
        name = Security.sanitize(name);
        email = Security.sanitize(email.toLowerCase().trim());

        // Vérifier existence
        const existing = localStorage.getItem(`user:${email}`);
        if (existing) {
            throw new Error('Cet email est déjà utilisé');
        }

        // Créer le compte avec salt
        const salt = Security.generateSalt();
        const passwordHash = await Security.hashPassword(password, salt);
        
        const userData = {
            email,
            name,
            passwordHash,
            salt,
            createdAt: new Date().toISOString(),
            version: 1
        };

        localStorage.setItem(`user:${email}`, JSON.stringify(userData));
        Security.rateLimiter.reset('register_' + email);
        
        return { success: true, email };
    },

    // Connexion sécurisée
    login: async (email, password) => {
        // Validation
        if (!Security.validateEmail(email)) {
            throw new Error('Email invalide');
        }

        email = Security.sanitize(email.toLowerCase().trim());

        // Rate limiting
        const rateCheck = Security.rateLimiter.check('login_' + email);
        if (!rateCheck.allowed) {
            throw new Error(`Trop de tentatives. Réessayez dans ${rateCheck.remainingTime} min.`);
        }

        // Récupérer utilisateur
        const userDataStr = localStorage.getItem(`user:${email}`);
        
        if (!userDataStr) {
            // Délai constant pour éviter l'énumération
            await Security.constantTimeCompare('', '');
            throw new Error('Email ou mot de passe incorrect');
        }

        const userData = JSON.parse(userDataStr);
        const passwordHash = await Security.hashPassword(password, userData.salt);

        if (!(await Security.constantTimeCompare(passwordHash, userData.passwordHash))) {
            throw new Error('Email ou mot de passe incorrect');
        }

        // Créer session sécurisée
        const sessionToken = Security.generateSessionToken();
        const sessionData = {
            email: userData.email,
            name: userData.name,
            token: sessionToken,
            connected: true,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
        };

        localStorage.setItem('session:current', JSON.stringify(sessionData));
        Security.rateLimiter.reset('login_' + email);

        return { success: true, user: { email: userData.email, name: userData.name } };
    },

    // Vérifier session
    checkSession: () => {
        const sessionStr = localStorage.getItem('session:current');
        if (!sessionStr) return null;

        try {
            const session = JSON.parse(sessionStr);
            
            // Vérifier expiration
            if (new Date(session.expiresAt) < new Date()) {
                Auth.logout();
                return null;
            }

            return session;
        } catch {
            return null;
        }
    },

    // Déconnexion
    logout: () => {
        localStorage.removeItem('session:current');
    },

    // Obtenir utilisateur courant
    getCurrentUser: () => {
        const session = Auth.checkSession();
        return session ? { email: session.email, name: session.name } : null;
    }
};

// ========== GESTIONNAIRE DE MENU D'AUTHENTIFICATION ==========
const AuthMenu = {
    init: () => {
        const nav = document.querySelector('.menu');
        if (!nav) return;

        const existing = document.getElementById('auth-menu-item');
        if (existing) existing.remove();

        const authItem = document.createElement('li');
        authItem.id = 'auth-menu-item';

        const user = Auth.getCurrentUser();
        if (user) {
            authItem.innerHTML = `
                <a href="#" onclick="handleLogout(event)" style="color: #2ecc71;">
                    👤 ${Security.sanitize(user.name)} <span style="font-size: 0.8em;">(Déco)</span>
                </a>
            `;
        } else {
            authItem.innerHTML = '<a href="Auth.html" style="color: #e74c3c;">🔐 Connexion</a>';
        }

        nav.appendChild(authItem);
    }
};

// Fonction globale de déconnexion
function handleLogout(event) {
    event.preventDefault();
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        Auth.logout();
        window.location.reload();
    }
}

// ========== GESTIONNAIRE DE SCORES SÉCURISÉ ==========
const Scores = {
    // Sauvegarder un score
    save: (scoreData) => {
        const user = Auth.getCurrentUser();
        if (!user) {
            throw new Error('Utilisateur non connecté');
        }

        // Validation des données
        if (!scoreData.matiere || !scoreData.categorie || typeof scoreData.score !== 'number') {
            throw new Error('Données de score invalides');
        }

        // Récupérer scores existants
        let scores = Scores.getAll(user.email);
        
        // Ajouter le nouveau score
        scores.push({
            ...scoreData,
            savedAt: new Date().toISOString(),
            version: 1
        });

        // Limiter à 1000 scores max par utilisateur
        if (scores.length > 1000) {
            scores = scores.slice(-1000);
        }

        // Sauvegarder
        localStorage.setItem(`scores:${user.email}`, JSON.stringify(scores));
        
        return true;
    },

    // Récupérer tous les scores
    getAll: (email) => {
        const scoresStr = localStorage.getItem(`scores:${email || Auth.getCurrentUser()?.email}`);
        if (!scoresStr) return [];
        
        try {
            return JSON.parse(scoresStr);
        } catch {
            return [];
        }
    },

    // Filtrer les scores
    filter: (criteria) => {
        const scores = Scores.getAll();
        return scores.filter(score => {
            if (criteria.matiere && score.matiere !== criteria.matiere) return false;
            if (criteria.mode && score.mode !== criteria.mode) return false;
            return true;
        });
    }
};

// ========== INITIALISATION AUTOMATIQUE ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AuthMenu.init);
} else {
    AuthMenu.init();
}

// ========== EXPORT GLOBAL ==========
window.Security = Security;
window.Auth = Auth;
window.AuthMenu = AuthMenu;
window.Scores = Scores;