// ========== SYSTÈME DE TITRES PERSONNALISÉS ==========
// Titres déblocables selon les performances

const TitlesSystem = {
    // Définition de tous les titres disponibles
    TITLES: {
        // Titres par matière (basés sur le nombre de quiz parfaits)
        histoire_novice: { name: 'Apprenti Historien', emoji: '📜', requirement: { matiere: 'histoire', perfectQuiz: 1 }, rarity: 'common' },
        histoire_expert: { name: 'Expert en Histoire', emoji: '🏛️', requirement: { matiere: 'histoire', perfectQuiz: 10 }, rarity: 'rare' },
        histoire_maitre: { name: 'Maître de l\'Histoire', emoji: '👑', requirement: { matiere: 'histoire', perfectQuiz: 50 }, rarity: 'legendary' },
        
        geographie_novice: { name: 'Globe-trotter', emoji: '🌍', requirement: { matiere: 'geographie', perfectQuiz: 1 }, rarity: 'common' },
        geographie_expert: { name: 'Explorateur', emoji: '🧭', requirement: { matiere: 'geographie', perfectQuiz: 10 }, rarity: 'rare' },
        geographie_maitre: { name: 'Maître du Monde', emoji: '🗺️', requirement: { matiere: 'geographie', perfectQuiz: 50 }, rarity: 'legendary' },
        
        science_novice: { name: 'Curieux Scientifique', emoji: '🔬', requirement: { matiere: 'science', perfectQuiz: 1 }, rarity: 'common' },
        science_expert: { name: 'Savant', emoji: '⚛️', requirement: { matiere: 'science', perfectQuiz: 10 }, rarity: 'rare' },
        science_maitre: { name: 'Génie des Sciences', emoji: '🧪', requirement: { matiere: 'science', perfectQuiz: 50 }, rarity: 'legendary' },
        
        litterature_novice: { name: 'Lecteur Assidu', emoji: '📚', requirement: { matiere: 'litterature', perfectQuiz: 1 }, rarity: 'common' },
        litterature_expert: { name: 'Bibliophile', emoji: '📖', requirement: { matiere: 'litterature', perfectQuiz: 10 }, rarity: 'rare' },
        litterature_maitre: { name: 'Maître des Lettres', emoji: '✒️', requirement: { matiere: 'litterature', perfectQuiz: 50 }, rarity: 'legendary' },
        
        sport_novice: { name: 'Sportif Amateur', emoji: '⚽', requirement: { matiere: 'sport', perfectQuiz: 1 }, rarity: 'common' },
        sport_expert: { name: 'Champion', emoji: '🏆', requirement: { matiere: 'sport', perfectQuiz: 10 }, rarity: 'rare' },
        sport_maitre: { name: 'Légende du Sport', emoji: '🥇', requirement: { matiere: 'sport', perfectQuiz: 50 }, rarity: 'legendary' },
        
        art_novice: { name: 'Amateur d\'Art', emoji: '🎨', requirement: { matiere: 'art', perfectQuiz: 1 }, rarity: 'common' },
        art_expert: { name: 'Artiste', emoji: '🖼️', requirement: { matiere: 'art', perfectQuiz: 10 }, rarity: 'rare' },
        art_maitre: { name: 'Virtuose de l\'Art', emoji: '🎭', requirement: { matiere: 'art', perfectQuiz: 50 }, rarity: 'legendary' },
        
        musique_novice: { name: 'Mélomane', emoji: '🎵', requirement: { matiere: 'musique', perfectQuiz: 1 }, rarity: 'common' },
        musique_expert: { name: 'Musicien', emoji: '🎸', requirement: { matiere: 'musique', perfectQuiz: 10 }, rarity: 'rare' },
        musique_maitre: { name: 'Maestro', emoji: '🎼', requirement: { matiere: 'musique', perfectQuiz: 50 }, rarity: 'legendary' },
        
        cinema_novice: { name: 'Cinéphile', emoji: '🎬', requirement: { matiere: 'cinema', perfectQuiz: 1 }, rarity: 'common' },
        cinema_expert: { name: 'Critique', emoji: '🎥', requirement: { matiere: 'cinema', perfectQuiz: 10 }, rarity: 'rare' },
        cinema_maitre: { name: 'Légende du 7ème Art', emoji: '⭐', requirement: { matiere: 'cinema', perfectQuiz: 50 }, rarity: 'legendary' },

        // Titres généraux (basés sur les stats globales)
        polyvalent: { name: 'Polyvalent', emoji: '🎯', requirement: { differentMatieres: 5 }, rarity: 'rare' },
        encyclopedie: { name: 'Encyclopédie Vivante', emoji: '📕', requirement: { differentMatieres: 10, totalQuiz: 100 }, rarity: 'legendary' },
        
        // Titres de streaks
        regulier: { name: 'Joueur Régulier', emoji: '📅', requirement: { streak: 7 }, rarity: 'common' },
        assidu: { name: 'Assidu', emoji: '🔥', requirement: { streak: 30 }, rarity: 'rare' },
        infatigable: { name: 'Infatigable', emoji: '💪', requirement: { streak: 100 }, rarity: 'legendary' },
        
        // Titres de rapidité (mode défi)
        eclair: { name: 'Éclair', emoji: '⚡', requirement: { fastQuiz: 10 }, rarity: 'rare' },
        supersonic: { name: 'Supersonique', emoji: '🚀', requirement: { fastQuiz: 50 }, rarity: 'legendary' },
        
        // Titres sociaux
        ami: { name: 'Sociable', emoji: '🤝', requirement: { friends: 5 }, rarity: 'common' },
        populaire: { name: 'Populaire', emoji: '⭐', requirement: { friends: 20 }, rarity: 'rare' },
        influenceur: { name: 'Influenceur', emoji: '👑', requirement: { friends: 100 }, rarity: 'legendary' },
        
        // Titres de quiz parfaits
        perfectionniste: { name: 'Perfectionniste', emoji: '💯', requirement: { totalPerfect: 10 }, rarity: 'rare' },
        sans_faute: { name: 'Sans Faute', emoji: '✨', requirement: { totalPerfect: 50 }, rarity: 'legendary' },
        
        // Titre ultime
        ultime: { name: 'Culture G Ultime', emoji: '🏅', requirement: { totalQuiz: 500, totalPerfect: 100, streak: 100 }, rarity: 'mythic' }
    },

    // Couleurs par rareté
    RARITY_COLORS: {
        common: '#95a5a6',
        rare: '#3498db',
        legendary: '#f39c12',
        mythic: '#9b59b6'
    },

    // Vérifier les titres débloqués pour un utilisateur
    checkUnlockedTitles: async (userId) => {
        if (!userId) return [];

        try {
            const profileDoc = await db.collection('profiles').doc(userId).get();
            if (!profileDoc.exists) return [];

            const profile = profileDoc.data();
            const stats = profile.stats || {};
            const unlockedTitles = profile.unlockedTitles || [];
            const newTitles = [];

            for (const [titleId, title] of Object.entries(TitlesSystem.TITLES)) {
                // Si déjà débloqué, passer
                if (unlockedTitles.includes(titleId)) continue;

                // Vérifier les conditions
                const req = title.requirement;
                let unlocked = true;

                if (req.matiere) {
                    const matiereStats = stats.matieres?.[req.matiere] || {};
                    if ((matiereStats.quizParfaits || 0) < req.perfectQuiz) unlocked = false;
                }
                if (req.differentMatieres) {
                    const matiereCount = Object.keys(stats.matieres || {}).length;
                    if (matiereCount < req.differentMatieres) unlocked = false;
                }
                if (req.totalQuiz) {
                    if ((stats.totalQuiz || 0) < req.totalQuiz) unlocked = false;
                }
                if (req.totalPerfect) {
                    if ((stats.quizParfaits || 0) < req.totalPerfect) unlocked = false;
                }
                if (req.streak) {
                    if ((profile.longestStreak || 0) < req.streak) unlocked = false;
                }
                if (req.fastQuiz) {
                    if ((stats.fastQuiz || 0) < req.fastQuiz) unlocked = false;
                }
                if (req.friends) {
                    if ((profile.friendsCount || 0) < req.friends) unlocked = false;
                }

                if (unlocked) {
                    newTitles.push(titleId);
                }
            }

            // Enregistrer les nouveaux titres
            if (newTitles.length > 0) {
                await db.collection('profiles').doc(userId).update({
                    unlockedTitles: firebase.firestore.FieldValue.arrayUnion(...newTitles)
                });

                // Créer des notifications
                for (const titleId of newTitles) {
                    const title = TitlesSystem.TITLES[titleId];
                    await db.collection('notifications').add({
                        userId: userId,
                        type: 'title_unlocked',
                        title: 'Nouveau titre débloqué !',
                        message: `Tu as débloqué le titre "${title.emoji} ${title.name}" !`,
                        titleId: titleId,
                        read: false,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }

            return newTitles;
        } catch (error) {
            console.error('Erreur checkUnlockedTitles:', error);
            return [];
        }
    },

    // Obtenir tous les titres d'un utilisateur
    getUserTitles: async (userId) => {
        if (!userId) return { unlocked: [], locked: [] };

        try {
            const profileDoc = await db.collection('profiles').doc(userId).get();
            if (!profileDoc.exists) return { unlocked: [], locked: [] };

            const unlockedIds = profileDoc.data().unlockedTitles || [];
            const activeTitle = profileDoc.data().activeTitle || null;

            const unlocked = [];
            const locked = [];

            for (const [titleId, title] of Object.entries(TitlesSystem.TITLES)) {
                const titleData = {
                    id: titleId,
                    ...title,
                    color: TitlesSystem.RARITY_COLORS[title.rarity],
                    isActive: titleId === activeTitle
                };

                if (unlockedIds.includes(titleId)) {
                    unlocked.push(titleData);
                } else {
                    locked.push(titleData);
                }
            }

            return { unlocked, locked, activeTitle };
        } catch (error) {
            console.error('Erreur getUserTitles:', error);
            return { unlocked: [], locked: [] };
        }
    },

    // Définir le titre actif
    setActiveTitle: async (userId, titleId) => {
        if (!userId) return false;

        try {
            const profileDoc = await db.collection('profiles').doc(userId).get();
            if (!profileDoc.exists) return false;

            const unlockedTitles = profileDoc.data().unlockedTitles || [];
            if (!unlockedTitles.includes(titleId) && titleId !== null) {
                return false; // Titre non débloqué
            }

            await db.collection('profiles').doc(userId).update({
                activeTitle: titleId
            });

            return true;
        } catch (error) {
            console.error('Erreur setActiveTitle:', error);
            return false;
        }
    },

    // Obtenir le titre actif formaté pour affichage
    getActiveTitleDisplay: async (userId) => {
        if (!userId) return null;

        try {
            const profileDoc = await db.collection('profiles').doc(userId).get();
            if (!profileDoc.exists) return null;

            const activeTitle = profileDoc.data().activeTitle;
            if (!activeTitle || !TitlesSystem.TITLES[activeTitle]) return null;

            const title = TitlesSystem.TITLES[activeTitle];
            return {
                id: activeTitle,
                name: title.name,
                emoji: title.emoji,
                color: TitlesSystem.RARITY_COLORS[title.rarity],
                rarity: title.rarity
            };
        } catch (error) {
            console.error('Erreur getActiveTitleDisplay:', error);
            return null;
        }
    },

    // Rendu d'un badge de titre
    renderTitleBadge: (title, size = 'normal') => {
        if (!title) return '';
        
        const fontSize = size === 'small' ? '0.8em' : '1em';
        const padding = size === 'small' ? '3px 8px' : '5px 12px';
        
        return `
            <span class="title-badge" style="
                background: linear-gradient(135deg, ${title.color}22, ${title.color}44);
                border: 1px solid ${title.color};
                color: ${title.color};
                padding: ${padding};
                border-radius: 20px;
                font-size: ${fontSize};
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 5px;
            ">
                ${title.emoji} ${title.name}
            </span>
        `;
    }
};

// Export global
window.TitlesSystem = TitlesSystem;
