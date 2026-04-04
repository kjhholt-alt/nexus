# Nexus Swarm Orchestrator — auto-start script
# Add to Windows Task Scheduler or shell:startup for auto-start on boot
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/start-orchestrator.ps1
#
# To install as startup task:
#   $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File C:\Users\Kruz\Desktop\Projects\nexus\scripts\start-orchestrator.ps1"
#   $trigger = New-ScheduledTaskTrigger -AtLogOn
#   Register-ScheduledTask -TaskName "NexusOrchestrator" -Action $action -Trigger $trigger -RunLevel Highest

$NexusDir = "C:\Users\Kruz\Desktop\Projects\nexus"
$LogFile = "$NexusDir\logs\orchestrator.log"

# Ensure log directory exists
New-Item -ItemType Directory -Force -Path "$NexusDir\logs" | Out-Null

# Check if already running
$existing = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*swarm.orchestrator*"
}

if ($existing) {
    Write-Host "Orchestrator already running (PID: $($existing.Id))"
    exit 0
}

Write-Host "Starting Nexus Swarm Orchestrator..."

# Start orchestrator in background
Start-Process -FilePath "python" `
    -ArgumentList "-m", "swarm.orchestrator" `
    -WorkingDirectory $NexusDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput $LogFile `
    -RedirectStandardError "$NexusDir\logs\orchestrator-error.log"

Write-Host "Orchestrator started. Logs at: $LogFile"
