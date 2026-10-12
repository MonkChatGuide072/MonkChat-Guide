param([Parameter(Mandatory = $true)][string]$RepositoryRoot)

$ErrorActionPreference = 'Stop'
$repository = (Resolve-Path -LiteralPath $RepositoryRoot).Path
$bridge = Join-Path $repository 'scripts\agent-bridge.mjs'
$supervisor = Join-Path $repository 'scripts\bridge-supervisor.ps1'
if (-not (Test-Path -LiteralPath $bridge -PathType Leaf) -or
    -not (Test-Path -LiteralPath $supervisor -PathType Leaf)) {
  throw 'Bridge files are missing. Update the MonkChat-Agent-Bridge checkout first.'
}

$branch = (& git -C $repository branch --show-current).Trim()
$origin = (& git -C $repository remote get-url origin).Trim()
if ($LASTEXITCODE -ne 0 -or $branch -ne 'feature/local-agent-bridge' -or
    $origin -notin @('https://github.com/MonkChatGuide072/MonkChat-Guide.git',
                     'git@github.com:MonkChatGuide072/MonkChat-Guide.git')) {
  throw 'Install from the clean feature/local-agent-bridge checkout of MonkChatGuide072/MonkChat-Guide.'
}

$powershellExe = Join-Path $PSHOME 'powershell.exe'
$arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "{0}" -RepositoryRoot "{1}"' -f $supervisor, $repository
$startup = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Startup'
$shortcutPath = Join-Path $startup 'MonkChat Agent Bridge.lnk'
$shortcut = (New-Object -ComObject WScript.Shell).CreateShortcut($shortcutPath)
$shortcut.TargetPath = $powershellExe
$shortcut.Arguments = $arguments
$shortcut.WorkingDirectory = $repository
$shortcut.Description = 'Start the owner-scoped MonkChat agent bridge at Windows sign-in'
$shortcut.Save()

$dataRoot = Join-Path $env:LOCALAPPDATA 'MonkChatAgentBridge'
$runningJobs = @(Get-ChildItem -Path (Join-Path $dataRoot 'jobs\issue-*\bridge-state.json') -ErrorAction SilentlyContinue |
  Where-Object { (Get-Content -LiteralPath $_.FullName -Raw | ConvertFrom-Json).phase -eq 'running' })
if ($runningJobs.Count -eq 0) {
  $oldWorkers = @(Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction Stop |
    Where-Object { $_.CommandLine -match 'agent-bridge\.mjs(?:\s|"|$)' -and
      $_.ExecutablePath -and $_.SessionId -eq (Get-Process -Id $PID).SessionId })
  foreach ($worker in $oldWorkers) {
    Stop-Process -Id $worker.ProcessId -ErrorAction Stop
  }
}

Start-Process -FilePath $powershellExe -ArgumentList $arguments -WorkingDirectory $repository -WindowStyle Hidden
Write-Host "Installed: $shortcutPath"
Write-Host 'Started the supervisor. It preserves active jobs and takes over from an idle manual Bridge process.'
Write-Host 'To disable automatic startup, remove the MonkChat Agent Bridge shortcut from the Windows Startup folder.'
