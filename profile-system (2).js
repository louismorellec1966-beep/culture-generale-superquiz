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

    // XP nécessaire pour le prochain niveau
    xpPourProchainNiveau: (niveau) => {
        if (niveau >= XPSystem.xpParNiveau.length) {
            return XPSystem.xpParNiveau[XPSystem.xpParNiveau.length - 1] + (niveau - 14) * 4000;
        }
        return XPSystem.xpParNiveau[niveau];
    },

    // Progression en pourcentage vers le prochain niveau
    progressionNiveau: (xp) => {
        const niveau = XPSystem.niveauDepuisXP(xp);
        const xpNiveauActuel = XPSystem.xpParNiveau[niveau - 1] || 0;
        const xpNiveauSuivant = XPSystem.xpPourProchainNiveau(niveau);
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
    'premier_quiz': {
        id: 'premier_quiz',
        nom: 'Première Victoire',
        description: 'Compléter son premier quiz',
        icone: '🎯',
        condition: (stats) => stats.totalQuiz >= 1
    },
    'dix_quiz': {
        id: 'dix_quiz',
        nom: 'Explorateur',
        description: 'Compléter 10 quiz',
        icone: '🧭',
        condition: (stats) => stats.totalQuiz >= 10
    },
    'cinquante_quiz': {
        id: 'cinquante_quiz',
        nom: 'Expert',
        description: 'Compléter 50 quiz',
        icone: '🏆',
        condition: (stats) => stats.totalQuiz >= 50
    },
    'cent_quiz': {
        id: 'cent_quiz',
        nom: 'Maître Quiz',
        description: 'Compléter 100 quiz',
        icone: '👑',
        condition: (stats) => stats.totalQuiz >= 100
    },
    'parfait': {
        id: 'parfait',
        nom: 'Perfectionniste',
        description: 'Obtenir un score parfait',
        icone: '⭐',
        condition: (stats) => stats.quizParfaits >= 1
    },
    'dix_parfaits': {
        id: 'dix_parfaits',
        nom: 'Sans Faute',
        description: 'Obtenir 10 scores parfaits',
        icone: '🌟',
        condition: (stats) => stats.quizParfaits >= 10
    },
    'streak_7': {
        id: 'streak_7',
        nom: 'Semaine Parfaite',
        description: 'Jouer 7 jours de suite',
        icone: '🔥',
        condition: (stats) => stats.recordStreak >= 7
    },
    'streak_30': {
        id: 'streak_30',
        nom: 'Mois de Feu',
        description: 'Jouer 30 jours de suite',
        icone: '💫',
        condition: (stats) => stats.recordStreak >= 30
    },
    'niveau_5': {
        id: 'niveau_5',
        nom: 'Apprenti',
        description: 'Atteindre le niveau 5',
        icone: '📚',
        condition: (stats) => stats.niveau >= 5
    },
    'niveau_10': {
        id: 'niveau_10',
        nom: 'Érudit',
        description: 'Atteindre le niveau 10',
        icone: '🎓',
        condition: (stats) => stats.niveau >= 10
    },
    'polyvalent': {
        id: 'polyvalent',
        nom: 'Polyvalent',
        description: 'Jouer dans toutes les matières',
        icone: '🎨',
        condition: (stats) => {
            const matieres = Object.keys(stats.matieres || {});
            return matieres.length >= 4;
        }
    },
    'rapide': {
        id: 'rapide',
        nom: 'Éclair',
        description: 'Finir un quiz en moins de 30 secondes',
        icone: '⚡',
        condition: (stats) => stats.tempsRecordQuiz && stats.tempsRecordQuiz < 30
    },
    'noctambule': {
        id: 'noctambule',
        nom: 'Noctambule',
        description: 'Jouer après minuit',
        icone: '🌙',
        condition: (stats) => stats.aJoueApresMinuit === true
    },
    'matinal': {
        id: 'matinal',
        nom: 'Lève-tôt',
        description: 'Jouer avant 7h du matin',
        icone: '🌅',
        condition: (stats) => stats.aJoueAvant7h === true
    },
    'marathonien': {
        id: 'marathonien',
        nom: 'Marathonien',
        description: 'Répondre à 100 questions en une journée',
        icone: '🏃',
        condition: (stats) => stats.questionsAujourdHui >= 100
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

    // CORRIGÉ: Récupérer le classement avec les profils (sans index composite)
    getLeaderboardWithProfiles: async (limit = 20) => {
        try {
            // Récupérer TOUS les profils (sans where + orderBy combinés)
            const snapshot = await db.collection('profiles').get();

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

            return profiles;
        } catch (error) {
            console.error('Erreur récupération classement:', error);
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

console.log('✅ Profile System chargé');
