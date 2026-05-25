# deploy.ps1 — JLR Dev website deploy to Cloudflare Pages
# Usage: .\deploy.ps1
# Requires: wrangler installed (npm install -g wrangler) and logged in (wrangler login)

Set-Location $PSScriptRoot
wrangler pages deploy . --project-name=jlrdev-website --branch=main
