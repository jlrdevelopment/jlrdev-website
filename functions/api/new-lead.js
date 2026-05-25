/**
 * Cloudflare Pages Function — /api/new-lead
 *
 * Receives Formspree webhook POST, calls Claude API to analyse the lead,
 * sends auto-reply to client and enriched briefing to Jan-Louis.
 *
 * Env vars (set in Cloudflare Pages → Settings → Environment variables):
 *   OPENAI_API_KEY   — sk-proj-...
 *   RESEND_API_KEY   — re_...
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const RESEND_URL = 'https://api.resend.com/emails';
const JL_EMAIL   = 'jan-louis@jlrdev.co.za';
const FROM_AUTO  = 'JLR Dev <noreply@jlrdev.co.za>';

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); }
  catch { return new Response('Bad request', { status: 400 }); }

  const name    = (body.name    || 'there').trim().slice(0, 200);
  const email   = (body.email   || '').trim().slice(0, 200);
  const subject = (body.subject || 'New enquiry').trim().slice(0, 300);
  const message = (body.message || '').trim().slice(0, 5000);

  if (!email || !message) return new Response('Missing fields', { status: 400 });

  // ── 1. OpenAI analysis ────────────────────────────────────────────────────
  let analysis = { summary: '', projectType: 'Unknown', draftReply: '', firstQuestions: '' };

  try {
    const prompt = `You are helping Jan-Louis Reynders (JLR Dev — solo software developer, Bloemfontein SA) process a new client enquiry. Analyse the message and respond with a JSON object with these exact keys:
- summary: 1–2 sentence plain-English summary of what they need
- projectType: one of "Automation Tool", "Data Pipeline", "Desktop App", "Website", "Unknown"
- draftReply: a warm, professional reply from Jan-Louis (first person, "I/me/my" only, never "we"). 3–5 sentences. Acknowledge their specific problem, briefly explain how you'd approach it, and invite them to share more or book a call.
- firstQuestions: 2–3 clarifying questions Jan-Louis should ask next, as a plain bulleted list

Client message:
Name: ${name}
Subject: ${subject}
Message: ${message}

Respond ONLY with valid JSON. No markdown, no code fences, no explanation.`;

    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    analysis = JSON.parse(data?.choices?.[0]?.message?.content || '{}');
  } catch (err) {
    console.error('OpenAI error:', err);
  }

  // ── 2. Email helper ────────────────────────────────────────────────────────
  const send = (to, subj, html, replyTo) => fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_AUTO,
      to,
      subject: subj,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  // ── 3. Auto-reply to client ────────────────────────────────────────────────
  const replyBody = analysis.draftReply
    ? analysis.draftReply.split(/\n+/).map(p => `<p>${p}</p>`).join('\n    ')
    : `<p>Thank you for reaching out. I've received your message and will review your project shortly. I'll be in touch within 24 hours.</p>`;

  const clientHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;margin:0;padding:32px 0}
.w{max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09)}
.h{background:#0d0f14;padding:28px 32px}
.ht{color:#fff;font-size:20px;font-weight:700;margin:0;letter-spacing:-0.3px}
.hs{color:#7EB3FF;font-size:11px;margin:5px 0 0;text-transform:uppercase;letter-spacing:1.2px}
.b{padding:28px 32px;color:#333;font-size:14px;line-height:1.75}
.b p{margin:0 0 14px}
.next{background:#f0f5ff;border-left:3px solid #7EB3FF;padding:12px 16px;border-radius:0 6px 6px 0;margin:20px 0;font-size:13px;color:#555}
.f{padding:16px 32px;background:#f0f0f0;font-size:11px;color:#888;text-align:center}
.f a{color:#7EB3FF;text-decoration:none}
</style></head>
<body><div class="w">
  <div class="h">
    <p class="ht">JLR Dev</p>
    <p class="hs">Message received — we'll be in touch</p>
  </div>
  <div class="b">
    <p>Hi ${name},</p>
    ${replyBody}
    <div class="next"><strong>What happens next:</strong> I'll review your message, do a quick assessment, and come back to you with thoughts and a few questions — usually within 24 hours.</div>
    <p>In the meantime, feel free to reply directly to this email or WhatsApp me on <strong>082 852 5108</strong> if anything is urgent.</p>
    <p>Kind regards,<br><strong>Jan-Louis Reynders</strong><br>JLR Dev</p>
  </div>
  <div class="f"><a href="https://jlrdev.co.za">jlrdev.co.za</a> &nbsp;·&nbsp; jan-louis@jlrdev.co.za &nbsp;·&nbsp; 082 852 5108</div>
</div></body></html>`;

  // ── 4. Lead briefing to JL ─────────────────────────────────────────────────
  const jlHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;margin:0;padding:32px 0}
.w{max-width:620px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09)}
.h{background:#0d0f14;padding:22px 32px;display:flex;align-items:center;justify-content:space-between}
.ht{color:#fff;font-size:17px;font-weight:700;margin:0}
.badge{background:#7EB3FF;color:#0d0f14;font-size:10px;font-weight:700;padding:4px 11px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap}
.b{padding:24px 32px;color:#333;font-size:14px;line-height:1.6}
.s{margin-bottom:18px}
.lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#7EB3FF;margin-bottom:5px}
.val{background:#f8f8f8;border:1px solid #e8e8e8;border-radius:6px;padding:10px 14px;font-size:13px;white-space:pre-wrap}
.draft{background:#f0f5ff;border:1px solid #c8d8ff;border-radius:6px;padding:14px 16px;font-size:13px;line-height:1.75;white-space:pre-wrap}
.q{background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:12px 16px;font-size:13px;color:#555;white-space:pre-wrap}
.f{padding:14px 32px;background:#f0f0f0;font-size:11px;color:#888;text-align:center}
</style></head>
<body><div class="w">
  <div class="h">
    <p class="ht">🔔 New Lead — JLR Dev</p>
    <span class="badge">${analysis.projectType || 'Enquiry'}</span>
  </div>
  <div class="b">
    <div class="s"><div class="lbl">From</div><div class="val">${name} &lt;${email}&gt;</div></div>
    <div class="s"><div class="lbl">Subject</div><div class="val">${subject}</div></div>
    <div class="s"><div class="lbl">Message</div><div class="val">${message}</div></div>
    ${analysis.summary ? `<div class="s"><div class="lbl">AI Summary</div><div class="val">${analysis.summary}</div></div>` : ''}
    ${analysis.draftReply ? `<div class="s"><div class="lbl">Suggested Reply — review before sending</div><div class="draft">${analysis.draftReply}</div></div>` : ''}
    ${analysis.firstQuestions ? `<div class="s"><div class="lbl">Suggested follow-up questions</div><div class="q">${analysis.firstQuestions}</div></div>` : ''}
  </div>
  <div class="f">Auto-generated by JLR Dev lead pipeline · jlrdev.co.za</div>
</div></body></html>`;

  await Promise.allSettled([
    send(email, `Re: ${subject} — JLR Dev`, clientHtml, JL_EMAIL),
    send(JL_EMAIL, `🔔 New lead: ${name} — ${analysis.projectType || subject}`, jlHtml),
  ]);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://jlrdev.co.za' },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://jlrdev.co.za',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
