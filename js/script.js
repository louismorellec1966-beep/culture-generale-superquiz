// ========== SYSTÈME DE SCORE ==========
let quizScore = {
    score: 0,
    total: 0,
    questionsRepondues: new Set()
};

// Charger le score depuis localStorage avec gestion d'erreurs robuste
function chargerScore() {
    try {
        const savedScore = localStorage.getItem('quizScore');
        if (savedScore) {
            const parsed = JSON.parse(savedScore);
            quizScore.score = parsed.score || 0;
            quizScore.total = parsed.total || 0;
            
            // Vérifier que questionsRepondues est bien un tableau
            if (Array.isArray(parsed.questionsRepondues)) {
                quizScore.questionsRepondues = new Set(parsed.questionsRepondues);
            } else {
                // Si ce n'est pas un tableau, réinitialiser
                console.warn('Données corrompues détectées, réinitialisation du Set');
                quizScore.questionsRepondues = new Set();
            }
        }
    } catch (error) {
        // Si erreur, réinitialiser complètement
        console.error('Erreur lors du chargement du score:', error);
        quizScore = { score: 0, total: 0, questionsRepondues: new Set() };
        localStorage.removeItem('quizScore');
    }
}

// Sauvegarder le score dans localStorage
function sauvegarderScore() {
    try {
        // Convertir le Set en tableau pour le sauvegarder
        const toSave = {
            score: quizScore.score,
            total: quizScore.total,
            questionsRepondues: Array.from(quizScore.questionsRepondues)
        };
        localStorage.setItem('quizScore', JSON.stringify(toSave));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du score:', error);
    }
}

// Mettre à jour l'affichage du score
function mettreAJourAffichageScore() {
    const scoreDisplay = document.getElementById('current-score');
    const totalDisplay = document.getElementById('total-questions');
    
    if (scoreDisplay && totalDisplay) {
        scoreDisplay.textContent = quizScore.score;
        totalDisplay.textContent = quizScore.total;
    }
}

// Réinitialiser le score
function reinitialiserScore() {
    // Demander confirmation
    if (confirm('Êtes-vous sûr de vouloir réinitialiser votre score ? Toutes vos réponses seront effacées.')) {
        quizScore = { score: 0, total: 0, questionsRepondues: new Set() };
        sauvegarderScore();
        mettreAJourAffichageScore();
        console.log('✅ Score réinitialisé');
        
        // Réactiver tous les boutons radio
        const tousLesRadios = document.querySelectorAll('input[type="radio"]');
        tousLesRadios.forEach(radio => {
            radio.disabled = false;
            radio.checked = false;
        });
        
        // Cacher tous les feedbacks
        const tousFeedbacks = document.querySelectorAll('.reponse-feedback');
        tousFeedbacks.forEach(feedback => {
            feedback.style.display = 'none';
        });
        
        // Afficher un message de confirmation
        alert('✅ Score réinitialisé avec succès ! Vous pouvez recommencer le quiz.');
        
        // Scroll vers le haut de la page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ========== ATTENDRE QUE LE DOM SOIT CHARGÉ ==========
document.addEventListener('DOMContentLoaded', function() {
    
    console.log('✅ Script chargé !');
    
    // Charger le score au démarrage
    chargerScore();
    mettreAJourAffichageScore();
    
    // ========== GESTION DU MENU HAMBURGER ==========
    const toggleButton = document.getElementById('toggle-menu');
    
    if (toggleButton) {
        // Gérer l'état aria-expanded
        const nav = document.querySelector('nav');
        
        // Gérer le clic sur le bouton (pour mobile)
        toggleButton.addEventListener('click', function() {
            const isOpen = this.classList.toggle('active');
            this.setAttribute('aria-expanded', isOpen);
            
            if (nav) {
                nav.classList.toggle('menu-open');
            }
        });
    }
    
    // Fermer le menu automatiquement quand on clique sur un lien (mobile)
    const menuLinks = document.querySelectorAll('.menu a');
    menuLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                const nav = document.querySelector('nav');
                const toggleButton = document.getElementById('toggle-menu');
                
                if (nav && nav.classList.contains('menu-open')) {
                    nav.classList.remove('menu-open');
                    if (toggleButton) {
                        toggleButton.classList.remove('active');
                        toggleButton.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        });
    });
    
    // Gérer le sous-menu sur mobile (clic au lieu de hover)
    if (window.innerWidth <= 768) {
        const dropdowns = document.querySelectorAll('.dropdown > a');
        dropdowns.forEach(function(dropdown) {
            dropdown.addEventListener('click', function(e) {
                e.preventDefault();
                const submenu = this.nextElementSibling;
                if (submenu && submenu.classList.contains('submenu')) {
                    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
                }
            });
        });
    }

    // ========== PROTECTION EMAIL ET TÉLÉPHONE (Contact.html) ==========
    const emailElement = document.getElementById('email-contact');
    const telElement = document.getElementById('tel-contact');
    
    if (emailElement) {
        // Email construit dynamiquement (moins visible pour les robots)
        const user = 'louismorellec1966';
        const domain = 'gmail' + '.' + 'com';
        const email = user + '@' + domain;
        
        emailElement.href = 'mailto:' + email;
        emailElement.textContent = email;
        emailElement.title = 'Envoyer un email à ' + email;
    }
    
    if (telElement) {
        // Téléphone construit dynamiquement
        const tel = '+33641321058';
        telElement.href = 'tel:' + tel;
        telElement.textContent = tel;
        telElement.title = 'Appeler ' + tel;
    }

    // ========== GESTION DES BOUTONS DE VALIDATION DES QUIZ ==========
    attachValidationListeners();

    // ========== GESTION DU BOUTON DE RÉINITIALISATION ==========
    const btnResetScore = document.getElementById('btn-reset-score');
    if (btnResetScore) {
        btnResetScore.addEventListener('click', reinitialiserScore);
        console.log('🔄 Bouton de réinitialisation détecté');
    }
});

// ========== FONCTION POUR ATTACHER LES ÉCOUTEURS (Exportée) ==========
function attachValidationListeners() {
    const boutonsValidation = document.querySelectorAll('.btn-valider');
    
    boutonsValidation.forEach(function(bouton) {
        // Évite d'ajouter plusieurs fois le même listener
        if (!bouton.hasAttribute('data-listener-attached')) {
            bouton.addEventListener('click', function() {
                const questionName = this.getAttribute('data-question');
                const feedbackId = this.getAttribute('data-feedback');
                validerReponse(questionName, feedbackId);
            });
            bouton.setAttribute('data-listener-attached', 'true');
        }
    });
}
window.attachValidationListeners = attachValidationListeners;

// ========== FONCTION OPTIMISÉE DE VALIDATION DES RÉPONSES ==========
function validerReponse(questionName, feedbackId) {
    console.log('🔍 Validation de:', questionName);
    
    // Récupérer la réponse sélectionnée avec querySelector (plus efficace)
    const reponseSelectionnee = document.querySelector(`input[name="${questionName}"]:checked`);
    const feedback = document.getElementById(feedbackId);

    // Vérifier si une réponse a été sélectionnée
    if (!reponseSelectionnee) {
        afficherFeedback(feedback, 'incorrect', '⚠️ Veuillez sélectionner une réponse avant de valider.');
        return;
    }

    // Vérifier si cette question a déjà été répondue
    const questionId = `${window.location.pathname}-${questionName}`;
    const dejaRepondu = quizScore.questionsRepondues.has(questionId);

    // Déterminer si la réponse est correcte
    const estCorrect = reponseSelectionnee.value === 'correct';

    console.log('✔️ Réponse correcte:', estCorrect);
    console.log('📝 Déjà répondu:', dejaRepondu);

    // Mettre à jour le score seulement si la question n'a pas encore été répondue
    if (!dejaRepondu) {
        if (estCorrect) {
            quizScore.score++;
        }
        quizScore.total++;
        quizScore.questionsRepondues.add(questionId);
        sauvegarderScore();
        mettreAJourAffichageScore();
        console.log('💾 Score sauvegardé:', quizScore.score, '/', quizScore.total);
    }

    // Afficher le feedback approprié
    const message = estCorrect 
        ? '✅ Bravo ! C\'est la bonne réponse !' 
        : '❌ Incorrect. Essayez une autre réponse.';
    
    afficherFeedback(feedback, estCorrect ? 'correct' : 'incorrect', message);

    // Désactiver les radios après validation pour éviter les modifications
    if (!dejaRepondu) {
        const radios = document.querySelectorAll(`input[name="${questionName}"]`);
        radios.forEach(radio => radio.disabled = true);
    }
}
window.validerReponse = validerReponse;

// ========== FONCTION D'AFFICHAGE DU FEEDBACK ==========
function afficherFeedback(element, classe, message) {
    element.className = `reponse-feedback ${classe}`;
    element.innerHTML = message;
    element.style.display = 'block';
    
    // Animation de fade-in avec requestAnimationFrame pour de meilleures performances
    element.style.opacity = '0';
    requestAnimationFrame(function() {
        element.style.transition = 'opacity 0.3s ease';
        requestAnimationFrame(function() {
            element.style.opacity = '1';
        });
    });
}

// ========== GESTION DU SCROLL POUR CACHER/AFFICHER LA NAVIGATION ==========
let lastScroll = 0;
const nav = document.querySelector('nav');

if (nav) {
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Ne rien faire si on est en haut de la page
        if (currentScroll <= 0) {
            nav.classList.remove('hidden');
            return;
        }
        
        // Scroll vers le bas = cacher la nav
        if (currentScroll > lastScroll && currentScroll > 100) {
            nav.classList.add('hidden');
        } 
        // Scroll vers le haut = afficher la nav
        else if (currentScroll < lastScroll) {
            nav.classList.remove('hidden');
        }
        
        lastScroll = currentScroll;
    });
}

// ========== VALIDATION EMAIL (pour future utilisation) ==========
function validerEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ========== UTILITAIRE: DEBOUNCE ==========
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========== AMÉLIORATION DE LA PERFORMANCE ==========
// Lazy loading des images (si vous ajoutez plus d'images)
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src || img.src;
    });
} else {
    // Fallback pour les navigateurs qui ne supportent pas le lazy loading natif
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// ========== FONCTION UTILITAIRE POUR DÉBOGUER ==========
// Pour réinitialiser le score depuis la console, tapez: reinitialiserScore()
console.log('💡 Pour réinitialiser le score, tapez dans la console: reinitialiserScore()');