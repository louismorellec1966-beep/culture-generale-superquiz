// ========== SYSTÈME DE TOURNOIS HEBDOMADAIRES ==========
// Compétitions avec phases de poules et élimination directe

const TournamentsSystem = {
    // Types de tournois
    TOURNAMENT_TYPES: {
        weekly: { name: 'Tournoi Hebdomadaire', duration: 7, maxParticipants: 64 },
        flash: { name: 'Tournoi Flash', duration: 1, maxParticipants: 16 },
        championship: { name: 'Championnat Mensuel', duration: 30, maxParticipants: 128 }
    },

    // Récompenses par position
    REWARDS: {
        1: { xp: 5000, title: 'champion', badge: '🏆' },
        2: { xp: 2500, title: 'finalist', badge: '🥈' },
        3: { xp: 1500, title: 'semifinalist', badge: '🥉' },
        4: { xp: 1000, badge: '4️⃣' },
        '5-8': { xp: 500, badge: '🎯' },
        '9-16': { xp: 250, badge: '⭐' },
        participant: { xp: 100, badge: '✓' }
    },

    // Créer un nouveau tournoi
    createTournament: async (config) => {
        const {
            name,
            type = 'weekly',
            matiere = null, // null = toutes matières
            difficulty = 'all',
            questionsPerMatch = 10,
            startDate = new Date()
        } = config;

        const typeConfig = TournamentsSystem.TOURNAMENT_TYPES[type];

        try {
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + typeConfig.duration);

            const tournamentRef = await db.collection('tournaments').add({
                name: name,
                type: type,
                matiere: matiere,
                difficulty: difficulty,
                questionsPerMatch: questionsPerMatch,
                maxParticipants: typeConfig.maxParticipants,
                startDate: firebase.firestore.Timestamp.fromDate(startDate),
                endDate: firebase.firestore.Timestamp.fromDate(endDate),
                registrationOpen: true,
                status: 'registration', // registration, groups, knockout, finished
                participants: [],
                groups: [],
                bracket: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, tournamentId: tournamentRef.id };
        } catch (error) {
            console.error('Erreur createTournament:', error);
            return { success: false, error: error.message };
        }
    },

    // S'inscrire à un tournoi
    registerForTournament: async (tournamentId, userId) => {
        if (!tournamentId || !userId) return { success: false, error: 'Paramètres manquants' };

        try {
            const tournamentRef = db.collection('tournaments').doc(tournamentId);
            const tournamentDoc = await tournamentRef.get();

            if (!tournamentDoc.exists) {
                return { success: false, error: 'Tournoi non trouvé' };
            }

            const tournament = tournamentDoc.data();

            if (!tournament.registrationOpen) {
                return { success: false, error: 'Les inscriptions sont fermées' };
            }

            if (tournament.participants.includes(userId)) {
                return { success: false, error: 'Déjà inscrit' };
            }

            if (tournament.participants.length >= tournament.maxParticipants) {
                return { success: false, error: 'Tournoi complet' };
            }

            // Obtenir les infos du joueur
            const profileDoc = await db.collection('profiles').doc(userId).get();
            const profile = profileDoc.data() || {};

            await tournamentRef.update({
                participants: firebase.firestore.FieldValue.arrayUnion(userId),
                [`participantInfo.${userId}`]: {
                    username: profile.username || 'Anonyme',
                    avatar: profile.avatar || '😊',
                    level: profile.level || 1,
                    registeredAt: firebase.firestore.FieldValue.serverTimestamp()
                }
            });

            return { success: true };
        } catch (error) {
            console.error('Erreur registerForTournament:', error);
            return { success: false, error: error.message };
        }
    },

    // Générer les poules
    generateGroups: async (tournamentId) => {
        try {
            const tournamentRef = db.collection('tournaments').doc(tournamentId);
            const tournamentDoc = await tournamentRef.get();
            const tournament = tournamentDoc.data();

            const participants = [...tournament.participants];
            
            // Mélanger les participants
            for (let i = participants.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [participants[i], participants[j]] = [participants[j], participants[i]];
            }

            // Créer les groupes (4 participants par groupe)
            const groupSize = 4;
            const groups = [];
            
            for (let i = 0; i < participants.length; i += groupSize) {
                const groupParticipants = participants.slice(i, i + groupSize);
                groups.push({
                    id: `group_${Math.floor(i / groupSize) + 1}`,
                    name: `Groupe ${String.fromCharCode(65 + Math.floor(i / groupSize))}`,
                    participants: groupParticipants,
                    standings: groupParticipants.map(p => ({
                        odlerId: p,
                        points: 0,
                        wins: 0,
                        losses: 0,
                        questionsCorrect: 0,
                        questionsTotal: 0
                    })),
                    matches: TournamentsSystem.generateGroupMatches(groupParticipants)
                });
            }

            await tournamentRef.update({
                groups: groups,
                status: 'groups',
                registrationOpen: false
            });

            return { success: true, groups };
        } catch (error) {
            console.error('Erreur generateGroups:', error);
            return { success: false, error: error.message };
        }
    },

    // Générer les matchs d'une poule
    generateGroupMatches: (participants) => {
        const matches = [];
        for (let i = 0; i < participants.length; i++) {
            for (let j = i + 1; j < participants.length; j++) {
                matches.push({
                    id: `match_${i}_${j}`,
                    player1: participants[i],
                    player2: participants[j],
                    status: 'pending',
                    player1Score: 0,
                    player2Score: 0,
                    winner: null
                });
            }
        }
        return matches;
    },

    // Soumettre le résultat d'un match
    submitMatchResult: async (tournamentId, groupId, matchId, result) => {
        try {
            const tournamentRef = db.collection('tournaments').doc(tournamentId);
            const tournamentDoc = await tournamentRef.get();
            const tournament = tournamentDoc.data();

            const groups = [...tournament.groups];
            const groupIndex = groups.findIndex(g => g.id === groupId);
            
            if (groupIndex === -1) return { success: false, error: 'Groupe non trouvé' };

            const group = groups[groupIndex];
            const matchIndex = group.matches.findIndex(m => m.id === matchId);
            
            if (matchIndex === -1) return { success: false, error: 'Match non trouvé' };

            const match = group.matches[matchIndex];

            // Mettre à jour le match
            match.player1Score = result.player1Score;
            match.player2Score = result.player2Score;
            match.winner = result.player1Score > result.player2Score ? match.player1 : 
                          result.player2Score > result.player1Score ? match.player2 : 'draw';
            match.status = 'completed';

            // Mettre à jour les standings
            const updateStanding = (playerId, won, score, total) => {
                const standing = group.standings.find(s => s.odlerId === playerId);
                if (standing) {
                    standing.points += won ? 3 : (match.winner === 'draw' ? 1 : 0);
                    standing.wins += won ? 1 : 0;
                    standing.losses += !won && match.winner !== 'draw' ? 1 : 0;
                    standing.questionsCorrect += score;
                    standing.questionsTotal += total;
                }
            };

            updateStanding(match.player1, match.winner === match.player1, result.player1Score, result.total);
            updateStanding(match.player2, match.winner === match.player2, result.player2Score, result.total);

            // Trier les standings
            group.standings.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                return b.questionsCorrect - a.questionsCorrect;
            });

            groups[groupIndex] = group;

            await tournamentRef.update({ groups });

            return { success: true };
        } catch (error) {
            console.error('Erreur submitMatchResult:', error);
            return { success: false, error: error.message };
        }
    },

    // Générer le bracket d'élimination
    generateKnockoutBracket: async (tournamentId) => {
        try {
            const tournamentRef = db.collection('tournaments').doc(tournamentId);
            const tournamentDoc = await tournamentRef.get();
            const tournament = tournamentDoc.data();

            // Obtenir les 2 premiers de chaque groupe
            const qualifiedPlayers = [];
            tournament.groups.forEach(group => {
                qualifiedPlayers.push(group.standings[0]?.odlerId);
                qualifiedPlayers.push(group.standings[1]?.odlerId);
            });

            // Filtrer les null
            const validPlayers = qualifiedPlayers.filter(p => p);

            // Créer le bracket
            const bracket = [];
            const rounds = Math.ceil(Math.log2(validPlayers.length));

            // Premier tour
            const firstRound = [];
            for (let i = 0; i < validPlayers.length; i += 2) {
                firstRound.push({
                    id: `ko_1_${i/2}`,
                    round: 1,
                    player1: validPlayers[i],
                    player2: validPlayers[i + 1] || null,
                    player1Score: 0,
                    player2Score: 0,
                    winner: validPlayers[i + 1] ? null : validPlayers[i], // Bye
                    status: validPlayers[i + 1] ? 'pending' : 'completed'
                });
            }
            bracket.push(firstRound);

            // Tours suivants (vides pour l'instant)
            for (let r = 2; r <= rounds; r++) {
                const roundMatches = [];
                const matchCount = Math.pow(2, rounds - r);
                for (let m = 0; m < matchCount; m++) {
                    roundMatches.push({
                        id: `ko_${r}_${m}`,
                        round: r,
                        player1: null,
                        player2: null,
                        player1Score: 0,
                        player2Score: 0,
                        winner: null,
                        status: 'waiting'
                    });
                }
                bracket.push(roundMatches);
            }

            await tournamentRef.update({
                bracket: bracket,
                status: 'knockout'
            });

            return { success: true, bracket };
        } catch (error) {
            console.error('Erreur generateKnockoutBracket:', error);
            return { success: false, error: error.message };
        }
    },

    // Obtenir les tournois disponibles
    getAvailableTournaments: async () => {
        try {
            const now = new Date();
            const snapshot = await db.collection('tournaments')
                .where('status', 'in', ['registration', 'groups', 'knockout'])
                .where('endDate', '>', firebase.firestore.Timestamp.fromDate(now))
                .orderBy('endDate')
                .limit(10)
                .get();

            const tournaments = [];
            snapshot.forEach(doc => {
                tournaments.push({ id: doc.id, ...doc.data() });
            });

            return tournaments;
        } catch (error) {
            console.error('Erreur getAvailableTournaments:', error);
            return [];
        }
    },

    // Obtenir les détails d'un tournoi
    getTournamentDetails: async (tournamentId) => {
        try {
            const doc = await db.collection('tournaments').doc(tournamentId).get();
            if (!doc.exists) return null;

            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('Erreur getTournamentDetails:', error);
            return null;
        }
    },

    // Obtenir les tournois d'un utilisateur
    getUserTournaments: async (userId) => {
        if (!userId) return [];

        try {
            const snapshot = await db.collection('tournaments')
                .where('participants', 'array-contains', userId)
                .orderBy('startDate', 'desc')
                .limit(20)
                .get();

            const tournaments = [];
            snapshot.forEach(doc => {
                tournaments.push({ id: doc.id, ...doc.data() });
            });

            return tournaments;
        } catch (error) {
            console.error('Erreur getUserTournaments:', error);
            return [];
        }
    },

    // Distribuer les récompenses
    distributeRewards: async (tournamentId) => {
        try {
            const tournamentDoc = await db.collection('tournaments').doc(tournamentId).get();
            const tournament = tournamentDoc.data();

            if (tournament.status !== 'knockout' || tournament.rewardsDistributed) {
                return { success: false, error: 'Tournoi non terminé ou récompenses déjà distribuées' };
            }

            // Trouver le bracket final
            const finalRound = tournament.bracket[tournament.bracket.length - 1];
            const finalMatch = finalRound[0];

            if (!finalMatch.winner) {
                return { success: false, error: 'Finale non terminée' };
            }

            // Position des joueurs
            const positions = {
                1: finalMatch.winner,
                2: finalMatch.player1 === finalMatch.winner ? finalMatch.player2 : finalMatch.player1
            };

            // Trouver les demi-finalistes perdants
            if (tournament.bracket.length >= 2) {
                const semiFinals = tournament.bracket[tournament.bracket.length - 2];
                let pos = 3;
                semiFinals.forEach(match => {
                    if (match.winner && match.winner !== positions[1] && match.winner !== positions[2]) {
                        const loser = match.player1 === match.winner ? match.player2 : match.player1;
                        positions[pos++] = loser;
                    }
                });
            }

            // Distribuer les récompenses
            for (const [position, playerId] of Object.entries(positions)) {
                if (!playerId) continue;

                let rewardKey = position;
                const posNum = parseInt(position);
                if (posNum >= 5 && posNum <= 8) rewardKey = '5-8';
                else if (posNum >= 9 && posNum <= 16) rewardKey = '9-16';
                else if (posNum > 16) rewardKey = 'participant';

                const reward = TournamentsSystem.REWARDS[rewardKey] || TournamentsSystem.REWARDS.participant;

                await db.collection('profiles').doc(playerId).update({
                    xp: firebase.firestore.FieldValue.increment(reward.xp),
                    'stats.tournamentsPlayed': firebase.firestore.FieldValue.increment(1),
                    [`stats.tournamentWins`]: posNum === 1 ? firebase.firestore.FieldValue.increment(1) : firebase.firestore.FieldValue.increment(0)
                });

                await db.collection('notifications').add({
                    odlerId: odlerId,
                    type: 'tournament_reward',
                    title: `${reward.badge} Tournoi terminé !`,
                    message: `Tu as terminé ${posNum === 1 ? '1er' : posNum === 2 ? '2ème' : posNum + 'ème'} et gagné ${reward.xp} XP !`,
                    read: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            await db.collection('tournaments').doc(tournamentId).update({
                status: 'finished',
                rewardsDistributed: true,
                finalPositions: positions
            });

            return { success: true };
        } catch (error) {
            console.error('Erreur distributeRewards:', error);
            return { success: false, error: error.message };
        }
    },

    // Rendu du widget de tournoi
    renderTournamentCard: (tournament, userId = null) => {
        const isRegistered = userId && tournament.participants.includes(userId);
        const participantCount = tournament.participants?.length || 0;
        const maxParticipants = tournament.maxParticipants || 64;
        const progress = Math.round((participantCount / maxParticipants) * 100);

        const statusLabels = {
            registration: '📝 Inscriptions ouvertes',
            groups: '⚔️ Phase de poules',
            knockout: '🏆 Élimination directe',
            finished: '✅ Terminé'
        };

        const endDate = tournament.endDate?.toDate ? tournament.endDate.toDate() : new Date(tournament.endDate);
        const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));

        return `
            <div class="tournament-card" style="
                background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));
                border: 2px solid var(--accent-color);
                border-radius: 16px;
                padding: 20px;
                margin: 15px 0;
            ">
                <div class="tournament-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div>
                        <h3 style="margin: 0; color: var(--accent-color);">🏆 ${tournament.name}</h3>
                        <p style="margin: 5px 0; opacity: 0.8; font-size: 0.9em;">
                            ${tournament.matiere ? `📚 ${tournament.matiere}` : '📚 Toutes matières'} 
                            | ${tournament.difficulty === 'all' ? 'Toutes difficultés' : tournament.difficulty}
                        </p>
                    </div>
                    <span class="tournament-status" style="
                        background: var(--accent-light);
                        padding: 5px 12px;
                        border-radius: 20px;
                        font-size: 0.85em;
                    ">${statusLabels[tournament.status]}</span>
                </div>

                <div class="tournament-progress" style="margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.9em; margin-bottom: 5px;">
                        <span>👥 ${participantCount}/${maxParticipants} participants</span>
                        <span>⏳ ${daysLeft > 0 ? daysLeft + ' jours restants' : 'Terminé'}</span>
                    </div>
                    <div style="background: var(--border-color); border-radius: 10px; height: 8px; overflow: hidden;">
                        <div style="background: var(--accent-color); height: 100%; width: ${progress}%;"></div>
                    </div>
                </div>

                ${tournament.status === 'registration' ? `
                    <button 
                        onclick="TournamentsSystem.registerForTournament('${tournament.id}', firebase.auth().currentUser?.uid).then(r => { if(r.success) location.reload(); else alert(r.error); })"
                        style="
                            width: 100%;
                            padding: 12px;
                            background: ${isRegistered ? 'var(--success-color)' : 'var(--accent-color)'};
                            color: white;
                            border: none;
                            border-radius: 10px;
                            font-weight: bold;
                            cursor: ${isRegistered ? 'default' : 'pointer'};
                        "
                        ${isRegistered ? 'disabled' : ''}
                    >
                        ${isRegistered ? '✅ Inscrit' : '📝 S\'inscrire'}
                    </button>
                ` : `
                    <button 
                        onclick="window.location.href='tournoi.html?id=${tournament.id}'"
                        style="
                            width: 100%;
                            padding: 12px;
                            background: var(--accent-color);
                            color: white;
                            border: none;
                            border-radius: 10px;
                            font-weight: bold;
                            cursor: pointer;
                        "
                    >
                        Voir le tournoi →
                    </button>
                `}
            </div>
        `;
    }
};

// Export global
window.TournamentsSystem = TournamentsSystem;
