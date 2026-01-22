// ========== SYSTÈME DE SÉRIES (STREAKS) ==========
// Gestion des connexions quotidiennes et bonus XP

const StreaksSystem = {
    // Récompenses par palier de jours consécutifs
    REWARDS: {
        3: { xp: 50, badge: 'streak_3', title: '🔥 3 jours !' },
        7: { xp: 150, badge: 'streak_7', title: '🔥 1 semaine !' },
        14: { xp: 300, badge: 'streak_14', title: '🔥 2 semaines !' },
        30: { xp: 500, badge: 'streak_30', title: '🔥 1 mois !' },
        60: { xp: 1000, badge: 'streak_60', title: '🔥 2 mois !' },
        100: { xp: 2000, badge: 'streak_100', title: '🔥 100 jours !' },
        365: { xp: 10000, badge: 'streak_365', title: '🔥 1 AN !' }
    },

    // Bonus XP quotidien selon la série en cours
    getDailyBonus: (streakDays) => {
        if (streakDays >= 100) return 100;
        if (streakDays >= 30) return 50;
        if (streakDays >= 14) return 30;
        if (streakDays >= 7) return 20;
        if (streakDays >= 3) return 10;
        return 5;
    },

    // Vérifier et mettre à jour la série de l'utilisateur
    checkStreak: async (userId) => {
        if (!userId) return null;

        try {
            const profileRef = db.collection('profiles').doc(userId);
            const profileDoc = await profileRef.get();
            
            if (!profileDoc.exists) return null;

            const profile = profileDoc.data();
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            
            const lastActivity = profile.lastActivityDate?.toDate?.() || profile.lastActivityDate;
            const lastActivityDay = lastActivity ? new Date(lastActivity.getFullYear?.() || new Date(lastActivity).getFullYear(), 
                                                           lastActivity.getMonth?.() || new Date(lastActivity).getMonth(), 
                                                           lastActivity.getDate?.() || new Date(lastActivity).getDate()).getTime() : 0;

            let currentStreak = profile.currentStreak || 0;
            let longestStreak = profile.longestStreak || 0;
            let todayPlayed = profile.todayPlayed || false;
            let rewards = [];

            // Calculer la différence en jours
            const daysDiff = Math.floor((today - lastActivityDay) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                // Même jour - rien à faire
                todayPlayed = true;
            } else if (daysDiff === 1) {
                // Jour consécutif - augmenter la série
                currentStreak++;
                todayPlayed = true;
                
                // Vérifier les récompenses de palier
                if (StreaksSystem.REWARDS[currentStreak]) {
                    rewards.push(StreaksSystem.REWARDS[currentStreak]);
                }
                
                // Mettre à jour le record
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }
            } else if (daysDiff > 1) {
                // Série perdue
                currentStreak = 1; // Recommencer à 1
                todayPlayed = true;
            }

            // Calculer le bonus XP du jour
            const dailyBonus = StreaksSystem.getDailyBonus(currentStreak);

            // Mettre à jour le profil
            await profileRef.update({
                currentStreak: currentStreak,
                longestStreak: longestStreak,
                lastActivityDate: firebase.firestore.FieldValue.serverTimestamp(),
                todayPlayed: todayPlayed,
                'streakData.lastCheck': today
            });

            return {
                currentStreak,
                longestStreak,
                dailyBonus,
                rewards,
                todayPlayed
            };
        } catch (error) {
            console.error('Erreur checkStreak:', error);
            return null;
        }
    },

    // Enregistrer une activité (quiz joué)
    recordActivity: async (userId) => {
        if (!userId) return null;

        try {
            const result = await StreaksSystem.checkStreak(userId);
            
            if (result && result.rewards.length > 0) {
                // Attribuer les récompenses XP
                for (const reward of result.rewards) {
                    await StreaksSystem.grantReward(userId, reward);
                }
            }

            // Ajouter le bonus XP quotidien
            if (result) {
                const profileRef = db.collection('profiles').doc(userId);
                await profileRef.update({
                    experiencePoints: firebase.firestore.FieldValue.increment(result.dailyBonus)
                });
            }

            return result;
        } catch (error) {
            console.error('Erreur recordActivity:', error);
            return null;
        }
    },

    // Attribuer une récompense de palier
    grantReward: async (userId, reward) => {
        try {
            const profileRef = db.collection('profiles').doc(userId);
            
            // Ajouter l'XP de récompense
            await profileRef.update({
                experiencePoints: firebase.firestore.FieldValue.increment(reward.xp),
                badges: firebase.firestore.FieldValue.arrayUnion(reward.badge)
            });

            // Enregistrer la notification
            await db.collection('notifications').add({
                userId: userId,
                type: 'streak_reward',
                title: reward.title,
                message: `Tu as gagné ${reward.xp} XP pour ta série de ${reward.badge.split('_')[1]} jours !`,
                xpGained: reward.xp,
                badge: reward.badge,
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('Erreur grantReward:', error);
            return false;
        }
    },

    // Obtenir les infos de streak pour affichage
    getStreakInfo: async (userId) => {
        if (!userId) return null;

        try {
            const profileDoc = await db.collection('profiles').doc(userId).get();
            if (!profileDoc.exists) return null;

            const profile = profileDoc.data();
            const currentStreak = profile.currentStreak || 0;
            const longestStreak = profile.longestStreak || 0;

            // Trouver le prochain palier
            let nextMilestone = null;
            for (const days of Object.keys(StreaksSystem.REWARDS).map(Number).sort((a, b) => a - b)) {
                if (days > currentStreak) {
                    nextMilestone = {
                        days: days,
                        daysLeft: days - currentStreak,
                        reward: StreaksSystem.REWARDS[days]
                    };
                    break;
                }
            }

            return {
                currentStreak,
                longestStreak,
                dailyBonus: StreaksSystem.getDailyBonus(currentStreak),
                nextMilestone,
                flameLevel: StreaksSystem.getFlameLevel(currentStreak)
            };
        } catch (error) {
            console.error('Erreur getStreakInfo:', error);
            return null;
        }
    },

    // Niveau de flamme pour l'affichage
    getFlameLevel: (streak) => {
        if (streak >= 100) return { emoji: '🔥🔥🔥', color: '#ff0000', name: 'Inferno' };
        if (streak >= 30) return { emoji: '🔥🔥', color: '#ff6600', name: 'Brasier' };
        if (streak >= 7) return { emoji: '🔥', color: '#ff9900', name: 'Flamme' };
        if (streak >= 3) return { emoji: '✨', color: '#ffcc00', name: 'Étincelle' };
        return { emoji: '💫', color: '#999', name: 'Début' };
    },

    // Afficher le widget de streak
    renderStreakWidget: (streakInfo) => {
        if (!streakInfo) return '';

        const flame = streakInfo.flameLevel;
        const nextText = streakInfo.nextMilestone 
            ? `Prochain palier dans ${streakInfo.nextMilestone.daysLeft} jour(s)` 
            : 'Maximum atteint !';

        return `
            <div class="streak-widget" style="background: linear-gradient(135deg, ${flame.color}22, ${flame.color}11); border: 2px solid ${flame.color}; border-radius: 15px; padding: 20px; text-align: center;">
                <div class="streak-flame" style="font-size: 3em;">${flame.emoji}</div>
                <div class="streak-count" style="font-size: 2em; font-weight: bold; color: ${flame.color};">${streakInfo.currentStreak} jour${streakInfo.currentStreak > 1 ? 's' : ''}</div>
                <div class="streak-label" style="color: #666; margin-bottom: 10px;">${flame.name}</div>
                <div class="streak-bonus" style="background: ${flame.color}; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block;">
                    +${streakInfo.dailyBonus} XP/jour
                </div>
                <div class="streak-next" style="color: #888; font-size: 0.85em; margin-top: 10px;">${nextText}</div>
                <div class="streak-record" style="color: #aaa; font-size: 0.8em; margin-top: 5px;">Record: ${streakInfo.longestStreak} jours</div>
            </div>
        `;
    }
};

// Export global
window.StreaksSystem = StreaksSystem;
