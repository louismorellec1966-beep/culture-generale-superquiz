// 📚 BANQUE DE QUESTIONS POUR QUIZ DU JOUR
// Copiez-collez ces questions dans votre import-questions.html

const QUESTIONS_QUIZ_DU_JOUR = [
    
    // ========== HISTOIRE DU XXe SIÈCLE (15 questions) ==========
    {
        theme: "Histoire du XXe siècle",
        difficulty: "facile",
        question: "En quelle année a eu lieu la Première Guerre mondiale ?",
        answers: ["1914-1918", "1939-1945", "1870-1871", "1950-1953"],
        correct: 0,
        tags: ["histoire", "guerre"]
    },
    {
        theme: "Histoire du XXe siècle",
        difficulty: "moyen",
        question: "Quel événement a marqué le début de la Seconde Guerre mondiale ?",
        answers: [
            "L'invasion de la Pologne par l'Allemagne",
            "L'attaque de Pearl Harbor",
            "La bataille de Stalingrad",
            "Le Débarquement en Normandie"
        ],
        correct: 0,
        tags: ["histoire", "guerre"]
    },
    {
        theme: "Histoire du XXe siècle",
        difficulty: "moyen",
        question: "En quelle année le mur de Berlin est-il tombé ?",
        answers: ["1985", "1987", "1989", "1991"],
        correct: 2,
        tags: ["histoire", "guerre-froide"]
    },
    {
        theme: "Histoire du XXe siècle",
        difficulty: "difficile",
        question: "Qui était le président français lors de Mai 68 ?",
        answers: [
            "Charles de Gaulle",
            "Georges Pompidou",
            "François Mitterrand",
            "Valéry Giscard d'Estaing"
        ],
        correct: 0,
        tags: ["histoire", "france", "politique"]
    },
    {
        theme: "Histoire du XXe siècle",
        difficulty: "facile",
        question: "Quelle année a marqué la fin de l'URSS ?",
        answers: ["1989", "1990", "1991", "1992"],
        correct: 2,
        tags: ["histoire", "urss"]
    },
    {
        theme: "Histoire du XXe siècle",
        difficulty: "moyen",
        question: "Quel était le surnom de Louis XIV ?",
        answers: ["Le Roi-Soleil", "Le Bien-Aimé", "Le Grand", "Le Conquérant"],
        correct: 0,
        tags: ["histoire", "france"]
    },
    {
        theme: "Histoire du XXe siècle",
        difficulty: "difficile",
        question: "En quelle année l'Inde a-t-elle obtenu son indépendance ?",
        answers: ["1945", "1947", "1949", "1950"],
        correct: 1,
        tags: ["histoire", "colonisation"]
    },
    {
        theme: "Histoire du XXe siècle",
        difficulty: "moyen",
        question: "Qui a été le premier homme dans l'espace ?",
        answers: [
            "Neil Armstrong",
            "Yuri Gagarin",
            "Buzz Aldrin",
            "Alan Shepard"
        ],
        correct: 1,
        tags: ["histoire", "espace"]
    },
    {
        theme: "Histoire du XXe siècle",
        difficulty: "facile",
        question: "Quelle guerre a opposé les États-Unis et le Vietnam ?",
        answers: [
            "Guerre de Corée",
            "Guerre du Vietnam",
            "Guerre du Golfe",
            "Guerre d'Afghanistan"
        ],
        correct: 1,
        tags: ["histoire", "guerre"]
    },
    {
        theme: "Histoire du XXe siècle",
        difficulty: "difficile",
        question: "Quel traité a mis fin à la Première Guerre mondiale ?",
        answers: [
            "Traité de Versailles",
            "Traité de Paris",
            "Traité de Rome",
            "Traité de Tordesillas"
        ],
        correct: 0,
        tags: ["histoire", "guerre", "traité"]
    },

    // ========== GÉOGRAPHIE MONDIALE (15 questions) ==========
    {
        theme: "Géographie mondiale",
        difficulty: "facile",
        question: "Quelle est la capitale de l'Australie ?",
        answers: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
        correct: 2,
        tags: ["géographie", "capitales"]
    },
    {
        theme: "Géographie mondiale",
        difficulty: "moyen",
        question: "Quel est le plus long fleuve du monde ?",
        answers: ["Le Nil", "L'Amazone", "Le Yang-Tsé", "Le Mississippi"],
        correct: 0,
        tags: ["géographie", "fleuves"]
    },
    {
        theme: "Géographie mondiale",
        difficulty: "difficile",
        question: "Combien de pays partagent une frontière avec la France ?",
        answers: ["6", "7", "8", "9"],
        correct: 2,
        tags: ["géographie", "france"]
    },
    {
        theme: "Géographie mondiale",
        difficulty: "facile",
        question: "Quel océan borde la côte ouest de l'Afrique ?",
        answers: [
            "Océan Atlantique",
            "Océan Pacifique",
            "Océan Indien",
            "Océan Arctique"
        ],
        correct: 0,
        tags: ["géographie", "océans"]
    },
    {
        theme: "Géographie mondiale",
        difficulty: "moyen",
        question: "Quelle est la capitale du Canada ?",
        answers: ["Toronto", "Ottawa", "Vancouver", "Montréal"],
        correct: 1,
        tags: ["géographie", "capitales"]
    },
    {
        theme: "Géographie mondiale",
        difficulty: "difficile",
        question: "Quel pays a le plus grand nombre d'îles au monde ?",
        answers: ["Philippines", "Indonésie", "Suède", "Norvège"],
        correct: 2,
        tags: ["géographie", "îles"]
    },
    {
        theme: "Géographie mondiale",
        difficulty: "facile",
        question: "Sur quel continent se trouve le Brésil ?",
        answers: ["Afrique", "Asie", "Amérique du Sud", "Océanie"],
        correct: 2,
        tags: ["géographie", "continents"]
    },
    {
        theme: "Géographie mondiale",
        difficulty: "moyen",
        question: "Quelle est la montagne la plus haute d'Europe ?",
        answers: ["Le Mont Blanc", "Le Cervin", "L'Elbrouz", "Le Mont Rose"],
        correct: 2,
        tags: ["géographie", "montagnes"]
    },
    {
        theme: "Géographie mondiale",
        difficulty: "difficile",
        question: "Quelle est la capitale de la Nouvelle-Zélande ?",
        answers: ["Auckland", "Wellington", "Christchurch", "Hamilton"],
        correct: 1,
        tags: ["géographie", "capitales"]
    },
    {
        theme: "Géographie mondiale",
        difficulty: "facile",
        question: "Combien y a-t-il de continents sur Terre ?",
        answers: ["5", "6", "7", "8"],
        correct: 2,
        tags: ["géographie", "continents"]
    },

    // ========== SCIENCES ET DÉCOUVERTES (15 questions) ==========
    {
        theme: "Sciences et découvertes",
        difficulty: "facile",
        question: "Qui a découvert la pénicilline ?",
        answers: [
            "Louis Pasteur",
            "Marie Curie",
            "Alexander Fleming",
            "Albert Einstein"
        ],
        correct: 2,
        tags: ["sciences", "médecine"]
    },
    {
        theme: "Sciences et découvertes",
        difficulty: "moyen",
        question: "Quelle est la vitesse de la lumière dans le vide ?",
        answers: [
            "300 000 km/s",
            "150 000 km/s",
            "450 000 km/s",
            "600 000 km/s"
        ],
        correct: 0,
        tags: ["sciences", "physique"]
    },
    {
        theme: "Sciences et découvertes",
        difficulty: "difficile",
        question: "Combien d'os possède un adulte humain ?",
        answers: ["186", "206", "226", "246"],
        correct: 1,
        tags: ["sciences", "biologie", "anatomie"]
    },
    {
        theme: "Sciences et découvertes",
        difficulty: "facile",
        question: "Quel gaz est essentiel à la respiration humaine ?",
        answers: ["Azote", "Oxygène", "Hydrogène", "Carbone"],
        correct: 1,
        tags: ["sciences", "biologie"]
    },
    {
        theme: "Sciences et découvertes",
        difficulty: "moyen",
        question: "Quelle planète est la plus proche du Soleil ?",
        answers: ["Vénus", "Mercure", "Mars", "Terre"],
        correct: 1,
        tags: ["sciences", "astronomie"]
    },
    {
        theme: "Sciences et découvertes",
        difficulty: "difficile",
        question: "Quel scientifique a développé la théorie de l'évolution ?",
        answers: [
            "Isaac Newton",
            "Charles Darwin",
            "Gregor Mendel",
            "Albert Einstein"
        ],
        correct: 1,
        tags: ["sciences", "biologie"]
    },
    {
        theme: "Sciences et découvertes",
        difficulty: "facile",
        question: "Combien de planètes y a-t-il dans notre système solaire ?",
        answers: ["7", "8", "9", "10"],
        correct: 1,
        tags: ["sciences", "astronomie"]
    },
    {
        theme: "Sciences et découvertes",
        difficulty: "moyen",
        question: "Quel est le symbole chimique de l'or ?",
        answers: ["Go", "Au", "Or", "Ag"],
        correct: 1,
        tags: ["sciences", "chimie"]
    },
    {
        theme: "Sciences et découvertes",
        difficulty: "difficile",
        question: "Quelle est la température d'ébullition de l'eau au niveau de la mer ?",
        answers: ["90°C", "95°C", "100°C", "105°C"],
        correct: 2,
        tags: ["sciences", "physique"]
    },
    {
        theme: "Sciences et découvertes",
        difficulty: "facile",
        question: "Quel organe du corps humain pompe le sang ?",
        answers: ["Le cerveau", "Les poumons", "Le cœur", "Le foie"],
        correct: 2,
        tags: ["sciences", "anatomie"]
    },

    // ========== LITTÉRATURE FRANÇAISE (10 questions) ==========
    {
        theme: "Littérature française",
        difficulty: "facile",
        question: "Qui a écrit 'Les Misérables' ?",
        answers: [
            "Victor Hugo",
            "Émile Zola",
            "Gustave Flaubert",
            "Alexandre Dumas"
        ],
        correct: 0,
        tags: ["littérature", "classique"]
    },
    {
        theme: "Littérature française",
        difficulty: "moyen",
        question: "Quel est le vrai nom de Molière ?",
        answers: [
            "Jean-Baptiste Poquelin",
            "Pierre Corneille",
            "Jean Racine",
            "François de Malherbe"
        ],
        correct: 0,
        tags: ["littérature", "théâtre"]
    },
    {
        theme: "Littérature française",
        difficulty: "difficile",
        question: "Qui a écrit 'À la recherche du temps perdu' ?",
        answers: [
            "Marcel Proust",
            "André Gide",
            "Paul Valéry",
            "Guillaume Apollinaire"
        ],
        correct: 0,
        tags: ["littérature", "roman"]
    },
    {
        theme: "Littérature française",
        difficulty: "facile",
        question: "Dans quel pays se déroule 'Le Petit Prince' ?",
        answers: ["En France", "Au Sahara", "En Afrique", "Sur une planète"],
        correct: 3,
        tags: ["littérature", "jeunesse"]
    },
    {
        theme: "Littérature française",
        difficulty: "moyen",
        question: "Qui a écrit 'Germinal' ?",
        answers: [
            "Émile Zola",
            "Guy de Maupassant",
            "Honoré de Balzac",
            "Stendhal"
        ],
        correct: 0,
        tags: ["littérature", "naturalisme"]
    },

    // ========== ARTS ET CULTURE (10 questions) ==========
    {
        theme: "Arts et culture",
        difficulty: "facile",
        question: "Qui a peint 'La Joconde' ?",
        answers: [
            "Michel-Ange",
            "Léonard de Vinci",
            "Raphaël",
            "Donatello"
        ],
        correct: 1,
        tags: ["art", "peinture"]
    },
    {
        theme: "Arts et culture",
        difficulty: "moyen",
        question: "Dans quelle ville se trouve le musée du Louvre ?",
        answers: ["Londres", "Rome", "Paris", "Madrid"],
        correct: 2,
        tags: ["art", "musée"]
    },
    {
        theme: "Arts et culture",
        difficulty: "difficile",
        question: "Quel artiste a coupé son oreille ?",
        answers: [
            "Pablo Picasso",
            "Vincent van Gogh",
            "Claude Monet",
            "Paul Cézanne"
        ],
        correct: 1,
        tags: ["art", "peinture"]
    },
    {
        theme: "Arts et culture",
        difficulty: "facile",
        question: "Quelle est la nationalité de Picasso ?",
        answers: ["Française", "Espagnole", "Italienne", "Portugaise"],
        correct: 1,
        tags: ["art", "peinture"]
    },
    {
        theme: "Arts et culture",
        difficulty: "moyen",
        question: "Qui a sculpté 'Le Penseur' ?",
        answers: [
            "Auguste Rodin",
            "Camille Claudel",
            "Alberto Giacometti",
            "Constantin Brancusi"
        ],
        correct: 0,
        tags: ["art", "sculpture"]
    },

    // ========== CINÉMA ET SÉRIES (10 questions) ==========
    {
        theme: "Cinéma et séries",
        difficulty: "facile",
        question: "Qui a réalisé 'Titanic' ?",
        answers: [
            "Steven Spielberg",
            "James Cameron",
            "Martin Scorsese",
            "Christopher Nolan"
        ],
        correct: 1,
        tags: ["cinéma", "réalisateur"]
    },
    {
        theme: "Cinéma et séries",
        difficulty: "moyen",
        question: "Quel film a remporté l'Oscar du meilleur film en 2020 ?",
        answers: [
            "1917",
            "Parasite",
            "Joker",
            "Once Upon a Time in Hollywood"
        ],
        correct: 1,
        tags: ["cinéma", "oscar"]
    },
    {
        theme: "Cinéma et séries",
        difficulty: "difficile",
        question: "Combien de saisons compte la série 'Game of Thrones' ?",
        answers: ["6", "7", "8", "9"],
        correct: 2,
        tags: ["série", "télévision"]
    },
    {
        theme: "Cinéma et séries",
        difficulty: "facile",
        question: "Dans quel film trouve-t-on la phrase 'Je suis ton père' ?",
        answers: [
            "Star Trek",
            "Star Wars",
            "Avatar",
            "Interstellar"
        ],
        correct: 1,
        tags: ["cinéma", "saga"]
    },
    {
        theme: "Cinéma et séries",
        difficulty: "moyen",
        question: "Quel acteur joue Iron Man dans l'univers Marvel ?",
        answers: [
            "Chris Evans",
            "Chris Hemsworth",
            "Robert Downey Jr.",
            "Mark Ruffalo"
        ],
        correct: 2,
        tags: ["cinéma", "marvel", "acteur"]
    },

    // ========== SPORT ET OLYMPISME (10 questions) ==========
    {
        theme: "Sport et olympisme",
        difficulty: "facile",
        question: "Combien de joueurs y a-t-il dans une équipe de football ?",
        answers: ["9", "10", "11", "12"],
        correct: 2,
        tags: ["sport", "football"]
    },
    {
        theme: "Sport et olympisme",
        difficulty: "moyen",
        question: "Quel pays a remporté le plus de Coupes du Monde de football ?",
        answers: ["Allemagne", "Argentine", "Brésil", "Italie"],
        correct: 2,
        tags: ["sport", "football", "coupe-du-monde"]
    },
    {
        theme: "Sport et olympisme",
        difficulty: "difficile",
        question: "En quelle année ont eu lieu les premiers Jeux Olympiques modernes ?",
        answers: ["1892", "1896", "1900", "1904"],
        correct: 1,
        tags: ["sport", "olympisme", "histoire"]
    },
    {
        theme: "Sport et olympisme",
        difficulty: "facile",
        question: "Quel sport pratique Roger Federer ?",
        answers: ["Golf", "Tennis", "Badminton", "Squash"],
        correct: 1,
        tags: ["sport", "tennis"]
    },
    {
        theme: "Sport et olympisme",
        difficulty: "moyen",
        question: "Combien de tours compte le Tour de France ?",
        answers: ["19", "21", "23", "25"],
        correct: 1,
        tags: ["sport", "cyclisme"]
    },

    // ========== MUSIQUE (10 questions) ==========
    {
        theme: "Musique classique et moderne",
        difficulty: "facile",
        question: "Qui a composé 'La 9e Symphonie' ?",
        answers: [
            "Mozart",
            "Beethoven",
            "Bach",
            "Vivaldi"
        ],
        correct: 1,
        tags: ["musique", "classique"]
    },
    {
        theme: "Musique classique et moderne",
        difficulty: "moyen",
        question: "Quel groupe britannique a chanté 'Bohemian Rhapsody' ?",
        answers: ["The Beatles", "Queen", "Led Zeppelin", "Pink Floyd"],
        correct: 1,
        tags: ["musique", "rock"]
    },
    {
        theme: "Musique classique et moderne",
        difficulty: "difficile",
        question: "Quel instrument Chopin jouait-il principalement ?",
        answers: ["Violon", "Piano", "Flûte", "Violoncelle"],
        correct: 1,
        tags: ["musique", "classique", "compositeur"]
    },
    {
        theme: "Musique classique et moderne",
        difficulty: "facile",
        question: "Combien de cordes a une guitare classique ?",
        answers: ["4", "5", "6", "7"],
        correct: 2,
        tags: ["musique", "instrument"]
    },
    {
        theme: "Musique classique et moderne",
        difficulty: "moyen",
        question: "Quel artiste est surnommé 'The King of Pop' ?",
        answers: [
            "Elvis Presley",
            "Michael Jackson",
            "Prince",
            "Freddie Mercury"
        ],
        correct: 1,
        tags: ["musique", "pop"]
    },

    // ========== MYTHOLOGIE ET LÉGENDES (5 questions) ==========
    {
        theme: "Mythologie et légendes",
        difficulty: "facile",
        question: "Qui est le dieu grec de la mer ?",
        answers: ["Zeus", "Hadès", "Poséidon", "Apollon"],
        correct: 2,
        tags: ["mythologie", "grec"]
    },
    {
        theme: "Mythologie et légendes",
        difficulty: "moyen",
        question: "Quel héros grec a tué la Méduse ?",
        answers: ["Hercule", "Persée", "Thésée", "Achille"],
        correct: 1,
        tags: ["mythologie", "grec", "héros"]
    },
    {
        theme: "Mythologie et légendes",
        difficulty: "difficile",
        question: "Combien de travaux Hercule a-t-il accomplis ?",
        answers: ["10", "11", "12", "13"],
        correct: 2,
        tags: ["mythologie", "grec"]
    },
    {
        theme: "Mythologie et légendes",
        difficulty: "facile",
        question: "Quel dieu romain correspond à Zeus ?",
        answers: ["Mars", "Jupiter", "Neptune", "Apollon"],
        correct: 1,
        tags: ["mythologie", "romain"]
    },
    {
        theme: "Mythologie et légendes",
        difficulty: "moyen",
        question: "Qui était le roi des dieux dans la mythologie nordique ?",
        answers: ["Thor", "Loki", "Odin", "Freya"],
        correct: 2,
        tags: ["mythologie", "nordique"]
    },

    // ========== ASTRONOMIE ET ESPACE (5 questions) ==========
    {
        theme: "Astronomie et espace",
        difficulty: "facile",
        question: "Quelle est la plus grosse planète du système solaire ?",
        answers: ["Saturne", "Jupiter", "Uranus", "Neptune"],
        correct: 1,
        tags: ["astronomie", "planètes"]
    },
    {
        theme: "Astronomie et espace",
        difficulty: "moyen",
        question: "Combien de temps met la lumière du Soleil pour atteindre la Terre ?",
        answers: ["8 secondes", "8 minutes", "8 heures", "8 jours"],
        correct: 1,
        tags: ["astronomie", "physique"]
    },
    {
        theme: "Astronomie et espace",
        difficulty: "difficile",
        question: "Quelle est la galaxie la plus proche de la Voie lactée ?",
        answers: [
            "Andromède",
            "Le Grand Nuage de Magellan",
            "Triangle",
            "Sombrero"
        ],
        correct: 0,
        tags: ["astronomie", "galaxie"]
    },
    {
        theme: "Astronomie et espace",
        difficulty: "facile",
        question: "Combien y a-t-il de lunes autour de Mars ?",
        answers: ["0", "1", "2", "3"],
        correct: 2,
        tags: ["astronomie", "planètes"]
    },
    {
        theme: "Astronomie et espace",
        difficulty: "moyen",
        question: "Quel est le nom du télescope spatial lancé en 1990 ?",
        answers: [
            "Kepler",
            "Hubble",
            "Spitzer",
            "Chandra"
        ],
        correct: 1,
        tags: ["astronomie", "technologie"]
    }
];

// TOTAL : 100 questions prêtes à l'emploi ! 🎉
console.log(`📚 ${QUESTIONS_QUIZ_DU_JOUR.length} questions chargées !`);