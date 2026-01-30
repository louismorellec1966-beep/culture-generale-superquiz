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
        // Histoire (7 sous-catégories)
        { name: 'Antiquité', emoji: '🏛️', url: 'mode-selection.html?matiere=histoire&categorie=antiquite', parent: 'Histoire', keywords: ['antiquité', 'rome', 'grèce', 'égypte', 'ancien', 'romains', 'grecs'] },
        { name: 'Moyen Âge', emoji: '🏰', url: 'mode-selection.html?matiere=histoire&categorie=moyenage', parent: 'Histoire', keywords: ['moyen âge', 'médiéval', 'chevaliers', 'châteaux', 'féodal'] },
        { name: 'Histoire de l\'Art', emoji: '🖼️', url: 'mode-selection.html?matiere=histoire&categorie=art', parent: 'Histoire', keywords: ['art', 'artistique', 'mouvements', 'courants'] },
        { name: 'Guerres Mondiales', emoji: '⚔️', url: 'mode-selection.html?matiere=histoire&categorie=guerres', parent: 'Histoire', keywords: ['guerre', 'guerres mondiales', 'wwi', 'wwii', 'conflits', 'batailles'] },
        { name: 'Histoire de France', emoji: '🇫🇷', url: 'mode-selection.html?matiere=histoire&categorie=france', parent: 'Histoire', keywords: ['france', 'révolution', 'empire', 'république', 'napoléon', 'rois'] },
        { name: 'Histoire Contemporaine', emoji: '📰', url: 'mode-selection.html?matiere=histoire&categorie=contemporaine', parent: 'Histoire', keywords: ['contemporain', 'moderne', '20ème siècle', '21ème siècle', 'récent'] },
        { name: 'Préhistoire', emoji: '🦴', url: 'mode-selection.html?matiere=histoire&categorie=prehistoire', parent: 'Histoire', keywords: ['préhistoire', 'dinosaures', 'hommes préhistoriques', 'cavernes', 'néolithique'] },

        // Géographie (6 sous-catégories)
        { name: 'Capitales du Monde', emoji: '🏛️', url: 'mode-selection.html?matiere=geographie&categorie=capitales', parent: 'Géographie', keywords: ['capitales', 'villes', 'métropoles', 'capitale'] },
        { name: 'Géographie de France', emoji: '🇫🇷', url: 'mode-selection.html?matiere=geographie&categorie=france', parent: 'Géographie', keywords: ['france', 'régions', 'départements', 'villes françaises'] },
        { name: 'Europe', emoji: '🇪🇺', url: 'mode-selection.html?matiere=geographie&categorie=europe', parent: 'Géographie', keywords: ['europe', 'européen', 'ue', 'union européenne', 'pays européens'] },
        { name: 'Continents & Océans', emoji: '🌏', url: 'mode-selection.html?matiere=geographie&categorie=continents', parent: 'Géographie', keywords: ['continents', 'océans', 'mers', 'terres', 'mondial'] },
        { name: 'Géographie Physique', emoji: '🏔️', url: 'mode-selection.html?matiere=geographie&categorie=nature', parent: 'Géographie', keywords: ['montagnes', 'fleuves', 'rivières', 'climat', 'nature', 'relief'] },
        { name: 'Géographie Culturelle', emoji: '🎭', url: 'mode-selection.html?matiere=geographie&categorie=culture', parent: 'Géographie', keywords: ['cultures', 'populations', 'traditions', 'peuples'] },

        // Science (6 sous-catégories)
        { name: 'Physique', emoji: '⚛️', url: 'mode-selection.html?matiere=science&categorie=physique', parent: 'Science', keywords: ['physique', 'atomes', 'énergie', 'mécanique', 'forces', 'newton'] },
        { name: 'Chimie', emoji: '🧪', url: 'mode-selection.html?matiere=science&categorie=chimie', parent: 'Science', keywords: ['chimie', 'molécules', 'éléments', 'réactions', 'tableau périodique'] },
        { name: 'Biologie', emoji: '🧬', url: 'mode-selection.html?matiere=science&categorie=biologie', parent: 'Science', keywords: ['biologie', 'vivant', 'cellules', 'adn', 'génétique', 'animaux', 'plantes'] },
        { name: 'Astronomie', emoji: '🔭', url: 'mode-selection.html?matiere=science&categorie=astronomie', parent: 'Science', keywords: ['astronomie', 'espace', 'planètes', 'étoiles', 'univers', 'galaxies', 'nasa'] },
        { name: 'Mathématiques', emoji: '🔢', url: 'mode-selection.html?matiere=science&categorie=mathematiques', parent: 'Science', keywords: ['mathématiques', 'maths', 'calcul', 'géométrie', 'algèbre', 'nombres'] },
        { name: 'Technologie', emoji: '💻', url: 'mode-selection.html?matiere=science&categorie=technologie', parent: 'Science', keywords: ['technologie', 'tech', 'informatique', 'inventions', 'innovations'] },

        // Littérature (6 sous-catégories)
        { name: 'Classiques', emoji: '📖', url: 'mode-selection.html?matiere=litterature&categorie=classiques', parent: 'Littérature', keywords: ['classiques', 'classique', 'grands auteurs', 'chefs-d\'oeuvre'] },
        { name: 'Poésie', emoji: '✨', url: 'mode-selection.html?matiere=litterature&categorie=poesie', parent: 'Littérature', keywords: ['poésie', 'poèmes', 'vers', 'rimes', 'poètes'] },
        { name: 'Théâtre', emoji: '🎭', url: 'mode-selection.html?matiere=litterature&categorie=theatre', parent: 'Littérature', keywords: ['théâtre', 'pièces', 'molière', 'comédie', 'tragédie', 'dramaturgie'] },
        { name: 'Romans', emoji: '📕', url: 'mode-selection.html?matiere=litterature&categorie=romans', parent: 'Littérature', keywords: ['romans', 'roman', 'fiction', 'récit', 'narratif'] },
        { name: 'Littérature Mondiale', emoji: '🌍', url: 'mode-selection.html?matiere=litterature&categorie=mondiale', parent: 'Littérature', keywords: ['mondiale', 'international', 'étrangère', 'world'] },
        { name: 'Littérature Contemporaine', emoji: '📚', url: 'mode-selection.html?matiere=litterature&categorie=contemporaine', parent: 'Littérature', keywords: ['contemporaine', 'moderne', 'actuelle', 'récente'] },

        // Sport (6 sous-catégories)
        { name: 'Football', emoji: '⚽', url: 'mode-selection.html?matiere=sport&categorie=football', parent: 'Sport', keywords: ['football', 'foot', 'ballon rond', 'coupe du monde', 'ligue', 'fifa'] },
        { name: 'Basketball', emoji: '🏀', url: 'mode-selection.html?matiere=sport&categorie=basketball', parent: 'Sport', keywords: ['basketball', 'basket', 'nba', 'panier'] },
        { name: 'Tennis', emoji: '🎾', url: 'mode-selection.html?matiere=sport&categorie=tennis', parent: 'Sport', keywords: ['tennis', 'raquette', 'roland garros', 'wimbledon', 'atp'] },
        { name: 'Athlétisme', emoji: '🏃', url: 'mode-selection.html?matiere=sport&categorie=athletisme', parent: 'Sport', keywords: ['athlétisme', 'course', 'sprint', 'marathon', 'saut'] },
        { name: 'Natation', emoji: '🏊', url: 'mode-selection.html?matiere=sport&categorie=natation', parent: 'Sport', keywords: ['natation', 'nager', 'piscine', 'crawl', 'brasse'] },
        { name: 'Jeux Olympiques', emoji: '🏅', url: 'mode-selection.html?matiere=sport&categorie=jeux-olympiques', parent: 'Sport', keywords: ['olympiques', 'jo', 'jeux', 'médailles', 'olympics'] },

        // Musique (6 sous-catégories)
        { name: 'Musique Classique', emoji: '🎻', url: 'mode-selection.html?matiere=musique&categorie=classique', parent: 'Musique', keywords: ['classique', 'orchestres', 'symphonie', 'opéra', 'mozart', 'beethoven'] },
        { name: 'Rock', emoji: '🎸', url: 'mode-selection.html?matiere=musique&categorie=rock', parent: 'Musique', keywords: ['rock', 'guitare', 'metal', 'hard rock', 'groupe'] },
        { name: 'Jazz', emoji: '🎷', url: 'mode-selection.html?matiere=musique&categorie=jazz', parent: 'Musique', keywords: ['jazz', 'blues', 'swing', 'saxophone', 'improvisation'] },
        { name: 'Rap & Hip-Hop', emoji: '🎤', url: 'mode-selection.html?matiere=musique&categorie=rap', parent: 'Musique', keywords: ['rap', 'hip-hop', 'hip hop', 'rappeur', 'mc', 'flow'] },
        { name: 'Musiques du Monde', emoji: '🌍', url: 'mode-selection.html?matiere=musique&categorie=monde', parent: 'Musique', keywords: ['monde', 'world', 'ethnique', 'traditionnel', 'folklore'] },
        { name: 'Théorie Musicale', emoji: '🎼', url: 'mode-selection.html?matiere=musique&categorie=theorie', parent: 'Musique', keywords: ['théorie', 'solfège', 'notes', 'accords', 'gammes'] },

        // Art (6 sous-catégories)
        { name: 'Peinture', emoji: '🖌️', url: 'mode-selection.html?matiere=art&categorie=peinture', parent: 'Art', keywords: ['peinture', 'peintres', 'tableaux', 'toile', 'huile', 'aquarelle', 'impressionnisme'] },
        { name: 'Sculpture', emoji: '🗿', url: 'mode-selection.html?matiere=art&categorie=sculpture', parent: 'Art', keywords: ['sculpture', 'sculpteurs', 'statues', 'bronze', 'marbre'] },
        { name: 'Architecture', emoji: '🏛️', url: 'mode-selection.html?matiere=art&categorie=architecture', parent: 'Art', keywords: ['architecture', 'monuments', 'bâtiments', 'architectes', 'style'] },
        { name: 'Art Moderne', emoji: '🖼️', url: 'mode-selection.html?matiere=art&categorie=moderne', parent: 'Art', keywords: ['moderne', 'contemporain', 'abstrait', 'avant-garde', 'xxe siècle'] },
        { name: 'Photographie', emoji: '📷', url: 'mode-selection.html?matiere=art&categorie=photo', parent: 'Art', keywords: ['photographie', 'photo', 'photographes', 'clichés', 'images'] },
        { name: 'Histoire de l\'Art', emoji: '📜', url: 'mode-selection.html?matiere=art&categorie=histoire', parent: 'Art', keywords: ['histoire', 'époques', 'mouvements', 'courants', 'renaissance', 'baroque'] },

        // Cinéma (6 sous-catégories)
        { name: 'Cinéma Français', emoji: '🇫🇷', url: 'mode-selection.html?matiere=cinema&categorie=francais', parent: 'Cinéma', keywords: ['français', 'france', 'cinéma français', 'nouvelle vague'] },
        { name: 'Cinéma International', emoji: '🌍', url: 'mode-selection.html?matiere=cinema&categorie=international', parent: 'Cinéma', keywords: ['international', 'hollywood', 'étranger', 'world cinema'] },
        { name: 'Acteurs & Actrices', emoji: '🌟', url: 'mode-selection.html?matiere=cinema&categorie=acteurs', parent: 'Cinéma', keywords: ['acteurs', 'actrices', 'stars', 'célébrités', 'comédiens'] },
        { name: 'Réalisateurs', emoji: '🎥', url: 'mode-selection.html?matiere=cinema&categorie=realisateurs', parent: 'Cinéma', keywords: ['réalisateurs', 'metteurs en scène', 'directors', 'cinéastes'] },
        { name: 'Oscars & Récompenses', emoji: '🏆', url: 'mode-selection.html?matiere=cinema&categorie=oscars', parent: 'Cinéma', keywords: ['oscars', 'césar', 'récompenses', 'prix', 'palmarès', 'festival'] },
        { name: 'Films Cultes', emoji: '🎬', url: 'mode-selection.html?matiere=cinema&categorie=films-cultes', parent: 'Cinéma', keywords: ['cultes', 'classiques', 'incontournables', 'chef-d\'oeuvre', 'mythiques'] },

        // Gastronomie (6 sous-catégories)
        { name: 'Cuisine Française', emoji: '🇫🇷', url: 'mode-selection.html?matiere=gastronomie&categorie=francaise', parent: 'Gastronomie', keywords: ['française', 'france', 'traditionnelle', 'terroir'] },
        { name: 'Cuisine Mondiale', emoji: '🌍', url: 'mode-selection.html?matiere=gastronomie&categorie=mondiale', parent: 'Gastronomie', keywords: ['mondiale', 'international', 'étrangère', 'world'] },
        { name: 'Chefs Cuisiniers', emoji: '👨‍🍳', url: 'mode-selection.html?matiere=gastronomie&categorie=chefs', parent: 'Gastronomie', keywords: ['chefs', 'cuisiniers', 'étoilés', 'bocuse', 'top chef'] },
        { name: 'Fromages', emoji: '🧀', url: 'mode-selection.html?matiere=gastronomie&categorie=fromages', parent: 'Gastronomie', keywords: ['fromages', 'fromage', 'lait', 'affinage'] },
        { name: 'Vins & Boissons', emoji: '🍷', url: 'mode-selection.html?matiere=gastronomie&categorie=boissons', parent: 'Gastronomie', keywords: ['vins', 'vin', 'boissons', 'alcool', 'vignobles', 'champagne'] },
        { name: 'Desserts & Pâtisserie', emoji: '🍰', url: 'mode-selection.html?matiere=gastronomie&categorie=desserts', parent: 'Gastronomie', keywords: ['desserts', 'pâtisserie', 'gâteaux', 'sucreries', 'chocolat'] },

        // Politique (6 sous-catégories)
        { name: 'Partis Politiques', emoji: '🗳️', url: 'mode-selection.html?matiere=politique&categorie=partis', parent: 'Politique', keywords: ['partis', 'parti', 'gauche', 'droite', 'élections'] },
        { name: 'Présidents', emoji: '🏛️', url: 'mode-selection.html?matiere=politique&categorie=presidents', parent: 'Politique', keywords: ['présidents', 'président', 'chef d\'état', 'élysée'] },
        { name: 'Institutions', emoji: '⚖️', url: 'mode-selection.html?matiere=politique&categorie=institutions', parent: 'Politique', keywords: ['institutions', 'assemblée', 'sénat', 'constitution', 'lois'] },
        { name: 'Idéologies', emoji: '💡', url: 'mode-selection.html?matiere=politique&categorie=ideologies', parent: 'Politique', keywords: ['idéologies', 'socialisme', 'libéralisme', 'communisme', 'démocratie'] },
        { name: 'Histoire Politique', emoji: '📜', url: 'mode-selection.html?matiere=politique&categorie=histoire', parent: 'Politique', keywords: ['histoire', 'révolutions', 'régimes', 'république'] },
        { name: 'Actualité Politique', emoji: '📰', url: 'mode-selection.html?matiere=politique&categorie=actualite', parent: 'Politique', keywords: ['actualité', 'actuel', 'récent', 'news', 'aujourd\'hui'] },

        // Philosophie (6 sous-catégories)
        { name: 'Philosophie Antique', emoji: '🏛️', url: 'mode-selection.html?matiere=philosophie&categorie=antiquite', parent: 'Philosophie', keywords: ['antique', 'grecque', 'socrate', 'platon', 'aristote'] },
        { name: 'Philosophie Moderne', emoji: '📖', url: 'mode-selection.html?matiere=philosophie&categorie=moderne', parent: 'Philosophie', keywords: ['moderne', 'descartes', 'kant', 'lumières', 'raison'] },
        { name: 'Philosophie Contemporaine', emoji: '💭', url: 'mode-selection.html?matiere=philosophie&categorie=contemporaine', parent: 'Philosophie', keywords: ['contemporaine', 'sartre', 'existentialisme', 'nietzsche'] },
        { name: 'Éthique', emoji: '⚖️', url: 'mode-selection.html?matiere=philosophie&categorie=ethique', parent: 'Philosophie', keywords: ['éthique', 'morale', 'bien', 'mal', 'valeurs'] },
        { name: 'Philosophie Politique', emoji: '🏛️', url: 'mode-selection.html?matiere=philosophie&categorie=politique', parent: 'Philosophie', keywords: ['politique', 'état', 'société', 'pouvoir', 'contrat social'] },
        { name: 'Concepts Philosophiques', emoji: '🧠', url: 'mode-selection.html?matiere=philosophie&categorie=concepts', parent: 'Philosophie', keywords: ['concepts', 'idées', 'notions', 'pensée', 'réflexion'] }
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
