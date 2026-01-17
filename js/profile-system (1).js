// ========== SYSTÈME DE PROFILS ENRICHIS - SUPERQUIZ ==========

// ========== CONFIGURATION DES BADGES ==========
const BADGES = {
    "premier_quiz": {
        nom: "Première fois",
        description: "Terminer votre premier quiz",
        icone: "🎯",
        condition: (stats) => stats.totalQuiz >= 1
    },
    "parfait": {
        nom: "Perfection",
        description: "Faire un sans-faute sur un quiz",
        icone: "💯",
        condition: (stats) => stats.quizParfaits >= 1
    },
    "marathonien": {
        nom: "Marathonien",
        description: "Répondre à 100 questions en une journée",
        icone: "🏃",
        condition: (stats) => stats.questionsAujourdHui >= 100
    },
    "historien": {
        nom: "Historien",
        description: "90% de réussite en Histoire sur 20 quiz",
        icone: "📚",
        condition: (stats) => stats.matieres?.histoire?.quizCount >= 20 && stats.matieres?.histoire?.tauxReussite >= 90
    },
    "geographe": {
        nom: "Géographe",
        description: "90% de réussite en Géographie sur 20 quiz",
        icone: "🗺️",
        condition: (stats) => stats.matieres?.geographie?.quizCount >= 20 && stats.matieres?.geographie?.tauxReussite >= 90
    },
    "scientifique": {
        nom: "Scientifique",
        description: "90% de réussite en Science sur 20 quiz",
        icone: "🔬",
        condition: (stats) => stats.matieres?.science?.quizCount >= 20 && stats.matieres?.science?.tauxReussite >= 90
    },
    "litteraire": {
        nom: "Littéraire",
        description: "90% de réussite en Littérature sur 20 quiz",
        icone: "✍️",
        condition: (stats) => stats.matieres?.litterature?.quizCount >= 20 && stats.matieres?.litterature?.tauxReussite >= 90
    },
    "serie_3": {
        nom: "Série de 3",
        description: "Jouer 3 jours d'affilée",
        icone: "🔥",
        condition: (stats) => stats.streakActuelle >= 3
    },
    "serie_7": {
        nom: "Série de 7",
        description: "Jouer 7 jours d'affilée",
        icone: "🔥🔥",
        condition: (stats) => stats.streakActuelle >= 7
    },
    "serie_30": {
        nom: "Série de 30",
        description: "Jouer 30 jours d'affilée",
        icone: "🏆",
        condition: (stats) => stats.streakActuelle >= 30
    },
    "rapide": {
        nom: "Éclair",
        description: "Finir un quiz en moins de 30 secondes",
        icone: "⚡",
        condition: (stats) => stats.tempsRecordQuiz && stats.tempsRecordQuiz <= 30
    },
    "veteran": {
        nom: "Vétéran",
        description: "Compléter 50 quiz",
        icone: "🎖️",
        condition: (stats) => stats.totalQuiz >= 50
    },
    "expert": {
        nom: "Expert",
        description: "Compléter 100 quiz",
        icone: "👑",
        condition: (stats) => stats.totalQuiz >= 100
    },
    "debutant": {
        nom: "Débutant",
        description: "Atteindre le niveau 5",
        icone: "🌱",
        condition: (stats) => stats.niveau >= 5
    },
    "intermediaire": {
        nom: "Intermédiaire",
        description: "Atteindre le niveau 15",
        icone: "🌿",
        condition: (stats) => stats.niveau >= 15
    },
    "avance": {
        nom: "Avancé",
        description: "Atteindre le niveau 30",
        icone: "🌳",
        condition: (stats) => stats.niveau >= 30
    },
    "maitre": {
        nom: "Maître",
        description: "Atteindre le niveau 50",
        icone: "🏅",
        condition: (stats) => stats.niveau >= 50
    },
    "polyvalent": {
        nom: "Polyvalent",
        description: "Jouer dans les 4 matières",
        icone: "🎭",
        condition: (stats) => {
            const matieres = stats.matieres || {};
            return Object.keys(matieres).length >= 4;
        }
    },
    "noctambule": {
        nom: "Noctambule",
        description: "Jouer après minuit",
        icone: "🦉",
        condition: (stats) => stats.aJoueApresMinuit
    },
    "matinal": {
        nom: "Matinal",
        description: "Jouer avant 7h du matin",
        icone: "🌅",
        condition: (stats) => stats.aJoueAvant7h
    }
};

// ========== AVATARS PRÉDÉFINIS ==========
const AVATARS_PREDEFINIES = [
    { id: 'default', url: null, emoji: '👤', nom: 'Par défaut' },
    { id: 'scholar', url: null, emoji: '🎓', nom: 'Érudit' },
    { id: 'scientist', url: null, emoji: '🧑‍🔬', nom: 'Scientifique' },
    { id: 'reader', url: null, emoji: '📖', nom: 'Lecteur' },
    { id: 'explorer', url: null, emoji: '🧭', nom: 'Explorateur' },
    { id: 'thinker', url: null, emoji: '🤔', nom: 'Penseur' },
    { id: 'genius', url: null, emoji: '🧠', nom: 'Génie' },
    { id: 'champion', url: null, emoji: '🏆', nom: 'Champion' },
    { id: 'ninja', url: null, emoji: '🥷', nom: 'Ninja' },
    { id: 'wizard', url: null, emoji: '🧙', nom: 'Mage' },
    { id: 'robot', url: null, emoji: '🤖', nom: 'Robot' },
    { id: 'alien', url: null, emoji: '👽', nom: 'Alien' },
    { id: 'astronaut', url: null, emoji: '👨‍🚀', nom: 'Astronaute' },
    { id: 'detective', url: null, emoji: '🕵️', nom: 'Détective' },
    { id: 'artist', url: null, emoji: '🎨', nom: 'Artiste' },
    { id: 'musician', url: null, emoji: '🎵', nom: 'Musicien' }
];

// ========== SYSTÈME DE NIVEAUX ET XP ==========
const XPSystem = {
    // Calcul de l'XP nécessaire pour un niveau
    xpPourNiveau: (niveau) => {
        return Math.floor(100 * Math.pow(niveau, 1.5));
    },

    // Calcul du niveau à partir de l'XP total
    niveauDepuisXP: (xp) => {
        let niveau = 1;
        while (XPSystem.xpPourNiveau(niveau + 1) <= xp) {
            niveau++;
        }
        return niveau;
    },

    // XP restant pour le prochain niveau
    xpRestantPourProchainNiveau: (xpTotal) => {
        const niveauActuel = XPSystem.niveauDepuisXP(xpTotal);
        const xpProchainNiveau = XPSystem.xpPourNiveau(niveauActuel + 1);
        return xpProchainNiveau - xpTotal;
    },

    // Pourcentage de progression vers le prochain niveau
    progressionNiveau: (xpTotal) => {
        const niveauActuel = XPSystem.niveauDepuisXP(xpTotal);
        const xpNiveauActuel = XPSystem.xpPourNiveau(niveauActuel);
        const xpProchainNiveau = XPSystem.xpPourNiveau(niveauActuel + 1);
        const xpDansNiveau = xpTotal - xpNiveauActuel;
        const xpNecessaire = xpProchainNiveau - xpNiveauActuel;
        return Math.floor((xpDansNiveau / xpNecessaire) * 100);
    },

    // Calcul des XP gagnés pour un quiz
    calculerXPQuiz: (score, total, mode, tempsEnSecondes) => {
        let xp = 0;
        
        // XP de base : 10 XP par bonne réponse
        xp += score * 10;
        
        // Bonus quiz complet
        xp += 50;
        
        // Bonus sans faute
        if (score === total) {
            xp += 100;
        }
        
        // Bonus mode défi
        if (mode === 'challenge') {
            xp = Math.floor(xp * 1.5);
        }
        
        // Bonus rapidité (si moins de 5 secondes par question en moyenne)
        if (tempsEnSecondes && total > 0) {
            const tempsParQuestion = tempsEnSecondes / total;
            if (tempsParQuestion < 5) {
                xp += 50;
            } else if (tempsParQuestion < 10) {
                xp += 25;
            }
        }
        
        return xp;
    }
};

// ========== GESTION DES PROFILS FIREBASE ==========
const ProfileSystem = {
    // Structure de profil par défaut
    defaultProfile: {
        pseudo: '',
        avatar: { type: 'emoji', value: '👤' },
        bio: '',
        niveau: 1,
        experiencePoints: 0,
        badges: [],
        
        stats: {
            totalQuiz: 0,
            totalBonnesReponses: 0,
            totalQuestions: 0,
            tauxReussite: 0,
            matierePreferee: null,
            tempsJeuTotal: 0,
            recordStreak: 0,
            streakActuelle: 0,
            dernierJeuDate: null,
            quizParfaits: 0,
            questionsAujourdHui: 0,
            derniereQuestionDate: null,
            tempsRecordQuiz: null,
            aJoueApresMinuit: false,
            aJoueAvant7h: false,
            matieres: {}
        },
        
        preferences: {
            theme: 'light',
            difficulte: 'moyen',
            notifications: true,
            langue: 'fr',
            afficherProfil: true
        },
        
        social: {
            amis: [],
            suivis: [],
            followers: []
        },
        
        createdAt: null,
        lastLogin: null,
        updatedAt: null
    },

    // Créer ou récupérer le profil d'un utilisateur
    getProfile: async (userId) => {
        try {
            const doc = await db.collection('profiles').doc(userId).get();
            
            if (doc.exists) {
                return { ...ProfileSystem.defaultProfile, ...doc.data(), id: doc.id };
            }
            
            return null;
        } catch (error) {
            console.error('Erreur récupération profil:', error);
            return null;
        }
    },

    // Créer un nouveau profil
    createProfile: async (userId, userData) => {
        try {
            const profile = {
                ...ProfileSystem.defaultProfile,
                pseudo: userData.name || userData.email.split('@')[0],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('profiles').doc(userId).set(profile);
            return { success: true, profile };
        } catch (error) {
            console.error('Erreur création profil:', error);
            throw error;
        }
    },

    // Mettre à jour le profil
    updateProfile: async (userId, updates) => {
        try {
            updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('profiles').doc(userId).update(updates);
            return { success: true };
        } catch (error) {
            console.error('Erreur mise à jour profil:', error);
            throw error;
        }
    },

    // Mettre à jour les stats après un quiz
    updateStatsAfterQuiz: async (userId, quizResult) => {
        try {
            const profile = await ProfileSystem.getProfile(userId);
            if (!profile) {
                throw new Error('Profil non trouvé');
            }

            const stats = { ...profile.stats };
            const now = new Date();
            const heure = now.getHours();

            // Mise à jour des stats de base
            stats.totalQuiz += 1;
            stats.totalBonnesReponses += quizResult.score;
            stats.totalQuestions += quizResult.total;
            stats.tauxReussite = Math.round((stats.totalBonnesReponses / stats.totalQuestions) * 100);

            // Quiz parfait ?
            if (quizResult.score === quizResult.total) {
                stats.quizParfaits += 1;
            }

            // Temps record quiz
            if (quizResult.tempsEnSecondes) {
                if (!stats.tempsRecordQuiz || quizResult.tempsEnSecondes < stats.tempsRecordQuiz) {
                    stats.tempsRecordQuiz = quizResult.tempsEnSecondes;
                }
                stats.tempsJeuTotal += quizResult.tempsEnSecondes;
            }

            // Heures spéciales
            if (heure >= 0 && heure < 5) {
                stats.aJoueApresMinuit = true;
            }
            if (heure >= 5 && heure < 7) {
                stats.aJoueAvant7h = true;
            }

            // Questions aujourd'hui
            const aujourdHui = now.toDateString();
            if (stats.derniereQuestionDate === aujourdHui) {
                stats.questionsAujourdHui += quizResult.total;
            } else {
                stats.questionsAujourdHui = quizResult.total;
                stats.derniereQuestionDate = aujourdHui;
            }

            // Streak (série de jours consécutifs)
            const dernierJeu = stats.dernierJeuDate ? new Date(stats.dernierJeuDate) : null;
            if (dernierJeu) {
                const diffJours = Math.floor((now - dernierJeu) / (1000 * 60 * 60 * 24));
                if (diffJours === 1) {
                    stats.streakActuelle += 1;
                } else if (diffJours > 1) {
                    stats.streakActuelle = 1;
                }
            } else {
                stats.streakActuelle = 1;
            }

            if (stats.streakActuelle > stats.recordStreak) {
                stats.recordStreak = stats.streakActuelle;
            }

            stats.dernierJeuDate = now.toISOString();

            // Stats par matière
            if (!stats.matieres) stats.matieres = {};
            if (!stats.matieres[quizResult.matiere]) {
                stats.matieres[quizResult.matiere] = {
                    quizCount: 0,
                    bonnesReponses: 0,
                    totalQuestions: 0,
                    tauxReussite: 0
                };
            }
            
            const matiereStats = stats.matieres[quizResult.matiere];
            matiereStats.quizCount += 1;
            matiereStats.bonnesReponses += quizResult.score;
            matiereStats.totalQuestions += quizResult.total;
            matiereStats.tauxReussite = Math.round((matiereStats.bonnesReponses / matiereStats.totalQuestions) * 100);

            // Matière préférée
            let maxQuiz = 0;
            let matierePreferee = null;
            for (const [matiere, data] of Object.entries(stats.matieres)) {
                if (data.quizCount > maxQuiz) {
                    maxQuiz = data.quizCount;
                    matierePreferee = matiere;
                }
            }
            stats.matierePreferee = matierePreferee;

            // Calcul XP
            const xpGagne = XPSystem.calculerXPQuiz(
                quizResult.score,
                quizResult.total,
                quizResult.mode,
                quizResult.tempsEnSecondes
            );

            const newXP = profile.experiencePoints + xpGagne;
            const newNiveau = XPSystem.niveauDepuisXP(newXP);
            const levelUp = newNiveau > profile.niveau;

            // Vérification des nouveaux badges
            const statsAvecNiveau = { ...stats, niveau: newNiveau, experiencePoints: newXP };
            const nouveauxBadges = ProfileSystem.checkNewBadges(profile.badges, statsAvecNiveau);

            // Mise à jour du profil
            await ProfileSystem.updateProfile(userId, {
                stats: stats,
                experiencePoints: newXP,
                niveau: newNiveau,
                badges: [...profile.badges, ...nouveauxBadges],
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            return {
                success: true,
                xpGagne,
                newXP,
                newNiveau,
                levelUp,
                nouveauxBadges: nouveauxBadges.map(id => BADGES[id]),
                stats
            };
        } catch (error) {
            console.error('Erreur mise à jour stats:', error);
            throw error;
        }
    },

    // Vérifier les nouveaux badges obtenus
    checkNewBadges: (badgesActuels, stats) => {
        const nouveauxBadges = [];
        
        for (const [badgeId, badge] of Object.entries(BADGES)) {
            if (!badgesActuels.includes(badgeId)) {
                try {
                    if (badge.condition(stats)) {
                        nouveauxBadges.push(badgeId);
                    }
                } catch (e) {
                    // Condition non remplie
                }
            }
        }
        
        return nouveauxBadges;
    },

    // Mettre à jour l'avatar
    updateAvatar: async (userId, avatarData) => {
        try {
            await ProfileSystem.updateProfile(userId, {
                avatar: avatarData
            });
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    // Mettre à jour les préférences
    updatePreferences: async (userId, preferences) => {
        try {
            await ProfileSystem.updateProfile(userId, {
                preferences: preferences
            });
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    // Récupérer le classement avec les profils
    getLeaderboardWithProfiles: async (limit = 20) => {
        try {
            const snapshot = await db.collection('profiles')
                .where('preferences.afficherProfil', '==', true)
                .orderBy('experiencePoints', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map((doc, index) => ({
                rank: index + 1,
                ...doc.data(),
                id: doc.id
            }));
        } catch (error) {
            console.error('Erreur récupération classement:', error);
            return [];
        }
    },

    // Rechercher des profils
    searchProfiles: async (searchTerm) => {
        try {
            // Recherche simple par pseudo (Firebase ne supporte pas la recherche full-text)
            const snapshot = await db.collection('profiles')
                .where('preferences.afficherProfil', '==', true)
                .orderBy('pseudo')
                .startAt(searchTerm)
                .endAt(searchTerm + '\uf8ff')
                .limit(10)
                .get();

            return snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }));
        } catch (error) {
            console.error('Erreur recherche profils:', error);
            return [];
        }
    },

    // Système d'amis - Envoyer une demande
    sendFriendRequest: async (fromUserId, toUserId) => {
        try {
            await db.collection('friendRequests').add({
                from: fromUserId,
                to: toUserId,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    // Système d'amis - Accepter une demande
    acceptFriendRequest: async (requestId, userId, friendId) => {
        try {
            // Mettre à jour la demande
            await db.collection('friendRequests').doc(requestId).update({
                status: 'accepted'
            });

            // Ajouter comme amis mutuellement
            const userProfile = await ProfileSystem.getProfile(userId);
            const friendProfile = await ProfileSystem.getProfile(friendId);

            const userAmis = userProfile.social?.amis || [];
            const friendAmis = friendProfile.social?.amis || [];

            if (!userAmis.includes(friendId)) {
                userAmis.push(friendId);
            }
            if (!friendAmis.includes(userId)) {
                friendAmis.push(userId);
            }

            await ProfileSystem.updateProfile(userId, { 'social.amis': userAmis });
            await ProfileSystem.updateProfile(friendId, { 'social.amis': friendAmis });

            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    // Récupérer les demandes d'amis en attente
    getPendingFriendRequests: async (userId) => {
        try {
            const snapshot = await db.collection('friendRequests')
                .where('to', '==', userId)
                .where('status', '==', 'pending')
                .get();

            const requests = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                const fromProfile = await ProfileSystem.getProfile(data.from);
                requests.push({
                    id: doc.id,
                    ...data,
                    fromProfile
                });
            }

            return requests;
        } catch (error) {
            console.error('Erreur récupération demandes:', error);
            return [];
        }
    }
};

// ========== EXPORT GLOBAL ==========
window.BADGES = BADGES;
window.AVATARS_PREDEFINIES = AVATARS_PREDEFINIES;
window.XPSystem = XPSystem;
window.ProfileSystem = ProfileSystem;

console.log('✅ Système de profils enrichis chargé');
