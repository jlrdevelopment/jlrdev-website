# Claude Handoff — JLR Dev Website & Client Intake Pipeline
## Last updated: 2026-05-25

---

## QUICK REFERENCE
- **GitHub (this project):** `github.com/jlrdevelopment/jlrdev-website` · branch: `main` — only use `jlrdevelopment`
- **Source folder:** `C:\Users\Jan-Louis.Reynders\OneDrive\JLR_Dev\Projects\preview-dark-full\`
- **Live site:** `https://jlrdev-website.pages.dev` ✅ · Custom domain `jlrdev.co.za` (NS propagating)
- **Deploy:** `$env:CLOUDFLARE_API_TOKEN='<token>'; wrangler pages deploy . --project-name=jlrdev-website --branch=main`
- **GitHub token (jlrdevelopment):** stored in Windows Credential Manager · embedded in remote URL

---

## WHO YOU ARE WORKING WITH

**Jan-Louis Reynders** — solo software developer & AI consultant, Bloemfontein SA.
- Business: JLR Dev
- Email: jan-louis@jlrdev.co.za
- Phone: 082 852 5108
- GitHub: jlrdevelopment (only account used for all JLR Dev work)
- Cloudflare: jan-louis@jlrdev.co.za
- Resend: jan-louis@jlrdev.co.za
- OpenAI: key set, using gpt-4o-mini
- Afrihost: domain registrar for jlrdev.co.za

---

## GITHUB REPOS

| Repo | URL | Branch | Purpose |
|------|-----|---------|---------|
| `jlrdev-web` | github.com/jlrdevelopment/jlrdev-web | master | Live website (this folder) — **create repo first** |
| `jlrdev-website` | github.com/jlrdevelopment/jlrdev-website | main | Old Astro site — archived |
| `GeoTech-PDF-Extractor` | github.com/jlrdevelopment/GeoTech-PDF-Extractor | master | GeoCalibre client tool |

---

## THIS PROJECT — WHAT IT IS

Single-page dark-theme website + automated client intake pipeline.

**Source folder:** `C:\Users\Jan-Louis.Reynders\OneDrive\JLR_Dev\Projects\preview-dark-full\`

| File | Purpose |
|------|---------|
| `index.html` | Full website — Three.js scene, contact form, all content |
| `functions/api/new-lead.js` | CF Pages Function — intake pipeline |
| `wrangler.toml` | Cloudflare Pages config |
| `_headers` | Security headers (CSP, HSTS, etc.) |
| `deploy.ps1` | Deploy script |
| `.gitignore` | Excludes .wrangler/, node_modules/, *.log, gc-ui-*.png |
| `CLAUDE_HANDOFF.md` | This file |
| `WEB_AGENT_INSTRUCTIONS.md` | Step-by-step for web agent tasks |

---

## INFRASTRUCTURE

### Cloudflare Pages
- Project: `jlrdev-website`
- Account ID: `099dce235d2d4c94021b4fbfcb0b3acd`
- Zone ID: `fc59aeb70e56dae3e829baa610ef63af`
- Live URL: `https://jlrdev-website.pages.dev` ✅
- Custom domain: `jlrdev.co.za` (DNS propagating — pending, CF will email when active)

### Secrets in CF Pages (encrypted)
| Secret | Value / Purpose |
|--------|----------------|
| `OPENAI_API_KEY` | gpt-4o-mini — lead analysis |
| `RESEND_API_KEY` | Resend `jlrdev-website` key — sends both emails |

### DNS (Cloudflare zone)
| Record | Content | Proxy |
|--------|---------|-------|
| CNAME `jlrdev.co.za` | `jlrdev-website.pages.dev` | ON |
| CNAME `www` | `jlrdev-website.pages.dev` | ON |
| TXT `resend._domainkey` | DKIM key | OFF |
| MX `send` priority 10 | `feedback-smtp.eu-west-1.amazonses.com` | OFF |
| TXT `send` | `v=spf1 include:amazonses.com ~all` | OFF |
| MX `jlrdev.co.za` | mx1/mx2.improvmx.com | OFF |

### Nameservers
- `holly.ns.cloudflare.com` + `jaziel.ns.cloudflare.com`
- Set at Afrihost 2026-05-25 ~14:12 SAST — propagation in progress

### Resend
- Domain: `jlrdev.co.za` — region Ireland (eu-west-1)
- Status: pending DNS verify (auto-verifies once NS propagates)
- Sends from: `noreply@jlrdev.co.za`
- Delivers to: `jan-louis@jlrdev.co.za` (lead briefing) + client (auto-reply)

---

## HOW THE INTAKE PIPELINE WORKS

```
User fills contact form on jlrdev.co.za
  → fetch() POSTs JSON {name, email, subject, message} to /api/new-lead
    → Cloudflare Pages Function (functions/api/new-lead.js)
      → OpenAI gpt-4o-mini → {summary, projectType, draftReply, firstQuestions}
        → Resend: auto-reply HTML email → client (from noreply@jlrdev.co.za)
        → Resend: lead briefing HTML email → jan-louis@jlrdev.co.za
```

No Formspree. No third-party webhook. Fully free.

---

## HOW TO DEPLOY

```powershell
Set-Location "C:\Users\Jan-Louis.Reynders\OneDrive\JLR_Dev\Projects\preview-dark-full"
.\deploy.ps1
```

`deploy.ps1` auto-checks auth. If session expired it opens a browser login (30 sec, click Allow), then deploys.
No tokens to manage. Just run the script.

**If wrangler is not installed:** `npm install -g wrangler`

---

## HOW TO PUSH TO GITHUB

```powershell
cd "C:\Users\Jan-Louis.Reynders\OneDrive\JLR_Dev\Projects\preview-dark-full"
git add -A
git commit -m "your message"
git push origin master
# Remote: https://github.com/jlrdevelopment/jlrdev-web.git
# Uses Windows Credential Manager — jlrdevelopment account
# NOTE: jlrdevelopment is the ONLY GitHub account to use for JLR Dev work
```

---

## WHAT STILL NEEDS TO HAPPEN (automatic — no action needed)

1. **NS propagation** — CF will email jan-louis@jlrdev.co.za when jlrdev.co.za zone activates
2. **Resend auto-verifies** once NS propagates

## AFTER PROPAGATION — ONE TEST

1. Browse `https://jlrdev.co.za` — dark site loads
2. Submit contact form
3. Check jan-louis@jlrdev.co.za — lead briefing with AI analysis arrives
4. Check sender inbox — auto-reply from noreply@jlrdev.co.za arrives

---

## SITE FEATURES (index.html)

- Hero: Three.js orbital 3D scene, typewriter animation
- Terminal widget: real GeoCalibre stats (33 PDFs, 850+ data points, 8s)
- Services: 5 cards with staggered scroll-reveal animations
- Case study: GeoCalibre — carousel + 4 stat tiles + client quote
- How I Work: 4 steps
- Contact form: hint chips, posts JSON to /api/new-lead
- WhatsApp floating button: bottom-right, links to wa.me/27828525108
- Copy protection: user-select:none, right-click + Ctrl+U/S/A blocked
- Location: "Bloemfontein, SA · Remote worldwide"
- GeoCalibre wording: "GeoCalibre Geotechnical Consultancy" (Kevin approved)

---

## OTHER ACTIVE PROJECTS

### GeoCalibre — GeoTech PDF Extractor
- Client: Kevin Coertzen (Kevin@geocalibre.co.za)
- Current version: v1.4 — delivered 2026-05-22, in use, Kevin happy
- Repo: github.com/jlrdevelopment/GeoTech-PDF-Extractor
- Source: `JLR_Dev\Clients\GeoCalibre\Projects\GeoTech-PDF-Extractor\`
- EXE build: `--distpath C:\Build\GeoTech\dist` (OneDrive locks local build/)
- Phase 3 planned: React+Vite PWA, Supabase, offline-first soil profiling app

### JLR Dev Hub
- Entry: `_Admin\Launch_Hub.bat` → `_Admin\jlr_hub.py` (PyQt6)
- Features: business snapshot, deploy card, voice pipeline, client onboarding

---

## NEXT PLANNED FEATURE: WhatsApp Automation

Add WhatsApp Business API to pipeline so incoming WhatsApp messages get:
- OpenAI analysis
- Auto-reply via WhatsApp
- Lead briefing email to jan-louis@jlrdev.co.za

Requires: Meta Business Account, WhatsApp Business number verification, Twilio or Meta webhook.
Architecture ready — awaiting setup.
