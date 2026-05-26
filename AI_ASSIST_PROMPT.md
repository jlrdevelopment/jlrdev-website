# AI Assistant Prompt — JLR Dev Website DNS Fix & Go-Live

Copy everything below this line and paste it to your AI assistant.

---

## Context

I am Jan-Louis Reynders, solo software developer & AI consultant at JLR Dev (jlrdev.co.za), based in Bloemfontein, South Africa.

I need help completing the go-live of my business website. Here is the full picture:

---

## Infrastructure

| Item | Detail |
|---|---|
| Website | Single-page dark-theme site (`index.html`) — already built and deployed |
| Hosting | Cloudflare Pages — project: `jlrdev-website` |
| Live (temp) URL | `https://jlrdev-website.pages.dev` ✅ working |
| Target domain | `jlrdev.co.za` ❌ not working yet |
| Domain registrar | Afrihost — [myaccount.afrihost.co.za](https://myaccount.afrihost.co.za) |
| GitHub repo | `github.com/jlrdevelopment/jlrdev-website` · branch: `main` |

---

## The Problem

`jlrdev.co.za` currently points to a **paused Netlify site** (old host). The nameserver change to Cloudflare was attempted on 2026-05-25 but **did not apply** — DNS still resolves to Afrihost's default nameservers (`dns1.co.za` / `dns2.co.za`) instead of Cloudflare.

---

## What Needs To Be Done

### Step 1 — Fix Nameservers at Afrihost (MANUAL — I must do this)

1. Log into [myaccount.afrihost.co.za](https://myaccount.afrihost.co.za)
2. Go to **Domain Manager** → `jlrdev.co.za` → **Manage Nameservers**
3. Remove all existing nameservers
4. Add both of these:
   - `holly.ns.cloudflare.com`
   - `jaziel.ns.cloudflare.com`
5. Save
6. Wait 1–24 hrs for propagation (usually under 1 hr)

**Help me navigate this** — if I get stuck or the Afrihost UI looks different, guide me step by step.

---

### Step 2 — Verify DNS Has Propagated

Once I've saved the nameservers, check propagation using:
- [whatsmydns.net](https://www.whatsmydns.net/#NS/jlrdev.co.za)
- Or: `nslookup -type=NS jlrdev.co.za 8.8.8.8`

We're looking for both `holly.ns.cloudflare.com` and `jaziel.ns.cloudflare.com` to appear globally.

---

### Step 3 — Confirm Cloudflare Zone Is Active

Once NS propagates, Cloudflare emails `jan-louis@jlrdev.co.za` to confirm the zone is active.

In Cloudflare dashboard → **DNS** → confirm these records exist:

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | `jlrdev.co.za` | `jlrdev-website.pages.dev` | ✅ ON |
| CNAME | `www` | `jlrdev-website.pages.dev` | ✅ ON |
| TXT | `resend._domainkey` | DKIM key | OFF |
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` (priority 10) | OFF |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | OFF |
| MX | `jlrdev.co.za` | mx1.improvmx.com + mx2.improvmx.com | OFF |

If any are missing, add them.

---

### Step 4 — Verify Resend Email Domain

Once Cloudflare zone is active, Resend should auto-verify the `jlrdev.co.za` domain.

Check at [resend.com/domains](https://resend.com/domains) — status should change from **Pending** to **Verified**.

If not auto-verified:
1. Log into Resend → Domains → `jlrdev.co.za` → click **Verify**

The pipeline sends from `noreply@jlrdev.co.za` and delivers lead briefings to `jan-louis@jlrdev.co.za`.

---

### Step 5 — Final Go-Live Test

Once `https://jlrdev.co.za` loads the dark site:

1. Browse `https://jlrdev.co.za` — confirm dark site loads with `<JLR/>` logo in nav
2. Browse `https://www.jlrdev.co.za` — confirm it also works (www redirect)
3. Check SSL — padlock must show (Let's Encrypt via Cloudflare, auto-issued)
4. Submit the contact form with test details
5. Check `jan-louis@jlrdev.co.za` — lead briefing email with AI analysis should arrive
6. Check the sender test email — auto-reply from `noreply@jlrdev.co.za` should arrive

---

## Intake Pipeline (for reference)

```
User fills contact form on jlrdev.co.za
  → fetch() POSTs JSON to /api/new-lead (Cloudflare Pages Function)
    → OpenAI gpt-4o-mini → AI analysis {summary, projectType, draftReply, firstQuestions}
      → Resend: auto-reply HTML email → client
      → Resend: lead briefing HTML email → jan-louis@jlrdev.co.za
```

Secrets stored in Cloudflare Pages → Settings → Environment Variables:
- `OPENAI_API_KEY` ✅
- `RESEND_API_KEY` ✅

---

## Key Contacts & Accounts

| Account | Login |
|---|---|
| Cloudflare | jan-louis@jlrdev.co.za |
| Afrihost | (Afrihost account — jlrdev.co.za domain) |
| Resend | jan-louis@jlrdev.co.za |
| GitHub | jlrdevelopment (only account for JLR Dev work) |

---

## Deploy Command (if site changes needed)

```powershell
Set-Location "C:\Users\Jan-Louis.Reynders\OneDrive\JLR_Dev\Projects\preview-dark-full"
.\deploy.ps1
```

Or manually:
```powershell
wrangler pages deploy . --project-name=jlrdev-website --branch=main
```

---

Please guide me step by step through the remaining items, starting with the Afrihost nameserver fix. Ask me to confirm each step before moving to the next.
