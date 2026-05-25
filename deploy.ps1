# deploy.ps1 — JLR Dev website deploy to Cloudflare Pages
# Usage: .\deploy.ps1  (auto-logins if session expired)

Set-Location $PSScriptRoot

# Check auth — login automatically if session expired
$whoami = wrangler whoami 2>&1
if ($whoami -match "not authenticated|login required") {
    Write-Host "Session expired — opening browser login..." -ForegroundColor Yellow
    wrangler login
}

wrangler pages deploy . --project-name=jlrdev-website --branch=main
