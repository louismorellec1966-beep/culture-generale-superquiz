/**
 * Script de mise à jour des favicons pour CultureLudo
 * 
 * INSTRUCTIONS:
 * 1. Placez ce fichier à la racine de votre projet (là où se trouvent vos fichiers HTML)
 * 2. Ouvrez un terminal dans ce dossier
 * 3. Exécutez: node update-favicons.js
 * 
 * Le script va automatiquement:
 * - Trouver tous les fichiers .html
 * - Remplacer l'ancien favicon par les nouveaux liens
 * - Ajouter les favicons si absents
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = './'; // Dossier racine (là où est le script)
const EXTENSIONS = ['.html', '.htm'];

// Ancien code à remplacer (différentes variantes possibles)
const OLD_FAVICON_PATTERNS = [
    /<link\s+rel="icon"\s+href="Images\/favicon\.ico"\s*\/?>/gi,
    /<link\s+rel="icon"\s+href="images\/favicon\.ico"\s*\/?>/gi,
    /<link\s+rel="shortcut icon"\s+href="Images\/favicon\.ico"\s*\/?>/gi,
    /<link\s+rel="shortcut icon"\s+href="images\/favicon\.ico"\s*\/?>/gi,
    /<link\s+rel="icon"\s+type="image\/x-icon"\s+href="[^"]*favicon\.ico"\s*\/?>/gi,
];

// Nouveau code favicon
const NEW_FAVICON_CODE = `<link rel="icon" type="image/png" sizes="32x32" href="Images/favicon-32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="Images/favicon-16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="Images/logo-192.png">`;

// Compteurs
let filesProcessed = 0;
let filesModified = 0;
let filesWithErrors = 0;

// Fonction pour trouver tous les fichiers HTML
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        // Ignorer node_modules et dossiers cachés
        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules') {
                findHtmlFiles(filePath, fileList);
            }
        } else if (EXTENSIONS.includes(path.extname(file).toLowerCase())) {
            fileList.push(filePath);
        }
    }
    
    return fileList;
}

// Fonction pour mettre à jour un fichier
function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Essayer de remplacer les anciens patterns
        for (const pattern of OLD_FAVICON_PATTERNS) {
            if (pattern.test(content)) {
                content = content.replace(pattern, NEW_FAVICON_CODE);
                modified = true;
                break; // Un seul remplacement suffit
            }
        }
        
        // Si pas de favicon trouvé, l'ajouter après <head> ou après le premier <meta>
        if (!modified && !content.includes('favicon-32.png')) {
            // Chercher un bon endroit pour insérer
            const headMatch = content.match(/<head[^>]*>/i);
            if (headMatch) {
                const insertPos = headMatch.index + headMatch[0].length;
                content = content.slice(0, insertPos) + '\n    ' + NEW_FAVICON_CODE + content.slice(insertPos);
                modified = true;
            }
        }
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Modifié: ${filePath}`);
            filesModified++;
        } else if (content.includes('favicon-32.png')) {
            console.log(`⏭️  Déjà à jour: ${filePath}`);
        } else {
            console.log(`⚠️  Pas de <head> trouvé: ${filePath}`);
        }
        
        filesProcessed++;
        
    } catch (error) {
        console.log(`❌ Erreur: ${filePath} - ${error.message}`);
        filesWithErrors++;
    }
}

// Fonction principale
function main() {
    console.log('🔧 Mise à jour des favicons CultureLudo\n');
    console.log('📁 Recherche des fichiers HTML...\n');
    
    const htmlFiles = findHtmlFiles(ROOT_DIR);
    
    if (htmlFiles.length === 0) {
        console.log('❌ Aucun fichier HTML trouvé dans le dossier actuel.');
        console.log('   Assurez-vous de placer ce script à la racine de votre projet.');
        return;
    }
    
    console.log(`📄 ${htmlFiles.length} fichier(s) HTML trouvé(s)\n`);
    console.log('─'.repeat(50) + '\n');
    
    for (const file of htmlFiles) {
        updateFile(file);
    }
    
    console.log('\n' + '─'.repeat(50));
    console.log('\n📊 RÉSUMÉ:');
    console.log(`   ✅ Fichiers modifiés: ${filesModified}`);
    console.log(`   📄 Fichiers traités: ${filesProcessed}`);
    if (filesWithErrors > 0) {
        console.log(`   ❌ Erreurs: ${filesWithErrors}`);
    }
    console.log('\n🎉 Terminé !');
    
    if (filesModified > 0) {
        console.log('\n💡 N\'oubliez pas de:');
        console.log('   1. Copier le dossier "Images" avec les nouvelles icônes');
        console.log('   2. Tester votre site pour vérifier que tout fonctionne');
    }
}

// Exécuter
main();
