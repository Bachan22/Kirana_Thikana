$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeRoot = Join-Path $projectRoot "..\.tools\node-v24.14.0-win-x64"
$npmPath = Join-Path $nodeRoot "npm.cmd"

if (-not (Test-Path $npmPath)) {
  Write-Error "Local Node runtime not found at $npmPath"
  exit 1
}

$env:Path = $nodeRoot + ";" + $env:Path

Push-Location $projectRoot
try {
  & $npmPath install
  & $npmPath install --prefix server
  & $npmPath install --prefix client
} finally {
  Pop-Location
}
