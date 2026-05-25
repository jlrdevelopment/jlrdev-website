# Claude Handoff — JLR Dev Website & Client Intake Pipeline
## Last updated: 2026-05-25

---

## Who You Are Working With

**Jan-Louis Reynders** — solo software developer and AI consultant, Bloemfontein SA.
- Business: JLR Dev (jlrdev.co.za)
- Email: jan-louis@jlrdev.co.za
- Phone: 082 852 5108
- Cloudflare account: jan-louis@jlrdev.co.za
- Afrihost account: jan-louis@jlrdev.co.za (domain registrar for jlrdev.co.za)

---

## Project: JLR Dev Website + Client Intake Pipeline

### Goal
When a prospect submits the contact form on jlrdev.co.za, the pipeline:
1. Receives the JSON POST directly at `/api/new-lead` (Cloudflare Pages Function)
2. Calls OpenAI API (gpt-4o-mini) to analyse the lead
3. Sends an auto-reply to the client via Resend (from noreply@jlrdev.co.za)
4. Sends a lead briefing email to Jan-Louis via Resend

---

## Infrastructure — Current State (2026-05-25)

### Cloudflare Pages
- Project name: `jlrdev-website`
- Account ID: `099dce235d2d4c94021b4fbfcb0b3acd`
- Zone ID (jlrdev.co.za): `fc59aeb70e56dae3e829baa610ef63af`
- Production URL: `https://jlrdev-website.pages.dev` ✅ live
- Custom domain: `jlrdev.co.za` ✅ added — pending NS propagation
- Last deployment: `https://aef729f1.jlrdev-website.pages.dev`

### Secrets set in CF Pages (encrypted)
| Secret | Status |
|--------|--------|
| `OPENAI_API_KEY` | ✅ set (gpt-4o-mini) |
| `RESEND_API_KEY` | ✅ set (key name: jlrdev-website, full access) |

### DNS (Cloudflare zone fc59aeb70e56dae3e829baa610ef63af)
| Record | Status |
|--------|--------|
| CNAME `jlrdev.co.za` → `jlrdev-website.pages.dev` (proxied) | ✅ |
| CNAME `www` → `jlrdev-website.pages.dev` (proxied) | ✅ |
| TXT `resend._domainkey` (DKIM, DNS-only) | ✅ |
| MX `send` → `feedback-smtp.eu-west-1.amazonses.com` priority 10 | ✅ |
| TXT `send` → `v=spf1 include:amazonses.com ~all` | ✅ |
| MX `jlrdev.co.za` → mx1/mx2.improvmx.com (existing email routing) | ✅ kept |
| CNAME `brevo1._domainkey` (DNS-only) | ✅ kept |

### Nameservers
- Assigned: `holly.ns.cloudflare.com` + `jaziel.ns.cloudflare.com`
- Updated at Afrihost: 2026-05-25 ~14:12 SAST
- Zone status: **pending** → will become **active** automatically (CF emails when done)

### Resend
- Account: jan-louis@jlrdev.co.za
- Domain: `jlrdev.co.za` — region Ireland (eu-west-1) — status: **pending** (waiting for NS)
- Will auto-verify once NS propagates

### Contact Form
- Posts JSON directly to `/api/new-lead` (no Formspree — fully free)
- No external webhook configuration needed

---

## Key File Locations

All website files:
`C:\Users\Jan-Louis.Reynders\OneDrive\JLR_Dev\Projects\preview-dark-full\`

| File | Purpose |
|------|---------|
| `index.html` | Full single-page dark-theme website |
| `functions/api/new-lead.js` | CF Pages Function — intake pipeline (OpenAI + Resend) |
| `wrangler.toml` | CF Pages config |
| `_headers` | Security headers |
| `deploy.ps1` | Deploy script |
| `CLIENT_INTAKE.md` | Pipeline documentation (in `_Admin/`) |
| `CLAUDE_HANDOFF.md` | This file |
| `WEB_AGENT_INSTRUCTIONS.md` | Step-by-step for web agent tasks (mostly complete) |

Local intake script:
`C:\Users\Jan-Louis.Reynders\OneDrive\JLR_Dev\_Admin\scripts\new_client_intake.py`
- Scaffolds `JLR_Dev/Clients/<Name>/` folder + Brief.md
- Appends to `_Admin/leads.json`

---

## What Still Needs To Be Done

### ⏳ Wait for DNS propagation (automatic — no action needed)
- CF will email jan-louis@jlrdev.co.za when zone is active
- Resend will auto-verify domain once NS resolves
- Check: `nslookup -type=NS jlrdev.co.za 8.8.8.8` — should return holly/jaziel.ns.cloudflare.com

### ✅ After propagation — do one end-to-end test
1. Browse to `https://jlrdev.co.za` — dark theme site loads
2. Fill contact form → submit
3. Check `jan-louis@jlrdev.co.za` — lead briefing with OpenAI summary arrives
4. Check sender's inbox — auto-reply from `noreply@jlrdev.co.za` arrives

---

## How The Intake Pipeline Works

```
User fills contact form on jlrdev.co.za
  → fetch() POSTs JSON {name, email, subject, message} to /api/new-lead
    → Cloudflare Pages Function (functions/api/new-lead.js)
      → OpenAI gpt-4o-mini analyses message
          returns: {summary, projectType, draftReply, firstQuestions}
        → Resend sends auto-reply HTML email to client (from noreply@jlrdev.co.za)
        → Resend sends lead briefing HTML email to jan-louis@jlrdev.co.za
            (includes: name, email, message, AI summary, draft reply, suggested questions)
```

---

## How To Deploy

```powershell
# Refresh OAuth token first if needed (expires hourly):
# POST https://dash.cloudflare.com/oauth2/token
# body: grant_type=refresh_token&refresh_token=<from default.toml>&client_id=54d11594-84e4-41aa-b438-e81b8fa78ee7
# Token file: C:\Users\Jan-Louis.Reynders\AppData\Roaming\xdg.config\.wrangler\config\default.toml

$env:CLOUDFLARE_API_TOKEN = '<access_token>'
Set-Location "C:\Users\Jan-Louis.Reynders\OneDrive\JLR_Dev\Projects\preview-dark-full"
wrangler pages deploy . --project-name=jlrdev-website --branch=main
```

**Recommended:** Create a permanent CF API token at dash.cloudflare.com/profile/api-tokens
(permissions: Pages:Edit) and store it — avoids hourly OAuth refresh hassle.

---

## Already Complete — Do Not Redo

- ✅ Website built and deployed to Cloudflare Pages
- ✅ Formspree removed — form posts directly to /api/new-lead (free)
- ✅ Pipeline switched from Claude API to OpenAI gpt-4o-mini
- ✅ OPENAI_API_KEY + RESEND_API_KEY set as CF Pages encrypted secrets
- ✅ All DNS records configured in Cloudflare
- ✅ Afrihost nameservers updated to Cloudflare (2026-05-25)
- ✅ Resend domain + DNS records added (pending verification)
- ✅ Security headers (_headers)
- ✅ GeoTech PDF Extractor v1.4 delivered to Kevin Coertzen (GeoCalibre)
