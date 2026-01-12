# Save Workspace Script
# Saves currently open applications and browser tabs for later restoration

$workspaceDir = "$env:USERPROFILE\.workspace-sessions"
$sessionFile = Join-Path $workspaceDir "session-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').json"

# Create directory if it doesn't exist
if (-not (Test-Path $workspaceDir)) {
    New-Item -ItemType Directory -Path $workspaceDir | Out-Null
}

Write-Host "Saving your workspace..." -ForegroundColor Cyan

# Get all open windows
$windows = Get-Process | Where-Object { $_.MainWindowTitle -ne "" } | ForEach-Object {
    [PSCustomObject]@{
        ProcessName = $_.ProcessName
        WindowTitle = $_.MainWindowTitle
        ProcessPath = $_.Path
        ProcessId = $_.Id
    }
}

# Get browser tabs (Chrome/Edge)
$browserTabs = @()

# Chrome tabs
$chromeProcesses = Get-Process -Name "chrome" -ErrorAction SilentlyContinue
if ($chromeProcesses) {
    Write-Host "  Detecting Chrome tabs..." -ForegroundColor Yellow
    try {
        # Try to get Chrome tabs using Chrome's remote debugging
        $chromeDataDir = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default"
        $sessionFileChrome = Join-Path $chromeDataDir "Current Session"
        if (Test-Path $sessionFileChrome) {
            $browserTabs += [PSCustomObject]@{
                Browser = "Chrome"
                Type = "Session"
                DataPath = $chromeDataDir
            }
        }
    } catch {
        Write-Host "    Note: Chrome session detection limited" -ForegroundColor Gray
    }
}

# Edge tabs
$edgeProcesses = Get-Process -Name "msedge" -ErrorAction SilentlyContinue
if ($edgeProcesses) {
    Write-Host "  Detecting Edge tabs..." -ForegroundColor Yellow
    try {
        $edgeDataDir = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default"
        $sessionFileEdge = Join-Path $edgeDataDir "Current Session"
        if (Test-Path $sessionFileEdge) {
            $browserTabs += [PSCustomObject]@{
                Browser = "Edge"
                Type = "Session"
                DataPath = $edgeDataDir
            }
        }
    } catch {
        Write-Host "    Note: Edge session detection limited" -ForegroundColor Gray
    }
}

# Alternative: Get URLs from browser command line arguments
$browserWindows = $windows | Where-Object { 
    $_.ProcessName -match "chrome|msedge|firefox" 
}

# Save session data
$sessionData = [PSCustomObject]@{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Applications = $windows | Where-Object { $_.ProcessName -notmatch "chrome|msedge|firefox" }
    BrowserWindows = $browserWindows
    BrowserSessions = $browserTabs
}

# Convert to JSON and save
$sessionData | ConvertTo-Json -Depth 10 | Out-File -FilePath $sessionFile -Encoding UTF8

# Also save as "latest" for easy access
$latestFile = Join-Path $workspaceDir "latest.json"
Copy-Item $sessionFile $latestFile -Force

Write-Host ""
Write-Host "[OK] Workspace saved!" -ForegroundColor Green
Write-Host "  Session file: $sessionFile" -ForegroundColor Gray
Write-Host "  Applications found: $($windows.Count)" -ForegroundColor Gray
Write-Host "  Browser windows: $($browserWindows.Count)" -ForegroundColor Gray
Write-Host ""
Write-Host "To restore, run: .\restore-workspace.ps1" -ForegroundColor Cyan
