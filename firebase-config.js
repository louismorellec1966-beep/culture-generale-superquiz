// ========== CONFIGURATION FIREBASE ==========
// Configuration Firebase pour SuperQuiz

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
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, message: '✅ Compte créé ! Vérifiez votre email.' };
        } catch (error) {
            throw new Error(FirebaseAuth.getErrorMessage(error.code));
        }
    },

    login: async (email, password) => {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return {
                success: true,
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    emailVerified: userCredential.user.emailVerified
                }
            };
        } catch (error) {
            throw new Error(FirebaseAuth.getErrorMessage(error.code));
        }
    },

    logout: async () => {
        await auth.signOut();
    },

    resetPassword: async (email) => {
        try {
            await auth.sendPasswordResetEmail(email);
            return { success: true, message: '✅ Email de réinitialisation envoyé !' };
        } catch (error) {
            throw new Error(FirebaseAuth.getErrorMessage(error.code));
        }
    },

    resendVerificationEmail: async () => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Aucun utilisateur connecté');
            await user.sendEmailVerification();
            return { success: true, message: '✅ Email de vérification renvoyé !' };
        } catch (error) {
            throw new Error(FirebaseAuth.getErrorMessage(error.code));
        }
    },

    getCurrentUser: () => {
        const user = auth.currentUser;
        if (!user) return null;
        return {
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            emailVerified: user.emailVerified
        };
    },

    onAuthStateChanged: (callback) => {
        return auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const doc = await db.collection('users').doc(user.uid).get();
                    const userData = doc.data();
                    callback({
                        uid: user.uid,
                        email: user.email,
                        name: userData?.name || user.email.split('@')[0],
                        emailVerified: user.emailVerified
                    });
                } catch (error) {
                    console.error('Erreur récupération profil:', error);
                    callback({
                        uid: user.uid,
                        email: user.email,
                        name: user.email.split('@')[0],
                        emailVerified: user.emailVerified
                    });
                }
            } else {
                callback(null);
            }
        });
    },

    getErrorMessage: (code) => {
        const messages = {
            'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
            'auth/invalid-email': 'Adresse email invalide',
            'auth/weak-password': 'Mot de passe trop faible (min. 6 caractères)',
            'auth/user-not-found': 'Email ou mot de passe incorrect',
            'auth/wrong-password': 'Email ou mot de passe incorrect',
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
                date: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Erreur sauvegarde score:', error);
            throw new Error('Erreur lors de la sauvegarde du score');
        }
    },

    getAll: async () => {
        const user = auth.currentUser;
        if (!user) return [];
        try {
            const snapshot = await db.collection('scores')
                .where('userId', '==', user.uid)
                .orderBy('date', 'desc')
                .get();
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date?.toDate().toISOString() || new Date().toISOString()
                };
            });
        } catch (error) {
            console.error('Erreur récupération scores:', error);
            return [];
        }
    },

    getLeaderboard: async (matiere = null) => {
        try {
            let query = db.collection('scores');
            if (matiere) query = query.where('matiere', '==', matiere);
            const snapshot = await query.get();
            const userScores = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const userId = data.userId;
                if (!userScores[userId]) {
                    userScores[userId] = {
                        email: data.userEmail,
                        totalScore: 0,
                        quizCount: 0
                    };
                }
                userScores[userId].totalScore += data.score || 0;
                userScores[userId].quizCount += 1;
            });
            const leaderboard = Object.entries(userScores).map(([userId, data]) => ({
                userId,
                name: data.email.split('@')[0],
                totalScore: data.totalScore,
                quizCount: data.quizCount,
                average: Math.round((data.totalScore / data.quizCount) * 100) / 100
            }));
            leaderboard.sort((a, b) => b.totalScore - a.totalScore);
            return leaderboard;
        } catch (error) {
            console.error('Erreur récupération classement:', error);
            return [];
        }
    }
};

window.FirebaseAuth = FirebaseAuth;
window.FirebaseScores = FirebaseScores;
console.log('✅ Firebase initialisé avec succès');