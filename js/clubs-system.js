// ========== SYSTÈME DE CLUBS / ÉQUIPES ==========
// Créer ou rejoindre des clubs pour jouer en équipe

const ClubsSystem = {
    // Limites et configuration
    MAX_CLUB_NAME_LENGTH: 30,
    MAX_CLUB_DESCRIPTION: 200,
    MAX_MEMBERS: 50,
    MIN_MEMBERS_FOR_RANKING: 3,

    // Rôles dans un club
    ROLES: {
        owner: { name: 'Fondateur', emoji: '👑', permissions: ['all'] },
        admin: { name: 'Admin', emoji: '⭐', permissions: ['kick', 'invite', 'edit_info'] },
        member: { name: 'Membre', emoji: '👤', permissions: [] }
    },

    // Créer un nouveau club
    createClub: async (userId, clubData) => {
        if (!userId) return { success: false, error: 'Non connecté' };

        const { name, description, avatar, isPublic = true } = clubData;

        if (!name || name.length > ClubsSystem.MAX_CLUB_NAME_LENGTH) {
            return { success: false, error: 'Nom invalide (max 30 caractères)' };
        }

        try {
            // Vérifier si l'utilisateur est déjà dans un club
            const profileDoc = await db.collection('profiles').doc(userId).get();
            if (profileDoc.data()?.clubId) {
                return { success: false, error: 'Tu es déjà membre d\'un club' };
            }

            // Vérifier si le nom existe
            const existingClub = await db.collection('clubs')
                .where('nameLower', '==', name.toLowerCase())
                .get();

            if (!existingClub.empty) {
                return { success: false, error: 'Ce nom de club existe déjà' };
            }

            // Obtenir les infos du créateur
            const profile = profileDoc.data() || {};

            // Créer le club
            const clubRef = await db.collection('clubs').add({
                name: name,
                nameLower: name.toLowerCase(),
                description: description?.substring(0, ClubsSystem.MAX_CLUB_DESCRIPTION) || '',
                avatar: avatar || '🏰',
                isPublic: isPublic,
                ownerId: userId,
                members: [{
                    odlerId: odlerId,
                    username: profile.username || 'Anonyme',
                    avatar: profile.avatar || '😊',
                    role: 'owner',
                    joinedAt: new Date()
                }],
                memberCount: 1,
                totalXP: 0,
                weeklyXP: 0,
                stats: {
                    quizCompleted: 0,
                    perfectQuiz: 0,
                    totalQuestions: 0,
                    correctAnswers: 0
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Mettre à jour le profil du créateur
            await db.collection('profiles').doc(userId).update({
                clubId: clubRef.id,
                clubRole: 'owner'
            });

            return { success: true, clubId: clubRef.id };
        } catch (error) {
            console.error('Erreur createClub:', error);
            return { success: false, error: error.message };
        }
    },

    // Rejoindre un club
    joinClub: async (userId, clubId) => {
        if (!userId || !clubId) return { success: false, error: 'Paramètres manquants' };

        try {
            // Vérifier si l'utilisateur est déjà dans un club
            const profileDoc = await db.collection('profiles').doc(userId).get();
            const profile = profileDoc.data() || {};
            
            if (profile.clubId) {
                return { success: false, error: 'Tu es déjà membre d\'un club' };
            }

            // Obtenir le club
            const clubDoc = await db.collection('clubs').doc(clubId).get();
            if (!clubDoc.exists) {
                return { success: false, error: 'Club non trouvé' };
            }

            const club = clubDoc.data();

            if (!club.isPublic) {
                return { success: false, error: 'Ce club est privé' };
            }

            if (club.memberCount >= ClubsSystem.MAX_MEMBERS) {
                return { success: false, error: 'Club complet' };
            }

            // Ajouter le membre
            await db.collection('clubs').doc(clubId).update({
                members: firebase.firestore.FieldValue.arrayUnion({
                    odlerId: odlerId,
                    username: profile.username || 'Anonyme',
                    avatar: profile.avatar || '😊',
                    role: 'member',
                    joinedAt: new Date()
                }),
                memberCount: firebase.firestore.FieldValue.increment(1)
            });

            // Mettre à jour le profil
            await db.collection('profiles').doc(userId).update({
                clubId: clubId,
                clubRole: 'member'
            });

            // Notification au club
            await db.collection('clubs').doc(clubId).collection('feed').add({
                type: 'member_joined',
                odlerId: odlerId,
                username: profile.username,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Erreur joinClub:', error);
            return { success: false, error: error.message };
        }
    },

    // Quitter un club
    leaveClub: async (userId) => {
        if (!userId) return { success: false, error: 'Non connecté' };

        try {
            const profileDoc = await db.collection('profiles').doc(userId).get();
            const profile = profileDoc.data();

            if (!profile?.clubId) {
                return { success: false, error: 'Tu n\'es pas dans un club' };
            }

            const clubDoc = await db.collection('clubs').doc(profile.clubId).get();
            const club = clubDoc.data();

            // Si c'est le fondateur
            if (club.ownerId === userId) {
                if (club.memberCount > 1) {
                    return { success: false, error: 'Transfère le club à un autre membre avant de partir' };
                }
                // Supprimer le club si seul membre
                await db.collection('clubs').doc(profile.clubId).delete();
            } else {
                // Retirer le membre
                const updatedMembers = club.members.filter(m => m.odlerId !== userId);
                await db.collection('clubs').doc(profile.clubId).update({
                    members: updatedMembers,
                    memberCount: firebase.firestore.FieldValue.increment(-1)
                });
            }

            // Mettre à jour le profil
            await db.collection('profiles').doc(userId).update({
                clubId: firebase.firestore.FieldValue.delete(),
                clubRole: firebase.firestore.FieldValue.delete()
            });

            return { success: true };
        } catch (error) {
            console.error('Erreur leaveClub:', error);
            return { success: false, error: error.message };
        }
    },

    // Ajouter des XP au club
    addClubXP: async (userId, xpAmount, quizStats = {}) => {
        if (!userId || xpAmount <= 0) return false;

        try {
            const profileDoc = await db.collection('profiles').doc(userId).get();
            const profile = profileDoc.data();

            if (!profile?.clubId) return false;

            const updateData = {
                totalXP: firebase.firestore.FieldValue.increment(xpAmount),
                weeklyXP: firebase.firestore.FieldValue.increment(xpAmount),
                'stats.quizCompleted': firebase.firestore.FieldValue.increment(1)
            };

            if (quizStats.isPerfect) {
                updateData['stats.perfectQuiz'] = firebase.firestore.FieldValue.increment(1);
            }
            if (quizStats.totalQuestions) {
                updateData['stats.totalQuestions'] = firebase.firestore.FieldValue.increment(quizStats.totalQuestions);
            }
            if (quizStats.correctAnswers) {
                updateData['stats.correctAnswers'] = firebase.firestore.FieldValue.increment(quizStats.correctAnswers);
            }

            await db.collection('clubs').doc(profile.clubId).update(updateData);

            // Ajouter au feed du club
            await db.collection('clubs').doc(profile.clubId).collection('feed').add({
                type: 'quiz_completed',
                odlerId: odlerId,
                username: profile.username,
                xp: xpAmount,
                isPerfect: quizStats.isPerfect || false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('Erreur addClubXP:', error);
            return false;
        }
    },

    // Obtenir le classement des clubs
    getClubsRanking: async (limit = 20, period = 'all') => {
        try {
            const orderField = period === 'weekly' ? 'weeklyXP' : 'totalXP';
            
            const snapshot = await db.collection('clubs')
                .where('memberCount', '>=', ClubsSystem.MIN_MEMBERS_FOR_RANKING)
                .orderBy('memberCount')
                .orderBy(orderField, 'desc')
                .limit(limit)
                .get();

            const clubs = [];
            let rank = 1;

            snapshot.forEach(doc => {
                clubs.push({
                    rank: rank++,
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Re-trier car Firestore ne permet pas d'ordonner directement
            clubs.sort((a, b) => b[orderField.replace('.', '')] - a[orderField.replace('.', '')]);
            clubs.forEach((club, index) => club.rank = index + 1);

            return clubs;
        } catch (error) {
            console.error('Erreur getClubsRanking:', error);
            return [];
        }
    },

    // Rechercher des clubs
    searchClubs: async (query) => {
        if (!query || query.length < 2) return [];

        try {
            const queryLower = query.toLowerCase();
            
            const snapshot = await db.collection('clubs')
                .where('isPublic', '==', true)
                .where('nameLower', '>=', queryLower)
                .where('nameLower', '<=', queryLower + '\uf8ff')
                .limit(20)
                .get();

            const clubs = [];
            snapshot.forEach(doc => {
                clubs.push({ id: doc.id, ...doc.data() });
            });

            return clubs;
        } catch (error) {
            console.error('Erreur searchClubs:', error);
            return [];
        }
    },

    // Obtenir les détails d'un club
    getClubDetails: async (clubId) => {
        if (!clubId) return null;

        try {
            const clubDoc = await db.collection('clubs').doc(clubId).get();
            if (!clubDoc.exists) return null;

            return { id: clubDoc.id, ...clubDoc.data() };
        } catch (error) {
            console.error('Erreur getClubDetails:', error);
            return null;
        }
    },

    // Obtenir le feed du club
    getClubFeed: async (clubId, limit = 20) => {
        if (!clubId) return [];

        try {
            const snapshot = await db.collection('clubs').doc(clubId)
                .collection('feed')
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            const feed = [];
            snapshot.forEach(doc => {
                feed.push({ id: doc.id, ...doc.data() });
            });

            return feed;
        } catch (error) {
            console.error('Erreur getClubFeed:', error);
            return [];
        }
    },

    // Réinitialiser les XP hebdomadaires (cron job)
    resetWeeklyXP: async () => {
        try {
            const batch = db.batch();
            const snapshot = await db.collection('clubs').get();

            snapshot.forEach(doc => {
                batch.update(doc.ref, { weeklyXP: 0 });
            });

            await batch.commit();
            return true;
        } catch (error) {
            console.error('Erreur resetWeeklyXP:', error);
            return false;
        }
    },

    // Rendu de la carte de club
    renderClubCard: (club, showJoinButton = false, userId = null) => {
        const isMember = userId && club.members?.some(m => m.odlerId === userId);
        const avgXP = club.memberCount > 0 ? Math.round(club.totalXP / club.memberCount) : 0;

        return `
            <div class="club-card" style="
                background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));
                border: 2px solid var(--border-color);
                border-radius: 16px;
                padding: 20px;
                margin: 15px 0;
            ">
                <div class="club-header" style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div class="club-avatar" style="
                        width: 60px;
                        height: 60px;
                        background: var(--accent-light);
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 2em;
                    ">${club.avatar || '🏰'}</div>
                    <div>
                        <h3 style="margin: 0;">${club.name}</h3>
                        <p style="margin: 5px 0 0; opacity: 0.7; font-size: 0.9em;">
                            👥 ${club.memberCount}/${ClubsSystem.MAX_MEMBERS} membres
                        </p>
                    </div>
                    ${club.rank ? `<span style="
                        margin-left: auto;
                        background: linear-gradient(135deg, #ffd700, #ff8c00);
                        color: #000;
                        padding: 5px 12px;
                        border-radius: 20px;
                        font-weight: bold;
                    ">#${club.rank}</span>` : ''}
                </div>

                ${club.description ? `
                    <p class="club-description" style="
                        margin: 0 0 15px;
                        font-size: 0.9em;
                        opacity: 0.8;
                    ">${club.description}</p>
                ` : ''}

                <div class="club-stats" style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    background: var(--bg-primary);
                    padding: 15px;
                    border-radius: 10px;
                    text-align: center;
                    font-size: 0.9em;
                ">
                    <div>
                        <div style="font-size: 1.3em; font-weight: bold; color: var(--accent-color);">
                            ${(club.totalXP || 0).toLocaleString()}
                        </div>
                        <div style="opacity: 0.7;">XP Total</div>
                    </div>
                    <div>
                        <div style="font-size: 1.3em; font-weight: bold; color: var(--success-color);">
                            ${(club.weeklyXP || 0).toLocaleString()}
                        </div>
                        <div style="opacity: 0.7;">XP Semaine</div>
                    </div>
                    <div>
                        <div style="font-size: 1.3em; font-weight: bold;">
                            ${avgXP.toLocaleString()}
                        </div>
                        <div style="opacity: 0.7;">XP/Membre</div>
                    </div>
                </div>

                ${showJoinButton && !isMember && club.isPublic ? `
                    <button 
                        onclick="ClubsSystem.joinClub('${userId}', '${club.id}').then(r => { if(r.success) location.reload(); else alert(r.error); })"
                        style="
                            width: 100%;
                            padding: 12px;
                            margin-top: 15px;
                            background: var(--accent-color);
                            color: white;
                            border: none;
                            border-radius: 10px;
                            font-weight: bold;
                            cursor: pointer;
                        "
                    >
                        Rejoindre le club 🚀
                    </button>
                ` : ''}
                
                ${isMember ? `
                    <div style="
                        text-align: center;
                        margin-top: 15px;
                        padding: 10px;
                        background: var(--success-color)22;
                        border-radius: 10px;
                        color: var(--success-color);
                    ">
                        ✅ Tu es membre de ce club
                    </div>
                ` : ''}
            </div>
        `;
    }
};

// Export global
window.ClubsSystem = ClubsSystem;
