// Script pour gérer l'affichage du menu d'authentification sur toutes les pages

async function initAuthMenu() {
    const nav = document.querySelector('.menu');
    if (!nav) return;

    // Supprimer l'ancien item d'auth s'il existe
    const existingAuthItem = document.getElementById('auth-menu-item');
    if (existingAuthItem) {
        existingAuthItem.remove();
    }

    // Créer le nouvel item
    const authItem = document.createElement('li');
    authItem.id = 'auth-menu-item';
    authItem.style.marginLeft = 'auto'; // Pousser à droite

    try {
        const sessionResult = await window.storage.get('session:current');
        
        if (sessionResult) {
            const session = JSON.parse(sessionResult.value);
            if (session.connected) {
                // Utilisateur connecté
                authItem.innerHTML = `
                    <a href="#" onclick="logout(event)" title="Déconnexion" style="color: #2ecc71;">
                        👤 ${session.name} <span style="font-size: 0.8em;">(Déconnexion)</span>
                    </a>
                `;
                nav.appendChild(authItem);
                return;
            }
        }
    } catch (error) {
        // Pas de session
    }

    // Utilisateur non connecté
    authItem.innerHTML = '<a href="Auth.html" style="color: #e74c3c;">🔐 Connexion</a>';
    nav.appendChild(authItem);
}

// Fonction de déconnexion globale
async function logout(event) {
    event.preventDefault();
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        try {
            await window.storage.delete('session:current');
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