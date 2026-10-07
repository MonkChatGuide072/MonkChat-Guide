[CmdletBinding()]
param(
    [switch]$Execute,
    [ValidateRange(1, 3)]
    [int]$MaxRounds = 2
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$relayScript = Join-Path $PSScriptRoot "agent-relay.mjs"

$relayArgs = @($relayScript, "--max-rounds=$MaxRounds")
if ($Execute) {
    $relayArgs += "--execute"
}
else {
    $relayArgs += "--dry-run"
}

Push-Location $repoRoot
try {
    & node @relayArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
