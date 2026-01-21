// ========== SYSTÈME DE RÉCOMPENSES QUOTIDIENNES ==========

const DailyRewards = {
    // Configuration des récompenses par jour de streak
    REWARDS: {
        1: { xp: 50, icone: "🎁", description: "Premier jour !" },
        2: { xp: 100, icone: "🎁", description: "2 jours d'affilée" },
        3: { xp: 150, icone: "🎁", description: "3 jours consécutifs" },
        4: { xp: 200, icone: "🎁", description: "Une semaine commence !" },
        5: { xp: 300, icone: "🎁", description: "5 jours de suite" },
        6: { xp: 400, icone: "🎁", description: "Presque une semaine !" },
        7: { xp: 500, icone: "🎉", badge: "assidu", description: "Une semaine complète !" }
    },

    // Vérifier et afficher la récompense quotidienne
    checkDailyReward: async function() {
        if (typeof firebase === 'undefined' || !firebase.auth().currentUser) {
            return null;
        }

        const userId = firebase.auth().currentUser.uid;
        const today = new Date().toISOString().split('T')[0];

        try {
            const profileRef = firebase.firestore().collection('profiles').doc(userId);
            const profile = await profileRef.get();
            const data = profile.exists ? profile.data() : {};

            const lastRewardDate = data.lastRewardDate || null;
            const currentStreak = data.rewardStreak || 0;

            // Déjà réclamé aujourd'hui
            if (lastRewardDate === today) {
                return { alreadyClaimed: true, streak: currentStreak };
            }

            // Calculer le nouveau streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            let newStreak;
            if (lastRewardDate === yesterdayStr) {
                // Continuation du streak
                newStreak = Math.min(currentStreak + 1, 7);
            } else if (lastRewardDate === null) {
                // Premier jour
                newStreak = 1;
            } else {
                // Streak cassé, on recommence
                newStreak = 1;
            }

            // Récupérer la récompense correspondante
            const reward = this.REWARDS[newStreak] || this.REWARDS[7];

            return {
                canClaim: true,
                streak: newStreak,
                reward: reward,
                previousStreak: currentStreak,
                wasReset: lastRewardDate !== null && lastRewardDate !== yesterdayStr
            };

        } catch (error) {
            console.error('Erreur vérification récompense:', error);
            return null;
        }
    },

    // Réclamer la récompense quotidienne
    claimReward: async function() {
        if (typeof firebase === 'undefined' || !firebase.auth().currentUser) {
            throw new Error('Non connecté');
        }

        const userId = firebase.auth().currentUser.uid;
        const today = new Date().toISOString().split('T')[0];

        const rewardInfo = await this.checkDailyReward();
        if (!rewardInfo || !rewardInfo.canClaim) {
            throw new Error('Récompense déjà réclamée ou non disponible');
        }

        const reward = rewardInfo.reward;
        const newStreak = rewardInfo.streak;

        try {
            const profileRef = firebase.firestore().collection('profiles').doc(userId);
            const profile = await profileRef.get();
            const currentXP = profile.exists ? (profile.data().experiencePoints || 0) : 0;

            // Mettre à jour le profil
            const updateData = {
                lastRewardDate: today,
                rewardStreak: newStreak,
                experiencePoints: currentXP + reward.xp,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Ajouter le badge si jour 7
            if (reward.badge && profile.exists) {
                const currentBadges = profile.data().badges || [];
                if (!currentBadges.includes(reward.badge)) {
                    updateData.badges = firebase.firestore.FieldValue.arrayUnion(reward.badge);
                }
            }

            await profileRef.update(updateData);

            // Recalculer le niveau si nécessaire
            if (typeof XPSystem !== 'undefined') {
                const newLevel = XPSystem.niveauDepuisXP(currentXP + reward.xp);
                const oldLevel = XPSystem.niveauDepuisXP(currentXP);
                if (newLevel > oldLevel) {
                    await profileRef.update({ niveau: newLevel });
                }
            }

            return {
                success: true,
                xpGained: reward.xp,
                newStreak: newStreak,
                badge: reward.badge || null
            };

        } catch (error) {
            console.error('Erreur réclamation récompense:', error);
            throw error;
        }
    },

    // Créer et afficher la modal de récompense
    showRewardModal: async function() {
        const rewardInfo = await this.checkDailyReward();
        
        if (!rewardInfo) return;
        
        // Supprimer l'ancienne modal si elle existe
        const existingModal = document.getElementById('daily-reward-modal');
        if (existingModal) existingModal.remove();

        // Si déjà réclamé, ne pas afficher
        if (rewardInfo.alreadyClaimed) return;

        const reward = rewardInfo.reward;
        const streak = rewardInfo.streak;

        // Générer l'aperçu des prochains jours
        let previewHTML = '';
        for (let i = streak; i <= Math.min(streak + 2, 7); i++) {
            const r = this.REWARDS[i];
            if (r) {
                const isToday = i === streak;
                previewHTML += `
                    <div class="reward-preview-item ${isToday ? 'today' : ''}">
                        <span class="reward-day">Jour ${i}</span>
                        <span class="reward-icon">${r.icone}</span>
                        <span class="reward-xp">+${r.xp} XP</span>
                        ${r.badge ? '<span class="reward-badge">🏅 Badge</span>' : ''}
                    </div>
                `;
            }
        }

        const modalHTML = `
            <div id="daily-reward-modal" class="daily-reward-overlay">
                <div class="daily-reward-container">
                    <div class="daily-reward-header">
                        <span class="reward-big-icon">${reward.icone}</span>
                        <h2>🎁 RÉCOMPENSE QUOTIDIENNE</h2>
                    </div>
                    
                    <div class="daily-reward-content">
                        ${rewardInfo.wasReset ? '<p class="streak-reset">⚠️ Votre série a été réinitialisée</p>' : ''}
                        
                        <div class="streak-info">
                            <span class="streak-fire">🔥</span>
                            <span class="streak-number">Jour ${streak}</span>
                            <span class="streak-text">de votre série !</span>
                        </div>
                        
                        <div class="today-reward">
                            <p>Aujourd'hui :</p>
                            <div class="reward-amount">+${reward.xp} XP</div>
                            ${reward.badge ? '<div class="reward-bonus">+ Badge "Assidu" 🎉</div>' : ''}
                        </div>
                        
                        <div class="reward-preview">
                            <p>Prochaines récompenses :</p>
                            <div class="reward-preview-list">
                                ${previewHTML}
                            </div>
                        </div>
                    </div>
                    
                    <button class="claim-reward-btn" onclick="DailyRewards.claimAndClose()">
                        ✨ Récupérer la récompense
                    </button>
                    
                    <button class="close-reward-btn" onclick="DailyRewards.closeModal()">
                        Plus tard
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Ajouter les styles si pas déjà présents
        if (!document.getElementById('daily-reward-styles')) {
            const styles = document.createElement('style');
            styles.id = 'daily-reward-styles';
            styles.textContent = `
                .daily-reward-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes bounceIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    70% { transform: scale(1.05); }
                    100% { transform: scale(1); opacity: 1; }
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                .daily-reward-container {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    color: white;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    animation: bounceIn 0.5s ease;
                }

                .daily-reward-header {
                    margin-bottom: 20px;
                }

                .reward-big-icon {
                    font-size: 4em;
                    display: block;
                    animation: pulse 1s infinite;
                }

                .daily-reward-header h2 {
                    margin: 10px 0 0 0;
                    font-size: 1.5em;
                }

                .streak-reset {
                    background: rgba(231, 76, 60, 0.3);
                    padding: 10px;
                    border-radius: 10px;
                    margin-bottom: 15px;
                }

                .streak-info {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 15px;
                    border-radius: 15px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .streak-fire {
                    font-size: 2em;
                }

                .streak-number {
                    font-size: 1.8em;
                    font-weight: bold;
                }

                .today-reward {
                    margin-bottom: 20px;
                }

                .today-reward p {
                    margin: 0 0 10px 0;
                    opacity: 0.9;
                }

                .reward-amount {
                    font-size: 2.5em;
                    font-weight: bold;
                    color: #ffd700;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                }

                .reward-bonus {
                    margin-top: 10px;
                    font-size: 1.2em;
                    color: #2ecc71;
                }

                .reward-preview {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 15px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }

                .reward-preview > p {
                    margin: 0 0 10px 0;
                    font-size: 0.9em;
                    opacity: 0.8;
                }

                .reward-preview-list {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                }

                .reward-preview-item {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 10px;
                    border-radius: 10px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    min-width: 80px;
                }

                .reward-preview-item.today {
                    background: rgba(255, 215, 0, 0.3);
                    border: 2px solid #ffd700;
                }

                .reward-day {
                    font-size: 0.8em;
                    opacity: 0.8;
                }

                .reward-icon {
                    font-size: 1.5em;
                }

                .reward-xp {
                    font-weight: bold;
                    color: #ffd700;
                }

                .reward-badge {
                    font-size: 0.7em;
                    color: #2ecc71;
                }

                .claim-reward-btn {
                    background: linear-gradient(135deg, #ffd700, #ffaa00);
                    color: #333;
                    border: none;
                    padding: 15px 40px;
                    font-size: 1.2em;
                    font-weight: bold;
                    border-radius: 30px;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: block;
                    width: 100%;
                    margin-bottom: 10px;
                }

                .claim-reward-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 5px 20px rgba(255, 215, 0, 0.5);
                }

                .close-reward-btn {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    font-size: 0.9em;
                    padding: 10px;
                }

                .close-reward-btn:hover {
                    color: white;
                }
            `;
            document.head.appendChild(styles);
        }
    },

    // Réclamer et fermer
    claimAndClose: async function() {
        const btn = document.querySelector('.claim-reward-btn');
        btn.disabled = true;
        btn.textContent = '⏳ Chargement...';

        try {
            const result = await this.claimReward();
            
            btn.textContent = '✅ Récupéré !';
            btn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';

            // Animation de succès
            setTimeout(() => {
                this.closeModal();
                
                // Notification de succès
                if (result.badge) {
                    alert(`🎉 Félicitations ! Vous avez gagné ${result.xpGained} XP et le badge "Assidu" !`);
                } else {
                    alert(`🎉 +${result.xpGained} XP ajoutés à votre compte !`);
                }

                // Recharger la page pour mettre à jour l'XP affiché
                if (window.location.pathname.includes('Profil')) {
                    location.reload();
                }
            }, 1000);

        } catch (error) {
            btn.textContent = '❌ Erreur';
            btn.disabled = false;
            setTimeout(() => {
                btn.textContent = '✨ Récupérer la récompense';
            }, 2000);
        }
    },

    // Fermer la modal
    closeModal: function() {
        const modal = document.getElementById('daily-reward-modal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        }
    },

    // Initialiser le système (à appeler au chargement de la page)
    init: async function() {
        // Attendre que Firebase soit chargé
        if (typeof firebase === 'undefined') {
            setTimeout(() => this.init(), 500);
            return;
        }

        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                // Petit délai pour laisser la page charger
                setTimeout(() => this.showRewardModal(), 1500);
            }
        });
    }
};

// Exposer globalement
window.DailyRewards = DailyRewards;

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    DailyRewards.init();
});
