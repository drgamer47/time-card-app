# Workspace Save/Restore Scripts

These PowerShell scripts help you save and restore your open applications and browser tabs.

## Quick Start

### Save Your Current Workspace
```powershell
.\save-workspace.ps1
```

This will:
- Save all open applications (process names and paths)
- Detect browser windows (Chrome/Edge)
- Save session data to `%USERPROFILE%\.workspace-sessions\`

### Restore Your Saved Workspace
```powershell
.\restore-workspace.ps1
```

This will:
- Restore all saved applications
- Open browsers with their last session
- Skip applications that are already running

## How It Works

### Saving
- Captures all processes with visible windows
- Records process names, window titles, and executable paths
- Detects Chrome and Edge browser sessions
- Saves everything to a JSON file with timestamp

### Restoring
- Reads the latest saved session
- Launches applications by their executable paths
- Opens browsers with session restore flags
- Skips applications that are already running

## Session Files

Sessions are saved in: `%USERPROFILE%\.workspace-sessions\`

- `latest.json` - The most recent session (used by restore script)
- `session-YYYY-MM-DD-HHMMSS.json` - Timestamped session files

## Limitations

1. **Browser Tabs**: Browsers will restore their last session automatically. The script can't capture individual tab URLs reliably without browser extensions.

2. **Application State**: The script saves which applications were open, but not their internal state (e.g., which files were open in VS Code).

3. **Windows**: Window positions and sizes are not restored.

## Tips

- Run `save-workspace.ps1` before closing your computer
- Run `restore-workspace.ps1` when you start work the next day
- For better browser tab restoration, use browser extensions like "Session Buddy" (Chrome) or "Tab Session Manager" (Edge)

## Troubleshooting

**"No saved workspace found"**
- Run `save-workspace.ps1` first

**Some applications don't restore**
- The executable path might have changed
- The application might require special launch arguments
- Check the error messages in the restore output

**Browsers don't restore tabs**
- Make sure your browser is set to restore previous session on startup
- Chrome: Settings → On startup → Continue where you left off
- Edge: Settings → Start, home, and new tabs → Open tabs from the previous session

