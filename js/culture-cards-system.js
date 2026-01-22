// ========== SYSTÈME DE FICHES CULTURE ==========
// Mini-articles explicatifs après chaque question

const CultureCardsSystem = {
    // Catégories de fiches
    CATEGORIES: {
        histoire: { emoji: '📜', color: '#795548' },
        geographie: { emoji: '🌍', color: '#4caf50' },
        science: { emoji: '🔬', color: '#2196f3' },
        litterature: { emoji: '📚', color: '#9c27b0' },
        art: { emoji: '🎨', color: '#e91e63' },
        musique: { emoji: '🎵', color: '#ff9800' },
        cinema: { emoji: '🎬', color: '#f44336' },
        sport: { emoji: '⚽', color: '#00bcd4' },
        gastronomie: { emoji: '🍳', color: '#ff5722' },
        philosophie: { emoji: '💭', color: '#607d8b' }
    },

    // Obtenir une fiche pour une question
    getCardForQuestion: async (questionId) => {
        if (!questionId) return null;

        try {
            const cardDoc = await db.collection('cultureCards').doc(questionId).get();
            if (cardDoc.exists) {
                return { id: cardDoc.id, ...cardDoc.data() };
            }
            return null;
        } catch (error) {
            console.error('Erreur getCardForQuestion:', error);
            return null;
        }
    },

    // Créer ou mettre à jour une fiche
    saveCard: async (questionId, cardData) => {
        if (!questionId) return false;

        try {
            await db.collection('cultureCards').doc(questionId).set({
                ...cardData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            return true;
        } catch (error) {
            console.error('Erreur saveCard:', error);
            return false;
        }
    },

    // Marquer une fiche comme lue par un utilisateur
    markAsRead: async (userId, cardId) => {
        if (!userId || !cardId) return false;

        try {
            await db.collection('profiles').doc(userId).update({
                readCards: firebase.firestore.FieldValue.arrayUnion(cardId)
            });
            return true;
        } catch (error) {
            console.error('Erreur markAsRead:', error);
            return false;
        }
    },

    // Sauvegarder une fiche en favoris
    saveToFavorites: async (userId, cardId) => {
        if (!userId || !cardId) return { success: false };

        try {
            await db.collection('profiles').doc(userId).update({
                favoriteCards: firebase.firestore.FieldValue.arrayUnion(cardId)
            });
            return { success: true };
        } catch (error) {
            console.error('Erreur saveToFavorites:', error);
            return { success: false, error: error.message };
        }
    },

    // Retirer des favoris
    removeFromFavorites: async (userId, cardId) => {
        if (!userId || !cardId) return { success: false };

        try {
            await db.collection('profiles').doc(userId).update({
                favoriteCards: firebase.firestore.FieldValue.arrayRemove(cardId)
            });
            return { success: true };
        } catch (error) {
            console.error('Erreur removeFromFavorites:', error);
            return { success: false, error: error.message };
        }
    },

    // Obtenir les fiches favorites d'un utilisateur
    getFavoriteCards: async (userId) => {
        if (!userId) return [];

        try {
            const profileDoc = await db.collection('profiles').doc(userId).get();
            if (!profileDoc.exists) return [];

            const favoriteIds = profileDoc.data().favoriteCards || [];
            if (favoriteIds.length === 0) return [];

            // Récupérer les fiches (par batch de 10 max pour Firestore)
            const cards = [];
            const chunks = [];
            for (let i = 0; i < favoriteIds.length; i += 10) {
                chunks.push(favoriteIds.slice(i, i + 10));
            }

            for (const chunk of chunks) {
                const snapshot = await db.collection('cultureCards')
                    .where(firebase.firestore.FieldPath.documentId(), 'in', chunk)
                    .get();
                
                snapshot.forEach(doc => {
                    cards.push({ id: doc.id, ...doc.data() });
                });
            }

            return cards;
        } catch (error) {
            console.error('Erreur getFavoriteCards:', error);
            return [];
        }
    },

    // Obtenir des fiches aléatoires pour découverte
    getRandomCards: async (count = 5, matiere = null) => {
        try {
            let query = db.collection('cultureCards');
            
            if (matiere) {
                query = query.where('matiere', '==', matiere);
            }

            // Obtenir un échantillon aléatoire (simplifié)
            const snapshot = await query.limit(50).get();
            
            const cards = [];
            snapshot.forEach(doc => {
                cards.push({ id: doc.id, ...doc.data() });
            });

            // Mélanger et prendre les premiers
            for (let i = cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cards[i], cards[j]] = [cards[j], cards[i]];
            }

            return cards.slice(0, count);
        } catch (error) {
            console.error('Erreur getRandomCards:', error);
            return [];
        }
    },

    // Rendu d'une fiche culture complète
    renderFullCard: (card, options = {}) => {
        if (!card) return '';

        const { showActions = true, userId = null, isFavorite = false } = options;
        const categoryInfo = CultureCardsSystem.CATEGORIES[card.matiere] || { emoji: '📖', color: '#5e35b1' };

        let sourcesHtml = '';
        if (card.sources && card.sources.length > 0) {
            sourcesHtml = `
                <div class="card-sources" style="
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid var(--border-color, #ddd);
                    font-size: 0.85em;
                    opacity: 0.7;
                ">
                    <strong>Sources:</strong>
                    <ul style="margin: 5px 0 0; padding-left: 20px;">
                        ${card.sources.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.title}</a></li>`).join('')}
                    </ul>
                </div>
            `;
        }

        let relatedHtml = '';
        if (card.relatedTopics && card.relatedTopics.length > 0) {
            relatedHtml = `
                <div class="related-topics" style="
                    margin-top: 15px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                ">
                    ${card.relatedTopics.map(topic => `
                        <span style="
                            background: ${categoryInfo.color}22;
                            color: ${categoryInfo.color};
                            padding: 5px 12px;
                            border-radius: 20px;
                            font-size: 0.85em;
                        ">${topic}</span>
                    `).join('')}
                </div>
            `;
        }

        let actionsHtml = '';
        if (showActions && userId) {
            actionsHtml = `
                <div class="card-actions" style="
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid var(--border-color, #ddd);
                ">
                    <button 
                        onclick="CultureCardsSystem.${isFavorite ? 'removeFromFavorites' : 'saveToFavorites'}('${userId}', '${card.id}').then(() => this.innerHTML = '${isFavorite ? '⭐ Ajouter aux favoris' : '✅ En favoris'}')"
                        style="
                            flex: 1;
                            padding: 10px;
                            background: ${isFavorite ? 'var(--warning-color, #ffc107)' : 'var(--bg-secondary, #f8f9fa)'};
                            border: 2px solid var(--border-color, #ddd);
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                        "
                    >
                        ${isFavorite ? '❌ Retirer des favoris' : '⭐ Ajouter aux favoris'}
                    </button>
                    <button 
                        onclick="navigator.share ? navigator.share({title: '${card.title}', url: location.href}) : alert('Partage non supporté')"
                        style="
                            padding: 10px 20px;
                            background: var(--bg-secondary, #f8f9fa);
                            border: 2px solid var(--border-color, #ddd);
                            border-radius: 8px;
                            cursor: pointer;
                        "
                    >
                        📤 Partager
                    </button>
                </div>
            `;
        }

        return `
            <div class="culture-card-full" style="
                background: var(--bg-card, #fff);
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                margin: 20px 0;
            ">
                <div class="card-header" style="
                    background: linear-gradient(135deg, ${categoryInfo.color}, ${categoryInfo.color}aa);
                    color: white;
                    padding: 25px;
                ">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 2em;">${categoryInfo.emoji}</span>
                        <span style="
                            background: rgba(255,255,255,0.2);
                            padding: 5px 12px;
                            border-radius: 20px;
                            font-size: 0.9em;
                        ">${card.matiere}</span>
                        ${card.difficulty ? `
                            <span style="
                                background: rgba(255,255,255,0.2);
                                padding: 5px 12px;
                                border-radius: 20px;
                                font-size: 0.9em;
                            ">${card.difficulty}</span>
                        ` : ''}
                    </div>
                    <h2 style="margin: 0; font-size: 1.5em;">${card.title}</h2>
                </div>

                <div class="card-content" style="padding: 25px;">
                    ${card.summary ? `
                        <div class="card-summary" style="
                            background: ${categoryInfo.color}11;
                            border-left: 4px solid ${categoryInfo.color};
                            padding: 15px;
                            margin-bottom: 20px;
                            font-style: italic;
                        ">
                            ${card.summary}
                        </div>
                    ` : ''}

                    <div class="card-body" style="line-height: 1.7;">
                        ${card.content || ''}
                    </div>

                    ${card.keyFacts && card.keyFacts.length > 0 ? `
                        <div class="key-facts" style="
                            background: var(--bg-secondary, #f8f9fa);
                            border-radius: 12px;
                            padding: 20px;
                            margin-top: 20px;
                        ">
                            <h4 style="margin: 0 0 15px; color: ${categoryInfo.color};">
                                📌 Points clés à retenir
                            </h4>
                            <ul style="margin: 0; padding-left: 20px;">
                                ${card.keyFacts.map(fact => `<li style="margin-bottom: 8px;">${fact}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${card.funFact ? `
                        <div class="fun-fact" style="
                            background: linear-gradient(135deg, #ffd70022, #ff980022);
                            border: 2px dashed #ffc107;
                            border-radius: 12px;
                            padding: 15px;
                            margin-top: 20px;
                        ">
                            <strong>💡 Le savais-tu ?</strong>
                            <p style="margin: 10px 0 0;">${card.funFact}</p>
                        </div>
                    ` : ''}

                    ${relatedHtml}
                    ${sourcesHtml}
                    ${actionsHtml}
                </div>
            </div>
        `;
    },

    // Rendu d'une mini fiche (après réponse à une question)
    renderMiniCard: (card, isCorrect = true) => {
        if (!card) return '';

        const categoryInfo = CultureCardsSystem.CATEGORIES[card.matiere] || { emoji: '📖', color: '#5e35b1' };
        const borderColor = isCorrect ? 'var(--success-color, #28a745)' : 'var(--error-color, #dc3545)';

        return `
            <div class="culture-card-mini" style="
                background: var(--bg-card, #fff);
                border: 2px solid ${borderColor};
                border-radius: 12px;
                padding: 20px;
                margin: 15px 0;
                animation: slideIn 0.3s ease;
            ">
                <div class="mini-header" style="
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 15px;
                ">
                    <span style="font-size: 1.5em;">${categoryInfo.emoji}</span>
                    <h4 style="margin: 0; flex: 1; color: ${categoryInfo.color};">
                        ${card.title || 'En savoir plus'}
                    </h4>
                    <span style="font-size: 1.5em;">${isCorrect ? '✅' : '📚'}</span>
                </div>

                ${card.summary ? `
                    <p style="margin: 0 0 15px; line-height: 1.6;">
                        ${card.summary}
                    </p>
                ` : ''}

                ${card.funFact ? `
                    <div style="
                        background: #ffc10722;
                        padding: 10px 15px;
                        border-radius: 8px;
                        font-size: 0.9em;
                    ">
                        💡 <strong>Le savais-tu ?</strong> ${card.funFact}
                    </div>
                ` : ''}

                ${card.content && card.content.length > 200 ? `
                    <button onclick="this.parentElement.classList.toggle('expanded')" style="
                        margin-top: 15px;
                        padding: 8px 16px;
                        background: ${categoryInfo.color}22;
                        border: 1px solid ${categoryInfo.color};
                        border-radius: 20px;
                        color: ${categoryInfo.color};
                        cursor: pointer;
                        font-size: 0.9em;
                    ">
                        📖 Lire la fiche complète
                    </button>
                ` : ''}
            </div>

            <style>
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
        `;
    },

    // Rendu d'une carte dans une liste
    renderCardListItem: (card) => {
        if (!card) return '';

        const categoryInfo = CultureCardsSystem.CATEGORIES[card.matiere] || { emoji: '📖', color: '#5e35b1' };

        return `
            <div class="card-list-item" onclick="window.location.href='fiche.html?id=${card.id}'" style="
                background: var(--bg-card, #fff);
                border-radius: 12px;
                padding: 15px;
                margin: 10px 0;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 15px;
                transition: transform 0.2s, box-shadow 0.2s;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            " onmouseover="this.style.transform='translateX(5px)'" onmouseout="this.style.transform='none'">
                <div style="
                    width: 50px;
                    height: 50px;
                    background: ${categoryInfo.color}22;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5em;
                ">${categoryInfo.emoji}</div>
                
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px; font-size: 1em;">${card.title}</h4>
                    <p style="margin: 0; font-size: 0.85em; opacity: 0.7; 
                        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${card.summary || ''}
                    </p>
                </div>
                
                <span style="font-size: 1.2em; opacity: 0.5;">→</span>
            </div>
        `;
    }
};

// Export global
window.CultureCardsSystem = CultureCardsSystem;
