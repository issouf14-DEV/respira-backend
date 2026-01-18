#!/usr/bin/env pwsh
<#
.SYNOPSIS
    RenderKeeper PowerShell - Service Keep-Alive Ultra-Robuste pour Render

.DESCRIPTION
    Ce script maintient votre serveur Render toujours actif en effectuant des pings réguliers.
    Conçu pour être exécuté en continu sur Windows.

.PARAMETER Interval
    Intervalle entre les pings en secondes (défaut: 480 = 8 minutes)

.PARAMETER Aggressive
    Mode agressif avec ping toutes les 5 minutes

.PARAMETER Daemon
    Mode daemon silencieux pour arrière-plan

.PARAMETER ServerUrl
    URL du serveur à maintenir actif

.EXAMPLE
    .\RenderKeeper.ps1
    .\RenderKeeper.ps1 -Aggressive
    .\RenderKeeper.ps1 -Interval 300 -Daemon
#>

param(
    [int]$Interval = 480,
    [switch]$Aggressive,
    [switch]$Daemon,
    [string]$ServerUrl = "https://respira-backend.onrender.com"
)

# Configuration
$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

if ($Aggressive) { $Interval = 300 }

# Statistiques
$Stats = @{
    TotalPings = 0
    SuccessfulPings = 0
    FailedPings = 0
    WakeUps = 0
    StartTime = Get-Date
}

# Fonction de logging
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    
    # Couleurs selon le niveau
    switch ($Level) {
        "SUCCESS" { Write-Host $LogMessage -ForegroundColor Green }
        "WARNING" { Write-Host $LogMessage -ForegroundColor Yellow }
        "ERROR"   { Write-Host $LogMessage -ForegroundColor Red }
        "INFO"    { Write-Host $LogMessage -ForegroundColor Cyan }
        default   { Write-Host $LogMessage }
    }
    
    # Log vers fichier
    Add-Content -Path "render_keeper.log" -Value $LogMessage
}

# Fonction de ping
function Test-Endpoint {
    param(
        [string]$Endpoint,
        [int]$TimeoutSeconds = 30
    )
    
    $Url = "$ServerUrl/$($Endpoint.TrimStart('/'))"
    
    try {
        $Response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec $TimeoutSeconds -Headers @{
            'User-Agent' = 'RenderKeeper-PowerShell/2.0'
            'Accept' = 'application/json'
        }
        
        return $Response
    }
    catch {
        Write-Log "❌ Error on $Endpoint : $($_.Exception.Message)" "WARNING"
        return $null
    }
}

# Fonction de health check
function Test-ServerHealth {
    Write-Log "🏥 Starting health check..."
    
    $Endpoints = @(
        @{ Path = "ping/"; Timeout = 10 },
        @{ Path = "health/"; Timeout = 20 },
        @{ Path = "wake-up/"; Timeout = 30 },
        @{ Path = "api/v1/"; Timeout = 30 },
        @{ Path = ""; Timeout = 30 }
    )
    
    foreach ($Endpoint in $Endpoints) {
        $Result = Test-Endpoint -Endpoint $Endpoint.Path -TimeoutSeconds $Endpoint.Timeout
        if ($Result) {
            Write-Log "✅ Health check OK via /$($Endpoint.Path)" "SUCCESS"
            return $true
        }
        Start-Sleep -Seconds 2
    }
    
    Write-Log "💀 All health checks failed!" "ERROR"
    return $false
}

# Fonction de wake-up agressif
function Invoke-AggressiveWakeUp {
    Write-Log "🚀 Starting aggressive wake-up sequence..."
    
    $Timeouts = @(30, 45, 60, 90)
    
    for ($i = 0; $i -lt $Timeouts.Length; $i++) {
        $Timeout = $Timeouts[$i]
        Write-Log "🔄 Wake-up attempt $($i + 1)/$($Timeouts.Length) (timeout: ${Timeout}s)"
        
        $Result = Test-Endpoint -Endpoint "wake-up/" -TimeoutSeconds $Timeout
        if ($Result) {
            Write-Log "🎉 Wake-up successful on attempt $($i + 1)!" "SUCCESS"
            $Stats.WakeUps++
            
            Write-Log "⏳ Waiting for server to be fully ready..."
            Start-Sleep -Seconds 15
            
            if (Test-ServerHealth) {
                return $true
            }
        }
        
        if ($i -lt ($Timeouts.Length - 1)) {
            $Pause = 10 * ($i + 1)
            Write-Log "💤 Waiting ${Pause}s before next attempt..."
            Start-Sleep -Seconds $Pause
        }
    }
    
    Write-Log "🔥 Aggressive wake-up failed!" "ERROR"
    return $false
}

# Fonction de cycle de ping complet
function Invoke-PingCycle {
    $Stats.TotalPings++
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Log "📡 Starting ping cycle #$($Stats.TotalPings) at $Timestamp"
    
    # 1. Ping normal
    if (Test-ServerHealth) {
        $Stats.SuccessfulPings++
        Write-Log "✅ Regular ping successful" "SUCCESS"
        return $true
    }
    
    # 2. Wake-up si échec
    Write-Log "⚠️ Regular ping failed, attempting wake-up..." "WARNING"
    $Stats.FailedPings++
    
    if (Invoke-AggressiveWakeUp) {
        Write-Log "🎯 Recovery successful via wake-up" "SUCCESS"
        return $true
    }
    
    Write-Log "💥 Complete ping cycle failed!" "ERROR"
    return $false
}

# Fonction d'affichage des statistiques
function Show-Stats {
    $Uptime = (Get-Date) - $Stats.StartTime
    $SuccessRate = if ($Stats.TotalPings -gt 0) { 
        ($Stats.SuccessfulPings / $Stats.TotalPings) * 100 
    } else { 0 }
    
    Write-Host "`n$('=' * 60)" -ForegroundColor Magenta
    Write-Host "📊 RENDER KEEPER STATISTICS" -ForegroundColor Magenta
    Write-Host "$('=' * 60)" -ForegroundColor Magenta
    Write-Host "🕐 Uptime: $($Uptime.ToString('d\.hh\:mm\:ss'))" -ForegroundColor White
    Write-Host "📡 Total pings: $($Stats.TotalPings)" -ForegroundColor White
    Write-Host "✅ Successful: $($Stats.SuccessfulPings) ($($SuccessRate.ToString('F1'))%)" -ForegroundColor Green
    Write-Host "❌ Failed: $($Stats.FailedPings)" -ForegroundColor Red
    Write-Host "🚀 Wake-ups: $($Stats.WakeUps)" -ForegroundColor Yellow
    Write-Host "⏱️ Ping interval: ${Interval}s ($([Math]::Round($Interval/60, 1))min)" -ForegroundColor Cyan
    Write-Host "$('=' * 60)" -ForegroundColor Magenta
}

# Fonction principale
function Start-RenderKeeper {
    Write-Host "🚀 RENDER KEEPER POWERSHELL STARTED!" -ForegroundColor Green
    Write-Host "🎯 Target: $ServerUrl" -ForegroundColor Cyan
    Write-Host "⏱️ Interval: ${Interval}s ($([Math]::Round($Interval/60, 1))min)" -ForegroundColor Cyan
    Write-Host "🤖 Daemon mode: $Daemon" -ForegroundColor Cyan
    Write-Host "$('=' * 60)" -ForegroundColor Green
    
    # Premier ping immédiat
    Write-Log "🔥 Initial ping to wake up server..."
    Invoke-PingCycle | Out-Null
    
    try {
        while ($true) {
            if (-not $Daemon) {
                $NextPing = (Get-Date).AddSeconds($Interval)
                Write-Host "`n💤 Waiting ${Interval}s until next ping..." -ForegroundColor Yellow
                Write-Host "⏰ Next ping at: $($NextPing.ToString('HH:mm:ss'))" -ForegroundColor Yellow
            }
            
            Start-Sleep -Seconds $Interval
            
            Invoke-PingCycle | Out-Null
            
            # Afficher stats toutes les ~10 minutes en mode non-daemon
            if (-not $Daemon -and ($Stats.TotalPings % [Math]::Max(1, [Math]::Floor(600 / $Interval))) -eq 0) {
                Show-Stats
            }
        }
    }
    catch {
        Write-Log "🛑 Received interrupt signal, stopping..." "INFO"
    }
    finally {
        Write-Host "`n🏁 RENDER KEEPER STOPPED" -ForegroundColor Red
        Show-Stats
    }
}

# Point d'entrée
Clear-Host
Write-Host @"
╔══════════════════════════════════════════════════════════════════╗
║                   🔥 RENDER KEEPER POWERSHELL 🔥                 ║
║              Service Keep-Alive Ultra-Robuste v2.0              ║
║                                                                  ║
║  🎯 Maintient votre serveur Render toujours actif !             ║
║  ⚡ Multi-endpoint failover avec wake-up intelligent            ║  
║  📊 Statistiques temps réel et logging complet                  ║
╚══════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Magenta

# Validation des paramètres
if ($Interval -lt 60) {
    Write-Host "⚠️ Warning: Interval < 60s may be too aggressive" -ForegroundColor Yellow
}
if ($Interval -gt 900) {
    Write-Host "⚠️ Warning: Interval > 15min may let server sleep" -ForegroundColor Yellow
}

Start-RenderKeeper