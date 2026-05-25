# Web Agent Instructions — jlrdev.co.za Setup
## Last updated: 2026-05-25

---

## Status Overview

| Task | Status |
|------|--------|
| Cloudflare zone created | ✅ Done |
| Afrihost nameservers updated | ✅ Done (holly + jaziel.ns.cloudflare.com) |
| DNS records in Cloudflare | ✅ Done |
| CF Pages project deployed | ✅ Done |
| OPENAI_API_KEY set | ✅ Done |
| RESEND_API_KEY set | ✅ Done |
| Resend domain added | ✅ Done (pending DNS verify) |
| NS propagation | ⏳ In progress (up to 24h) |
| End-to-end test | ⏳ Do after NS propagates |

---

## TASK 1 — COMPLETE ✅
Cloudflare zone `jlrdev.co.za` created.
Nameservers `holly.ns.cloudflare.com` + `jaziel.ns.cloudflare.com` set at Afrihost.

---

## TASK 2 — COMPLETE ✅
All DNS records configured in Cloudflare:
- CNAME `jlrdev.co.za` → `jlrdev-website.pages.dev` (proxied)
- CNAME `www` → `jlrdev-website.pages.dev` (proxied)
- TXT `resend._domainkey` (DKIM, DNS-only)
- MX `send` → `feedback-smtp.eu-west-1.amazonses.com` priority 10
- TXT `send` → `v=spf1 include:amazonses.com ~all`

---

## TASK 3 — COMPLETE ✅
CF Pages secrets set:
- `OPENAI_API_KEY` — gpt-4o-mini for lead analysis
- `RESEND_API_KEY` — Resend jlrdev-website key

---

## TASK 4 — COMPLETE ✅
Resend account set up (jan-louis@jlrdev.co.za).
Domain `jlrdev.co.za` added — region Ireland (eu-west-1).
DNS records added to Cloudflare. Status: pending (auto-verifies after NS propagates).

---

## TASK 5 — NOT NEEDED ✅
Formspree webhook is NOT required. The contact form posts directly to `/api/new-lead`.
Formspree has been removed from the pipeline entirely.

---

## TASK 6 — After NS propagation: End-to-end test

Steps:
1. Browse to `https://jlrdev.co.za` — dark theme JLR Dev site must load.
2. Fill in the contact form with a test name, email, subject, and message.
3. Submit the form.
4. Within 10 seconds, check `jan-louis@jlrdev.co.za`:
   - Should receive a **lead briefing email** with AI summary, draft reply, and suggested questions.
5. Check the test sender's inbox:
   - Should receive an **auto-reply** from `noreply@jlrdev.co.za`.
6. If both arrive — pipeline is live and fully working. ✅

---

## Context

- CF Pages project: `jlrdev-website` (account: jan-louis@jlrdev.co.za)
- Account ID: `099dce235d2d4c94021b4fbfcb0b3acd`
- Zone ID: `fc59aeb70e56dae3e829baa610ef63af`
- Full handoff doc: `CLAUDE_HANDOFF.md` (same folder)
- Pipeline docs: `C:\Users\Jan-Louis.Reynders\OneDrive\JLR_Dev\_Admin\CLIENT_INTAKE.md`
