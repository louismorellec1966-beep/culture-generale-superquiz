/**
 * Skeleton Loader - Système de chargement avec placeholders animés
 * CultureLudo - Amélioration UX
 */

const SkeletonLoader = {
    /**
     * Crée un élément skeleton
     * @param {string} type - Type de skeleton: 'text', 'title', 'card', 'avatar', 'button', 'custom'
     * @param {object} options - Options supplémentaires
     * @returns {HTMLElement}
     */
    create(type = 'text', options = {}) {
        const skeleton = document.createElement('div');
        skeleton.classList.add('skeleton');

        switch (type) {
            case 'text':
                skeleton.classList.add('skeleton-text');
                skeleton.style.width = options.width || '100%';
                skeleton.style.height = options.height || '1em';
                break;

            case 'title':
                skeleton.classList.add('skeleton-title');
                skeleton.style.width = options.width || '60%';
                skeleton.style.height = options.height || '2em';
                break;

            case 'card':
                skeleton.classList.add('skeleton-card');
                skeleton.style.width = options.width || '100%';
                skeleton.style.height = options.height || '200px';
                break;

            case 'avatar':
                skeleton.classList.add('skeleton-avatar');
                const size = options.size || '48px';
                skeleton.style.width = size;
                skeleton.style.height = size;
                break;

            case 'button':
                skeleton.style.width = options.width || '120px';
                skeleton.style.height = options.height || '40px';
                skeleton.style.borderRadius = '25px';
                break;

            case 'custom':
                if (options.width) skeleton.style.width = options.width;
                if (options.height) skeleton.style.height = options.height;
                if (options.borderRadius) skeleton.style.borderRadius = options.borderRadius;
                break;
        }

        return skeleton;
    },

    /**
     * Crée un groupe de skeletons pour une liste
     * @param {number} count - Nombre d'éléments
     * @param {string} type - Type de skeleton
     * @param {object} options - Options
     * @returns {DocumentFragment}
     */
    createList(count, type = 'text', options = {}) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const item = this.create(type, options);
            if (options.marginBottom) {
                item.style.marginBottom = options.marginBottom;
            }
            fragment.appendChild(item);
        }
        return fragment;
    },

    /**
     * Crée un skeleton de profil utilisateur
     * @returns {HTMLElement}
     */
    createProfileSkeleton() {
        const container = document.createElement('div');
        container.className = 'skeleton-profile';
        container.style.cssText = 'display: flex; align-items: center; gap: 15px; padding: 20px;';

        container.appendChild(this.create('avatar', { size: '64px' }));

        const info = document.createElement('div');
        info.style.flex = '1';
        info.appendChild(this.create('title', { width: '150px', height: '1.2em' }));
        info.appendChild(this.create('text', { width: '100px', height: '0.9em' }));
        container.appendChild(info);

        return container;
    },

    /**
     * Crée un skeleton de carte de quiz
     * @returns {HTMLElement}
     */
    createQuizCardSkeleton() {
        const card = document.createElement('div');
        card.className = 'skeleton-quiz-card';
        card.style.cssText = `
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 30px;
            text-align: center;
        `;

        // Icône
        const icon = this.create('custom', { width: '60px', height: '60px', borderRadius: '50%' });
        icon.style.margin = '0 auto 15px';
        card.appendChild(icon);

        // Titre
        const title = this.create('title', { width: '80%', height: '1.3em' });
        title.style.margin = '0 auto 10px';
        card.appendChild(title);

        // Description
        card.appendChild(this.create('text', { width: '90%', height: '0.9em' }));
        card.appendChild(this.create('text', { width: '70%', height: '0.9em' }));

        return card;
    },

    /**
     * Crée un skeleton pour le classement
     * @param {number} count - Nombre de lignes
     * @returns {HTMLElement}
     */
    createLeaderboardSkeleton(count = 5) {
        const container = document.createElement('div');
        container.className = 'skeleton-leaderboard';

        for (let i = 0; i < count; i++) {
            const row = document.createElement('div');
            row.style.cssText = `
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: rgba(255,255,255,0.03);
                border-radius: 10px;
                margin-bottom: 10px;
            `;

            // Rang
            row.appendChild(this.create('custom', { width: '30px', height: '30px', borderRadius: '50%' }));

            // Avatar
            row.appendChild(this.create('avatar', { size: '40px' }));

            // Nom
            const nameContainer = document.createElement('div');
            nameContainer.style.flex = '1';
            nameContainer.appendChild(this.create('text', { width: '120px', height: '1em' }));
            row.appendChild(nameContainer);

            // Score
            row.appendChild(this.create('text', { width: '60px', height: '1em' }));

            container.appendChild(row);
        }

        return container;
    },

    /**
     * Affiche des skeletons dans un conteneur
     * @param {HTMLElement|string} container - Conteneur ou sélecteur CSS
     * @param {string} type - Type de skeleton
     * @param {number} count - Nombre d'éléments
     * @param {object} options - Options
     */
    show(container, type, count = 1, options = {}) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;

        el.innerHTML = '';
        el.setAttribute('data-skeleton', 'true');

        if (type === 'profile') {
            el.appendChild(this.createProfileSkeleton());
        } else if (type === 'quiz-card') {
            for (let i = 0; i < count; i++) {
                el.appendChild(this.createQuizCardSkeleton());
            }
        } else if (type === 'leaderboard') {
            el.appendChild(this.createLeaderboardSkeleton(count));
        } else {
            el.appendChild(this.createList(count, type, options));
        }
    },

    /**
     * Remplace les skeletons par du contenu réel avec une animation
     * @param {HTMLElement|string} container - Conteneur
     * @param {HTMLElement|string} content - Contenu à afficher
     */
    replace(container, content) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;

        // Animation de fade out
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.2s ease';

        setTimeout(() => {
            el.removeAttribute('data-skeleton');

            if (typeof content === 'string') {
                el.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                el.innerHTML = '';
                el.appendChild(content);
            }

            // Animation de fade in
            requestAnimationFrame(() => {
                el.style.opacity = '1';
            });
        }, 200);
    },

    /**
     * Vérifie si un conteneur affiche des skeletons
     * @param {HTMLElement|string} container
     * @returns {boolean}
     */
    isLoading(container) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        return el ? el.hasAttribute('data-skeleton') : false;
    },

    /**
     * Applique automatiquement des skeletons aux éléments marqués [data-skeleton-type]
     */
    autoApply() {
        document.querySelectorAll('[data-skeleton-type]').forEach(el => {
            const type = el.dataset.skeletonType;
            const count = parseInt(el.dataset.skeletonCount) || 1;
            this.show(el, type, count);
        });
    }
};

// Export pour utilisation globale
window.SkeletonLoader = SkeletonLoader;

// Auto-application au chargement si demandé
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-skeleton-auto]')) {
        SkeletonLoader.autoApply();
    }
});
