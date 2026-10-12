param([Parameter(Mandatory = $true)][string]$RepositoryRoot)

$ErrorActionPreference = 'Stop'
$repository = (Resolve-Path -LiteralPath $RepositoryRoot).Path
$dataRoot = Join-Path $env:LOCALAPPDATA 'MonkChatAgentBridge'
New-Item -ItemType Directory -Path $dataRoot -Force | Out-Null
$log = Join-Path $dataRoot 'supervisor.log'
$workerLog = Join-Path $dataRoot 'worker.log'
$lockPath = Join-Path $dataRoot 'worker.lock'
$guardPath = Join-Path $dataRoot 'supervisor.lock'

try {
  $guard = [System.IO.File]::Open($guardPath, [System.IO.FileMode]::OpenOrCreate,
    [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
} catch [System.IO.IOException] {
  exit 0  # A supervisor from this Windows account is already running.
}

function Write-BridgeLog([string]$message) {
  Add-Content -LiteralPath $log -Value ("{0:u} {1}" -f (Get-Date), $message) -Encoding UTF8
}

function Get-BridgeWorkers {
  @(Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction Stop |
    Where-Object { $_.CommandLine -match 'agent-bridge\.mjs(?:\s|"|$)' -and
      $_.SessionId -eq (Get-Process -Id $PID).SessionId })
}

function Rotate-BridgeLog([string]$file) {
  if ((Test-Path -LiteralPath $file) -and (Get-Item -LiteralPath $file).Length -gt 2MB) {
    Move-Item -LiteralPath $file -Destination "$file.previous" -Force
  }
}

try {
  while ($true) {
    try {
      if ((Get-BridgeWorkers).Count -gt 0) {
        Start-Sleep -Seconds 30  # Preserve an older manual worker until it exits.
        continue
      }
      # A dead worker may leave a running state. The next worker reports that
      # interrupted job as blocked and preserves its checkout for review.
      # Remove only the empty lock directory after confirming no worker exists.
      if (Test-Path -LiteralPath $lockPath) {
        # A newly created lock could belong to a worker that is still starting.
        if ((Get-Item -LiteralPath $lockPath).LastWriteTimeUtc -gt (Get-Date).ToUniversalTime().AddSeconds(-10) -or
            (Get-BridgeWorkers).Count -gt 0) {
          Start-Sleep -Seconds 15
          continue
        }
        Remove-Item -LiteralPath $lockPath -Force -ErrorAction Stop
        Write-BridgeLog 'Removed stale worker.lock; the next worker will report any interrupted job.'
      }

      $branch = (& git -C $repository branch --show-current).Trim()
      $origin = (& git -C $repository remote get-url origin).Trim()
      if ($LASTEXITCODE -ne 0 -or $branch -ne 'feature/local-agent-bridge' -or
          $origin -notin @('https://github.com/MonkChatGuide072/MonkChat-Guide.git',
                           'git@github.com:MonkChatGuide072/MonkChat-Guide.git')) {
        throw 'Unexpected checkout or origin. Refusing to run the bridge.'
      }

      if (-not (& git -C $repository status --porcelain)) {
        $before = (& git -C $repository rev-parse HEAD).Trim()
        $previousPreference = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        try { & git -C $repository pull --ff-only origin feature/local-agent-bridge *> $null; $pullExit = $LASTEXITCODE }
        finally { $ErrorActionPreference = $previousPreference }
        if ($pullExit -eq 0) {
          $after = (& git -C $repository rev-parse HEAD).Trim()
          if ($after -ne $before) {
            Write-BridgeLog "Fast-forwarded bridge from $before to $after."
            $lockChanged = & git -C $repository diff --name-only "$before..$after" -- package-lock.json
            if ($lockChanged -or -not (Test-Path -LiteralPath (Join-Path $repository 'node_modules'))) {
              Push-Location $repository
              try {
                $previousPreference = $ErrorActionPreference
                $ErrorActionPreference = 'Continue'
                try { & npm ci *> $null; $npmExit = $LASTEXITCODE }
                finally { $ErrorActionPreference = $previousPreference }
                if ($npmExit -ne 0) { throw 'npm ci failed after update.' }
              }
              finally { Pop-Location }
            }
          }
        } else {
          Write-BridgeLog 'Fast-forward update failed; starting the existing local bridge version.'
        }
      } else {
        Write-BridgeLog 'Checkout contains local edits; skipped automatic update.'
      }

      if (-not (Test-Path -LiteralPath (Join-Path $repository 'node_modules'))) {
        Push-Location $repository
        try {
          $previousPreference = $ErrorActionPreference
          $ErrorActionPreference = 'Continue'
          try { & npm ci *> $null; $npmExit = $LASTEXITCODE }
          finally { $ErrorActionPreference = $previousPreference }
          if ($npmExit -ne 0) { throw 'npm ci failed.' }
        }
        finally { Pop-Location }
      }

      Rotate-BridgeLog $workerLog
      Write-BridgeLog 'Starting Bridge worker.'
      Push-Location $repository
      try { & node .\scripts\agent-bridge.mjs *>> $workerLog; $workerExit = $LASTEXITCODE }
      finally { Pop-Location }
      Write-BridgeLog "Bridge worker exited with code $workerExit; retrying after 30 seconds."
    } catch {
      Write-BridgeLog ("Supervisor paused after an error: {0}" -f $_.Exception.Message)
    }
    Start-Sleep -Seconds 30
  }
} finally {
  $guard.Dispose()
}
