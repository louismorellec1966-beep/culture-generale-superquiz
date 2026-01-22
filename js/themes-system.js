// ========== SYSTÈME DE THÈMES VISUELS ==========
// Mode sombre/clair et thèmes colorés

const ThemesSystem = {
    // Thèmes disponibles
    THEMES: {
        light: {
            name: 'Clair',
            emoji: '☀️',
            colors: {
                '--bg-primary': '#ffffff',
                '--bg-secondary': '#f8f9fa',
                '--bg-card': '#ffffff',
                '--text-primary': '#212529',
                '--text-secondary': '#6c757d',
                '--border-color': '#dee2e6',
                '--shadow-color': 'rgba(0,0,0,0.1)',
                '--accent-color': '#5e35b1',
                '--accent-light': '#ede7f6',
                '--success-color': '#28a745',
                '--error-color': '#dc3545',
                '--warning-color': '#ffc107'
            }
        },
        dark: {
            name: 'Sombre',
            emoji: '🌙',
            colors: {
                '--bg-primary': '#121212',
                '--bg-secondary': '#1e1e1e',
                '--bg-card': '#2d2d2d',
                '--text-primary': '#ffffff',
                '--text-secondary': '#b0b0b0',
                '--border-color': '#404040',
                '--shadow-color': 'rgba(0,0,0,0.3)',
                '--accent-color': '#bb86fc',
                '--accent-light': '#3700b3',
                '--success-color': '#03dac6',
                '--error-color': '#cf6679',
                '--warning-color': '#ffb74d'
            }
        },
        ocean: {
            name: 'Océan',
            emoji: '🌊',
            colors: {
                '--bg-primary': '#0a1929',
                '--bg-secondary': '#0d2137',
                '--bg-card': '#132f4c',
                '--text-primary': '#ffffff',
                '--text-secondary': '#94a3b8',
                '--border-color': '#1e4976',
                '--shadow-color': 'rgba(0,0,0,0.3)',
                '--accent-color': '#5090d3',
                '--accent-light': '#0a1929',
                '--success-color': '#66bb6a',
                '--error-color': '#f44336',
                '--warning-color': '#ffa726'
            }
        },
        forest: {
            name: 'Forêt',
            emoji: '🌲',
            colors: {
                '--bg-primary': '#1a2f1a',
                '--bg-secondary': '#243524',
                '--bg-card': '#2d4a2d',
                '--text-primary': '#ffffff',
                '--text-secondary': '#a8c9a8',
                '--border-color': '#3d5c3d',
                '--shadow-color': 'rgba(0,0,0,0.3)',
                '--accent-color': '#81c784',
                '--accent-light': '#1a2f1a',
                '--success-color': '#4caf50',
                '--error-color': '#e57373',
                '--warning-color': '#ffb74d'
            }
        },
        sunset: {
            name: 'Coucher de soleil',
            emoji: '🌅',
            colors: {
                '--bg-primary': '#2d1b1b',
                '--bg-secondary': '#3d2424',
                '--bg-card': '#4a2c2c',
                '--text-primary': '#ffffff',
                '--text-secondary': '#d4a5a5',
                '--border-color': '#5c3a3a',
                '--shadow-color': 'rgba(0,0,0,0.3)',
                '--accent-color': '#ff8a65',
                '--accent-light': '#2d1b1b',
                '--success-color': '#81c784',
                '--error-color': '#ef5350',
                '--warning-color': '#ffca28'
            }
        },
        purple: {
            name: 'Violet royal',
            emoji: '👑',
            premium: true,
            colors: {
                '--bg-primary': '#1a1a2e',
                '--bg-secondary': '#16213e',
                '--bg-card': '#1f2b47',
                '--text-primary': '#ffffff',
                '--text-secondary': '#a0a0c0',
                '--border-color': '#2a3f5f',
                '--shadow-color': 'rgba(0,0,0,0.3)',
                '--accent-color': '#9d4edd',
                '--accent-light': '#1a1a2e',
                '--success-color': '#00d9ff',
                '--error-color': '#ff6b6b',
                '--warning-color': '#f9ca24'
            }
        },
        gold: {
            name: 'Or',
            emoji: '✨',
            premium: true,
            colors: {
                '--bg-primary': '#1a1a0a',
                '--bg-secondary': '#252510',
                '--bg-card': '#333320',
                '--text-primary': '#ffd700',
                '--text-secondary': '#c9b037',
                '--border-color': '#4a4a20',
                '--shadow-color': 'rgba(0,0,0,0.3)',
                '--accent-color': '#ffd700',
                '--accent-light': '#1a1a0a',
                '--success-color': '#00ff00',
                '--error-color': '#ff4444',
                '--warning-color': '#ffaa00'
            }
        }
    },

    // Obtenir le thème actuel
    getCurrentTheme: () => {
        const saved = localStorage.getItem('cultureludo_theme');
        return saved || 'light';
    },

    // Appliquer un thème
    applyTheme: (themeId) => {
        const theme = ThemesSystem.THEMES[themeId];
        if (!theme) return false;

        const root = document.documentElement;
        
        // Appliquer les couleurs CSS
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Ajouter classe pour le mode
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${themeId === 'light' ? 'light' : 'dark'}`);
        
        // Sauvegarder le choix
        localStorage.setItem('cultureludo_theme', themeId);

        // Émettre un événement
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeId } }));

        return true;
    },

    // Initialiser le thème au chargement
    init: () => {
        const currentTheme = ThemesSystem.getCurrentTheme();
        ThemesSystem.applyTheme(currentTheme);

        // Injecter les styles CSS de base pour les variables
        if (!document.getElementById('theme-base-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'theme-base-styles';
            styleSheet.textContent = `
                :root {
                    ${Object.entries(ThemesSystem.THEMES.light.colors)
                        .map(([prop, val]) => `${prop}: ${val};`)
                        .join('\n')}
                }

                body {
                    background-color: var(--bg-primary);
                    color: var(--text-primary);
                    transition: background-color 0.3s, color 0.3s;
                }

                .card, .quiz-container, .profile-card, .stats-card {
                    background-color: var(--bg-card);
                    border-color: var(--border-color);
                    box-shadow: 0 2px 10px var(--shadow-color);
                }

                .btn-primary {
                    background-color: var(--accent-color);
                }

                .btn-primary:hover {
                    background-color: var(--accent-color);
                    filter: brightness(1.1);
                }

                .text-secondary {
                    color: var(--text-secondary) !important;
                }

                input, select, textarea {
                    background-color: var(--bg-secondary);
                    color: var(--text-primary);
                    border-color: var(--border-color);
                }

                .navbar, .sidebar, header {
                    background-color: var(--bg-secondary);
                    border-color: var(--border-color);
                }

                .theme-selector-btn {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: 3px solid var(--border-color);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5em;
                    transition: transform 0.2s, border-color 0.2s;
                }

                .theme-selector-btn:hover {
                    transform: scale(1.1);
                }

                .theme-selector-btn.active {
                    border-color: var(--accent-color);
                    box-shadow: 0 0 10px var(--accent-color);
                }

                .theme-selector-btn.premium::after {
                    content: '👑';
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    font-size: 0.7em;
                }
            `;
            document.head.appendChild(styleSheet);
        }
    },

    // Vérifier si un thème est débloqué
    isThemeUnlocked: async (userId, themeId) => {
        const theme = ThemesSystem.THEMES[themeId];
        if (!theme) return false;
        if (!theme.premium) return true; // Thèmes gratuits

        if (!userId) return false;

        try {
            const profileDoc = await db.collection('profiles').doc(userId).get();
            if (!profileDoc.exists) return false;

            const unlockedThemes = profileDoc.data().unlockedThemes || [];
            const isPremium = profileDoc.data().isPremium || false;

            return isPremium || unlockedThemes.includes(themeId);
        } catch (error) {
            console.error('Erreur isThemeUnlocked:', error);
            return false;
        }
    },

    // Sélecteur de thème UI
    renderThemeSelector: async (userId = null) => {
        const currentTheme = ThemesSystem.getCurrentTheme();
        let html = '<div class="theme-selector" style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; padding: 20px;">';

        for (const [themeId, theme] of Object.entries(ThemesSystem.THEMES)) {
            const isActive = currentTheme === themeId;
            const isUnlocked = userId ? await ThemesSystem.isThemeUnlocked(userId, themeId) : !theme.premium;
            const premiumClass = theme.premium ? 'premium' : '';
            const activeClass = isActive ? 'active' : '';
            const lockedStyle = !isUnlocked ? 'opacity: 0.5; cursor: not-allowed;' : '';

            html += `
                <div class="theme-option" style="text-align: center;">
                    <button 
                        class="theme-selector-btn ${premiumClass} ${activeClass}"
                        style="background: ${theme.colors['--bg-primary']}; ${lockedStyle}"
                        onclick="${isUnlocked ? `ThemesSystem.applyTheme('${themeId}')` : 'alert(\'Thème premium ! Débloquez-le avec des XP.\')'}"
                        ${!isUnlocked ? 'disabled' : ''}
                    >
                        ${theme.emoji}
                    </button>
                    <p style="margin: 8px 0 0; font-size: 0.9em; color: var(--text-secondary);">
                        ${theme.name}
                        ${theme.premium && !isUnlocked ? '🔒' : ''}
                    </p>
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    // Toggle rapide dark/light
    toggleDarkMode: () => {
        const current = ThemesSystem.getCurrentTheme();
        const newTheme = current === 'light' ? 'dark' : 'light';
        ThemesSystem.applyTheme(newTheme);
        return newTheme;
    },

    // Bouton toggle dark mode
    renderDarkModeToggle: () => {
        const current = ThemesSystem.getCurrentTheme();
        const isDark = current !== 'light';
        
        return `
            <button 
                class="dark-mode-toggle" 
                onclick="ThemesSystem.toggleDarkMode(); this.innerHTML = ThemesSystem.getCurrentTheme() === 'light' ? '🌙' : '☀️';"
                style="
                    background: var(--bg-secondary);
                    border: 2px solid var(--border-color);
                    border-radius: 50%;
                    width: 45px;
                    height: 45px;
                    font-size: 1.3em;
                    cursor: pointer;
                    transition: transform 0.2s;
                "
                title="Changer le thème"
            >
                ${isDark ? '☀️' : '🌙'}
            </button>
        `;
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    ThemesSystem.init();
});

// Export global
window.ThemesSystem = ThemesSystem;
