$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$npmPath = Join-Path $projectRoot "..\.tools\node-v24.14.0-win-x64\npm.cmd"

if (-not (Test-Path $npmPath)) {
  Write-Error "Local Node runtime not found at $npmPath"
  exit 1
}

Push-Location $projectRoot
try {
  & $npmPath run dev
} finally {
  Pop-Location
}
