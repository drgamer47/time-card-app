# List Saved Workspaces
# Shows all saved workspace sessions

$workspaceDir = "$env:USERPROFILE\.workspace-sessions"

if (-not (Test-Path $workspaceDir)) {
    Write-Host "No workspace sessions found." -ForegroundColor Yellow
    Write-Host "Run save-workspace.ps1 to create your first session." -ForegroundColor Cyan
    exit 0
}

$sessions = Get-ChildItem -Path $workspaceDir -Filter "session-*.json" | Sort-Object LastWriteTime -Descending

if ($sessions.Count -eq 0) {
    Write-Host "No saved sessions found." -ForegroundColor Yellow
    exit 0
}

Write-Host "Saved Workspace Sessions:`n" -ForegroundColor Cyan

foreach ($session in $sessions) {
    try {
        $data = Get-Content $session.FullName | ConvertFrom-Json
        $isLatest = (Test-Path (Join-Path $workspaceDir "latest.json")) -and 
                    ((Get-Item (Join-Path $workspaceDir "latest.json")).LastWriteTime -eq $session.LastWriteTime)
        
        $marker = if ($isLatest) { " [LATEST]" } else { "" }
        Write-Host "  $($session.Name)$marker" -ForegroundColor $(if ($isLatest) { "Green" } else { "White" })
        Write-Host "    Saved: $($data.Timestamp)" -ForegroundColor Gray
        Write-Host "    Applications: $($data.Applications.Count)" -ForegroundColor Gray
        Write-Host "    Browsers: $($data.BrowserWindows.Count)" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "  $($session.Name) (error reading)" -ForegroundColor Red
    }
}

Write-Host "To restore the latest session, run: .\restore-workspace.ps1" -ForegroundColor Cyan
Write-Host "To restore a specific session, copy it to latest.json" -ForegroundColor Gray

