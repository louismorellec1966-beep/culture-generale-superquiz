// ========== MENU DYNAMIQUE - CULTURE LUDO ==========
// Ce script injecte le menu sur toutes les pages

function initMenu() {
    // Déterminer la page actuelle
    const currentPage = window.location.pathname.split('/').pop() || 'Accueil.html';
    
    // Créer le menu desktop
    const navDesktop = document.createElement('nav');
    navDesktop.className = 'nav-desktop';
    navDesktop.setAttribute('aria-label', 'Navigation principale');
    
    navDesktop.innerHTML = `
        <a href="Accueil.html" class="nav-logo">🧠 CultureLudo</a>
        
        <ul class="menu">
            <li><a href="Accueil.html" ${currentPage === 'Accueil.html' ? 'aria-current="page"' : ''}>🏠 Accueil</a></li>
            
            <!-- Groupe JOUER -->
            <li class="dropdown">
                <a href="Jouer.html" ${currentPage === 'Jouer.html' ? 'aria-current="page"' : ''}>🎮 Jouer</a>
                <ul class="submenu submenu-grid">
                    <li class="submenu-section">
                        <span class="submenu-title">Modes de jeu</span>
                        <a href="Quiz.html" ${currentPage === 'Quiz.html' ? 'class="active"' : ''}>🎯 Quiz Classique</a>
                        <a href="quiz-du-jour.html" ${currentPage === 'quiz-du-jour.html' ? 'class="active"' : ''}>📅 Quiz du Jour</a>
                        <a href="mode-survie.html" ${currentPage === 'mode-survie.html' ? 'class="active"' : ''}>💀 Mode Survie</a>
                        <a href="multiplayer.html" ${currentPage === 'multiplayer.html' ? 'class="active"' : ''}>⚔️ Multijoueur</a>
                        <a href="tournois.html" ${currentPage === 'tournois.html' ? 'class="active"' : ''}>🏆 Tournois</a>
                        <a href="quiz-perso.html" ${currentPage === 'quiz-perso.html' ? 'class="active"' : ''}>🎨 Quiz Perso</a>
                    </li>
                    <li class="submenu-section">
                        <span class="submenu-title">Catégories</span>
                        <div class="submenu-categories">
                            <a href="Histoire.html" ${currentPage === 'Histoire.html' ? 'class="active"' : ''}>📜 Histoire</a>
                            <a href="Géographie.html" ${currentPage === 'Géographie.html' ? 'class="active"' : ''}>🌍 Géographie</a>
                            <a href="Science.html" ${currentPage === 'Science.html' ? 'class="active"' : ''}>🔬 Science</a>
                            <a href="Littérature.html" ${currentPage === 'Littérature.html' ? 'class="active"' : ''}>📚 Littérature</a>
                            <a href="Sport.html" ${currentPage === 'Sport.html' ? 'class="active"' : ''}>⚽ Sport</a>
                            <a href="Musique.html" ${currentPage === 'Musique.html' ? 'class="active"' : ''}>🎵 Musique</a>
                            <a href="Art.html" ${currentPage === 'Art.html' ? 'class="active"' : ''}>🎨 Art</a>
                            <a href="Culture.html" ${currentPage === 'Culture.html' ? 'class="active"' : ''}>🎭 Culture</a>
                            <a href="Cinéma.html" ${currentPage === 'Cinéma.html' ? 'class="active"' : ''}>🎬 Cinéma</a>
                            <a href="Gastronomie.html" ${currentPage === 'Gastronomie.html' ? 'class="active"' : ''}>🍽️ Gastronomie</a>
                            <a href="Politique.html" ${currentPage === 'Politique.html' ? 'class="active"' : ''}>🏛️ Politique</a>
                            <a href="Philosophie.html" ${currentPage === 'Philosophie.html' ? 'class="active"' : ''}>💭 Philosophie</a>
                        </div>
                    </li>
                </ul>
            </li>
            
            <!-- Groupe MON ESPACE -->
            <li class="dropdown">
                <a href="MonEspace.html" ${currentPage === 'MonEspace.html' ? 'aria-current="page"' : ''}>👤 Mon Espace</a>
                <ul class="submenu">
                    <li><a href="Profil.html" ${currentPage === 'Profil.html' ? 'class="active"' : ''}>👤 Mon Profil</a></li>
                    <li><a href="Scores.html" ${currentPage === 'Scores.html' ? 'class="active"' : ''}>🏆 Mes Scores</a></li>
                    <li><a href="Classement.html" ${currentPage === 'Classement.html' ? 'class="active"' : ''}>📊 Classement</a></li>
                    <li><a href="Social.html" ${currentPage === 'Social.html' ? 'class="active"' : ''}>👥 Amis</a></li>
                    <li><a href="clubs.html" ${currentPage === 'clubs.html' ? 'class="active"' : ''}>🏟️ Clubs</a></li>
                    <li><a href="revision.html" ${currentPage === 'revision.html' ? 'class="active"' : ''}>📖 Révisions</a></li>
                    <li><a href="parametres.html" ${currentPage === 'parametres.html' ? 'class="active"' : ''}>⚙️ Paramètres</a></li>
                </ul>
            </li>
            
            <li><a href="avis.html" ${currentPage === 'avis.html' ? 'aria-current="page"' : ''}>💬 Avis</a></li>
            <li><a href="Contact.html" ${currentPage === 'Contact.html' ? 'aria-current="page"' : ''}>📧 Contact</a></li>
        </ul>
        
        <div id="auth-nav-btn"><a href="Auth.html">🔐 Connexion</a></div>
    `;

    // Créer le menu mobile (barre en bas)
    const navMobile = document.createElement('nav');
    navMobile.className = 'nav-mobile';
    navMobile.setAttribute('aria-label', 'Navigation mobile');
    
    const isActive = (page) => currentPage === page ? 'active' : '';
    
    navMobile.innerHTML = `
        <a href="Accueil.html" class="nav-mobile-item ${isActive('Accueil.html')}">
            <span class="nav-mobile-icon">🏠</span>
            <span class="nav-mobile-label">Accueil</span>
        </a>
        <a href="Jouer.html" class="nav-mobile-item ${isActive('Jouer.html')}">
            <span class="nav-mobile-icon">🎮</span>
            <span class="nav-mobile-label">Jouer</span>
        </a>
        <a href="quiz-du-jour.html" class="nav-mobile-item nav-mobile-featured ${isActive('quiz-du-jour.html')}">
            <span class="nav-mobile-icon">📅</span>
            <span class="nav-mobile-label">Quiz du Jour</span>
        </a>
        <a href="MonEspace.html" class="nav-mobile-item ${isActive('MonEspace.html')}">
            <span class="nav-mobile-icon">👤</span>
            <span class="nav-mobile-label">Espace</span>
        </a>
        <button class="nav-mobile-item" id="mobile-menu-btn">
            <span class="nav-mobile-icon">☰</span>
            <span class="nav-mobile-label">Plus</span>
        </button>
    `;

    // Créer l'overlay du menu mobile
    const mobileOverlay = document.createElement('div');
    mobileOverlay.className = 'mobile-menu-overlay';
    mobileOverlay.id = 'mobile-menu-overlay';
    
    mobileOverlay.innerHTML = `
        <div class="mobile-menu-content">
            <button class="mobile-menu-close" id="mobile-menu-close">✕</button>
            <div class="mobile-menu-sections">
                <div class="mobile-menu-section">
                    <h3>🎮 Modes de Jeu</h3>
                    <a href="Quiz.html">🎯 Quiz Classique</a>
                    <a href="quiz-du-jour.html">📅 Quiz du Jour</a>
                    <a href="mode-survie.html">💀 Mode Survie</a>
                    <a href="multiplayer.html">⚔️ Multijoueur</a>
                </div>
                <div class="mobile-menu-section">
                    <h3>📚 Catégories</h3>
                    <div class="mobile-categories-grid">
                        <a href="Histoire.html">📜 Histoire</a>
                        <a href="Géographie.html">🌍 Géo</a>
                        <a href="Science.html">🔬 Science</a>
                        <a href="Littérature.html">📚 Littérature</a>
                        <a href="Sport.html">⚽ Sport</a>
                        <a href="Musique.html">🎵 Musique</a>
                        <a href="Art.html">🎨 Art</a>
                        <a href="Culture.html">🎭 Culture</a>
                        <a href="Cinéma.html">🎬 Cinéma</a>
                        <a href="Gastronomie.html">🍽️ Gastro</a>
                        <a href="Politique.html">🏛️ Politique</a>
                        <a href="Philosophie.html">💭 Philo</a>
                    </div>
                </div>
                <div class="mobile-menu-section">
                    <h3>👤 Mon Espace</h3>
                    <a href="Profil.html">👤 Mon Profil</a>
                    <a href="Scores.html">🏆 Mes Scores</a>
                    <a href="Classement.html">📊 Classement</a>
                    <a href="Social.html">👥 Amis</a>
                </div>
                <div class="mobile-menu-section">
                    <h3>ℹ️ Autres</h3>
                    <a href="avis.html">💬 Avis & Bugs</a>
                    <a href="Contact.html">📧 Contact</a>
                    <a href="Mentions-Legales.html">📋 Mentions légales</a>
                </div>
            </div>
        </div>
    `;

    // Supprimer l'ancien menu s'il existe
    const oldNav = document.querySelector('nav:not(.nav-desktop):not(.nav-mobile)');
    if (oldNav) oldNav.remove();
    
    // Supprimer les anciens menus dynamiques s'ils existent
    document.querySelectorAll('.nav-desktop, .nav-mobile, .mobile-menu-overlay').forEach(el => el.remove());

    // Insérer les nouveaux menus au début du body
    document.body.insertBefore(mobileOverlay, document.body.firstChild);
    document.body.insertBefore(navMobile, document.body.firstChild);
    document.body.insertBefore(navDesktop, document.body.firstChild);

    // Gestion du menu mobile
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuCloseBtn = document.getElementById('mobile-menu-close');

    if (mobileMenuBtn && mobileOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        mobileMenuCloseBtn.addEventListener('click', () => {
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        mobileOverlay.addEventListener('click', (e) => {
            if (e.target === mobileOverlay) {
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Initialiser l'auth dans le menu
    initAuthInMenu();
}

// Gestion de l'authentification dans le menu
function initAuthInMenu() {
    if (typeof firebase === 'undefined' || typeof firebase.auth !== 'function') {
        const authBtn = document.getElementById('auth-nav-btn');
        if (authBtn) {
            authBtn.innerHTML = '<a href="Auth.html">🔐 Connexion</a>';
        }
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        const authBtn = document.getElementById('auth-nav-btn');
        if (!authBtn) return;

        if (user) {
            const db = firebase.firestore();
            db.collection('profiles').doc(user.uid).get()
                .then(doc => {
                    const data = doc.exists ? doc.data() : {};
                    const pseudo = data.pseudo || user.email.split('@')[0];
                    const avatar = data.avatar?.value || '👤';
                    authBtn.innerHTML = `
                        <a href="#" onclick="logoutFromMenu(event)" title="Déconnexion">
                            ${avatar} ${pseudo}
                        </a>
                    `;
                })
                .catch(() => {
                    authBtn.innerHTML = `
                        <a href="#" onclick="logoutFromMenu(event)" title="Déconnexion">
                            👤 ${user.email.split('@')[0]}
                        </a>
                    `;
                });
        } else {
            authBtn.innerHTML = '<a href="Auth.html">🔐 Connexion</a>';
        }
    });
}

// Fonction de déconnexion
async function logoutFromMenu(event) {
    event.preventDefault();
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        try {
            await firebase.auth().signOut();
            window.location.reload();
        } catch (error) {
            alert('Erreur lors de la déconnexion');
        }
    }
}

// Initialiser le menu quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
} else {
    initMenu();
}

console.log('✅ Menu dynamique chargé');
