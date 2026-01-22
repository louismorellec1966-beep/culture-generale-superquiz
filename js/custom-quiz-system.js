// ========== SYSTÈME DE QUIZ PERSONNALISÉS ==========
// Permet aux utilisateurs de créer et partager leurs propres quiz

const CustomQuizSystem = {
    // Créer un nouveau quiz personnalisé
    async createQuiz(userId, quizData) {
        if (!userId || !quizData) return null;

        const quiz = {
            creatorId: userId,
            title: quizData.title,
            description: quizData.description || '',
            category: quizData.category || 'divers',
            difficulty: quizData.difficulty || 'moyen',
            questions: quizData.questions || [],
            isPublic: quizData.isPublic !== false,
            tags: quizData.tags || [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            stats: {
                plays: 0,
                avgScore: 0,
                totalScore: 0,
                ratings: [],
                avgRating: 0
            }
        };

        // Validation
        if (!quiz.title || quiz.title.length < 3) {
            throw new Error('Le titre doit contenir au moins 3 caractères');
        }
        if (quiz.questions.length < 3) {
            throw new Error('Le quiz doit contenir au moins 3 questions');
        }
        if (quiz.questions.length > 30) {
            throw new Error('Le quiz ne peut pas contenir plus de 30 questions');
        }

        // Valider chaque question
        for (let i = 0; i < quiz.questions.length; i++) {
            const q = quiz.questions[i];
            if (!q.question || q.question.length < 10) {
                throw new Error(`Question ${i + 1}: Le texte doit contenir au moins 10 caractères`);
            }
            if (!q.reponses || q.reponses.length < 2) {
                throw new Error(`Question ${i + 1}: Au moins 2 réponses sont requises`);
            }
            if (q.correct === undefined || q.correct < 0 || q.correct >= q.reponses.length) {
                throw new Error(`Question ${i + 1}: La réponse correcte n'est pas valide`);
            }
        }

        try {
            const docRef = await db.collection('customQuizzes').add(quiz);
            
            // Mettre à jour le profil du créateur
            await db.collection('profiles').doc(userId).update({
                'stats.quizCreated': firebase.firestore.FieldValue.increment(1)
            });

            return docRef.id;
        } catch (error) {
            console.error('Erreur création quiz:', error);
            throw error;
        }
    },

    // Récupérer un quiz par ID
    async getQuiz(quizId) {
        try {
            const doc = await db.collection('customQuizzes').doc(quizId).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('Erreur récupération quiz:', error);
            return null;
        }
    },

    // Récupérer les quiz d'un utilisateur
    async getUserQuizzes(userId) {
        try {
            const snapshot = await db.collection('customQuizzes')
                .where('creatorId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Erreur récupération quiz utilisateur:', error);
            return [];
        }
    },

    // Récupérer les quiz publics (avec filtres)
    async getPublicQuizzes(options = {}) {
        try {
            let query = db.collection('customQuizzes')
                .where('isPublic', '==', true);

            if (options.category) {
                query = query.where('category', '==', options.category);
            }
            if (options.difficulty) {
                query = query.where('difficulty', '==', options.difficulty);
            }

            // Tri
            const sortField = options.sortBy || 'createdAt';
            const sortOrder = options.sortOrder || 'desc';
            query = query.orderBy(sortField, sortOrder);

            // Limite
            query = query.limit(options.limit || 20);

            const snapshot = await query.get();
            const quizzes = [];

            for (const doc of snapshot.docs) {
                const quiz = { id: doc.id, ...doc.data() };
                // Récupérer les infos du créateur
                const creatorDoc = await db.collection('profiles').doc(quiz.creatorId).get();
                quiz.creatorName = creatorDoc.exists ? creatorDoc.data().pseudo : 'Anonyme';
                quizzes.push(quiz);
            }

            return quizzes;
        } catch (error) {
            console.error('Erreur récupération quiz publics:', error);
            return [];
        }
    },

    // Rechercher des quiz
    async searchQuizzes(searchTerm) {
        try {
            // Recherche simple par titre (Firestore ne supporte pas la recherche full-text)
            const snapshot = await db.collection('customQuizzes')
                .where('isPublic', '==', true)
                .orderBy('title')
                .startAt(searchTerm)
                .endAt(searchTerm + '\uf8ff')
                .limit(20)
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Erreur recherche quiz:', error);
            return [];
        }
    },

    // Quiz populaires
    async getPopularQuizzes(limit = 10) {
        try {
            const snapshot = await db.collection('customQuizzes')
                .where('isPublic', '==', true)
                .orderBy('stats.plays', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Erreur quiz populaires:', error);
            return [];
        }
    },

    // Quiz les mieux notés
    async getTopRatedQuizzes(limit = 10) {
        try {
            const snapshot = await db.collection('customQuizzes')
                .where('isPublic', '==', true)
                .where('stats.avgRating', '>=', 4)
                .orderBy('stats.avgRating', 'desc')
                .orderBy('stats.plays', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Erreur quiz top rated:', error);
            return [];
        }
    },

    // Jouer un quiz et enregistrer le score
    async playQuiz(quizId, userId, score, totalQuestions) {
        try {
            const quizRef = db.collection('customQuizzes').doc(quizId);
            const quizDoc = await quizRef.get();
            
            if (!quizDoc.exists) return;

            const quiz = quizDoc.data();
            const newTotalScore = (quiz.stats?.totalScore || 0) + score;
            const newPlays = (quiz.stats?.plays || 0) + 1;
            const newAvgScore = Math.round(newTotalScore / newPlays);

            await quizRef.update({
                'stats.plays': newPlays,
                'stats.totalScore': newTotalScore,
                'stats.avgScore': newAvgScore
            });

            // Enregistrer dans l'historique du joueur
            if (userId) {
                await db.collection('profiles').doc(userId).collection('customQuizHistory').add({
                    quizId,
                    quizTitle: quiz.title,
                    score,
                    totalQuestions,
                    percentage: Math.round((score / totalQuestions) * 100),
                    playedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Erreur enregistrement partie:', error);
        }
    },

    // Noter un quiz
    async rateQuiz(quizId, userId, rating) {
        if (rating < 1 || rating > 5) return;

        try {
            const quizRef = db.collection('customQuizzes').doc(quizId);
            const quizDoc = await quizRef.get();
            
            if (!quizDoc.exists) return;

            const quiz = quizDoc.data();
            const ratings = quiz.stats?.ratings || [];
            
            // Vérifier si l'utilisateur a déjà noté
            const existingIndex = ratings.findIndex(r => r.userId === userId);
            if (existingIndex >= 0) {
                ratings[existingIndex].rating = rating;
            } else {
                ratings.push({ userId, rating, date: new Date().toISOString() });
            }

            // Calculer la moyenne
            const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

            await quizRef.update({
                'stats.ratings': ratings,
                'stats.avgRating': Math.round(avgRating * 10) / 10
            });
        } catch (error) {
            console.error('Erreur notation quiz:', error);
        }
    },

    // Modifier un quiz
    async updateQuiz(quizId, userId, updates) {
        try {
            const quizRef = db.collection('customQuizzes').doc(quizId);
            const quizDoc = await quizRef.get();
            
            if (!quizDoc.exists) throw new Error('Quiz non trouvé');
            if (quizDoc.data().creatorId !== userId) throw new Error('Non autorisé');

            const allowedFields = ['title', 'description', 'category', 'difficulty', 'questions', 'isPublic', 'tags'];
            const filteredUpdates = {};
            
            for (const field of allowedFields) {
                if (updates[field] !== undefined) {
                    filteredUpdates[field] = updates[field];
                }
            }

            filteredUpdates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

            await quizRef.update(filteredUpdates);
            return true;
        } catch (error) {
            console.error('Erreur modification quiz:', error);
            throw error;
        }
    },

    // Supprimer un quiz
    async deleteQuiz(quizId, userId) {
        try {
            const quizRef = db.collection('customQuizzes').doc(quizId);
            const quizDoc = await quizRef.get();
            
            if (!quizDoc.exists) throw new Error('Quiz non trouvé');
            if (quizDoc.data().creatorId !== userId) throw new Error('Non autorisé');

            await quizRef.delete();

            // Mettre à jour le compteur du créateur
            await db.collection('profiles').doc(userId).update({
                'stats.quizCreated': firebase.firestore.FieldValue.increment(-1)
            });

            return true;
        } catch (error) {
            console.error('Erreur suppression quiz:', error);
            throw error;
        }
    },

    // Signaler un quiz
    async reportQuiz(quizId, userId, reason) {
        try {
            await db.collection('quizReports').add({
                quizId,
                reporterId: userId,
                reason,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });
            return true;
        } catch (error) {
            console.error('Erreur signalement quiz:', error);
            return false;
        }
    },

    // Dupliquer un quiz
    async duplicateQuiz(quizId, userId) {
        try {
            const originalQuiz = await this.getQuiz(quizId);
            if (!originalQuiz) throw new Error('Quiz non trouvé');

            const newQuizData = {
                title: `${originalQuiz.title} (copie)`,
                description: originalQuiz.description,
                category: originalQuiz.category,
                difficulty: originalQuiz.difficulty,
                questions: originalQuiz.questions,
                isPublic: false, // Par défaut privé
                tags: originalQuiz.tags
            };

            return await this.createQuiz(userId, newQuizData);
        } catch (error) {
            console.error('Erreur duplication quiz:', error);
            throw error;
        }
    },

    // Catégories disponibles
    CATEGORIES: {
        histoire: { name: 'Histoire', icon: '📜' },
        geographie: { name: 'Géographie', icon: '🗺️' },
        science: { name: 'Science', icon: '🔬' },
        litterature: { name: 'Littérature', icon: '📚' },
        art: { name: 'Art', icon: '🎨' },
        musique: { name: 'Musique', icon: '🎵' },
        cinema: { name: 'Cinéma', icon: '🎬' },
        sport: { name: 'Sport', icon: '⚽' },
        gastronomie: { name: 'Gastronomie', icon: '🍽️' },
        divers: { name: 'Divers', icon: '🎲' }
    },

    // Générer le HTML pour la carte d'un quiz
    renderQuizCard(quiz) {
        const category = this.CATEGORIES[quiz.category] || this.CATEGORIES.divers;
        const stars = '⭐'.repeat(Math.round(quiz.stats?.avgRating || 0));
        
        return `
            <div class="custom-quiz-card" data-quiz-id="${quiz.id}">
                <div class="quiz-card-header">
                    <span class="quiz-category">${category.icon} ${category.name}</span>
                    <span class="quiz-difficulty ${quiz.difficulty}">${quiz.difficulty}</span>
                </div>
                <h3 class="quiz-title">${quiz.title}</h3>
                <p class="quiz-description">${quiz.description || 'Aucune description'}</p>
                <div class="quiz-meta">
                    <span>📝 ${quiz.questions?.length || 0} questions</span>
                    <span>👤 ${quiz.creatorName || 'Anonyme'}</span>
                </div>
                <div class="quiz-stats">
                    <span>🎮 ${quiz.stats?.plays || 0} parties</span>
                    <span>${stars || 'Non noté'}</span>
                </div>
                <div class="quiz-actions">
                    <button class="btn-play-quiz" onclick="playCustomQuiz('${quiz.id}')">
                        ▶️ Jouer
                    </button>
                </div>
            </div>
        `;
    }
};

// Rendre disponible globalement
window.CustomQuizSystem = CustomQuizSystem;
