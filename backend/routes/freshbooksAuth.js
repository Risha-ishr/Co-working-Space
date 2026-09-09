const express = require('express');
const {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  isConnected,
  resolveAccountId,
} = require('../utils/freshbooks');

const router = express.Router();

const REQUIRED_ENV = [
  'FRESHBOOKS_CLIENT_ID',
  'FRESHBOOKS_CLIENT_SECRET',
  'FRESHBOOKS_REDIRECT_URI',
];

function missingEnv() {
  return REQUIRED_ENV.filter((k) => !process.env[k]);
}

function page(title, body) {
  return `<!doctype html><meta charset="utf-8">
<title>${title}</title>
<body style="font-family:system-ui,sans-serif;max-width:640px;margin:60px auto;padding:0 20px;line-height:1.6">
${body}
</body>`;
}

// GET /auth/freshbooks — status + one-click connect link
router.get('/', async (req, res) => {
  const missing = missingEnv();
  if (missing.length) {
    return res
      .status(500)
      .send(page('FreshBooks — not configured',
        `<h2>FreshBooks is not configured</h2>
         <p>Set these in <code>backend/.env</code> and restart:</p>
         <ul>${missing.map((k) => `<li><code>${k}</code></li>`).join('')}</ul>`));
  }

  const connected = await isConnected();
  let accountLine = '';
  if (connected) {
    try {
      accountLine = `<p>Account id: <code>${await resolveAccountId()}</code></p>`;
    } catch {
      accountLine = `<p style="color:#b00">Connected, but no account id was detected —
        set <code>FRESHBOOKS_ACCOUNT_ID</code> in .env, or click Reconnect.</p>`;
    }
  }
  res.send(page('FreshBooks connection',
    `<h2>FreshBooks connection</h2>
     <p>Status: <strong>${connected ? '✅ Connected' : '❌ Not connected'}</strong></p>
     ${accountLine}
     <p><a href="/auth/freshbooks/connect">${connected ? 'Reconnect' : 'Connect FreshBooks'}</a></p>`));
});

// GET /auth/freshbooks/debug — shows what the server is actually using
router.get('/debug', async (req, res) => {
  let connected = false;
  let accountId = null;
  let accountErr = null;
  try { connected = await isConnected(); } catch (e) { accountErr = e.message; }
  try { accountId = await resolveAccountId(); } catch (e) { accountErr = e.message; }
  res.json({
    clientIdSet: Boolean(process.env.FRESHBOOKS_CLIENT_ID),
    clientSecretSet: Boolean(process.env.FRESHBOOKS_CLIENT_SECRET),
    redirectUri: process.env.FRESHBOOKS_REDIRECT_URI || null,
    authorizeUrl: missingEnv().length ? null : getAuthorizationUrl(),
    connected,
    accountId,
    accountErr,
  });
});

// GET /auth/freshbooks/connect — redirect the user to FreshBooks consent
router.get('/connect', (req, res) => {
  if (missingEnv().length) return res.redirect('/auth/freshbooks');
  const url = getAuthorizationUrl();
  console.log('[freshbooks] redirecting to consent:', url);
  res.redirect(url);
});

// GET /auth/freshbooks/callback — FreshBooks redirects here with ?code=...
router.get('/callback', async (req, res) => {
  console.log('[freshbooks] callback hit. query =', req.query);
  const { code, error, error_description } = req.query;

  if (error) {
    return res.status(400).send(page('FreshBooks — authorization failed',
      `<h2>Authorization failed</h2><p>${error}: ${error_description || ''}</p>
       <p><a href="/auth/freshbooks">Try again</a></p>`));
  }
  if (!code) {
    return res.status(400).send(page('FreshBooks — missing code',
      `<h2>Missing authorization code</h2><p><a href="/auth/freshbooks">Start over</a></p>`));
  }

  try {
    const { accountId } = await exchangeCodeForTokens(String(code));
    const acctLine = accountId
      ? `<p>Detected account id: <code>${accountId}</code> — saved, nothing else to set.</p>`
      : `<p style="color:#b00">Could not auto-detect the account id.
         Set <code>FRESHBOOKS_ACCOUNT_ID</code> in <code>backend/.env</code> and restart.</p>`;
    res.send(page('FreshBooks — connected',
      `<h2>✅ FreshBooks connected</h2>
       <p>Tokens were saved to the database and refresh automatically from now on.</p>
       ${acctLine}`));
  } catch (err) {
    const detail = err.response?.data
      ? JSON.stringify(err.response.data)
      : err.message;
    console.error('[freshbooks] token exchange failed:', detail);
    res.status(500).send(page('FreshBooks — token exchange failed',
      `<h2>Token exchange failed</h2><pre style="white-space:pre-wrap">${detail}</pre>
       <p>The code expires in ~30s — <a href="/auth/freshbooks/connect">get a fresh one</a>.</p>`));
  }
});

module.exports = router;
