// ========== SYSTÈME XP & NIVEAUX ==========
const XPSystem = {
    // Table d'XP nécessaire par niveau
    xpParNiveau: [
        0,      // Niveau 1
        100,    // Niveau 2
        250,    // Niveau 3
        500,    // Niveau 4
        850,    // Niveau 5
        1300,   // Niveau 6
        1900,   // Niveau 7
        2600,   // Niveau 8
        3500,   // Niveau 9
        4600,   // Niveau 10
        6000,   // Niveau 11
        7700,   // Niveau 12
        9700,   // Niveau 13
        12000,  // Niveau 14
        15000   // Niveau 15+
    ],

    // Calculer le niveau depuis l'XP
    niveauDepuisXP: (xp) => {
        for (let i = XPSystem.xpParNiveau.length - 1; i >= 0; i--) {
            if (xp >= XPSystem.xpParNiveau[i]) {
                return i + 1;
            }
        }
        return 1;
    },

    // XP requis pour atteindre un niveau donné
    xpPourNiveau: (niveau) => {
        if (niveau <= 1) return 0;
        if (niveau <= XPSystem.xpParNiveau.length) {
            return XPSystem.xpParNiveau[niveau - 1];
        }
        // Pour les niveaux au-delà de 15
        return XPSystem.xpParNiveau[XPSystem.xpParNiveau.length - 1] + (niveau - 15) * 4000;
    },

    // XP nécessaire pour le prochain niveau
    xpPourProchainNiveau: (niveau) => {
        return XPSystem.xpPourNiveau(niveau + 1);
    },

    // Progression en pourcentage vers le prochain niveau
    progressionNiveau: (xp) => {
        const niveau = XPSystem.niveauDepuisXP(xp);
        const xpNiveauActuel = XPSystem.xpPourNiveau(niveau);
        const xpNiveauSuivant = XPSystem.xpPourNiveau(niveau + 1);
        const progression = (xp - xpNiveauActuel) / (xpNiveauSuivant - xpNiveauActuel);
        return Math.min(Math.max(progression * 100, 0), 100);
    },

    // Calculer les XP gagnés pour un quiz
    calculerXPQuiz: (score, total, mode = 'classic', tempsEnSecondes = null) => {
        let xp = 0;
        
        // XP par bonne réponse
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

// ========== BADGES ==========
const BADGES = {
    "premier_quiz": {
        nom: "Premier Pas",
        description: "Compléter son premier quiz",
        icone: "🎯",
        condition: (stats) => stats.totalQuiz >= 1
    },
    "dix_quiz": {
        nom: "Habitué",
        description: "Compléter 10 quiz",
        icone: "📚",
        condition: (stats) => stats.totalQuiz >= 10
    },
    "parfait": {
        nom: "Perfectionniste",
        description: "Obtenir un score parfait",
        icone: "⭐",
        condition: (stats) => stats.quizParfaits >= 1
    },
    "cinq_parfaits": {
        nom: "Excellence",
        description: "Obtenir 5 scores parfaits",
        icone: "🌟",
        condition: (stats) => stats.quizParfaits >= 5
    },
    "streak_7": {
        nom: "Semaine de feu",
        description: "Jouer 7 jours d'affilée",
        icone: "🔥",
        condition: (stats) => stats.recordStreak >= 7
    },
    "streak_30": {
        nom: "Mois de feu",
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
    { id: 'artist', url: null, emoji: '🎨', nom: 'Artiste' },
    { id: 'explorer', url: null, emoji: '🧭', nom: 'Explorateur' },
    { id: 'wizard', url: null, emoji: '🧙', nom: 'Magicien' },
    { id: 'robot', url: null, emoji: '🤖', nom: 'Robot' },
    { id: 'alien', url: null, emoji: '👽', nom: 'Alien' },
    { id: 'ninja', url: null, emoji: '🥷', nom: 'Ninja' },
    { id: 'astronaut', url: null, emoji: '👨‍🚀', nom: 'Astronaute' },
    { id: 'detective', url: null, emoji: '🕵️', nom: 'Détective' },
    { id: 'chef', url: null, emoji: '👨‍🍳', nom: 'Chef' },
    { id: 'superhero', url: null, emoji: '🦸', nom: 'Super-héros' },
    { id: 'pirate', url: null, emoji: '🏴‍☠️', nom: 'Pirate' },
    { id: 'king', url: null, emoji: '👑', nom: 'Roi' },
    { id: 'queen', url: null, emoji: '👸', nom: 'Reine' },
    { id: 'dragon', url: null, emoji: '🐉', nom: 'Dragon' },
    { id: 'unicorn', url: null, emoji: '🦄', nom: 'Licorne' },
    { id: 'phoenix', url: null, emoji: '🔥', nom: 'Phénix' },
    { id: 'owl', url: null, emoji: '🦉', nom: 'Hibou' },
    { id: 'cat', url: null, emoji: '🐱', nom: 'Chat' },
    { id: 'dog', url: null, emoji: '🐶', nom: 'Chien' },
    { id: 'fox', url: null, emoji: '🦊', nom: 'Renard' },
    { id: 'panda', url: null, emoji: '🐼', nom: 'Panda' }
];

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
            console.log('📥 Récupération profil:', userId);
            const doc = await db.collection('profiles').doc(userId).get();
            
            if (doc.exists) {
                console.log('✅ Profil trouvé');
                return { ...ProfileSystem.defaultProfile, ...doc.data(), id: doc.id };
            }
            
            console.log('⚠️ Profil non trouvé');
            return null;
        } catch (error) {
            console.error('❌ Erreur récupération profil:', error);
            throw error;
        }
    },

    // Créer un nouveau profil
    createProfile: async (userId, userData) => {
        try {
            console.log('📝 Création profil pour:', userId);
            const profile = {
                ...ProfileSystem.defaultProfile,
                pseudo: userData.name || userData.email?.split('@')[0] || 'Joueur',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('profiles').doc(userId).set(profile);
            console.log('✅ Profil créé');
            return { success: true, profile };
        } catch (error) {
            console.error('❌ Erreur création profil:', error);
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

    // CORRIGÉ: Récupérer le classement avec les profils (sans index composite)
    getLeaderboardWithProfiles: async (limit = 20) => {
        try {
            console.log('📊 Récupération classement...');
            // Récupérer TOUS les profils (sans where + orderBy combinés)
            const snapshot = await db.collection('profiles').get();
            console.log('📥 Profils récupérés:', snapshot.docs.length);

            // Filtrer et trier côté client
            const profiles = snapshot.docs
                .map(doc => ({
                    ...doc.data(),
                    id: doc.id
                }))
                // Filtrer les profils publics
                .filter(p => p.preferences?.afficherProfil !== false)
                // Trier par XP décroissant
                .sort((a, b) => (b.experiencePoints || 0) - (a.experiencePoints || 0))
                // Limiter
                .slice(0, limit)
                // Ajouter le rang
                .map((p, index) => ({
                    rank: index + 1,
                    ...p
                }));

            console.log('✅ Classement prêt:', profiles.length, 'profils');
            return profiles;
        } catch (error) {
            console.error('❌ Erreur récupération classement:', error);
            return [];
        }
    },

    // CORRIGÉ: Rechercher des profils (sans index composite)
    searchProfiles: async (searchTerm) => {
        try {
            // Récupérer tous les profils publics
            const snapshot = await db.collection('profiles').get();

            // Filtrer côté client
            const searchLower = searchTerm.toLowerCase();
            const profiles = snapshot.docs
                .map(doc => ({
                    ...doc.data(),
                    id: doc.id
                }))
                // Filtrer les profils publics
                .filter(p => p.preferences?.afficherProfil !== false)
                // Filtrer par recherche
                .filter(p => {
                    const pseudo = (p.pseudo || '').toLowerCase();
                    return pseudo.includes(searchLower) || pseudo.startsWith(searchLower);
                })
                // Limiter
                .slice(0, 10);

            return profiles;
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
    acceptFriendRequest: async (requestId, fromUserId, toUserId) => {
        try {
            // Mettre à jour la demande
            await db.collection('friendRequests').doc(requestId).update({
                status: 'accepted'
            });

            // Ajouter aux amis des deux côtés
            await db.collection('profiles').doc(fromUserId).update({
                'social.amis': firebase.firestore.FieldValue.arrayUnion(toUserId)
            });
            await db.collection('profiles').doc(toUserId).update({
                'social.amis': firebase.firestore.FieldValue.arrayUnion(fromUserId)
            });

            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    // Récupérer les demandes d'ami en attente
    getPendingFriendRequests: async (userId) => {
        try {
            const snapshot = await db.collection('friendRequests')
                .where('to', '==', userId)
                .where('status', '==', 'pending')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erreur récupération demandes:', error);
            return [];
        }
    }
};

// ========== EXPORTS GLOBAUX ==========
window.XPSystem = XPSystem;
window.ProfileSystem = ProfileSystem;
window.BADGES = BADGES;
window.AVATARS_PREDEFINIES = AVATARS_PREDEFINIES;

console.log('✅ Profile System chargé');