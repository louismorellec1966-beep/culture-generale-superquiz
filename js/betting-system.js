// ========== SYSTÈME DE PARIS XP ==========
// Parier des points sur ses performances

const BettingSystem = {
    // Multiplicateurs selon le type de pari
    MULTIPLIERS: {
        quiz_complete: { name: 'Finir le quiz', multiplier: 1.5, minCorrect: 1 },
        half_correct: { name: '50% de bonnes réponses', multiplier: 2, minPercent: 50 },
        most_correct: { name: '75% de bonnes réponses', multiplier: 3, minPercent: 75 },
        perfect: { name: 'Score parfait', multiplier: 5, minPercent: 100 },
        speed_demon: { name: 'Terminer en moins de 2min', multiplier: 2.5, maxTime: 120 }
    },

    // Limites de paris
    MIN_BET: 10,
    MAX_BET: 500,
    DAILY_LIMIT: 1000,

    // Vérifier le solde disponible pour parier
    getAvailableBalance: async (userId) => {
        if (!userId) return 0;

        try {
            const profileDoc = await db.collection('profiles').doc(userId).get();
            if (!profileDoc.exists) return 0;

            const profile = profileDoc.data();
            const xp = profile.xp || 0;
            
            // Obtenir les paris du jour
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const betsSnapshot = await db.collection('bets')
                .where('userId', '==', userId)
                .where('createdAt', '>=', today)
                .get();

            let dailyBetTotal = 0;
            betsSnapshot.forEach(doc => {
                dailyBetTotal += doc.data().amount || 0;
            });

            const remainingDaily = BettingSystem.DAILY_LIMIT - dailyBetTotal;
            return Math.min(xp, remainingDaily);
        } catch (error) {
            console.error('Erreur getAvailableBalance:', error);
            return 0;
        }
    },

    // Placer un pari
    placeBet: async (userId, betType, amount, quizConfig) => {
        if (!userId || !betType || !amount) {
            return { success: false, error: 'Paramètres manquants' };
        }

        const multiplierData = BettingSystem.MULTIPLIERS[betType];
        if (!multiplierData) {
            return { success: false, error: 'Type de pari invalide' };
        }

        if (amount < BettingSystem.MIN_BET || amount > BettingSystem.MAX_BET) {
            return { success: false, error: `Mise entre ${BettingSystem.MIN_BET} et ${BettingSystem.MAX_BET} XP` };
        }

        try {
            const available = await BettingSystem.getAvailableBalance(userId);
            if (amount > available) {
                return { success: false, error: 'Solde insuffisant ou limite quotidienne atteinte' };
            }

            // Déduire les XP
            await db.collection('profiles').doc(userId).update({
                xp: firebase.firestore.FieldValue.increment(-amount)
            });

            // Créer le pari
            const betRef = await db.collection('bets').add({
                odlerId: odlerId,
                betType: betType,
                amount: amount,
                multiplier: multiplierData.multiplier,
                potentialWin: Math.floor(amount * multiplierData.multiplier),
                quizConfig: quizConfig || {},
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return {
                success: true,
                betId: betRef.id,
                potentialWin: Math.floor(amount * multiplierData.multiplier),
                multiplier: multiplierData.multiplier
            };
        } catch (error) {
            console.error('Erreur placeBet:', error);
            return { success: false, error: 'Erreur lors du placement du pari' };
        }
    },

    // Résoudre un pari après un quiz
    resolveBet: async (betId, quizResult) => {
        if (!betId || !quizResult) return null;

        try {
            const betDoc = await db.collection('bets').doc(betId).get();
            if (!betDoc.exists) return null;

            const bet = betDoc.data();
            if (bet.status !== 'pending') return null;

            const { correct, total, timeSeconds } = quizResult;
            const percent = Math.round((correct / total) * 100);

            const multiplierData = BettingSystem.MULTIPLIERS[bet.betType];
            let won = false;

            // Vérifier les conditions
            switch (bet.betType) {
                case 'quiz_complete':
                    won = correct >= multiplierData.minCorrect;
                    break;
                case 'half_correct':
                case 'most_correct':
                case 'perfect':
                    won = percent >= multiplierData.minPercent;
                    break;
                case 'speed_demon':
                    won = timeSeconds <= multiplierData.maxTime && correct >= 1;
                    break;
            }

            const winnings = won ? bet.potentialWin : 0;

            // Mettre à jour le pari
            await db.collection('bets').doc(betId).update({
                status: won ? 'won' : 'lost',
                result: { correct, total, percent, timeSeconds },
                winnings: winnings,
                resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Si gagné, créditer les XP
            if (won) {
                await db.collection('profiles').doc(bet.userId).update({
                    xp: firebase.firestore.FieldValue.increment(winnings),
                    'stats.betsWon': firebase.firestore.FieldValue.increment(1),
                    'stats.totalWinnings': firebase.firestore.FieldValue.increment(winnings - bet.amount)
                });

                // Notification
                await db.collection('notifications').add({
                    odlerId: bet.odlerId,
                    type: 'bet_won',
                    title: 'Pari gagné ! 🎉',
                    message: `Tu as gagné ${winnings} XP avec ton pari "${multiplierData.name}" !`,
                    read: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                await db.collection('profiles').doc(bet.userId).update({
                    'stats.betsLost': firebase.firestore.FieldValue.increment(1)
                });
            }

            return {
                won: won,
                winnings: winnings,
                bet: bet
            };
        } catch (error) {
            console.error('Erreur resolveBet:', error);
            return null;
        }
    },

    // Obtenir l'historique des paris
    getBetHistory: async (userId, limit = 20) => {
        if (!userId) return [];

        try {
            const snapshot = await db.collection('bets')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            const bets = [];
            snapshot.forEach(doc => {
                bets.push({ id: doc.id, ...doc.data() });
            });

            return bets;
        } catch (error) {
            console.error('Erreur getBetHistory:', error);
            return [];
        }
    },

    // Statistiques de paris
    getBetStats: async (userId) => {
        if (!userId) return null;

        try {
            const profileDoc = await db.collection('profiles').doc(userId).get();
            if (!profileDoc.exists) return null;

            const stats = profileDoc.data().stats || {};
            const betsWon = stats.betsWon || 0;
            const betsLost = stats.betsLost || 0;
            const totalWinnings = stats.totalWinnings || 0;

            return {
                betsWon,
                betsLost,
                totalBets: betsWon + betsLost,
                winRate: betsWon + betsLost > 0 ? Math.round((betsWon / (betsWon + betsLost)) * 100) : 0,
                totalWinnings,
                netProfit: totalWinnings
            };
        } catch (error) {
            console.error('Erreur getBetStats:', error);
            return null;
        }
    },

    // Interface de pari
    renderBettingUI: async (userId, quizConfig = {}) => {
        const available = await BettingSystem.getAvailableBalance(userId);
        const stats = await BettingSystem.getBetStats(userId);

        let statsHtml = '';
        if (stats) {
            statsHtml = `
                <div class="bet-stats" style="
                    background: var(--bg-secondary);
                    padding: 10px 15px;
                    border-radius: 10px;
                    margin-bottom: 15px;
                    display: flex;
                    justify-content: space-around;
                    font-size: 0.9em;
                ">
                    <span>🎯 Taux: ${stats.winRate}%</span>
                    <span>✅ Gagnés: ${stats.betsWon}</span>
                    <span>💰 Profit: ${stats.totalWinnings > 0 ? '+' : ''}${stats.totalWinnings} XP</span>
                </div>
            `;
        }

        let optionsHtml = '';
        for (const [betType, data] of Object.entries(BettingSystem.MULTIPLIERS)) {
            optionsHtml += `
                <div class="bet-option" style="
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    padding: 15px;
                    margin: 10px 0;
                    cursor: pointer;
                    transition: all 0.2s;
                " onclick="BettingSystem.selectBetType('${betType}')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="bet-name">${data.name}</span>
                        <span class="bet-multiplier" style="
                            background: linear-gradient(135deg, #ffd700, #ff8c00);
                            color: #000;
                            padding: 5px 12px;
                            border-radius: 20px;
                            font-weight: bold;
                        ">x${data.multiplier}</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="betting-panel" style="
                background: var(--bg-primary);
                border: 2px solid var(--accent-color);
                border-radius: 20px;
                padding: 25px;
                max-width: 400px;
                margin: 20px auto;
            ">
                <h3 style="text-align: center; margin-bottom: 20px;">
                    🎰 Parier sur ce Quiz
                </h3>
                
                ${statsHtml}
                
                <div class="available-balance" style="
                    text-align: center;
                    padding: 10px;
                    background: var(--bg-secondary);
                    border-radius: 10px;
                    margin-bottom: 20px;
                ">
                    <span>XP disponibles: </span>
                    <strong style="color: var(--accent-color);">${available} XP</strong>
                </div>

                <div class="bet-amount-input" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px;">Mise:</label>
                    <input type="number" id="betAmount" 
                        min="${BettingSystem.MIN_BET}" 
                        max="${Math.min(BettingSystem.MAX_BET, available)}"
                        value="${Math.min(50, available)}"
                        style="
                            width: 100%;
                            padding: 12px;
                            border-radius: 10px;
                            border: 2px solid var(--border-color);
                            background: var(--bg-secondary);
                            color: var(--text-primary);
                            font-size: 1.1em;
                            text-align: center;
                        "
                    >
                </div>

                <div class="bet-options">
                    <label style="display: block; margin-bottom: 8px;">Type de pari:</label>
                    ${optionsHtml}
                </div>

                <div id="selectedBetInfo" style="
                    text-align: center;
                    padding: 15px;
                    background: var(--accent-light);
                    border-radius: 10px;
                    margin: 20px 0;
                    display: none;
                ">
                    <p>Gain potentiel: <strong id="potentialWin">0</strong> XP</p>
                </div>

                <button onclick="BettingSystem.confirmBet()" style="
                    width: 100%;
                    padding: 15px;
                    background: linear-gradient(135deg, var(--accent-color), #7c4dff);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 1.1em;
                    font-weight: bold;
                    cursor: pointer;
                    transition: transform 0.2s;
                ">
                    Placer le pari 🎲
                </button>

                <p style="text-align: center; margin-top: 15px; font-size: 0.85em; opacity: 0.7;">
                    ⚠️ Limite quotidienne: ${BettingSystem.DAILY_LIMIT} XP
                </p>
            </div>
        `;
    },

    // Sélectionner un type de pari (UI)
    selectedBetType: null,

    selectBetType: (betType) => {
        BettingSystem.selectedBetType = betType;
        
        // Mettre à jour l'UI
        document.querySelectorAll('.bet-option').forEach(el => {
            el.style.borderColor = 'var(--border-color)';
        });
        event.currentTarget.style.borderColor = 'var(--accent-color)';

        // Calculer et afficher le gain potentiel
        const amount = parseInt(document.getElementById('betAmount')?.value || 0);
        const multiplier = BettingSystem.MULTIPLIERS[betType].multiplier;
        const potentialWin = Math.floor(amount * multiplier);

        const infoEl = document.getElementById('selectedBetInfo');
        const winEl = document.getElementById('potentialWin');
        if (infoEl && winEl) {
            infoEl.style.display = 'block';
            winEl.textContent = potentialWin;
        }
    },

    // Confirmer le pari (UI)
    confirmBet: async () => {
        if (!BettingSystem.selectedBetType) {
            alert('Sélectionne un type de pari !');
            return;
        }

        const amount = parseInt(document.getElementById('betAmount')?.value || 0);
        if (amount < BettingSystem.MIN_BET) {
            alert(`Mise minimum: ${BettingSystem.MIN_BET} XP`);
            return;
        }

        const userId = firebase.auth().currentUser?.uid;
        if (!userId) {
            alert('Connecte-toi pour parier !');
            return;
        }

        const result = await BettingSystem.placeBet(userId, BettingSystem.selectedBetType, amount, {});
        
        if (result.success) {
            // Stocker le pari actif
            sessionStorage.setItem('activeBet', JSON.stringify({
                betId: result.betId,
                betType: BettingSystem.selectedBetType,
                amount: amount,
                potentialWin: result.potentialWin
            }));

            alert(`Pari placé ! Gain potentiel: ${result.potentialWin} XP (x${result.multiplier})`);
            
            // Fermer le panel ou lancer le quiz
            if (typeof startQuiz === 'function') {
                startQuiz();
            }
        } else {
            alert(result.error);
        }
    }
};

// Export global
window.BettingSystem = BettingSystem;
