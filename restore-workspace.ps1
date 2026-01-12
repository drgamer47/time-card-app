# Restore Workspace Script
# Restores previously saved applications and browser tabs

$workspaceDir = "$env:USERPROFILE\.workspace-sessions"
$latestFile = Join-Path $workspaceDir "latest.json"

# Check if session file exists
if (-not (Test-Path $latestFile)) {
    Write-Host "No saved workspace found!" -ForegroundColor Red
    Write-Host "Run save-workspace.ps1 first to save your current workspace." -ForegroundColor Yellow
    exit 1
}

Write-Host "Restoring workspace..." -ForegroundColor Cyan

# Load session data
$sessionData = Get-Content $latestFile | ConvertFrom-Json

Write-Host "  Session saved on: $($sessionData.Timestamp)" -ForegroundColor Gray
Write-Host ""
Write-Host "Restoring applications..." -ForegroundColor Yellow

# Restore applications
$restored = 0
$failed = 0

foreach ($app in $sessionData.Applications) {
    try {
        $processName = $app.ProcessName
        $processPath = $app.ProcessPath
        
        # Check if already running
        $existing = Get-Process -Name $processName -ErrorAction SilentlyContinue
        if ($existing) {
            Write-Host "  ⏭  $processName (already running)" -ForegroundColor Gray
            continue
        }
        
        # Try to start the application
        if (Test-Path $processPath) {
            Start-Process -FilePath $processPath -ErrorAction SilentlyContinue
            Write-Host "  [OK]  $processName" -ForegroundColor Green
            $restored++
            Start-Sleep -Milliseconds 500
        } else {
            # Try to start by process name
            try {
                Start-Process $processName -ErrorAction Stop
                Write-Host "  [OK]  $processName" -ForegroundColor Green
                $restored++
                Start-Sleep -Milliseconds 500
            } catch {
                Write-Host "  ✗  $processName (not found)" -ForegroundColor Red
                $failed++
            }
        }
    } catch {
        Write-Host "  ✗  $($app.ProcessName) (error: $($_.Exception.Message))" -ForegroundColor Red
        $failed++
    }
}

# Restore browser sessions
Write-Host ""
Write-Host "Restoring browser sessions..." -ForegroundColor Yellow

foreach ($browser in $sessionData.BrowserSessions) {
    try {
        $browserName = $browser.Browser
        $dataPath = $browser.DataPath
        
        if ($browserName -eq "Chrome") {
            $chromePath = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
            if (Test-Path $chromePath) {
                # Chrome will restore last session automatically if it crashed
                # We can also try to restore from session file
                Start-Process -FilePath $chromePath -ArgumentList "--restore-last-session" -ErrorAction SilentlyContinue
                Write-Host "  [OK]  Chrome (restoring last session)" -ForegroundColor Green
            } else {
                Write-Host "  ✗  Chrome (not installed)" -ForegroundColor Red
            }
        } elseif ($browserName -eq "Edge") {
            $edgePath = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
            if (-not (Test-Path $edgePath)) {
                $edgePath = "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe"
            }
            if (Test-Path $edgePath) {
                Start-Process -FilePath $edgePath -ArgumentList "--restore-last-session" -ErrorAction SilentlyContinue
                Write-Host "  [OK]  Edge (restoring last session)" -ForegroundColor Green
            } else {
                Write-Host "  ✗  Edge (not installed)" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "  ✗  $browserName (error)" -ForegroundColor Red
    }
}

# Restore browser windows (open with URLs if available)
foreach ($browserWindow in $sessionData.BrowserWindows) {
    try {
        $processName = $browserWindow.ProcessName
        $windowTitle = $browserWindow.WindowTitle
        
        # Extract URL from window title if it contains one
        if ($windowTitle -match "http") {
            $url = $windowTitle -replace ".*(https?://[^\s]+).*", '$1'
            if ($url -ne $windowTitle) {
                if ($processName -eq "chrome") {
                    Start-Process "chrome.exe" -ArgumentList $url -ErrorAction SilentlyContinue
                } elseif ($processName -eq "msedge") {
                    Start-Process "msedge.exe" -ArgumentList $url -ErrorAction SilentlyContinue
                }
            }
        }
    } catch {
        # Silently continue
    }
}

Write-Host ""
Write-Host "[OK] Workspace restoration complete!" -ForegroundColor Green
Write-Host "  Restored: $restored applications" -ForegroundColor Gray
if ($failed -gt 0) {
    Write-Host "  Failed: $failed applications" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Note: Browsers will restore their last session automatically." -ForegroundColor Cyan
Write-Host "      Some applications may need to be opened manually." -ForegroundColor Cyan

