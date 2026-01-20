// ========== SYSTÈME SOCIAL SUPERQUIZ ===========
// Gestion des amis, défis, feed d'activité et partage

const SocialSystem = {
    // ========== GESTION DES AMIS ==========
    
    // Rechercher un utilisateur par pseudo ou email
    searchUsers: async (query) => {
        if (!query || query.length < 2) return [];
        
        const queryLower = query.toLowerCase();
        const snapshot = await db.collection('profiles').get();
        
        const results = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const pseudo = (data.pseudo || '').toLowerCase();
            const email = (data.email || '').toLowerCase();
            
            if (pseudo.includes(queryLower) || email.includes(queryLower)) {
                // Ne pas inclure l'utilisateur actuel
                if (doc.id !== firebase.auth().currentUser?.uid) {
                    results.push({
                        odexid: doc.id,
                        odexpseudo: data.pseudo || 'Joueur',
                        avatar: data.avatar?.value || data.avatar || '👤',
                        niveau: data.niveau || 1,
                        experiencePoints: data.experiencePoints || 0
                    });
                }
            }
        });
        
        return results.slice(0, 10); // Limiter à 10 résultats
    },
    
    // Envoyer une demande d'ami
    sendFriendRequest: async (targetUserId) => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) throw new Error('Non connecté');
        
        // Vérifier si une demande existe déjà
        const existingRequest = await db.collection('friendRequests')
            .where('from', '==', currentUser.uid)
            .where('to', '==', targetUserId)
            .where('status', '==', 'pending')
            .get();
        
        if (!existingRequest.empty) {
            throw new Error('Demande déjà envoyée');
        }
        
        // Vérifier si déjà amis
        const alreadyFriends = await SocialSystem.areFriends(currentUser.uid, targetUserId);
        if (alreadyFriends) {
            throw new Error('Vous êtes déjà amis');
        }
        
        // Créer la demande
        await db.collection('friendRequests').add({
            from: currentUser.uid,
            to: targetUserId,
            status: 'pending',
            sentAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Créer une notification
        await SocialSystem.createNotification(targetUserId, 'friend_request', {
            fromUserId: currentUser.uid
        });
        
        return { success: true };
    },
    
    // Accepter une demande d'ami
    acceptFriendRequest: async (requestId) => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) throw new Error('Non connecté');
        
        const requestRef = db.collection('friendRequests').doc(requestId);
        const requestDoc = await requestRef.get();
        
        if (!requestDoc.exists) throw new Error('Demande introuvable');
        
        const request = requestDoc.data();
        if (request.to !== currentUser.uid) throw new Error('Non autorisé');
        
        // Mettre à jour le statut
        await requestRef.update({ status: 'accepted' });
        
        // Créer la relation d'amitié bidirectionnelle
        const friendshipData = {
            users: [request.from, request.to],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('friendships').add(friendshipData);
        
        // Notifier l'expéditeur
        await SocialSystem.createNotification(request.from, 'friend_accepted', {
            fromUserId: currentUser.uid
        });
        
        // Ajouter au feed
        await SocialSystem.addToFeed(currentUser.uid, 'new_friend', {
            friendId: request.from
        });
        
        return { success: true };
    },
    
    // Refuser une demande d'ami
    declineFriendRequest: async (requestId) => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) throw new Error('Non connecté');
        
        const requestRef = db.collection('friendRequests').doc(requestId);
        const requestDoc = await requestRef.get();
        
        if (!requestDoc.exists) throw new Error('Demande introuvable');
        if (requestDoc.data().to !== currentUser.uid) throw new Error('Non autorisé');
        
        await requestRef.update({ status: 'declined' });
        
        return { success: true };
    },
    
    // Vérifier si deux utilisateurs sont amis
    areFriends: async (userId1, userId2) => {
        const snapshot = await db.collection('friendships')
            .where('users', 'array-contains', userId1)
            .get();
        
        for (const doc of snapshot.docs) {
            if (doc.data().users.includes(userId2)) {
                return true;
            }
        }
        return false;
    },
    
    // Récupérer la liste d'amis
    getFriends: async (userId = null) => {
        const currentUserId = userId || firebase.auth().currentUser?.uid;
        if (!currentUserId) return [];
        
        const snapshot = await db.collection('friendships')
            .where('users', 'array-contains', currentUserId)
            .get();
        
        const friendIds = [];
        snapshot.forEach(doc => {
            const users = doc.data().users;
            const friendId = users.find(id => id !== currentUserId);
            if (friendId) friendIds.push(friendId);
        });
        
        // Récupérer les profils des amis
        const friends = [];
        for (const friendId of friendIds) {
            const profileDoc = await db.collection('profiles').doc(friendId).get();
            if (profileDoc.exists) {
                const data = profileDoc.data();
                friends.push({
                    odexid: friendId,
                    odexpseudo: data.pseudo || 'Joueur',
                    avatar: data.avatar?.value || data.avatar || '👤',
                    niveau: data.niveau || 1,
                    experiencePoints: data.experiencePoints || 0,
                    lastLogin: data.lastLogin,
                    isOnline: SocialSystem.isRecentlyActive(data.lastLogin)
                });
            }
        }
        
        return friends;
    },
    
    // Récupérer les demandes d'amis en attente
    getPendingRequests: async () => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) return [];
        
        const snapshot = await db.collection('friendRequests')
            .where('to', '==', currentUser.uid)
            .where('status', '==', 'pending')
            .get();
        
        const requests = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const profileDoc = await db.collection('profiles').doc(data.from).get();
            const profile = profileDoc.exists ? profileDoc.data() : {};
            
            requests.push({
                id: doc.id,
                fromUserId: data.from,
                fromPseudo: profile.pseudo || 'Joueur',
                fromAvatar: profile.avatar?.value || profile.avatar || '👤',
                fromNiveau: profile.niveau || 1,
                sentAt: data.sentAt?.toDate() || new Date()
            });
        }
        
        return requests;
    },
    
    // Supprimer un ami
    removeFriend: async (friendId) => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) throw new Error('Non connecté');
        
        const snapshot = await db.collection('friendships')
            .where('users', 'array-contains', currentUser.uid)
            .get();
        
        for (const doc of snapshot.docs) {
            if (doc.data().users.includes(friendId)) {
                await doc.ref.delete();
                return { success: true };
            }
        }
        
        throw new Error('Amitié non trouvée');
    },
    
    // ========== SYSTÈME DE DÉFIS ==========
    
    // Envoyer un défi à un ami
    sendChallenge: async (friendId, quizData) => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) throw new Error('Non connecté');
        
        // Vérifier qu'ils sont amis
        const areFriends = await SocialSystem.areFriends(currentUser.uid, friendId);
        if (!areFriends) throw new Error('Vous devez être amis pour vous défier');
        
        // Récupérer le profil du joueur actuel
        const myProfile = await db.collection('profiles').doc(currentUser.uid).get();
        const myPseudo = myProfile.exists ? myProfile.data().pseudo : 'Joueur';
        
        const challenge = {
            from: currentUser.uid,
            fromPseudo: myPseudo,
            to: friendId,
            quizId: quizData.quizId || null,
            matiere: quizData.matiere,
            categorie: quizData.categorie,
            titre: quizData.titre,
            challengerScore: quizData.score,
            challengerTotal: quizData.total,
            challengerTime: quizData.tempsEnSecondes,
            status: 'pending', // pending, accepted, completed, declined
            challengedScore: null,
            challengedTime: null,
            winner: null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
        };
        
        const docRef = await db.collection('challenges').add(challenge);
        
        // Créer une notification
        await SocialSystem.createNotification(friendId, 'challenge', {
            fromUserId: currentUser.uid,
            fromPseudo: myPseudo,
            challengeId: docRef.id,
            quizTitre: quizData.titre,
            score: quizData.score,
            total: quizData.total
        });
        
        return { success: true, challengeId: docRef.id };
    },
    
    // Récupérer les défis reçus
    getReceivedChallenges: async () => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) return [];
        
        const snapshot = await db.collection('challenges')
            .where('to', '==', currentUser.uid)
            .where('status', '==', 'pending')
            .get();
        
        const challenges = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const profileDoc = await db.collection('profiles').doc(data.from).get();
            const profile = profileDoc.exists ? profileDoc.data() : {};
            
            challenges.push({
                id: doc.id,
                fromUserId: data.from,
                fromPseudo: profile.pseudo || data.fromPseudo || 'Joueur',
                fromAvatar: profile.avatar?.value || profile.avatar || '👤',
                matiere: data.matiere,
                categorie: data.categorie,
                titre: data.titre,
                challengerScore: data.challengerScore,
                challengerTotal: data.challengerTotal,
                challengerTime: data.challengerTime,
                createdAt: data.createdAt?.toDate() || new Date()
            });
        }
        
        return challenges;
    },
    
    // Relever un défi
    acceptChallenge: async (challengeId, myScore, myTime) => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) throw new Error('Non connecté');
        
        const challengeRef = db.collection('challenges').doc(challengeId);
        const challengeDoc = await challengeRef.get();
        
        if (!challengeDoc.exists) throw new Error('Défi introuvable');
        
        const challenge = challengeDoc.data();
        if (challenge.to !== currentUser.uid) throw new Error('Non autorisé');
        
        // Déterminer le gagnant
        let winner = null;
        if (myScore > challenge.challengerScore) {
            winner = currentUser.uid;
        } else if (myScore < challenge.challengerScore) {
            winner = challenge.from;
        } else {
            // Égalité : le plus rapide gagne
            winner = myTime < challenge.challengerTime ? currentUser.uid : challenge.from;
        }
        
        await challengeRef.update({
            status: 'completed',
            challengedScore: myScore,
            challengedTime: myTime,
            winner: winner,
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Notifier le challenger
        const myProfile = await db.collection('profiles').doc(currentUser.uid).get();
        const myPseudo = myProfile.exists ? myProfile.data().pseudo : 'Joueur';
        
        await SocialSystem.createNotification(challenge.from, 'challenge_completed', {
            challengeId: challengeId,
            challengedPseudo: myPseudo,
            challengedScore: myScore,
            winner: winner
        });
        
        // Ajouter au feed
        await SocialSystem.addToFeed(currentUser.uid, 'challenge_completed', {
            challengeId: challengeId,
            opponentId: challenge.from,
            won: winner === currentUser.uid
        });
        
        return { 
            success: true, 
            winner: winner,
            isWinner: winner === currentUser.uid
        };
    },
    
    // ========== FEED D'ACTIVITÉ ==========
    
    // Ajouter une entrée au feed
    addToFeed: async (userId, type, data) => {
        await db.collection('activityFeed').add({
            userId: userId,
            type: type, // quiz_completed, badge_earned, level_up, challenge_completed, new_friend, record_broken
            data: data,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },
    
    // Récupérer le feed d'activité des amis
    getFriendsFeed: async (limit = 20) => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) return [];
        
        // Récupérer la liste des amis
        const friends = await SocialSystem.getFriends();
        const friendIds = friends.map(f => f.odexid);
        
        if (friendIds.length === 0) return [];
        
        // Récupérer les activités des amis
        const snapshot = await db.collection('activityFeed')
            .where('userId', 'in', friendIds.slice(0, 10)) // Firestore limite à 10 éléments dans 'in'
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        
        const activities = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const friend = friends.find(f => f.odexid === data.userId);
            
            activities.push({
                id: doc.id,
                userId: data.userId,
                pseudo: friend?.odexpseudo || 'Joueur',
                avatar: friend?.avatar || '👤',
                type: data.type,
                data: data.data,
                createdAt: data.createdAt?.toDate() || new Date()
            });
        }
        
        return activities;
    },
    
    // Formater une activité pour l'affichage
    formatActivity: (activity) => {
        const { type, data, pseudo } = activity;
        
        switch (type) {
            case 'quiz_completed':
                return `🎯 ${pseudo} a terminé "${data.titre}" : ${data.score}/${data.total}`;
            case 'badge_earned':
                return `⭐ ${pseudo} a débloqué le badge "${data.badgeName}"`;
            case 'level_up':
                return `🏆 ${pseudo} est passé Niveau ${data.newLevel}`;
            case 'challenge_completed':
                return data.won 
                    ? `🔥 ${pseudo} a remporté un défi !`
                    : `💪 ${pseudo} a relevé un défi`;
            case 'new_friend':
                return `🤝 ${pseudo} a un nouvel ami`;
            case 'record_broken':
                return `🔥 ${pseudo} a battu un record sur "${data.quizTitre}"`;
            default:
                return `📌 ${pseudo} a fait quelque chose`;
        }
    },
    
    // ========== NOTIFICATIONS ==========
    
    // Créer une notification
    createNotification: async (userId, type, data) => {
        await db.collection('notifications').add({
            userId: userId,
            type: type,
            data: data,
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },
    
    // Récupérer les notifications
    getNotifications: async (limit = 20) => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) return [];
        
        const snapshot = await db.collection('notifications')
            .where('userId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        
        const notifications = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            notifications.push({
                id: doc.id,
                type: data.type,
                data: data.data,
                read: data.read,
                createdAt: data.createdAt?.toDate() || new Date()
            });
        }
        
        return notifications;
    },
    
    // Marquer une notification comme lue
    markNotificationRead: async (notificationId) => {
        await db.collection('notifications').doc(notificationId).update({
            read: true
        });
    },
    
    // Compter les notifications non lues
    getUnreadNotificationsCount: async () => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) return 0;
        
        const snapshot = await db.collection('notifications')
            .where('userId', '==', currentUser.uid)
            .where('read', '==', false)
            .get();
        
        return snapshot.size;
    },
    
    // ========== PARTAGE DE RÉSULTATS ==========
    
    // Générer une image de partage
    generateShareImage: async (scoreData) => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        // Fond dégradé
        const gradient = ctx.createLinearGradient(0, 0, 600, 400);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 400);
        
        // Bordure intérieure
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, 560, 360);
        
        // Titre
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 SUPERQUIZ', 300, 70);
        
        // Score principal
        ctx.font = 'bold 60px Arial';
        ctx.fillText(`${scoreData.score}/${scoreData.total}`, 300, 160);
        
        // Message
        ctx.font = '24px Arial';
        const message = scoreData.score === scoreData.total 
            ? '✨ Score parfait !' 
            : scoreData.score >= scoreData.total * 0.8 
                ? '🔥 Excellent score !' 
                : 'J\'ai relevé le défi !';
        ctx.fillText(message, 300, 210);
        
        // Thème
        ctx.font = '20px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(`Thème : ${scoreData.titre || scoreData.matiere}`, 300, 260);
        
        // Temps (si disponible)
        if (scoreData.tempsEnSecondes) {
            ctx.fillText(`⏱️ Temps : ${scoreData.tempsEnSecondes} secondes`, 300, 295);
        }
        
        // Call to action
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('Peux-tu faire mieux ?', 300, 340);
        
        // URL
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('▶ superquiz.fr', 300, 370);
        
        return canvas.toDataURL('image/png');
    },
    
    // Partager sur les réseaux sociaux
    shareResult: async (scoreData, platform) => {
        const text = `🎯 J'ai fait ${scoreData.score}/${scoreData.total} au quiz "${scoreData.titre}" sur SuperQuiz ! Peux-tu faire mieux ?`;
        const url = window.location.origin;
        
        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                break;
            case 'copy':
                await navigator.clipboard.writeText(text + ' ' + url);
                return { success: true, message: 'Lien copié !' };
            case 'download':
                const imageUrl = await SocialSystem.generateShareImage(scoreData);
                const link = document.createElement('a');
                link.download = `superquiz-score-${Date.now()}.png`;
                link.href = imageUrl;
                link.click();
                return { success: true, message: 'Image téléchargée !' };
        }
        
        return { success: true };
    },
    
    // ========== UTILITAIRES ==========
    
    // Vérifier si un utilisateur est actif récemment (< 5 minutes)
    isRecentlyActive: (lastLogin) => {
        if (!lastLogin) return false;
        const loginDate = lastLogin.toDate ? lastLogin.toDate() : new Date(lastLogin);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return loginDate > fiveMinutesAgo;
    },
    
    // Enregistrer une activité de quiz (à appeler après chaque quiz)
    recordQuizActivity: async (quizData) => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) return;
        
        // Ajouter au feed d'activité
        await SocialSystem.addToFeed(currentUser.uid, 'quiz_completed', {
            matiere: quizData.matiere,
            categorie: quizData.categorie,
            titre: quizData.titre,
            score: quizData.score,
            total: quizData.total
        });
    },
    
    // Enregistrer un level up
    recordLevelUp: async (newLevel) => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) return;
        
        await SocialSystem.addToFeed(currentUser.uid, 'level_up', {
            newLevel: newLevel
        });
    },
    
    // Enregistrer un badge gagné
    recordBadgeEarned: async (badgeName, badgeIcon) => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) return;
        
        await SocialSystem.addToFeed(currentUser.uid, 'badge_earned', {
            badgeName: badgeName,
            badgeIcon: badgeIcon
        });
    }
};

// Exposer globalement
window.SocialSystem = SocialSystem;
