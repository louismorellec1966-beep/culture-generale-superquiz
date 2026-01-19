// ========== CONFIGURATION FIREBASE ==========
// Configuration Firebase pour SuperQuiz avec système de profils enrichis
// VERSION CORRIGÉE - Compatible avec et sans Realtime Database

const firebaseConfig = {
    apiKey: "AIzaSyCAEGKVsQYmKnzkMu8vclmxrf01sHmvZXA",
    authDomain: "super-quiz-da40b.firebaseapp.com",
    projectId: "super-quiz-da40b",
    storageBucket: "super-quiz-da40b.firebasestorage.app",
    messagingSenderId: "535455857030",
    appId: "1:535455857030:web:441af3ea2cdbc3a0c91407",
    measurementId: "G-G3YEKJLDRT",
    // URL pour Realtime Database (nécessaire pour le mode multijoueur)
    databaseURL: "https://super-quiz-da40b-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialiser Firebase (compat version)
firebase.initializeApp(firebaseConfig);

// Références globales - Firestore (toujours disponible)
const auth = firebase.auth();
const db = firebase.firestore();

console.log('🔥 Firebase initialisé');
console.log('✅ Firestore prêt');

// Realtime Database - SEULEMENT si le SDK est chargé
let rtdb = null;
if (typeof firebase.database === 'function') {
    rtdb = firebase.database();
    window.rtdb = rtdb;
    console.log('✅ Realtime Database prêt');
} else {
    console.log('ℹ️ Realtime Database non chargé (normal si pas sur une page multijoueur)');
}

// ========== SYSTÈME D'AUTHENTIFICATION ==========
const FirebaseAuth = {
    register: async (name, email, password) => {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            await user.sendEmailVerification();
            
            // Créer le document utilisateur
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Créer le profil enrichi
            if (typeof ProfileSystem !== 'undefined') {
                await ProfileSystem.createProfile(user.uid, { name, email });
            } else {
                // Créer un profil basique si ProfileSystem n'est pas chargé
                await db.collection('profiles').doc(user.uid).set({
                    pseudo: name || email.split('@')[0],
                    avatar: { type: 'emoji', value: '👤' },
                    bio: '',
                    niveau: 1,
                    experiencePoints: 0,
                    elo: 1000, // Pour le mode multijoueur
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
                        matieres: {}
                    },
                    multiplayerStats: {
                        wins: 0,
                        losses: 0,
                        draws: 0,
                        totalGames: 0
                    },
                    preferences: {
                        theme: 'light',
                        difficulte: 'moyen',
                        notifications: true,
                        langue: 'fr',
                        afficherProfil: true
                    },
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            return { success: true, user };
        } catch (error) {
            console.error('Erreur inscription:', error);
            throw new Error(FirebaseAuth.getErrorMessage(error.code));
        }
    },

    login: async (email, password) => {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Mettre à jour lastLogin dans le profil
            try {
                await db.collection('profiles').doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (e) {
                console.log('Profil non trouvé, création...');
            }
            
            return { success: true, user };
        } catch (error) {
            console.error('Erreur connexion:', error);
            throw new Error(FirebaseAuth.getErrorMessage(error.code));
        }
    },

    logout: async () => {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Erreur déconnexion:', error);
            throw error;
        }
    },

    getCurrentUser: () => auth.currentUser,

    onAuthStateChanged: (callback) => {
        return auth.onAuthStateChanged(callback);
    },

    getErrorMessage: (code) => {
        const messages = {
            'auth/email-already-in-use': 'Cet email est déjà utilisé',
            'auth/invalid-email': 'Email invalide',
            'auth/weak-password': 'Mot de passe trop faible (min. 6 caractères)',
            'auth/user-not-found': 'Email ou mot de passe incorrect',
            'auth/wrong-password': 'Email ou mot de passe incorrect',
            'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
            'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion.'
        };
        return messages[code] || 'Une erreur est survenue';
    }
};

// ========== SYSTÈME DE SCORES ==========
const FirebaseScores = {
    save: async (scoreData) => {
        const user = auth.currentUser;
        if (!user) throw new Error('Utilisateur non connecté');
        
        try {
            // Sauvegarder le score
            await db.collection('scores').add({
                userId: user.uid,
                userEmail: user.email,
                matiere: scoreData.matiere,
                categorie: scoreData.categorie,
                titre: scoreData.titre,
                score: scoreData.score,
                total: scoreData.total,
                mode: scoreData.mode || 'classic',
                bonusPoints: scoreData.bonusPoints || 0,
                totalScore: scoreData.totalScore || scoreData.score,
                tempsEnSecondes: scoreData.tempsEnSecondes || null,
                date: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Mettre à jour le profil enrichi si le système est chargé
            let profileUpdate = null;
            if (typeof ProfileSystem !== 'undefined') {
                try {
                    profileUpdate = await ProfileSystem.updateStatsAfterQuiz(user.uid, {
                        matiere: scoreData.matiere,
                        score: scoreData.score,
                        total: scoreData.total,
                        mode: scoreData.mode || 'classic',
                        tempsEnSecondes: scoreData.tempsEnSecondes || null
                    });
                } catch (e) {
                    console.error('Erreur mise à jour profil:', e);
                }
            }

            return { 
                success: true,
                profileUpdate: profileUpdate
            };
        } catch (error) {
            console.error('Erreur sauvegarde score:', error);
            throw new Error('Erreur lors de la sauvegarde du score');
        }
    },

    // CORRIGÉ: Récupération sans index composite (tri côté client)
    getAll: async () => {
        const user = auth.currentUser;
        if (!user) {
            console.log('⚠️ Utilisateur non connecté');
            return [];
        }
        
        try {
            console.log('📥 Récupération scores pour:', user.uid);
            
            // Requête simple SANS orderBy pour éviter le besoin d'index
            const snapshot = await db.collection('scores')
                .where('userId', '==', user.uid)
                .get();
            
            console.log('📊 Scores trouvés:', snapshot.docs.length);
            
            const scores = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date?.toDate?.() || new Date()
                };
            });
            
            // Tri côté client (plus récent d'abord)
            scores.sort((a, b) => b.date - a.date);
            
            return scores;
        } catch (error) {
            console.error('❌ Erreur récupération scores:', error);
            return [];
        }
    },

    // Classement global (XP) - Sans index composite
    getLeaderboardByXP: async (limit = 20) => {
        try {
            console.log('📥 Récupération classement XP...');
            
            // Récupérer TOUS les profils puis trier côté client
            const snapshot = await db.collection('profiles').get();
            
            console.log('📥 Profils récupérés:', snapshot.docs.length);

            // Filtrer et trier côté client
            const profiles = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    return {
                        odexid: doc.id,
                        pseudo: data.pseudo || 'Joueur',
                        avatar: data.avatar?.value || data.avatar || '👤',
                        niveau: data.niveau || 1,
                        experiencePoints: data.experiencePoints || 0,
                        elo: data.elo || 1000,
                        totalQuiz: data.stats?.totalQuiz || 0,
                        tauxReussite: data.stats?.tauxReussite || 0,
                        badges: data.badges || [],
                        afficherProfil: data.preferences?.afficherProfil !== false
                    };
                })
                // Filtrer les profils publics
                .filter(p => p.afficherProfil)
                // Trier par XP décroissant
                .sort((a, b) => b.experiencePoints - a.experiencePoints)
                // Limiter le nombre
                .slice(0, limit)
                // Ajouter le rang
                .map((p, index) => ({
                    ...p,
                    rank: index + 1
                }));

            console.log('✅ Classement XP prêt:', profiles.length, 'profils');
            return profiles;
        } catch (error) {
            console.error('❌ Erreur récupération classement XP:', error);
            return [];
        }
    },

    // Classement par ELO (pour le mode multijoueur)
    getLeaderboardByELO: async (limit = 20) => {
        try {
            console.log('📥 Récupération classement ELO...');
            
            const snapshot = await db.collection('profiles').get();

            const profiles = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    return {
                        odexid: doc.id,
                        pseudo: data.pseudo || 'Joueur',
                        avatar: data.avatar?.value || data.avatar || '👤',
                        elo: data.elo || 1000,
                        multiplayerStats: data.multiplayerStats || { wins: 0, losses: 0 },
                        afficherProfil: data.preferences?.afficherProfil !== false
                    };
                })
                .filter(p => p.afficherProfil)
                .sort((a, b) => b.elo - a.elo)
                .slice(0, limit)
                .map((p, index) => ({
                    ...p,
                    rank: index + 1
                }));

            console.log('✅ Classement ELO prêt:', profiles.length, 'profils');
            return profiles;
        } catch (error) {
            console.error('❌ Erreur récupération classement ELO:', error);
            return [];
        }
    }
};

// ========== EXPORTS GLOBAUX ==========
window.FirebaseAuth = FirebaseAuth;
window.FirebaseScores = FirebaseScores;
window.db = db;
window.auth = auth;
window.firebase = firebase;

// rtdb est déjà exporté plus haut si disponible

console.log('✅ Firebase Config chargé avec succès');