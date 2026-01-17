// ========== CONFIGURATION FIREBASE ==========
// Configuration Firebase pour SuperQuiz avec système de profils enrichis

const firebaseConfig = {
    apiKey: "AIzaSyCAEGKVsQYmKnzkMu8vclmxrf01sHmvZXA",
    authDomain: "super-quiz-da40b.firebaseapp.com",
    projectId: "super-quiz-da40b",
    storageBucket: "super-quiz-da40b.firebasestorage.app",
    messagingSenderId: "535455857030",
    appId: "1:535455857030:web:441af3ea2cdbc3a0c91407",
    measurementId: "G-G3YEKJLDRT"
};

// Initialiser Firebase (compat version)
firebase.initializeApp(firebaseConfig);

// Références globales
const auth = firebase.auth();
const db = firebase.firestore();

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

    // CORRIGÉ: Récupération sans index composite
    getAll: async () => {
        const user = auth.currentUser;
        if (!user) return [];
        try {
            // Requête simple sans orderBy pour éviter le besoin d'index
            const snapshot = await db.collection('scores')
                .where('userId', '==', user.uid)
                .get();
            
            const scores = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date?.toDate?.() ? data.date.toDate().toISOString() : new Date().toISOString()
                };
            });
            
            // Tri côté client (évite le besoin d'index)
            scores.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            return scores;
        } catch (error) {
            console.error('Erreur récupération scores:', error);
            return [];
        }
    },

    getLeaderboard: async (matiere = null) => {
        try {
            // Récupérer tous les scores (sans filtre pour éviter les index)
            const snapshot = await db.collection('scores').get();
            const userScores = {};
            
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                
                // Filtrer par matière côté client si nécessaire
                if (matiere && data.matiere !== matiere) {
                    return;
                }
                
                const userId = data.userId;
                if (!userScores[userId]) {
                    userScores[userId] = {
                        uid: userId,
                        email: data.userEmail,
                        totalScore: 0,
                        quizCount: 0
                    };
                }
                userScores[userId].totalScore += data.score || 0;
                userScores[userId].quizCount += 1;
            });

            // Récupérer les profils pour les noms et avatars
            const leaderboard = [];
            for (const [userId, data] of Object.entries(userScores)) {
                let profileData = { pseudo: data.email.split('@')[0], avatar: { value: '👤' }, niveau: 1 };
                try {
                    const profileDoc = await db.collection('profiles').doc(userId).get();
                    if (profileDoc.exists) {
                        const profile = profileDoc.data();
                        profileData = {
                            pseudo: profile.pseudo || data.email.split('@')[0],
                            avatar: profile.avatar || { value: '👤' },
                            niveau: profile.niveau || 1
                        };
                    }
                } catch (e) {
                    // Utiliser les données par défaut
                }

                leaderboard.push({
                    uid: userId,
                    name: profileData.pseudo,
                    avatar: profileData.avatar?.value || profileData.avatar || '👤',
                    niveau: profileData.niveau,
                    totalScore: data.totalScore,
                    quizCount: data.quizCount,
                    average: Math.round((data.totalScore / data.quizCount) * 100) / 100
                });
            }

            // Tri côté client
            leaderboard.sort((a, b) => b.totalScore - a.totalScore);
            return leaderboard;
        } catch (error) {
            console.error('Erreur récupération classement:', error);
            return [];
        }
    },

    // CORRIGÉ: Classement par XP sans index composite
    getXPLeaderboard: async (limit = 20) => {
        try {
            // Récupérer TOUS les profils (sans where/orderBy combinés)
            const snapshot = await db.collection('profiles').get();

            // Filtrer et trier côté client
            const profiles = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    return {
                        uid: doc.id,
                        pseudo: data.pseudo || 'Joueur',
                        avatar: data.avatar?.value || data.avatar || '👤',
                        niveau: data.niveau || 1,
                        experiencePoints: data.experiencePoints || 0,
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

            return profiles;
        } catch (error) {
            console.error('Erreur récupération classement XP:', error);
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

console.log('✅ Firebase initialisé avec succès');
