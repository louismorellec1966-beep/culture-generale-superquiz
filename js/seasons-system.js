// ========== SYSTÈME DE SAISONS ==========
// Classements trimestriels avec récompenses

const SeasonsSystem = {
    // Configuration des saisons
    SEASONS: {
        spring: { name: 'Printemps', emoji: '🌸', color: '#e91e63' },
        summer: { name: 'Été', emoji: '☀️', color: '#ff9800' },
        autumn: { name: 'Automne', emoji: '🍂', color: '#795548' },
        winter: { name: 'Hiver', emoji: '❄️', color: '#2196f3' }
    },

    // Rangs et récompenses
    RANKS: {
        bronze: { name: 'Bronze', emoji: '🥉', minPercentile: 0, xpReward: 100, color: '#cd7f32' },
        silver: { name: 'Argent', emoji: '🥈', minPercentile: 50, xpReward: 250, color: '#c0c0c0' },
        gold: { name: 'Or', emoji: '🥇', minPercentile: 75, xpReward: 500, color: '#ffd700' },
        platinum: { name: 'Platine', emoji: '💎', minPercentile: 90, xpReward: 1000, color: '#e5e4e2' },
        diamond: { name: 'Diamant', emoji: '💠', minPercentile: 95, xpReward: 2000, color: '#b9f2ff' },
        legend: { name: 'Légende', emoji: '👑', minPercentile: 99, xpReward: 5000, color: '#9b59b6' }
    },

    // Obtenir la saison actuelle
    getCurrentSeason: () => {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        
        let season;
        let quarter;
        
        if (month >= 2 && month <= 4) {
            season = 'spring';
            quarter = 1;
        } else if (month >= 5 && month <= 7) {
            season = 'summer';
            quarter = 2;
        } else if (month >= 8 && month <= 10) {
            season = 'autumn';
            quarter = 3;
        } else {
            season = 'winter';
            quarter = month === 11 ? 4 : 4; // Décembre = Q4, Jan-Fév = fin Q4 de l'année précédente
        }

        const seasonYear = month <= 1 ? year - 1 : year;
        const seasonId = `${seasonYear}-${season}`;
        
        // Calculer les dates de début et fin
        const seasonStartMonth = { spring: 2, summer: 5, autumn: 8, winter: 11 };
        const startMonth = seasonStartMonth[season];
        const startYear = season === 'winter' && month <= 1 ? year - 1 : year;
        const startDate = new Date(startYear, startMonth, 1);
        
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 3);
        endDate.setDate(0); // Dernier jour du mois précédent

        const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
        const daysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, totalDays - daysPassed);
        const progress = Math.min(100, Math.round((daysPassed / totalDays) * 100));

        return {
            id: seasonId,
            season: season,
            year: seasonYear,
            ...SeasonsSystem.SEASONS[season],
            startDate: startDate,
            endDate: endDate,
            daysRemaining: daysRemaining,
            progress: progress
        };
    },

    // Obtenir ou créer l'entrée de saison d'un utilisateur
    getUserSeasonEntry: async (userId) => {
        if (!userId) return null;

        const currentSeason = SeasonsSystem.getCurrentSeason();

        try {
            const entryRef = db.collection('seasons')
                .doc(currentSeason.id)
                .collection('entries')
                .doc(userId);

            const entryDoc = await entryRef.get();

            if (!entryDoc.exists) {
                // Créer une nouvelle entrée
                const profileDoc = await db.collection('profiles').doc(userId).get();
                const profile = profileDoc.data() || {};

                const newEntry = {
                    odlerId: userId,
                    username: profile.username || 'Anonyme',
                    avatar: profile.avatar || '😊',
                    points: 0,
                    quizCompleted: 0,
                    perfectQuiz: 0,
                    bestStreak: 0,
                    joinedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                await entryRef.set(newEntry);
                return { ...newEntry, rank: null };
            }

            return entryDoc.data();
        } catch (error) {
            console.error('Erreur getUserSeasonEntry:', error);
            return null;
        }
    },

    // Ajouter des points de saison
    addSeasonPoints: async (userId, points, quizPerfect = false) => {
        if (!userId || points <= 0) return false;

        const currentSeason = SeasonsSystem.getCurrentSeason();

        try {
            const entryRef = db.collection('seasons')
                .doc(currentSeason.id)
                .collection('entries')
                .doc(userId);

            const updateData = {
                points: firebase.firestore.FieldValue.increment(points),
                quizCompleted: firebase.firestore.FieldValue.increment(1),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (quizPerfect) {
                updateData.perfectQuiz = firebase.firestore.FieldValue.increment(1);
            }

            await entryRef.update(updateData).catch(async () => {
                // Si l'entrée n'existe pas, la créer d'abord
                await SeasonsSystem.getUserSeasonEntry(userId);
                await entryRef.update(updateData);
            });

            return true;
        } catch (error) {
            console.warn('⚠️ Erreur addSeasonPoints (points sauvegardés localement):', error.message);

            // Sauvegarder localement en cas d'erreur Firestore
            try {
                const localSeasonData = JSON.parse(localStorage.getItem('localSeasonData') || '{}');
                if (!localSeasonData[currentSeason.id]) {
                    localSeasonData[currentSeason.id] = { points: 0, quizCompleted: 0, perfectQuiz: 0 };
                }

                localSeasonData[currentSeason.id].points += points;
                localSeasonData[currentSeason.id].quizCompleted += 1;
                if (quizPerfect) {
                    localSeasonData[currentSeason.id].perfectQuiz += 1;
                }

                localStorage.setItem('localSeasonData', JSON.stringify(localSeasonData));
                console.log('💾 Points sauvegardés localement:', points);
            } catch (localError) {
                console.error('Erreur sauvegarde locale:', localError);
            }

            return false;
        }
    },

    // Obtenir le classement de la saison
    getSeasonLeaderboard: async (seasonId = null, limit = 50) => {
        const season = seasonId || SeasonsSystem.getCurrentSeason().id;

        try {
            const snapshot = await db.collection('seasons')
                .doc(season)
                .collection('entries')
                .orderBy('points', 'desc')
                .limit(limit)
                .get();

            const leaderboard = [];
            let rank = 1;

            snapshot.forEach(doc => {
                leaderboard.push({
                    rank: rank++,
                    odlerId: doc.id,
                    ...doc.data()
                });
            });

            return leaderboard;
        } catch (error) {
            console.error('Erreur getSeasonLeaderboard:', error);
            return [];
        }
    },

    // Obtenir le rang d'un utilisateur
    getUserSeasonRank: async (userId) => {
        if (!userId) return null;

        const currentSeason = SeasonsSystem.getCurrentSeason();

        try {
            // Obtenir les stats de l'utilisateur
            const entryDoc = await db.collection('seasons')
                .doc(currentSeason.id)
                .collection('entries')
                .doc(userId)
                .get();

            if (!entryDoc.exists) {
                // Si pas d'entry, vérifier les données locales
                console.log('ℹ️ Aucune donnée de saison trouvée, vérification des données locales');
                const localSeasonData = JSON.parse(localStorage.getItem('localSeasonData') || '{}');
                const localData = localSeasonData[currentSeason.id];

                if (localData) {
                    return {
                        position: 1, // Position estimée
                        points: localData.points || 0,
                        percentile: 50, // Percentile estimé
                        totalParticipants: 1,
                        rank: 'bronze',
                        rankData: SeasonsSystem.RANKS.bronze,
                        localData: true // Indicateur de données locales
                    };
                }

                return {
                    position: 1,
                    points: 0,
                    percentile: 0,
                    totalParticipants: 1,
                    rank: 'bronze',
                    rankData: SeasonsSystem.RANKS.bronze
                };
            }

            const userPoints = entryDoc.data().points || 0;

            // Compter combien ont plus de points
            const higherSnapshot = await db.collection('seasons')
                .doc(currentSeason.id)
                .collection('entries')
                .where('points', '>', userPoints)
                .get();

            const rank = higherSnapshot.size + 1;

            // Compter le total de participants
            const totalSnapshot = await db.collection('seasons')
                .doc(currentSeason.id)
                .collection('entries')
                .get();

            const totalParticipants = totalSnapshot.size;
            const percentile = Math.round(((totalParticipants - rank) / totalParticipants) * 100);

            // Déterminer le rang (badge)
            let currentRank = 'bronze';
            for (const [rankId, rankData] of Object.entries(SeasonsSystem.RANKS)) {
                if (percentile >= rankData.minPercentile) {
                    currentRank = rankId;
                }
            }

            return {
                position: rank,
                points: userPoints,
                percentile: percentile,
                totalParticipants: totalParticipants,
                rank: currentRank,
                rankData: SeasonsSystem.RANKS[currentRank]
            };
        } catch (error) {
            console.warn('⚠️ Erreur getUserSeasonRank (utilisation des valeurs par défaut):', error.message);

            // Retourner des valeurs par défaut en cas d'erreur de permissions
            return {
                position: 1,
                points: 0,
                percentile: 0,
                totalParticipants: 1,
                rank: 'bronze',
                rankData: SeasonsSystem.RANKS.bronze,
                error: true // Indicateur d'erreur
            };
        }
    },

    // Obtenir l'historique des saisons d'un utilisateur
    getUserSeasonHistory: async (userId) => {
        if (!userId) return [];

        try {
            const historyDoc = await db.collection('profiles').doc(userId).get();
            if (!historyDoc.exists) return [];

            return historyDoc.data().seasonHistory || [];
        } catch (error) {
            console.error('Erreur getUserSeasonHistory:', error);
            return [];
        }
    },

    // Finaliser une saison (à appeler par un admin/cron)
    finalizeSeason: async (seasonId) => {
        try {
            // Obtenir tous les participants
            const snapshot = await db.collection('seasons')
                .doc(seasonId)
                .collection('entries')
                .orderBy('points', 'desc')
                .get();

            const total = snapshot.size;
            let rank = 1;

            for (const doc of snapshot.docs) {
                const percentile = Math.round(((total - rank) / total) * 100);
                
                // Déterminer le rang final
                let finalRank = 'bronze';
                for (const [rankId, rankData] of Object.entries(SeasonsSystem.RANKS)) {
                    if (percentile >= rankData.minPercentile) {
                        finalRank = rankId;
                    }
                }

                const reward = SeasonsSystem.RANKS[finalRank];

                // Enregistrer dans l'historique du profil
                await db.collection('profiles').doc(doc.id).update({
                    seasonHistory: firebase.firestore.FieldValue.arrayUnion({
                        seasonId: seasonId,
                        rank: rank,
                        points: doc.data().points,
                        finalRank: finalRank,
                        percentile: percentile,
                        xpReward: reward.xpReward
                    }),
                    xp: firebase.firestore.FieldValue.increment(reward.xpReward)
                });

                // Notification de fin de saison
                await db.collection('notifications').add({
                    userId: doc.id,
                    type: 'season_end',
                    title: 'Saison terminée !',
                    message: `Tu as terminé la saison au rang ${reward.emoji} ${reward.name} (Top ${percentile}%) ! +${reward.xpReward} XP`,
                    read: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                rank++;
            }

            // Marquer la saison comme finalisée
            await db.collection('seasons').doc(seasonId).set({
                finalized: true,
                finalizedAt: firebase.firestore.FieldValue.serverTimestamp(),
                totalParticipants: total
            }, { merge: true });

            return true;
        } catch (error) {
            console.error('Erreur finalizeSeason:', error);
            return false;
        }
    },

    // Rendu du widget de saison
    renderSeasonWidget: async (userId) => {
        const season = SeasonsSystem.getCurrentSeason();
        const userRank = userId ? await SeasonsSystem.getUserSeasonRank(userId) : null;

        let rankHtml = '';
        if (userRank) {
            rankHtml = `
                <div class="season-user-rank">
                    <div class="rank-badge" style="background: ${userRank.rankData.color}20; border: 2px solid ${userRank.rankData.color};">
                        <span class="rank-emoji">${userRank.rankData.emoji}</span>
                        <span class="rank-name">${userRank.rankData.name}</span>
                    </div>
                    <div class="rank-details">
                        <span class="rank-position">#${userRank.position}</span>
                        <span class="rank-points">${userRank.points} pts</span>
                        <span class="rank-percentile">Top ${100 - userRank.percentile}%</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="season-widget" style="
                background: linear-gradient(135deg, ${season.color}22, ${season.color}44);
                border: 2px solid ${season.color};
                border-radius: 16px;
                padding: 20px;
                margin: 15px 0;
            ">
                <div class="season-header">
                    <span class="season-emoji">${season.emoji}</span>
                    <div class="season-info">
                        <h3 style="margin: 0; color: ${season.color};">Saison ${season.name} ${season.year}</h3>
                        <p style="margin: 5px 0 0; opacity: 0.8;">${season.daysRemaining} jours restants</p>
                    </div>
                </div>
                <div class="season-progress-bar" style="
                    background: rgba(255,255,255,0.3);
                    border-radius: 10px;
                    height: 10px;
                    margin: 15px 0;
                    overflow: hidden;
                ">
                    <div class="season-progress-fill" style="
                        background: ${season.color};
                        height: 100%;
                        width: ${season.progress}%;
                        transition: width 0.5s;
                    "></div>
                </div>
                ${rankHtml}
            </div>
        `;
    }
};

// Export global
window.SeasonsSystem = SeasonsSystem;
