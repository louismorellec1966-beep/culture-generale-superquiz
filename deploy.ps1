# =============================================
# Script de déploiement automatique vers Hostinger
# =============================================

# Configuration - À MODIFIER avec vos informations Hostinger
$FTP_HOST = "ftp://147.93.54.141"      # Trouvable dans hPanel > Fichiers > Comptes FTP
$FTP_USER = "u180189556"      # Votre identifiant FTP
$FTP_PASS = "06190Lfmpmval2206!"     # Votre mot de passe FTP
$REMOTE_PATH = "/public_html"            # Dossier distant (généralement /public_html)
$LOCAL_PATH = "c:\Users\louis\Desktop\Culture G site"

# Fichiers/dossiers à exclure du déploiement
$EXCLUDE = @(
    "deploy.ps1",
    "deploy.bat",
    ".git",
    ".gitignore",
    "node_modules",
    "*.log",
    ".env"
)

# Couleurs pour les messages
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   DÉPLOIEMENT CULTURE G SITE" -ForegroundColor Magenta  
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Vérifier si WinSCP est installé (méthode recommandée)
$winscpPath = "C:\Program Files (x86)\WinSCP\WinSCPnet.dll"
$useWinSCP = Test-Path $winscpPath

if ($useWinSCP) {
    Write-Info "Utilisation de WinSCP pour le transfert..."
    
    Add-Type -Path $winscpPath
    
    $sessionOptions = New-Object WinSCP.SessionOptions -Property @{
        Protocol = [WinSCP.Protocol]::Ftp
        HostName = $FTP_HOST
        UserName = $FTP_USER
        Password = $FTP_PASS
    }
    
    $session = New-Object WinSCP.Session
    
    try {
        $session.Open($sessionOptions)
        
        $transferOptions = New-Object WinSCP.TransferOptions
        $transferOptions.TransferMode = [WinSCP.TransferMode]::Automatic
        
        # Synchroniser les fichiers (miroir)
        Write-Info "Synchronisation en cours..."
        $syncResult = $session.SynchronizeDirectories(
            [WinSCP.SynchronizationMode]::Remote,
            $LOCAL_PATH,
            $REMOTE_PATH,
            $false  # Ne pas supprimer les fichiers distants non présents localement
        )
        
        $syncResult.Check()
        
        Write-Success "Déploiement terminé !"
        Write-Info "Fichiers transférés : $($syncResult.Uploads.Count)"
        
    } catch {
        Write-Err "Erreur : $_"
    } finally {
        $session.Dispose()
    }
    
} else {
    # Méthode alternative avec FTP natif PowerShell
    Write-Info "WinSCP non détecté. Utilisation de FTP natif..."
    Write-Warn "Pour de meilleures performances, installez WinSCP: https://winscp.net"
    Write-Host ""
    
    # Fonction pour uploader un fichier
    function Upload-File {
        param($localFile, $remoteFile)
        
        $ftpUri = "ftp://$FTP_HOST$remoteFile"
        $webclient = New-Object System.Net.WebClient
        $webclient.Credentials = New-Object System.Net.NetworkCredential($FTP_USER, $FTP_PASS)
        
        try {
            $webclient.UploadFile($ftpUri, $localFile)
            Write-Success "Uploadé: $($localFile | Split-Path -Leaf)"
        } catch {
            Write-Err "Échec: $($localFile | Split-Path -Leaf) - $_"
        }
    }
    
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
    
    Write-Info "Fichiers à transférer : $($files.Count)"
    Write-Host ""
    
    foreach ($file in $files) {
        $relativePath = $file.FullName.Replace($LOCAL_PATH, "").Replace("\", "/")
        $remotePath = "$REMOTE_PATH$relativePath"
        Upload-File -localFile $file.FullName -remoteFile $remotePath
    }
    
    Write-Host ""
    Write-Success "Déploiement terminé !"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Read-Host "Appuyez sur Entrée pour fermer"
