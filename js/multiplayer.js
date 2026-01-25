// ========== MULTIPLAYER.JS ==========
// Mode Multijoueur en temps réel avec Firebase Realtime Database
// Système de matchmaking, ELO et duels 1v1

console.log('🎮 Chargement du module Multiplayer...');

// ========== CONFIGURATION ==========
const MULTIPLAYER_CONFIG = {
    // Paramètres de jeu
    DUEL_QUESTIONS: 10,
    QUICK_QUESTIONS: 5,
    DUEL_TIME_PER_QUESTION: 15,
    QUICK_TIME_PER_QUESTION: 10,
    
    // Matchmaking
    MAX_QUEUE_TIME: 30000, // 30 secondes max
    INITIAL_ELO_RANGE: 50,
    ELO_RANGE_INCREASE: 25, // Augmente la recherche toutes les 5 secondes
    ELO_RANGE_MAX: 500,
    
    // Système ELO
    DEFAULT_ELO: 1000,
    K_FACTOR: 32, // Facteur de volatilité ELO
    
    // Vies
    STARTING_LIVES: 3
};

// Définition des rangs
const RANKS = {
    BRONZE: { min: 0, max: 999, name: 'Bronze', icon: '🥉', color: '#cd7f32' },
    SILVER: { min: 1000, max: 1499, name: 'Argent', icon: '🥈', color: '#c0c0c0' },
    GOLD: { min: 1500, max: 1999, name: 'Or', icon: '🥇', color: '#ffd700' },
    PLATINUM: { min: 2000, max: 2499, name: 'Platine', icon: '💎', color: '#e5e4e2' },
    DIAMOND: { min: 2500, max: Infinity, name: 'Diamant', icon: '💠', color: '#b9f2ff' }
};

// ========== ÉTAT DU JEU ==========
let gameState = {
    currentUser: null,
    playerProfile: null,
    matchId: null,
    isHost: false,
    opponent: null,
    questions: [],
    currentQuestionIndex: 0,
    playerScore: 0,
    opponentScore: 0,
    playerLives: MULTIPLAYER_CONFIG.STARTING_LIVES,
    opponentLives: MULTIPLAYER_CONFIG.STARTING_LIVES,
    gameMode: 'duel',
    timer: null,
    safetyTimer: null,
    queueTimer: null,
    matchmakingRef: null,
    matchRef: null,
    isSearching: false,
    hasAnswered: false,
    playerAnswers: [],
    opponentAnswers: {},
    opponentAnsweredCurrent: false,
    questionStartTime: null
};

let lastGameMode = 'duel';

// ========== INITIALISATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📱 Initialisation du mode Multijoueur...');
    
    // Attendre Firebase
    await waitForFirebase();
    
    // Initialiser Realtime Database
    initRealtimeDatabase();
    
    // Vérifier l'authentification
    checkAuth();
});

// Attendre que Firebase soit chargé
function waitForFirebase() {
    return new Promise((resolve) => {
        let resolved = false;
        
        const check = setInterval(() => {
            if (typeof firebase !== 'undefined' && firebase.auth && firebase.firestore) {
                clearInterval(check);
                if (!resolved) {
                    resolved = true;
                    console.log('✅ Firebase prêt pour le multijoueur');
                    resolve();
                }
            }
        }, 100);
        
        setTimeout(() => {
            clearInterval(check);
            if (!resolved) {
                resolved = true;
                console.warn('⚠️ Timeout Firebase - Chargement forcé');
                resolve();
            }
        }, 10000);
    });
}

// Initialiser Realtime Database
function initRealtimeDatabase() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        window.rtdb = firebase.database();
        console.log('✅ Realtime Database initialisé');
    } else {
        console.warn('⚠️ Realtime Database non disponible - Mode simulation activé');
        // Mode simulation pour les tests sans Realtime Database
        window.rtdb = null;
    }
}

// Vérifier l'authentification
function checkAuth() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
        showScreen('login-required');
        return;
    }
    
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            gameState.currentUser = user;
            await loadPlayerProfile();
            showScreen('lobby-screen');
            updateOnlineStatus(true);
            loadLeaderboard('global');
        } else {
            showScreen('login-required');
        }
    });
}

// ========== GESTION DU PROFIL ==========
async function loadPlayerProfile() {
    if (!gameState.currentUser) return;
    
    try {
        const db = firebase.firestore();
        const profileDoc = await db.collection('profiles').doc(gameState.currentUser.uid).get();
        
        if (profileDoc.exists) {
            gameState.playerProfile = profileDoc.data();
        } else {
            // Créer un profil par défaut
            gameState.playerProfile = {
                pseudo: gameState.currentUser.email.split('@')[0],
                avatar: '👤',
                elo: MULTIPLAYER_CONFIG.DEFAULT_ELO,
                multiplayerStats: {
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    totalGames: 0
                }
            };
        }
        
        // S'assurer que les stats multijoueur existent
        if (!gameState.playerProfile.multiplayerStats) {
            gameState.playerProfile.multiplayerStats = {
                wins: 0,
                losses: 0,
                draws: 0,
                totalGames: 0
            };
        }
        
        if (!gameState.playerProfile.elo) {
            gameState.playerProfile.elo = MULTIPLAYER_CONFIG.DEFAULT_ELO;
        }
        
        updatePlayerDisplay();
        
    } catch (error) {
        console.error('Erreur chargement profil:', error);
        gameState.playerProfile = {
            pseudo: 'Joueur',
            avatar: '👤',
            elo: MULTIPLAYER_CONFIG.DEFAULT_ELO,
            multiplayerStats: { wins: 0, losses: 0, draws: 0, totalGames: 0 }
        };
        updatePlayerDisplay();
    }
}

// Mettre à jour l'affichage du joueur
function updatePlayerDisplay() {
    const profile = gameState.playerProfile;
    const rank = getRankFromElo(profile.elo);
    const stats = profile.multiplayerStats || { wins: 0, losses: 0 };
    const totalGames = stats.wins + stats.losses;
    const winrate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
    
    // Lobby
    document.getElementById('player-name').textContent = profile.pseudo || 'Joueur';
    document.getElementById('player-avatar').textContent = profile.avatar || '👤';
    document.getElementById('player-elo').textContent = profile.elo;
    document.getElementById('player-rank').innerHTML = `
        <span class="rank-icon">${rank.icon}</span>
        <span class="rank-name">${rank.name}</span>
    `;
    document.getElementById('wins-count').textContent = stats.wins || 0;
    document.getElementById('losses-count').textContent = stats.losses || 0;
    document.getElementById('winrate').textContent = `${winrate}%`;
    
    // Matchmaking
    document.getElementById('mm-player-name').textContent = profile.pseudo || 'Vous';
    document.getElementById('mm-player-avatar').textContent = profile.avatar || '👤';
    document.getElementById('mm-player-elo').textContent = `${profile.elo} ELO`;
}

// Obtenir le rang depuis l'ELO
function getRankFromElo(elo) {
    for (const rank of Object.values(RANKS)) {
        if (elo >= rank.min && elo <= rank.max) {
            return rank;
        }
    }
    return RANKS.BRONZE;
}

// ========== MATCHMAKING ==========
async function startMatchmaking(mode) {
    if (gameState.isSearching) return;
    
    gameState.gameMode = mode;
    lastGameMode = mode;
    gameState.isSearching = true;
    
    console.log(`🔍 Démarrage matchmaking: ${mode}`);
    
    showScreen('matchmaking-screen');
    startQueueTimer();
    
    if (window.rtdb) {
        // Mode réel avec Firebase Realtime Database
        try {
            await joinMatchmakingQueue();
        } catch (error) {
            console.error('❌ Erreur matchmaking:', error);
            if (error.message && error.message.includes('permission_denied')) {
                handlePermissionError();
            } else {
                // Fallback vers simulation si Firebase échoue
                console.log('⚠️ Fallback vers mode simulation');
                simulateMatchmaking();
            }
        }
    } else {
        // Mode simulation (pour les tests)
        simulateMatchmaking();
    }
}

// Gérer l'erreur de permissions Firebase
function handlePermissionError() {
    gameState.isSearching = false;
    clearInterval(gameState.queueTimer);
    
    showScreen('lobby-screen');
    
    // Afficher un message d'erreur explicatif
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; text-align: center;">
            <h2 style="color: #e74c3c; margin-bottom: 15px;">⚠️ Configuration Firebase requise</h2>
            <p style="color: #2c3e50; margin-bottom: 20px;">
                Le mode multijoueur nécessite une configuration des règles Firebase Realtime Database.
            </p>
            <p style="color: #7f8c8d; font-size: 0.9em; margin-bottom: 20px;">
                Rendez-vous dans la console Firebase → Realtime Database → Règles, et ajoutez les règles de sécurité appropriées.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="this.closest('div').parentElement.remove(); simulateMatchmaking();" 
                        style="padding: 12px 25px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    🎮 Jouer en mode démo
                </button>
                <button onclick="this.closest('div').parentElement.remove();" 
                        style="padding: 12px 25px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Fermer
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Rejoindre la file d'attente
async function joinMatchmakingQueue() {
    const profile = gameState.playerProfile;
    const queueRef = window.rtdb.ref(`matchmaking/${gameState.gameMode}`);
    
    // Données du joueur dans la file
    const playerData = {
        odexid: gameState.currentUser.uid,
        pseudo: profile.pseudo,
        avatar: profile.avatar || '👤',
        elo: profile.elo,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        status: 'searching'
    };
    
    // Ajouter à la file
    gameState.matchmakingRef = queueRef.child(gameState.currentUser.uid);
    
    try {
        await gameState.matchmakingRef.set(playerData);
    } catch (error) {
        throw error; // Propager l'erreur pour la gérer dans startMatchmaking
    }
    
    // Écouter les changements (pour trouver un match)
    gameState.matchmakingRef.on('value', async (snapshot) => {
        const data = snapshot.val();
        if (data && data.matchId) {
            // Match trouvé !
            gameState.matchId = data.matchId;
            gameState.isHost = data.isHost;
            await onMatchFound(data.matchId, data.opponentId);
        }
    });
    
    // Chercher un adversaire
    searchForOpponent();
}

// Chercher un adversaire compatible
async function searchForOpponent() {
    if (!gameState.isSearching || !window.rtdb) return;
    
    const myElo = gameState.playerProfile.elo;
    let eloRange = MULTIPLAYER_CONFIG.INITIAL_ELO_RANGE;
    
    const searchInterval = setInterval(async () => {
        if (!gameState.isSearching) {
            clearInterval(searchInterval);
            return;
        }
        
        // Mise à jour de l'affichage
        document.getElementById('elo-range').textContent = `±${eloRange}`;
        
        // Chercher dans la file
        const queueRef = window.rtdb.ref(`matchmaking/${gameState.gameMode}`);
        const snapshot = await queueRef.once('value');
        const queue = snapshot.val() || {};
        
        for (const [odexid, player] of Object.entries(queue)) {
            if (odexid === gameState.currentUser.uid) continue;
            if (player.status !== 'searching') continue;
            
            // Vérifier la compatibilité ELO
            const eloDiff = Math.abs(player.elo - myElo);
            if (eloDiff <= eloRange) {
                // Adversaire trouvé !
                clearInterval(searchInterval);
                await createMatch(odexid, player);
                return;
            }
        }
        
        // Élargir la recherche
        eloRange = Math.min(eloRange + MULTIPLAYER_CONFIG.ELO_RANGE_INCREASE, MULTIPLAYER_CONFIG.ELO_RANGE_MAX);
        
    }, 2000);
    
    // Timeout
    setTimeout(() => {
        if (gameState.isSearching) {
            clearInterval(searchInterval);
            handleMatchmakingTimeout();
        }
    }, MULTIPLAYER_CONFIG.MAX_QUEUE_TIME);
}

// Créer un match
async function createMatch(opponentId, opponentData) {
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🎮 Création du match: ${matchId}`);
    
    // Charger les questions
    const questions = await loadQuestionsForMatch();
    
    // Créer le match dans la base
    const matchData = {
        id: matchId,
        mode: gameState.gameMode,
        status: 'starting',
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        players: {
            [gameState.currentUser.uid]: {
                odexid: gameState.currentUser.uid,
                pseudo: gameState.playerProfile.pseudo,
                avatar: gameState.playerProfile.avatar,
                elo: gameState.playerProfile.elo,
                score: 0,
                lives: MULTIPLAYER_CONFIG.STARTING_LIVES,
                ready: false
            },
            [opponentId]: {
                odexid: opponentId,
                pseudo: opponentData.pseudo,
                avatar: opponentData.avatar,
                elo: opponentData.elo,
                score: 0,
                lives: MULTIPLAYER_CONFIG.STARTING_LIVES,
                ready: false
            }
        },
        questions: questions,
        currentQuestion: 0,
        answers: {}
    };
    
    // Sauvegarder le match
    await window.rtdb.ref(`matches/${matchId}`).set(matchData);
    
    // Notifier les deux joueurs
    await window.rtdb.ref(`matchmaking/${gameState.gameMode}/${gameState.currentUser.uid}`).update({
        status: 'matched',
        matchId: matchId,
        opponentId: opponentId,
        isHost: true
    });
    
    await window.rtdb.ref(`matchmaking/${gameState.gameMode}/${opponentId}`).update({
        status: 'matched',
        matchId: matchId,
        opponentId: gameState.currentUser.uid,
        isHost: false
    });
}

// Match trouvé
async function onMatchFound(matchId, opponentId) {
    console.log(`✅ Match trouvé: ${matchId}`);
    
    gameState.isSearching = false;
    stopQueueTimer();
    
    // Récupérer les données du match
    const matchSnapshot = await window.rtdb.ref(`matches/${matchId}`).once('value');
    const matchData = matchSnapshot.val();
    
    if (!matchData) {
        console.error('Match non trouvé');
        backToLobby();
        return;
    }
    
    // Stocker les données de l'adversaire
    gameState.opponent = matchData.players[opponentId];
    gameState.questions = matchData.questions || [];
    gameState.matchId = matchId;
    
    // Écouter les changements du match
    setupMatchListeners(matchId);
    
    // Afficher l'écran "adversaire trouvé"
    showOpponentFoundScreen();
}

// Simulation de matchmaking (pour tests)
function simulateMatchmaking() {
    console.log('🤖 Mode simulation du matchmaking');
    
    setTimeout(() => {
        if (!gameState.isSearching) return;
        
        // Simuler un adversaire
        gameState.opponent = {
            odexid: 'bot_' + Date.now(),
            pseudo: 'QuizBot',
            avatar: '🤖',
            elo: gameState.playerProfile.elo + Math.floor(Math.random() * 100) - 50
        };
        
        gameState.isSearching = false;
        stopQueueTimer();
        
        // Charger des questions
        loadQuestionsForMatch().then(questions => {
            gameState.questions = questions;
            showOpponentFoundScreen();
        });
        
    }, Math.random() * 3000 + 2000);
}

// Timer de file d'attente
function startQueueTimer() {
    let seconds = 0;
    gameState.queueTimer = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('queue-timer').textContent = 
            `${mins}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopQueueTimer() {
    if (gameState.queueTimer) {
        clearInterval(gameState.queueTimer);
        gameState.queueTimer = null;
    }
}

// Annuler le matchmaking
function cancelMatchmaking() {
    console.log('❌ Matchmaking annulé');
    
    gameState.isSearching = false;
    stopQueueTimer();
    
    // Supprimer de la file d'attente
    if (gameState.matchmakingRef) {
        gameState.matchmakingRef.off();
        gameState.matchmakingRef.remove();
        gameState.matchmakingRef = null;
    }
    
    showScreen('lobby-screen');
}

// Timeout du matchmaking
function handleMatchmakingTimeout() {
    console.log('⏱️ Timeout matchmaking');
    
    cancelMatchmaking();
    alert('Aucun adversaire trouvé. Réessayez plus tard !');
}

// ========== ÉCRAN ADVERSAIRE TROUVÉ ==========
function showOpponentFoundScreen() {
    const profile = gameState.playerProfile;
    const opponent = gameState.opponent;
    const playerRank = getRankFromElo(profile.elo);
    const opponentRank = getRankFromElo(opponent.elo);
    
    // Joueur
    document.getElementById('vs-player-avatar').textContent = profile.avatar || '👤';
    document.getElementById('vs-player-name').textContent = profile.pseudo || 'Vous';
    document.getElementById('vs-player-rank').textContent = `${playerRank.icon} ${playerRank.name}`;
    document.getElementById('vs-player-elo').textContent = `${profile.elo} ELO`;
    
    // Adversaire
    document.getElementById('vs-opponent-avatar').textContent = opponent.avatar || '👤';
    document.getElementById('vs-opponent-name').textContent = opponent.pseudo || 'Adversaire';
    document.getElementById('vs-opponent-rank').textContent = `${opponentRank.icon} ${opponentRank.name}`;
    document.getElementById('vs-opponent-elo').textContent = `${opponent.elo} ELO`;
    
    // Type de match
    const matchType = gameState.gameMode === 'duel' ? 'Duel 1v1 Classé' : 'Partie Rapide';
    document.getElementById('match-type').textContent = matchType;
    
    showScreen('opponent-found-screen');
    
    // Compte à rebours
    startMatchCountdown();
}

// Compte à rebours avant le match
function startMatchCountdown() {
    let count = 3;
    const countdownEl = document.getElementById('start-countdown');
    
    const countdownInterval = setInterval(() => {
        count--;
        countdownEl.textContent = count;
        
        if (count <= 0) {
            clearInterval(countdownInterval);
            startDuel();
        }
    }, 1000);
}

// ========== LOGIQUE DU DUEL ==========
function startDuel() {
    console.log('⚔️ Début du duel !');
    
    // Réinitialiser l'état
    gameState.currentQuestionIndex = 0;
    gameState.playerScore = 0;
    gameState.opponentScore = 0;
    gameState.playerLives = MULTIPLAYER_CONFIG.STARTING_LIVES;
    gameState.opponentLives = MULTIPLAYER_CONFIG.STARTING_LIVES;
    gameState.playerAnswers = [];
    gameState.opponentAnswers = [];
    
    // Configuration selon le mode
    const totalQuestions = gameState.gameMode === 'duel' 
        ? MULTIPLAYER_CONFIG.DUEL_QUESTIONS 
        : MULTIPLAYER_CONFIG.QUICK_QUESTIONS;
    
    // Mettre à jour l'interface
    document.getElementById('total-questions').textContent = totalQuestions;
    updateDuelHeader();
    
    showScreen('duel-screen');
    showQuestion();
}

// Afficher une question
function showQuestion() {
    const question = gameState.questions[gameState.currentQuestionIndex];
    
    if (!question) {
        console.error('Question non trouvée');
        endDuel();
        return;
    }
    
    // Réinitialiser l'état
    gameState.hasAnswered = false;
    gameState.opponentAnsweredCurrent = false;
    
    // Annuler tous les timers précédents
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    if (gameState.safetyTimer) {
        clearTimeout(gameState.safetyTimer);
        gameState.safetyTimer = null;
    }
    
    console.log(`📝 Question ${gameState.currentQuestionIndex + 1}/${gameState.questions.length}`);
    
    // Mettre à jour l'interface
    document.getElementById('current-question').textContent = gameState.currentQuestionIndex + 1;
    document.getElementById('question-text').textContent = question.question;
    
    // Réinitialiser le statut de l'adversaire
    document.getElementById('opponent-answer-status').textContent = '';
    
    // Mélanger les réponses aléatoirement
    const shuffledAnswers = question.reponses.map((answer, i) => ({ text: answer, originalIndex: i }));
    for (let i = shuffledAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
    }
    // Stocker le mapping pour la validation
    gameState.currentShuffledAnswers = shuffledAnswers;
    
    // Afficher les réponses (SANS classe disabled)
    const answersGrid = document.getElementById('answers-grid');
    answersGrid.innerHTML = shuffledAnswers.map((ans, index) => `
        <button class="answer-btn" onclick="selectAnswer(${index})" data-index="${index}">
            ${ans.text}
        </button>
    `).join('');
    
    // Cacher le feedback
    document.getElementById('answer-feedback').style.display = 'none';
    
    // Mettre à jour la barre de progression
    const progress = ((gameState.currentQuestionIndex) / gameState.questions.length) * 100;
    document.getElementById('question-progress').style.width = `${progress}%`;
    
    // Attendre un court instant puis démarrer le timer (pour éviter les clics accidentels)
    gameState.questionStartTime = Date.now();
    
    // Démarrer le timer après un petit délai
    setTimeout(() => {
        startQuestionTimer();
    }, 300);
    
    // Timeout de sécurité si l'adversaire ne répond pas
    if (window.rtdb && gameState.matchId) {
        const safetyTimeout = (gameState.gameMode === 'duel' 
            ? MULTIPLAYER_CONFIG.DUEL_TIME_PER_QUESTION 
            : MULTIPLAYER_CONFIG.QUICK_TIME_PER_QUESTION) + 10;
        
        gameState.safetyTimer = setTimeout(() => {
            if (gameState.hasAnswered && !gameState.opponentAnsweredCurrent) {
                console.log('⏰ Timeout de sécurité - Adversaire n\'a pas répondu');
                gameState.opponentAnsweredCurrent = true;
                gameState.opponentLives--;
                updateDuelHeader();
                document.getElementById('opponent-answer-status').innerHTML = 
                    `<span style="color: #e74c3c;">⏰ ${gameState.opponent.pseudo} n'a pas répondu</span>`;
                setTimeout(() => nextQuestion(), 1500);
            }
        }, safetyTimeout * 1000);
    }
}

// Timer de question
function startQuestionTimer() {
    // S'assurer qu'aucun timer n'est actif
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    const timeLimit = gameState.gameMode === 'duel' 
        ? MULTIPLAYER_CONFIG.DUEL_TIME_PER_QUESTION 
        : MULTIPLAYER_CONFIG.QUICK_TIME_PER_QUESTION;
    
    let timeLeft = timeLimit;
    const timerEl = document.getElementById('duel-timer');
    
    if (!timerEl) {
        console.error('Element timer non trouvé');
        return;
    }
    
    timerEl.textContent = timeLeft;
    timerEl.classList.remove('warning', 'danger');
    
    gameState.timer = setInterval(() => {
        // Vérifier si on a déjà répondu
        if (gameState.hasAnswered) {
            clearInterval(gameState.timer);
            gameState.timer = null;
            return;
        }
        
        timeLeft--;
        timerEl.textContent = timeLeft;
        
        if (timeLeft <= 5) {
            timerEl.classList.add('danger');
        } else if (timeLeft <= 10) {
            timerEl.classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            clearInterval(gameState.timer);
            gameState.timer = null;
            if (!gameState.hasAnswered) {
                handleTimeout();
            }
        }
    }, 1000);
}

// Sélectionner une réponse
function selectAnswer(index) {
    if (gameState.hasAnswered) return;
    
    gameState.hasAnswered = true;
    clearInterval(gameState.timer);
    
    const question = gameState.questions[gameState.currentQuestionIndex];
    // Trouver l'index original de la réponse sélectionnée via le mapping
    const originalSelectedIndex = gameState.currentShuffledAnswers[index].originalIndex;
    const isCorrect = originalSelectedIndex === question.correct;
    
    // Trouver l'index affiché de la bonne réponse
    const correctDisplayIndex = gameState.currentShuffledAnswers.findIndex(a => a.originalIndex === question.correct);
    const responseTime = Date.now() - gameState.questionStartTime;
    
    // Enregistrer la réponse
    gameState.playerAnswers.push({
        questionIndex: gameState.currentQuestionIndex,
        answer: index,
        correct: isCorrect,
        time: responseTime
    });
    
    // Mettre à jour le score et les vies
    if (isCorrect) {
        gameState.playerScore++;
    } else {
        gameState.playerLives--;
    }
    
    // Afficher le feedback (avec l'index affiché de la bonne réponse)
    showAnswerFeedback(index, isCorrect, correctDisplayIndex);
    
    // Si jeu en temps réel, envoyer au serveur
    if (window.rtdb && gameState.matchId) {
        sendAnswerToServer(index, isCorrect, responseTime);
        // Vérifier si l'adversaire a déjà répondu
        checkBothAnswered();
    }
    
    // Simuler la réponse de l'adversaire (en mode simulation)
    if (!window.rtdb) {
        simulateOpponentAnswer(question.correct);
    }
    
    updateDuelHeader();
}

// Timeout - pas de réponse
function handleTimeout() {
    gameState.hasAnswered = true;
    gameState.playerLives--;
    
    gameState.playerAnswers.push({
        questionIndex: gameState.currentQuestionIndex,
        answer: -1,
        correct: false,
        time: 0
    });
    
    const question = gameState.questions[gameState.currentQuestionIndex];
    // Trouver l'index affiché de la bonne réponse
    const correctDisplayIndex = gameState.currentShuffledAnswers.findIndex(a => a.originalIndex === question.correct);
    showAnswerFeedback(-1, false, correctDisplayIndex);
    
    // Si jeu en temps réel, envoyer le timeout au serveur
    if (window.rtdb && gameState.matchId) {
        sendAnswerToServer(-1, false, 0);
        checkBothAnswered();
    }
    
    if (!window.rtdb) {
        simulateOpponentAnswer(question.correct);
    }
    
    updateDuelHeader();
}

// Simuler la réponse de l'adversaire
function simulateOpponentAnswer(correctAnswer) {
    // L'adversaire a 70% de chance de bien répondre
    const isCorrect = Math.random() < 0.7;
    // Temps de réponse simulé (entre 1s et 8s)
    const responseTime = Math.floor(Math.random() * 7000) + 1000;

    setTimeout(() => {
        if (isCorrect) {
            gameState.opponentScore++;
        } else {
            gameState.opponentLives--;
        }

        // Stocker avec le temps de réponse pour le départage
        gameState.opponentAnswers[gameState.currentQuestionIndex] = {
            questionIndex: gameState.currentQuestionIndex,
            correct: isCorrect,
            time: responseTime
        };

        updateDuelHeader();
        updateOpponentAnswerStatus(isCorrect);

        // Passer à la question suivante après un délai
        setTimeout(() => {
            nextQuestion();
        }, 1500);

    }, Math.random() * 2000 + 500);
}

// Afficher le feedback de réponse
function showAnswerFeedback(selectedIndex, isCorrect, correctIndex) {
    const feedbackEl = document.getElementById('answer-feedback');
    const iconEl = document.getElementById('feedback-icon');
    const textEl = document.getElementById('feedback-text');

    // Récupérer le temps de réponse
    const lastAnswer = gameState.playerAnswers[gameState.playerAnswers.length - 1];
    const responseTime = lastAnswer ? (lastAnswer.time / 1000).toFixed(1) : 0;

    if (isCorrect) {
        iconEl.textContent = '✅';
        // Afficher le temps avec une indication de rapidité
        let speedBonus = '';
        if (responseTime < 3) {
            speedBonus = ' ⚡ Ultra rapide!';
        } else if (responseTime < 5) {
            speedBonus = ' 🚀 Rapide!';
        }
        textEl.innerHTML = `Bonne réponse ! <span style="font-size: 0.85em; opacity: 0.8;">(${responseTime}s)${speedBonus}</span>`;
        textEl.style.color = '#2ecc71';
    } else {
        iconEl.textContent = '❌';
        textEl.textContent = 'Mauvaise réponse !';
        textEl.style.color = '#e74c3c';
    }
    
    // Marquer les boutons
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach((btn, index) => {
        btn.classList.add('disabled');
        if (index === correctIndex) {
            btn.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });
    
    feedbackEl.style.display = 'block';
    document.getElementById('opponent-answer-status').textContent = "En attente de l'adversaire...";
}

// Mettre à jour le statut de réponse de l'adversaire
function updateOpponentAnswerStatus(opponentCorrect) {
    const statusEl = document.getElementById('opponent-answer-status');
    if (opponentCorrect) {
        statusEl.innerHTML = `<span style="color: #2ecc71;">✅ ${gameState.opponent.pseudo} a bien répondu</span>`;
    } else {
        statusEl.innerHTML = `<span style="color: #e74c3c;">❌ ${gameState.opponent.pseudo} s'est trompé</span>`;
    }
}

// Passer à la question suivante
function nextQuestion() {
    document.getElementById('answer-feedback').style.display = 'none';
    
    // Vérifier fin de partie
    if (gameState.playerLives <= 0 || gameState.opponentLives <= 0) {
        endDuel();
        return;
    }
    
    gameState.currentQuestionIndex++;
    
    const totalQuestions = gameState.gameMode === 'duel' 
        ? MULTIPLAYER_CONFIG.DUEL_QUESTIONS 
        : MULTIPLAYER_CONFIG.QUICK_QUESTIONS;
    
    if (gameState.currentQuestionIndex >= totalQuestions || 
        gameState.currentQuestionIndex >= gameState.questions.length) {
        endDuel();
        return;
    }
    
    showQuestion();
}

// Mettre à jour l'en-tête du duel
function updateDuelHeader() {
    const profile = gameState.playerProfile;
    const opponent = gameState.opponent;
    
    // Avatars et noms
    document.getElementById('duel-player-avatar').textContent = profile.avatar || '👤';
    document.getElementById('duel-player-name').textContent = profile.pseudo || 'Vous';
    document.getElementById('duel-opponent-avatar').textContent = opponent.avatar || '👤';
    document.getElementById('duel-opponent-name').textContent = opponent.pseudo || 'Adversaire';
    
    // Scores
    document.getElementById('player-score').textContent = gameState.playerScore;
    document.getElementById('opponent-score').textContent = gameState.opponentScore;
    document.getElementById('score-diff').textContent = 
        `${gameState.playerScore}-${gameState.opponentScore}`;
    
    // Vies
    updateLivesDisplay('player-hearts', gameState.playerLives);
    updateLivesDisplay('opponent-hearts', gameState.opponentLives);
}

// Mettre à jour l'affichage des vies
function updateLivesDisplay(elementId, lives) {
    const container = document.getElementById(elementId);
    let html = '';
    for (let i = 0; i < MULTIPLAYER_CONFIG.STARTING_LIVES; i++) {
        if (i < lives) {
            html += '<span class="heart full">❤️</span>';
        } else {
            html += '<span class="heart empty">🖤</span>';
        }
    }
    container.innerHTML = html;
}

// ========== FIN DU DUEL ==========
function endDuel() {
    console.log('🏁 Fin du duel !');

    clearInterval(gameState.timer);

    // Calculer les temps totaux de réponse (pour départager)
    const playerTotalTime = gameState.playerAnswers
        .filter(a => a.time > 0)
        .reduce((sum, a) => sum + a.time, 0);

    const opponentTotalTime = Object.values(gameState.opponentAnswers)
        .filter(a => a.time > 0)
        .reduce((sum, a) => sum + a.time, 0);

    console.log(`⏱️ Temps total - Joueur: ${playerTotalTime}ms, Adversaire: ${opponentTotalTime}ms`);

    // Déterminer le résultat
    let result;
    let wonBySpeed = false; // Indique si départagé par rapidité

    if (gameState.playerLives <= 0 && gameState.opponentLives > 0) {
        result = 'defeat';
    } else if (gameState.opponentLives <= 0 && gameState.playerLives > 0) {
        result = 'victory';
    } else if (gameState.playerScore > gameState.opponentScore) {
        result = 'victory';
    } else if (gameState.playerScore < gameState.opponentScore) {
        result = 'defeat';
    } else {
        // Égalité de score - Le plus rapide gagne !
        if (playerTotalTime < opponentTotalTime) {
            result = 'victory';
            wonBySpeed = true;
            console.log('🏆 Victoire par rapidité !');
        } else if (playerTotalTime > opponentTotalTime) {
            result = 'defeat';
            wonBySpeed = true;
            console.log('😔 Défaite par rapidité...');
        } else {
            result = 'draw'; // Vraie égalité (très rare)
        }
    }

    // Calculer le changement ELO (seulement pour les parties classées)
    let eloDiff = 0;
    let newElo = gameState.playerProfile.elo;

    if (gameState.gameMode === 'duel') {
        eloDiff = calculateEloChange(
            gameState.playerProfile.elo,
            gameState.opponent.elo,
            result
        );
        newElo = gameState.playerProfile.elo + eloDiff;
    }

    // Afficher les résultats
    showResults(result, eloDiff, newElo, wonBySpeed, playerTotalTime, opponentTotalTime);
    
    // Sauvegarder les stats
    saveMatchResults(result, eloDiff, newElo);
    
    // Nettoyer
    cleanupMatch();
}

// Calculer le changement ELO
function calculateEloChange(playerElo, opponentElo, result) {
    const K = MULTIPLAYER_CONFIG.K_FACTOR;
    const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    
    let actual;
    if (result === 'victory') {
        actual = 1;
    } else if (result === 'defeat') {
        actual = 0;
    } else {
        actual = 0.5;
    }
    
    return Math.round(K * (actual - expected));
}

// Afficher les résultats
function showResults(result, eloDiff, newElo, wonBySpeed = false, playerTime = 0, opponentTime = 0) {
    const profile = gameState.playerProfile;
    const opponent = gameState.opponent;
    const resultBanner = document.getElementById('result-banner');

    // Configuration selon le résultat
    let icon, title, subtitle = '';
    if (result === 'victory') {
        icon = '🏆';
        title = 'Victoire !';
        if (wonBySpeed) {
            subtitle = `⚡ Départagé par rapidité (${(playerTime/1000).toFixed(1)}s vs ${(opponentTime/1000).toFixed(1)}s)`;
        }
        resultBanner.className = 'result-banner victory';
    } else if (result === 'defeat') {
        icon = '😔';
        title = 'Défaite';
        if (wonBySpeed) {
            subtitle = `⚡ Départagé par rapidité (${(playerTime/1000).toFixed(1)}s vs ${(opponentTime/1000).toFixed(1)}s)`;
        }
        resultBanner.className = 'result-banner defeat';
    } else {
        icon = '🤝';
        title = 'Égalité !';
        resultBanner.className = 'result-banner draw';
    }
    
    document.getElementById('result-icon').textContent = icon;
    document.getElementById('result-title').textContent = title;

    // Afficher le sous-titre si départagé par rapidité
    let subtitleEl = document.getElementById('result-subtitle');
    if (!subtitleEl) {
        // Créer l'élément s'il n'existe pas
        subtitleEl = document.createElement('p');
        subtitleEl.id = 'result-subtitle';
        subtitleEl.style.cssText = 'font-size: 0.9em; margin-top: 5px; opacity: 0.9;';
        document.getElementById('result-title').after(subtitleEl);
    }
    subtitleEl.textContent = subtitle;
    subtitleEl.style.display = subtitle ? 'block' : 'none';

    // Scores finaux
    document.getElementById('result-player-avatar').textContent = profile.avatar || '👤';
    document.getElementById('result-player-name').textContent = profile.pseudo || 'Vous';
    document.getElementById('result-player-score').textContent = gameState.playerScore;
    
    document.getElementById('result-opponent-avatar').textContent = opponent.avatar || '👤';
    document.getElementById('result-opponent-name').textContent = opponent.pseudo || 'Adversaire';
    document.getElementById('result-opponent-score').textContent = gameState.opponentScore;
    
    // Changement ELO
    const eloChangeSection = document.getElementById('elo-change-section');
    if (gameState.gameMode === 'duel') {
        eloChangeSection.style.display = 'block';
        const eloDiffEl = document.getElementById('elo-diff');
        eloDiffEl.textContent = eloDiff >= 0 ? `+${eloDiff}` : eloDiff;
        eloDiffEl.className = `elo-value ${eloDiff >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('new-elo').textContent = newElo;
    } else {
        eloChangeSection.style.display = 'none';
    }
    
    // Statistiques du match
    const opponentAnswersArray = Object.values(gameState.opponentAnswers);
    const avgTimePlayer = calculateAverageTime(gameState.playerAnswers);
    const avgTimeOpponent = calculateAverageTime(opponentAnswersArray);
    const correctPlayer = gameState.playerAnswers.filter(a => a.correct).length;
    const correctOpponent = opponentAnswersArray.filter(a => a.correct).length;
    const streakPlayer = calculateBestStreak(gameState.playerAnswers);
    const streakOpponent = calculateBestStreak(opponentAnswersArray);
    
    document.getElementById('stat-correct-you').textContent = correctPlayer;
    document.getElementById('stat-correct-opponent').textContent = correctOpponent;
    document.getElementById('stat-time-you').textContent = `${avgTimePlayer}s`;
    document.getElementById('stat-time-opponent').textContent = `${avgTimeOpponent}s`;
    document.getElementById('stat-streak-you').textContent = streakPlayer;
    document.getElementById('stat-streak-opponent').textContent = streakOpponent;
    
    showScreen('results-screen');
}

// Calculer le temps moyen de réponse
function calculateAverageTime(answers) {
    const validAnswers = answers.filter(a => a.time > 0);
    if (validAnswers.length === 0) return 0;
    const total = validAnswers.reduce((sum, a) => sum + a.time, 0);
    return (total / validAnswers.length / 1000).toFixed(1);
}

// Calculer la meilleure série
function calculateBestStreak(answers) {
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (const answer of answers) {
        if (answer.correct) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    }
    
    return maxStreak;
}

// Sauvegarder les résultats
async function saveMatchResults(result, eloDiff, newElo) {
    if (!gameState.currentUser) return;
    
    try {
        const db = firebase.firestore();
        const profileRef = db.collection('profiles').doc(gameState.currentUser.uid);
        
        // Mettre à jour les stats
        const stats = gameState.playerProfile.multiplayerStats || { wins: 0, losses: 0, draws: 0, totalGames: 0 };
        
        if (result === 'victory') stats.wins++;
        else if (result === 'defeat') stats.losses++;
        else stats.draws++;
        stats.totalGames++;
        
        // Sauvegarder
        await profileRef.update({
            elo: newElo,
            multiplayerStats: stats
        });
        
        // Mettre à jour l'état local
        gameState.playerProfile.elo = newElo;
        gameState.playerProfile.multiplayerStats = stats;
        
        console.log('✅ Résultats sauvegardés');
        
    } catch (error) {
        console.error('Erreur sauvegarde résultats:', error);
    }
}

// Nettoyer le match
function cleanupMatch() {
    // Supprimer les listeners
    if (gameState.matchRef) {
        gameState.matchRef.off();
        gameState.matchRef = null;
    }
    
    if (gameState.matchmakingRef) {
        gameState.matchmakingRef.off();
        gameState.matchmakingRef.remove();
        gameState.matchmakingRef = null;
    }
    
    // Supprimer le match de la base
    if (window.rtdb && gameState.matchId) {
        window.rtdb.ref(`matches/${gameState.matchId}`).remove();
    }
    
    gameState.matchId = null;
    gameState.opponent = null;
    gameState.questions = [];
}

// ========== FIREBASE REALTIME ==========
function setupMatchListeners(matchId) {
    gameState.matchRef = window.rtdb.ref(`matches/${matchId}`);
    
    // Écouter les changements du match
    gameState.matchRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        // Mettre à jour les données
        if (data.status === 'finished') {
            // L'adversaire a terminé
        }
        
        // Récupérer les réponses de l'adversaire
        if (data.answers && data.answers[gameState.opponent.odexid]) {
            handleOpponentAnswers(data.answers[gameState.opponent.odexid]);
        }
    });
    
    // Détecter la déconnexion de l'adversaire
    gameState.matchRef.child(`players/${gameState.opponent.odexid}/connected`).on('value', (snapshot) => {
        if (snapshot.val() === false) {
            handleOpponentDisconnect();
        }
    });
}

// Envoyer une réponse au serveur
async function sendAnswerToServer(answerIndex, isCorrect, responseTime) {
    if (!window.rtdb || !gameState.matchId) return;
    
    const answerData = {
        questionIndex: gameState.currentQuestionIndex,
        answer: answerIndex,
        correct: isCorrect,
        time: responseTime,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    
    await window.rtdb.ref(`matches/${gameState.matchId}/answers/${gameState.currentUser.uid}/${gameState.currentQuestionIndex}`).set(answerData);
}

// Gérer les réponses de l'adversaire
function handleOpponentAnswers(answers) {
    const currentAnswerKey = gameState.currentQuestionIndex.toString();
    
    // Vérifier si l'adversaire a répondu à la question actuelle
    if (answers[currentAnswerKey] && !gameState.opponentAnsweredCurrent) {
        const oppAnswer = answers[currentAnswerKey];
        
        console.log(`📨 Réponse adversaire reçue pour question ${currentAnswerKey}:`, oppAnswer);
        
        if (oppAnswer.correct) {
            gameState.opponentScore++;
        } else {
            gameState.opponentLives--;
        }
        
        gameState.opponentAnswers[currentAnswerKey] = oppAnswer;
        gameState.opponentAnsweredCurrent = true;
        
        updateDuelHeader();
        updateOpponentAnswerStatus(oppAnswer.correct);
        
        // Si les deux ont répondu, passer à la suite
        checkBothAnswered();
    }
}

// Vérifier si les deux joueurs ont répondu
function checkBothAnswered() {
    if (gameState.hasAnswered && gameState.opponentAnsweredCurrent) {
        console.log('✅ Les deux joueurs ont répondu, passage à la question suivante...');
        
        // Annuler le timer de sécurité
        if (gameState.safetyTimer) {
            clearTimeout(gameState.safetyTimer);
            gameState.safetyTimer = null;
        }
        
        setTimeout(() => nextQuestion(), 1500);
    }
}

// Gérer la déconnexion de l'adversaire
function handleOpponentDisconnect() {
    console.log('😔 Adversaire déconnecté');
    
    clearInterval(gameState.timer);
    showScreen('disconnect-screen');
    
    // Victoire par forfait
    if (gameState.gameMode === 'duel') {
        const eloDiff = 15; // Gain réduit pour forfait
        const newElo = gameState.playerProfile.elo + eloDiff;
        saveMatchResults('victory', eloDiff, newElo);
    }
    
    cleanupMatch();
}

// ========== CHARGEMENT DES QUESTIONS ==========
async function loadQuestionsForMatch() {
    const totalQuestions = gameState.gameMode === 'duel'
        ? MULTIPLAYER_CONFIG.DUEL_QUESTIONS
        : MULTIPLAYER_CONFIG.QUICK_QUESTIONS;

    console.log(`🎯 Chargement de ${totalQuestions} questions...`);

    try {
        // Vérifier que Firebase est disponible
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.warn('⚠️ Firebase non disponible');
            return getFallbackQuestions(totalQuestions);
        }

        // Utiliser la variable globale db si disponible, sinon créer une instance
        const database = (typeof db !== 'undefined') ? db : firebase.firestore();

        console.log('📡 Requête Firebase questionBank...');
        const snapshot = await database.collection('questionBank').get();

        if (!snapshot.empty) {
            const allQuestions = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Vérifier que la question a les champs nécessaires
                if (data.question && data.reponses && data.correct !== undefined) {
                    allQuestions.push({
                        id: doc.id,
                        question: data.question,
                        reponses: data.reponses,
                        correct: data.correct,
                        matiere: data.matiere || 'general',
                        categorie: data.categorie || 'general',
                        difficulty: data.difficulty || 'moyen'
                    });
                }
            });

            if (allQuestions.length > 0) {
                console.log(`✅ ${allQuestions.length} questions chargées de toutes les catégories`);
                // Mélanger et prendre le nombre requis
                const selectedQuestions = shuffleArray(allQuestions).slice(0, totalQuestions);
                console.log(`🎲 ${selectedQuestions.length} questions sélectionnées:`,
                    selectedQuestions.map(q => q.matiere).join(', '));
                return selectedQuestions;
            }
        }

        // Fallback : questions de test
        console.log('⚠️ Aucune question valide en base, utilisation des questions de test');
        return getFallbackQuestions(totalQuestions);

    } catch (error) {
        console.error('❌ Erreur chargement questions:', error);
        return getFallbackQuestions(totalQuestions);
    }
}

// Questions de fallback - variées et nombreuses
function getFallbackQuestions(count) {
    const questions = [
        // GÉOGRAPHIE
        { question: "Quelle est la capitale de la France ?", reponses: ["Paris", "Lyon", "Marseille", "Bordeaux"], correct: 0, matiere: "geographie" },
        { question: "Quel est le plus grand océan du monde ?", reponses: ["Atlantique", "Indien", "Arctique", "Pacifique"], correct: 3, matiere: "geographie" },
        { question: "Combien de continents y a-t-il sur Terre ?", reponses: ["5", "6", "7", "8"], correct: 2, matiere: "geographie" },
        { question: "Quel est le plus long fleuve du monde ?", reponses: ["Amazone", "Nil", "Mississippi", "Yangtsé"], correct: 1, matiere: "geographie" },
        { question: "Quelle est la capitale de l'Australie ?", reponses: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correct: 2, matiere: "geographie" },
        { question: "Quel pays a la plus grande population ?", reponses: ["États-Unis", "Inde", "Chine", "Russie"], correct: 2, matiere: "geographie" },
        { question: "Quelle est la plus haute montagne du monde ?", reponses: ["K2", "Mont Blanc", "Everest", "Kilimandjaro"], correct: 2, matiere: "geographie" },
        { question: "Quelle est la capitale du Canada ?", reponses: ["Toronto", "Vancouver", "Montréal", "Ottawa"], correct: 3, matiere: "geographie" },
        { question: "Quel désert est le plus grand du monde ?", reponses: ["Sahara", "Gobi", "Antarctique", "Kalahari"], correct: 2, matiere: "geographie" },
        { question: "Combien d'étoiles y a-t-il sur le drapeau de l'Union Européenne ?", reponses: ["10", "12", "15", "27"], correct: 1, matiere: "geographie" },

        // HISTOIRE
        { question: "En quelle année a eu lieu la Révolution française ?", reponses: ["1789", "1799", "1815", "1848"], correct: 0, matiere: "histoire" },
        { question: "En quelle année l'homme a-t-il marché sur la Lune ?", reponses: ["1965", "1969", "1972", "1975"], correct: 1, matiere: "histoire" },
        { question: "Qui était le premier président des États-Unis ?", reponses: ["Lincoln", "Jefferson", "Washington", "Adams"], correct: 2, matiere: "histoire" },
        { question: "En quelle année a débuté la Seconde Guerre mondiale ?", reponses: ["1937", "1938", "1939", "1940"], correct: 2, matiere: "histoire" },
        { question: "Qui a découvert l'Amérique en 1492 ?", reponses: ["Vasco de Gama", "Christophe Colomb", "Magellan", "Amerigo Vespucci"], correct: 1, matiere: "histoire" },
        { question: "Quel pharaon est associé à la grande pyramide de Gizeh ?", reponses: ["Toutânkhamon", "Ramsès II", "Khéops", "Cléopâtre"], correct: 2, matiere: "histoire" },
        { question: "En quelle année le mur de Berlin est-il tombé ?", reponses: ["1987", "1989", "1991", "1993"], correct: 1, matiere: "histoire" },
        { question: "Qui était le roi de France pendant la Révolution ?", reponses: ["Louis XIV", "Louis XV", "Louis XVI", "Louis XVIII"], correct: 2, matiere: "histoire" },

        // SCIENCE
        { question: "Quelle planète est surnommée la 'planète rouge' ?", reponses: ["Vénus", "Mars", "Jupiter", "Saturne"], correct: 1, matiere: "science" },
        { question: "Quel est le symbole chimique de l'or ?", reponses: ["Or", "Ag", "Au", "Fe"], correct: 2, matiere: "science" },
        { question: "Qui a découvert la pénicilline ?", reponses: ["Louis Pasteur", "Alexander Fleming", "Marie Curie", "Robert Koch"], correct: 1, matiere: "science" },
        { question: "Combien de planètes y a-t-il dans notre système solaire ?", reponses: ["7", "8", "9", "10"], correct: 1, matiere: "science" },
        { question: "Quel gaz les plantes absorbent-elles ?", reponses: ["Oxygène", "Azote", "Dioxyde de carbone", "Hydrogène"], correct: 2, matiere: "science" },
        { question: "Quelle est la formule chimique de l'eau ?", reponses: ["H2O", "CO2", "O2", "NaCl"], correct: 0, matiere: "science" },
        { question: "Qui a développé la théorie de la relativité ?", reponses: ["Newton", "Einstein", "Hawking", "Bohr"], correct: 1, matiere: "science" },
        { question: "Quel organe pompe le sang dans le corps ?", reponses: ["Poumons", "Foie", "Cœur", "Reins"], correct: 2, matiere: "science" },
        { question: "Combien d'os compte le corps humain adulte ?", reponses: ["186", "206", "226", "256"], correct: 1, matiere: "science" },

        // LITTÉRATURE
        { question: "Qui a écrit 'Les Misérables' ?", reponses: ["Émile Zola", "Victor Hugo", "Gustave Flaubert", "Honoré de Balzac"], correct: 1, matiere: "litterature" },
        { question: "Qui a écrit 'Le Petit Prince' ?", reponses: ["Jules Verne", "Albert Camus", "Antoine de Saint-Exupéry", "Marcel Proust"], correct: 2, matiere: "litterature" },
        { question: "Quel auteur a créé Sherlock Holmes ?", reponses: ["Agatha Christie", "Arthur Conan Doyle", "Edgar Allan Poe", "Charles Dickens"], correct: 1, matiere: "litterature" },
        { question: "Qui a écrit 'Roméo et Juliette' ?", reponses: ["Molière", "Shakespeare", "Racine", "Corneille"], correct: 1, matiere: "litterature" },

        // ART
        { question: "Qui a peint la Joconde ?", reponses: ["Michel-Ange", "Léonard de Vinci", "Raphaël", "Donatello"], correct: 1, matiere: "art" },
        { question: "Qui a peint 'La Nuit étoilée' ?", reponses: ["Monet", "Picasso", "Van Gogh", "Renoir"], correct: 2, matiere: "art" },
        { question: "Dans quel musée se trouve la Joconde ?", reponses: ["British Museum", "Louvre", "Prado", "Uffizi"], correct: 1, matiere: "art" },
        { question: "Quel artiste a créé la statue de David à Florence ?", reponses: ["Donatello", "Michel-Ange", "Bernin", "Rodin"], correct: 1, matiere: "art" },

        // SPORT
        { question: "Combien de joueurs y a-t-il dans une équipe de football ?", reponses: ["9", "10", "11", "12"], correct: 2, matiere: "sport" },
        { question: "Dans quel pays les Jeux Olympiques modernes ont-ils été créés ?", reponses: ["Italie", "France", "Grèce", "Angleterre"], correct: 2, matiere: "sport" },
        { question: "Combien de sets faut-il gagner pour remporter un match de tennis masculin en Grand Chelem ?", reponses: ["2", "3", "4", "5"], correct: 1, matiere: "sport" },
        { question: "Quel pays a remporté la Coupe du Monde 2018 ?", reponses: ["Brésil", "Allemagne", "France", "Argentine"], correct: 2, matiere: "sport" },

        // CULTURE GÉNÉRALE
        { question: "Quelle est la monnaie du Japon ?", reponses: ["Yuan", "Won", "Yen", "Ringgit"], correct: 2, matiere: "culture" },
        { question: "Combien y a-t-il de couleurs dans un arc-en-ciel ?", reponses: ["5", "6", "7", "8"], correct: 2, matiere: "culture" },
        { question: "Quel animal est le symbole de la paix ?", reponses: ["Aigle", "Colombe", "Lion", "Chouette"], correct: 1, matiere: "culture" },
        { question: "Combien de jours y a-t-il dans une année bissextile ?", reponses: ["364", "365", "366", "367"], correct: 2, matiere: "culture" },
        { question: "Quel instrument a 88 touches ?", reponses: ["Guitare", "Violon", "Piano", "Harpe"], correct: 2, matiere: "culture" },
        { question: "Quelle est la langue la plus parlée au monde ?", reponses: ["Anglais", "Espagnol", "Mandarin", "Hindi"], correct: 2, matiere: "culture" },

        // CINÉMA
        { question: "Qui a réalisé 'Titanic' ?", reponses: ["Steven Spielberg", "James Cameron", "Martin Scorsese", "Christopher Nolan"], correct: 1, matiere: "cinema" },
        { question: "Quel acteur joue Jack Sparrow ?", reponses: ["Brad Pitt", "Johnny Depp", "Leonardo DiCaprio", "Tom Cruise"], correct: 1, matiere: "cinema" },
        { question: "En quelle année est sorti le premier film 'Star Wars' ?", reponses: ["1975", "1977", "1979", "1981"], correct: 1, matiere: "cinema" }
    ];

    console.log(`🎲 Sélection de ${count} questions parmi ${questions.length} disponibles`);
    return shuffleArray(questions).slice(0, count);
}

// Mélanger un tableau
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ========== CLASSEMENT ==========
async function loadLeaderboard(type) {
    const container = document.getElementById('leaderboard-list');
    container.innerHTML = '<div class="loading-spinner">Chargement...</div>';
    
    try {
        const db = firebase.firestore();
        let query = db.collection('profiles')
            .orderBy('elo', 'desc')
            .limit(20);
        
        const snapshot = await query.get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">Aucun joueur classé pour le moment.</p>';
            return;
        }
        
        let html = '';
        let rank = 1;
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            const playerRank = getRankFromElo(data.elo || 1000);
            const isCurrentUser = doc.id === gameState.currentUser?.uid;
            
            let rankClass = '';
            if (rank === 1) rankClass = 'top-1';
            else if (rank === 2) rankClass = 'top-2';
            else if (rank === 3) rankClass = 'top-3';
            if (isCurrentUser) rankClass += ' self';
            
            let rankDisplay = rank;
            if (rank === 1) rankDisplay = '🥇';
            else if (rank === 2) rankDisplay = '🥈';
            else if (rank === 3) rankDisplay = '🥉';
            
            html += `
                <div class="leaderboard-item ${rankClass}">
                    <div class="lb-rank">${rankDisplay}</div>
                    <div class="lb-avatar">${data.avatar || '👤'}</div>
                    <div class="lb-info">
                        <div class="lb-name">${data.pseudo || 'Joueur'}</div>
                        <div class="lb-rank-badge">${playerRank.icon} ${playerRank.name}</div>
                    </div>
                    <div class="lb-elo">${data.elo || 1000}</div>
                </div>
            `;
            
            rank++;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Erreur chargement classement:', error);
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: #e74c3c;">Erreur de chargement</p>';
    }
}

function switchLeaderboard(type) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadLeaderboard(type);
}

// ========== PRÉSENCE EN LIGNE ==========
function updateOnlineStatus(isOnline) {
    if (!window.rtdb || !gameState.currentUser) return;
    
    const presenceRef = window.rtdb.ref(`presence/${gameState.currentUser.uid}`);
    
    if (isOnline) {
        presenceRef.set({
            odexid: gameState.currentUser.uid,
            lastSeen: firebase.database.ServerValue.TIMESTAMP,
            online: true
        });
        
        // Supprimer la présence à la déconnexion
        presenceRef.onDisconnect().remove();
    } else {
        presenceRef.remove();
    }
    
    // Compter les joueurs en ligne
    updateOnlineCount();
}

async function updateOnlineCount() {
    if (!window.rtdb) {
        document.getElementById('online-count').textContent = '1';
        return;
    }
    
    try {
        const snapshot = await window.rtdb.ref('presence').once('value');
        const count = snapshot.numChildren();
        document.getElementById('online-count').textContent = count;
    } catch (error) {
        document.getElementById('online-count').textContent = '?';
    }
}

// Mettre à jour le compteur périodiquement
setInterval(updateOnlineCount, 30000);

// ========== NAVIGATION ==========
function showScreen(screenId) {
    const screens = [
        'login-required',
        'lobby-screen',
        'matchmaking-screen',
        'opponent-found-screen',
        'duel-screen',
        'results-screen',
        'disconnect-screen'
    ];
    
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = id === screenId ? 'block' : 'none';
        }
    });
}

function backToLobby() {
    cleanupMatch();
    loadPlayerProfile();
    loadLeaderboard('global');
    showScreen('lobby-screen');
}

// ========== NETTOYAGE À LA FERMETURE ==========
window.addEventListener('beforeunload', () => {
    updateOnlineStatus(false);
    cleanupMatch();
});

// ========== EXPORTS GLOBAUX ==========
window.startMatchmaking = startMatchmaking;
window.cancelMatchmaking = cancelMatchmaking;
window.selectAnswer = selectAnswer;
window.backToLobby = backToLobby;
window.switchLeaderboard = switchLeaderboard;

console.log('✅ Module Multiplayer chargé');