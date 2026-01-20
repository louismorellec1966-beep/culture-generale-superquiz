// Script pour gérer l'affichage du menu d'authentification sur toutes les pages
// Utilise Firebase Auth - Compatible avec toutes les pages du site

function initAuthMenu() {
    // Vérifier que Firebase Auth est chargé
    if (typeof firebase === 'undefined' || typeof firebase.auth !== 'function') {
        console.warn('Firebase Auth non chargé - auth-menu désactivé');
        return;
    }

    const auth = firebase.auth();

    auth.onAuthStateChanged(user => {
        const nav = document.querySelector('.menu');
        if (!nav) return;

        // Supprimer l'ancien item d'auth s'il existe
        const existingAuthItem = document.getElementById('auth-menu-item');
        if (existingAuthItem) existingAuthItem.remove();

        // Créer le nouvel item
        const authItem = document.createElement('li');
        authItem.id = 'auth-menu-item';

        if (user) {
            // Utilisateur connecté - Récupérer le pseudo et l'avatar depuis Firestore
            const db = firebase.firestore();
            db.collection('profiles').doc(user.uid).get()
                .then(doc => {
                    const data = doc.exists ? doc.data() : {};
                    const pseudo = data.pseudo || user.email.split('@')[0];
                    const avatar = data.avatar?.value || '👤';
                    authItem.innerHTML = `
                        <a href="#" onclick="logout(event)" title="Déconnexion" style="color: #2ecc71;">
                            ${avatar} ${pseudo} <span style="font-size: 0.8em;">(Déco)</span>
                        </a>
                    `;
                })
                .catch(() => {
                    authItem.innerHTML = `
                        <a href="#" onclick="logout(event)" title="Déconnexion" style="color: #2ecc71;">
                            👤 ${user.email.split('@')[0]} <span style="font-size: 0.8em;">(Déco)</span>
                        </a>
                    `;
                });
        } else {
            // Utilisateur non connecté
            authItem.innerHTML = '<a href="Auth.html" style="color: #e74c3c;">🔐 Connexion</a>';
        }

        nav.appendChild(authItem);
    });
}

// Fonction de déconnexion globale
async function logout(event) {
    event.preventDefault();
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        try {
            await firebase.auth().signOut();
            alert('Déconnexion réussie !');
            window.location.href = 'Accueil.html';
        } catch (error) {
            alert('Erreur lors de la déconnexion');
        }
    }
}

// Initialiser au chargement de la page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthMenu);
} else {
    initAuthMenu();
}