// ========== SEARCH SYSTEM - CULTURE LUDO ==========
// Système de recherche pour catégories, sous-catégories et menu

// Données de recherche
const searchData = {
    // Catégories principales
    categories: [
        { name: 'Histoire', emoji: '📜', url: 'Histoire.html', keywords: ['histoire', 'historique', 'passé', 'événements'] },
        { name: 'Géographie', emoji: '🌍', url: 'Géographie.html', keywords: ['géographie', 'géo', 'pays', 'capitales', 'monde', 'cartes', 'continents'] },
        { name: 'Science', emoji: '🔬', url: 'Science.html', keywords: ['science', 'sciences', 'scientifique', 'physique', 'chimie', 'biologie'] },
        { name: 'Littérature', emoji: '📚', url: 'Littérature.html', keywords: ['littérature', 'livres', 'auteurs', 'écrivains', 'romans', 'poésie'] },
        { name: 'Sport', emoji: '⚽', url: 'Sport.html', keywords: ['sport', 'sports', 'football', 'athlétisme', 'jeux olympiques'] },
        { name: 'Musique', emoji: '🎵', url: 'Musique.html', keywords: ['musique', 'chansons', 'artistes', 'chanteurs', 'albums', 'concerts'] },
        { name: 'Art', emoji: '🎨', url: 'Art.html', keywords: ['art', 'peinture', 'sculpture', 'artistes', 'tableaux', 'musées'] },
        { name: 'Cinéma', emoji: '🎬', url: 'Cinéma.html', keywords: ['cinéma', 'films', 'acteurs', 'réalisateurs', 'séries', 'hollywood'] },
        { name: 'Gastronomie', emoji: '🍽️', url: 'Gastronomie.html', keywords: ['gastronomie', 'cuisine', 'recettes', 'plats', 'chefs', 'nourriture'] },
        { name: 'Politique', emoji: '🏛️', url: 'Politique.html', keywords: ['politique', 'gouvernement', 'présidents', 'élections', 'lois'] },
        { name: 'Philosophie', emoji: '💭', url: 'Philosophie.html', keywords: ['philosophie', 'philo', 'philosophes', 'pensée', 'sagesse'] }
    ],

    // Sous-catégories (par catégorie principale)
    subcategories: [
        // Histoire
        { name: 'Antiquité', emoji: '🏛️', url: 'mode-selection.html?matiere=histoire&categorie=antiquite', parent: 'Histoire', keywords: ['antiquité', 'rome', 'grèce', 'égypte', 'ancien'] },
        { name: 'Moyen Âge', emoji: '🏰', url: 'mode-selection.html?matiere=histoire&categorie=moyenage', parent: 'Histoire', keywords: ['moyen âge', 'médiéval', 'chevaliers', 'châteaux'] },
        { name: 'Histoire de l\'Art', emoji: '🖼️', url: 'mode-selection.html?matiere=histoire&categorie=art', parent: 'Histoire', keywords: ['art', 'peinture', 'sculpture', 'architecture'] },
        { name: 'Guerres Mondiales', emoji: '⚔️', url: 'mode-selection.html?matiere=histoire&categorie=guerres', parent: 'Histoire', keywords: ['guerre', 'guerres mondiales', 'wwi', 'wwii', 'conflits'] },
        { name: 'Histoire de France', emoji: '🇫🇷', url: 'mode-selection.html?matiere=histoire&categorie=france', parent: 'Histoire', keywords: ['france', 'révolution', 'empire', 'république'] },
        { name: 'Histoire Contemporaine', emoji: '📰', url: 'mode-selection.html?matiere=histoire&categorie=contemporaine', parent: 'Histoire', keywords: ['contemporain', 'moderne', '20ème siècle', '21ème siècle'] },
        { name: 'Préhistoire', emoji: '🦴', url: 'mode-selection.html?matiere=histoire&categorie=prehistoire', parent: 'Histoire', keywords: ['préhistoire', 'dinosaures', 'hommes préhistoriques', 'cavernes'] },

        // Géographie
        { name: 'Europe', emoji: '🇪🇺', url: 'mode-selection.html?matiere=geographie&categorie=europe', parent: 'Géographie', keywords: ['europe', 'européen', 'ue', 'union européenne'] },
        { name: 'Afrique', emoji: '🌍', url: 'mode-selection.html?matiere=geographie&categorie=afrique', parent: 'Géographie', keywords: ['afrique', 'africain'] },
        { name: 'Asie', emoji: '🌏', url: 'mode-selection.html?matiere=geographie&categorie=asie', parent: 'Géographie', keywords: ['asie', 'asiatique'] },
        { name: 'Amériques', emoji: '🌎', url: 'mode-selection.html?matiere=geographie&categorie=ameriques', parent: 'Géographie', keywords: ['amérique', 'américain', 'usa', 'états-unis'] },
        { name: 'Océanie', emoji: '🏝️', url: 'mode-selection.html?matiere=geographie&categorie=oceanie', parent: 'Géographie', keywords: ['océanie', 'australie', 'pacifique'] },
        { name: 'Capitales', emoji: '🏙️', url: 'mode-selection.html?matiere=geographie&categorie=capitales', parent: 'Géographie', keywords: ['capitales', 'villes', 'métropoles'] },
        { name: 'Drapeaux', emoji: '🚩', url: 'mode-selection.html?matiere=geographie&categorie=drapeaux', parent: 'Géographie', keywords: ['drapeaux', 'emblèmes', 'symboles'] },

        // Science
        { name: 'Physique', emoji: '⚛️', url: 'mode-selection.html?matiere=science&categorie=physique', parent: 'Science', keywords: ['physique', 'atomes', 'énergie', 'mécanique'] },
        { name: 'Chimie', emoji: '🧪', url: 'mode-selection.html?matiere=science&categorie=chimie', parent: 'Science', keywords: ['chimie', 'molécules', 'éléments', 'réactions'] },
        { name: 'Biologie', emoji: '🧬', url: 'mode-selection.html?matiere=science&categorie=biologie', parent: 'Science', keywords: ['biologie', 'vivant', 'cellules', 'adn'] },
        { name: 'Astronomie', emoji: '🔭', url: 'mode-selection.html?matiere=science&categorie=astronomie', parent: 'Science', keywords: ['astronomie', 'espace', 'planètes', 'étoiles', 'univers'] },
        { name: 'Mathématiques', emoji: '🔢', url: 'mode-selection.html?matiere=science&categorie=mathematiques', parent: 'Science', keywords: ['mathématiques', 'maths', 'calcul', 'géométrie'] },

        // Littérature
        { name: 'Classiques', emoji: '📖', url: 'mode-selection.html?matiere=litterature&categorie=classiques', parent: 'Littérature', keywords: ['classiques', 'classique', 'grands auteurs'] },
        { name: 'Poésie', emoji: '✨', url: 'mode-selection.html?matiere=litterature&categorie=poesie', parent: 'Littérature', keywords: ['poésie', 'poèmes', 'vers', 'rimes'] },
        { name: 'Théâtre', emoji: '🎭', url: 'mode-selection.html?matiere=litterature&categorie=theatre', parent: 'Littérature', keywords: ['théâtre', 'pièces', 'molière', 'comédie', 'tragédie'] },

        // Sport
        { name: 'Football', emoji: '⚽', url: 'mode-selection.html?matiere=sport&categorie=football', parent: 'Sport', keywords: ['football', 'foot', 'ballon rond', 'coupe du monde'] },
        { name: 'Tennis', emoji: '🎾', url: 'mode-selection.html?matiere=sport&categorie=tennis', parent: 'Sport', keywords: ['tennis', 'raquette', 'roland garros', 'wimbledon'] },
        { name: 'Jeux Olympiques', emoji: '🏅', url: 'mode-selection.html?matiere=sport&categorie=jo', parent: 'Sport', keywords: ['olympiques', 'jo', 'jeux', 'médailles'] },

        // Musique
        { name: 'Rock', emoji: '🎸', url: 'mode-selection.html?matiere=musique&categorie=rock', parent: 'Musique', keywords: ['rock', 'guitare', 'metal'] },
        { name: 'Pop', emoji: '🎤', url: 'mode-selection.html?matiere=musique&categorie=pop', parent: 'Musique', keywords: ['pop', 'populaire', 'hits'] },
        { name: 'Classique', emoji: '🎻', url: 'mode-selection.html?matiere=musique&categorie=classique', parent: 'Musique', keywords: ['classique', 'orchestres', 'symphonie', 'opéra'] },

        // Cinéma
        { name: 'Films Cultes', emoji: '🎬', url: 'mode-selection.html?matiere=cinema&categorie=cultes', parent: 'Cinéma', keywords: ['cultes', 'classiques', 'incontournables'] },
        { name: 'Réalisateurs', emoji: '🎥', url: 'mode-selection.html?matiere=cinema&categorie=realisateurs', parent: 'Cinéma', keywords: ['réalisateurs', 'metteurs en scène', 'directors'] },
        { name: 'Acteurs', emoji: '🌟', url: 'mode-selection.html?matiere=cinema&categorie=acteurs', parent: 'Cinéma', keywords: ['acteurs', 'actrices', 'stars', 'célébrités'] }
    ],

    // Pages du menu
    pages: [
        { name: 'Accueil', emoji: '🏠', url: 'Accueil.html', keywords: ['accueil', 'home', 'principal'] },
        { name: 'Jouer', emoji: '🎮', url: 'Jouer.html', keywords: ['jouer', 'jeu', 'play'] },
        { name: 'Quiz Classique', emoji: '🎯', url: 'Quiz.html', keywords: ['quiz', 'classique', 'normal', 'standard'] },
        { name: 'Quiz du Jour', emoji: '📅', url: 'quiz-du-jour.html', keywords: ['jour', 'quotidien', 'daily', 'journalier'] },
        { name: 'Mode Survie', emoji: '💀', url: 'mode-survie.html', keywords: ['survie', 'survival', 'endurance', 'challenge'] },
        { name: 'Multijoueur', emoji: '⚔️', url: 'multiplayer.html', keywords: ['multijoueur', 'multiplayer', 'duel', 'versus', 'pvp', 'amis'] },
        { name: 'Tournois', emoji: '🏆', url: 'tournois.html', keywords: ['tournois', 'compétition', 'championship'] },
        { name: 'Quiz Perso', emoji: '🎨', url: 'quiz-perso.html', keywords: ['personnalisé', 'custom', 'créer', 'perso'] },
        { name: 'Mon Profil', emoji: '👤', url: 'Profil.html', keywords: ['profil', 'profile', 'compte', 'moi'] },
        { name: 'Mes Scores', emoji: '🏆', url: 'Scores.html', keywords: ['scores', 'points', 'résultats'] },
        { name: 'Classement', emoji: '📊', url: 'Classement.html', keywords: ['classement', 'ranking', 'leaderboard', 'top'] },
        { name: 'Amis', emoji: '👥', url: 'Social.html', keywords: ['amis', 'friends', 'social', 'communauté'] },
        { name: 'Clubs', emoji: '🏟️', url: 'clubs.html', keywords: ['clubs', 'groupes', 'équipes', 'communauté'] },
        { name: 'Révisions', emoji: '📖', url: 'revision.html', keywords: ['révisions', 'réviser', 'apprendre', 'étudier'] },
        { name: 'Paramètres', emoji: '⚙️', url: 'parametres.html', keywords: ['paramètres', 'settings', 'options', 'configuration'] },
        { name: 'Avis', emoji: '💬', url: 'avis.html', keywords: ['avis', 'feedback', 'bugs', 'suggestions'] },
        { name: 'Contact', emoji: '📧', url: 'Contact.html', keywords: ['contact', 'email', 'message'] },
        { name: 'Mon Espace', emoji: '👤', url: 'MonEspace.html', keywords: ['espace', 'dashboard', 'tableau de bord'] }
    ]
};

// Classe SearchSystem
class SearchSystem {
    constructor() {
        this.isOpen = false;
        this.selectedIndex = -1;
        this.results = [];
        this.init();
    }

    init() {
        this.createSearchElements();
        this.bindEvents();
    }

    // Création des éléments HTML de la recherche
    createSearchElements() {
        // Container principal de recherche (desktop)
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <button class="search-trigger" id="search-trigger" aria-label="Rechercher">
                <span class="search-icon">🔍</span>
                <span class="search-text">Rechercher...</span>
                <span class="search-shortcut">Ctrl+K</span>
            </button>
        `;

        // Modal de recherche
        const searchModal = document.createElement('div');
        searchModal.className = 'search-modal';
        searchModal.id = 'search-modal';
        searchModal.innerHTML = `
            <div class="search-modal-backdrop"></div>
            <div class="search-modal-content">
                <div class="search-input-container">
                    <span class="search-input-icon">🔍</span>
                    <input type="text"
                           class="search-input"
                           id="search-input"
                           placeholder="Rechercher catégories, quiz, pages..."
                           autocomplete="off"
                           spellcheck="false">
                    <button class="search-close" id="search-close">Échap</button>
                </div>
                <div class="search-results" id="search-results">
                    <div class="search-hint">
                        <p>Tapez pour rechercher parmi :</p>
                        <div class="search-hint-tags">
                            <span>📚 Catégories</span>
                            <span>📁 Sous-catégories</span>
                            <span>📄 Pages</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Bouton de recherche mobile
        const mobileSearchBtn = document.createElement('button');
        mobileSearchBtn.className = 'search-mobile-btn';
        mobileSearchBtn.id = 'search-mobile-btn';
        mobileSearchBtn.innerHTML = '🔍';
        mobileSearchBtn.setAttribute('aria-label', 'Rechercher');

        // Ajouter au DOM
        document.body.appendChild(searchModal);

        // Stocker les références
        this.searchContainer = searchContainer;
        this.searchModal = searchModal;
        this.mobileSearchBtn = mobileSearchBtn;
    }

    // Injection dans le menu
    injectIntoMenu() {
        const navDesktop = document.querySelector('.nav-desktop');
        const navMobile = document.querySelector('.nav-mobile');

        if (navDesktop) {
            const authBtn = navDesktop.querySelector('#auth-nav-btn');
            if (authBtn) {
                authBtn.parentNode.insertBefore(this.searchContainer, authBtn);
            }
        }

        if (navMobile) {
            navMobile.appendChild(this.mobileSearchBtn);
        }
    }

    // Binding des événements
    bindEvents() {
        // Ouvrir la recherche
        document.addEventListener('click', (e) => {
            if (e.target.closest('#search-trigger') || e.target.closest('#search-mobile-btn')) {
                this.open();
            }
        });

        // Fermer la recherche
        document.addEventListener('click', (e) => {
            if (e.target.closest('.search-modal-backdrop') || e.target.closest('#search-close')) {
                this.close();
            }
        });

        // Raccourci clavier Ctrl+K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }

            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Input de recherche
        document.addEventListener('input', (e) => {
            if (e.target.id === 'search-input') {
                this.search(e.target.value);
            }
        });

        // Navigation clavier dans les résultats
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateResults(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateResults(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.selectResult();
            }
        });
    }

    // Ouvrir la modal
    open() {
        this.isOpen = true;
        this.searchModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            const input = document.getElementById('search-input');
            if (input) {
                input.focus();
                input.value = '';
            }
        }, 100);

        this.showHint();
    }

    // Fermer la modal
    close() {
        this.isOpen = false;
        this.searchModal.classList.remove('active');
        document.body.style.overflow = '';
        this.selectedIndex = -1;
        this.results = [];
    }

    // Toggle
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    // Afficher l'indice initial
    showHint() {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = `
            <div class="search-hint">
                <p>Tapez pour rechercher parmi :</p>
                <div class="search-hint-tags">
                    <span>📚 Catégories</span>
                    <span>📁 Sous-catégories</span>
                    <span>📄 Pages</span>
                </div>
            </div>
        `;
    }

    // Normaliser une chaîne pour la recherche
    normalize(str) {
        return str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    // Effectuer la recherche
    search(query) {
        const resultsContainer = document.getElementById('search-results');

        if (!query || query.length < 1) {
            this.showHint();
            return;
        }

        const normalizedQuery = this.normalize(query);
        this.results = [];

        // Rechercher dans les catégories
        searchData.categories.forEach(cat => {
            const score = this.getMatchScore(normalizedQuery, cat.name, cat.keywords);
            if (score > 0) {
                this.results.push({
                    type: 'category',
                    label: 'Catégorie',
                    ...cat,
                    score
                });
            }
        });

        // Rechercher dans les sous-catégories
        searchData.subcategories.forEach(sub => {
            const score = this.getMatchScore(normalizedQuery, sub.name, sub.keywords);
            if (score > 0) {
                this.results.push({
                    type: 'subcategory',
                    label: `Sous-catégorie • ${sub.parent}`,
                    ...sub,
                    score
                });
            }
        });

        // Rechercher dans les pages
        searchData.pages.forEach(page => {
            const score = this.getMatchScore(normalizedQuery, page.name, page.keywords);
            if (score > 0) {
                this.results.push({
                    type: 'page',
                    label: 'Page',
                    ...page,
                    score
                });
            }
        });

        // Trier par score décroissant
        this.results.sort((a, b) => b.score - a.score);

        // Limiter à 10 résultats
        this.results = this.results.slice(0, 10);

        // Afficher les résultats
        this.displayResults();
    }

    // Calculer le score de correspondance
    getMatchScore(query, name, keywords) {
        const normalizedName = this.normalize(name);
        let score = 0;

        // Correspondance exacte du nom
        if (normalizedName === query) {
            score += 100;
        }
        // Le nom commence par la requête
        else if (normalizedName.startsWith(query)) {
            score += 80;
        }
        // Le nom contient la requête
        else if (normalizedName.includes(query)) {
            score += 60;
        }

        // Vérifier les mots-clés
        if (keywords) {
            keywords.forEach(keyword => {
                const normalizedKeyword = this.normalize(keyword);
                if (normalizedKeyword === query) {
                    score += 50;
                } else if (normalizedKeyword.startsWith(query)) {
                    score += 30;
                } else if (normalizedKeyword.includes(query)) {
                    score += 20;
                }
            });
        }

        return score;
    }

    // Afficher les résultats
    displayResults() {
        const resultsContainer = document.getElementById('search-results');

        if (this.results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <span class="search-no-results-icon">🔍</span>
                    <p>Aucun résultat trouvé</p>
                    <small>Essayez avec d'autres mots-clés</small>
                </div>
            `;
            return;
        }

        let html = '<div class="search-results-list">';

        this.results.forEach((result, index) => {
            const typeClass = `search-result-${result.type}`;
            const selectedClass = index === this.selectedIndex ? 'selected' : '';

            html += `
                <a href="${result.url}"
                   class="search-result-item ${typeClass} ${selectedClass}"
                   data-index="${index}">
                    <span class="search-result-emoji">${result.emoji}</span>
                    <div class="search-result-info">
                        <span class="search-result-name">${result.name}</span>
                        <span class="search-result-label">${result.label}</span>
                    </div>
                    <span class="search-result-arrow">→</span>
                </a>
            `;
        });

        html += '</div>';
        resultsContainer.innerHTML = html;

        // Ajouter les événements hover
        resultsContainer.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                this.selectedIndex = index;
                this.updateSelection();
            });
        });
    }

    // Navigation avec les flèches
    navigateResults(direction) {
        if (this.results.length === 0) return;

        this.selectedIndex += direction;

        if (this.selectedIndex < 0) {
            this.selectedIndex = this.results.length - 1;
        } else if (this.selectedIndex >= this.results.length) {
            this.selectedIndex = 0;
        }

        this.updateSelection();
    }

    // Mettre à jour la sélection visuelle
    updateSelection() {
        const items = document.querySelectorAll('.search-result-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // Sélectionner un résultat
    selectResult() {
        if (this.selectedIndex >= 0 && this.selectedIndex < this.results.length) {
            const result = this.results[this.selectedIndex];
            window.location.href = result.url;
        }
    }
}

// Initialiser le système de recherche
let searchSystem;

function initSearchSystem() {
    searchSystem = new SearchSystem();

    // Attendre que le menu soit chargé
    const checkMenu = setInterval(() => {
        const navDesktop = document.querySelector('.nav-desktop');
        if (navDesktop) {
            clearInterval(checkMenu);
            searchSystem.injectIntoMenu();
        }
    }, 100);
}

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchSystem);
} else {
    initSearchSystem();
}

console.log('✅ Système de recherche chargé');
