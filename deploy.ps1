# =============================================
# Script de deploiement automatique vers Hostinger
# Utilise CURL pour une meilleure compatibilite
# =============================================

# Configuration
$FTP_HOST = "147.93.54.141"
$FTP_USER = "u180189556"
$FTP_PASS = "06190Lfmpmval2206!"
$REMOTE_PATH = "domains/cultureludo.com/public_html"
$LOCAL_PATH = "c:\Users\louis\Desktop\Culture G site"

# Fichiers/dossiers a exclure du deploiement
$EXCLUDE = @(
    "deploy.ps1",
    "deploy.bat",
    ".git",
    ".gitignore",
    "node_modules",
    "*.log",
    ".env"
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   DEPLOIEMENT CULTURE G SITE" -ForegroundColor Magenta  
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Fonction pour uploader un fichier avec curl
function Upload-File {
    param($localFile, $remotePath)
    
    $ftpUrl = "ftp://${FTP_HOST}/${remotePath}"
    
    try {
        $result = & curl.exe -s -S -T "`"$localFile`"" "`"$ftpUrl`"" -u "`"${FTP_USER}:${FTP_PASS}`"" --ftp-create-dirs 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] $($localFile | Split-Path -Leaf)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "[ERREUR] $($localFile | Split-Path -Leaf) - $result" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "[ERREUR] $($localFile | Split-Path -Leaf) - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "Analyse des fichiers..." -ForegroundColor Cyan

# Parcourir et uploader tous les fichiers
$files = Get-ChildItem -Path $LOCAL_PATH -Recurse -File | Where-Object {
    $relativePath = $_.FullName.Replace($LOCAL_PATH, "")
    $excluded = $false
    foreach ($pattern in $EXCLUDE) {
        if ($relativePath -like "*$pattern*") {
            $excluded = $true
            break
        }
    }
    -not $excluded
}

Write-Host "Fichiers a transferer : $($files.Count)" -ForegroundColor Cyan
Write-Host ""

$success = 0
$failed = 0

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace($LOCAL_PATH, "").TrimStart("\").Replace("\", "/")
    $remotePath = "$REMOTE_PATH/$relativePath"
    
    if (Upload-File -localFile $file.FullName -remotePath $remotePath) {
        $success++
    } else {
        $failed++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
if ($failed -eq 0) {
    Write-Host "Resultat: $success fichiers deployes avec succes!" -ForegroundColor Green
} else {
    Write-Host "Resultat: $success OK / $failed erreurs" -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Read-Host "Appuyez sur Entree pour fermer"
