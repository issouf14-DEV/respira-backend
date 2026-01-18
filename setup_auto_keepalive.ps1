# =============================================================================
# CONFIGURATION TÂCHE PLANIFIÉE WINDOWS - Auto Keep-Alive au démarrage
# =============================================================================

Write-Host "🔥 CONFIGURATION AUTO KEEP-ALIVE" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

$ScriptPath = "c:\Users\fofan\Downloads\respira-backend-main\respira-backend-main\auto_keepalive.py"
$BatchPath = "c:\Users\fofan\Downloads\respira-backend-main\respira-backend-main\start_keepalive.bat"

# Vérifier que les fichiers existent
if (-not (Test-Path $ScriptPath)) {
    Write-Host "❌ Erreur: Script non trouvé: $ScriptPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $BatchPath)) {
    Write-Host "❌ Erreur: Batch non trouvé: $BatchPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichiers trouvés" -ForegroundColor Green
Write-Host ""

# Supprimer la tâche si elle existe déjà
$TaskName = "RespiraKeepAlive"
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Write-Host "⚠️  Suppression de l'ancienne tâche..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Write-Host "📋 Création de la tâche planifiée..." -ForegroundColor Cyan

try {
    # Action: Exécuter le batch
    $Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$BatchPath`""
    
    # Déclencheur: Au démarrage + toutes les heures (sécurité)
    $TriggerStartup = New-ScheduledTaskTrigger -AtStartup
    $TriggerHourly = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1)
    
    # Paramètres
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnDemand -DontStopIfGoingOnBatteries -PowerRequest -ExecutionTimeLimit (New-TimeSpan -Hours 0)
    $Settings.RestartCount = 3
    $Settings.RestartInterval = "PT5M"  # Redémarrer toutes les 5 minutes en cas d'échec
    
    # Principal (utilisateur actuel)
    $Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive
    
    # Créer la tâche
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $TriggerStartup,$TriggerHourly -Settings $Settings -Principal $Principal -Description "Maintient le serveur Respira Render toujours actif"
    
    Write-Host ""
    Write-Host "✅ TÂCHE CRÉÉE AVEC SUCCÈS !" -ForegroundColor Green
    Write-Host "📋 Nom: $TaskName" -ForegroundColor White
    Write-Host "🚀 Démarrage: Automatique au boot Windows" -ForegroundColor White
    Write-Host "🔄 Redémarrage: Auto en cas d'échec" -ForegroundColor White
    Write-Host "⏱️  Backup: Vérification toutes les heures" -ForegroundColor White
    
    Write-Host ""
    Write-Host "🎯 COMMANDES UTILES:" -ForegroundColor Magenta
    Write-Host "-------------------" -ForegroundColor Magenta
    Write-Host "▶️  Démarrer maintenant:  Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Yellow
    Write-Host "⏸️  Arrêter:              Stop-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Yellow  
    Write-Host "❌ Supprimer:            Unregister-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Yellow
    Write-Host "📊 Voir l'état:          Get-ScheduledTask -TaskName '$TaskName' | Get-ScheduledTaskInfo" -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "🔥 VOTRE SERVEUR SERA MAINTENANT TOUJOURS ACTIF !" -ForegroundColor Green -BackgroundColor DarkGreen
    Write-Host ""
    
    # Proposer de démarrer immédiatement
    $Choice = Read-Host "Voulez-vous démarrer le service maintenant ? (O/n)"
    if ($Choice -eq "" -or $Choice -eq "O" -or $Choice -eq "o" -or $Choice -eq "oui") {
        Write-Host "🚀 Démarrage du service..." -ForegroundColor Cyan
        Start-ScheduledTask -TaskName $TaskName
        Start-Sleep -Seconds 2
        
        $TaskInfo = Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo
        Write-Host "📊 État: $($TaskInfo.LastTaskResult)" -ForegroundColor Green
        Write-Host "⏰ Dernier démarrage: $($TaskInfo.LastRunTime)" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ ERREUR lors de la création de la tâche:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solutions possibles:" -ForegroundColor Yellow
    Write-Host "• Exécuter PowerShell en tant qu'administrateur" -ForegroundColor Yellow
    Write-Host "• Vérifier les chemins des fichiers" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 CONFIGURATION TERMINÉE" -ForegroundColor Magenta
Write-Host ""