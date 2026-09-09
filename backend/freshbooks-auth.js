/**
 * One-time FreshBooks OAuth2 setup script.
 *
 * STEP 1 — print the authorization URL:
 *   node freshbooks-auth.js
 *
 * STEP 2 — exchange the code for tokens (paste the code from the redirect URL):
 *   node freshbooks-auth.js --code=PASTE_CODE_HERE
 */

require('dotenv').config();
const axios = require('axios');

const CLIENT_ID     = process.env.FRESHBOOKS_CLIENT_ID?.trim();
const CLIENT_SECRET = process.env.FRESHBOOKS_CLIENT_SECRET?.trim();
const REDIRECT_URI  = process.env.FRESHBOOKS_REDIRECT_URI?.trim();

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.error('Missing FRESHBOOKS_CLIENT_ID, FRESHBOOKS_CLIENT_SECRET, or FRESHBOOKS_REDIRECT_URI in .env');
  process.exit(1);
}

const codeArg = process.argv.find((a) => a.startsWith('--code='));

if (!codeArg) {
  // ── STEP 1: print the URL the user must visit ──────────────────────────────
  const authUrl =
    `https://my.freshbooks.com/service/auth/oauth/authorize` +
    `?client_id=${CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  console.log('\n──────────────────────────────────────────────────────');
  console.log('STEP 1 — Open this URL in your browser and authorize:');
  console.log('\n' + authUrl + '\n');
  console.log('After you click "Allow", your browser will redirect to:');
  console.log(`  ${REDIRECT_URI}?code=XXXXXX`);
  console.log('\nCopy that code from the URL bar, then run:');
  console.log('  node freshbooks-auth.js --code=XXXXXX');
  console.log('──────────────────────────────────────────────────────\n');
  process.exit(0);
}

// ── STEP 2: exchange the code for tokens ────────────────────────────────────
const code = codeArg.split('=').slice(1).join('=');

(async () => {
  try {
    const res = await axios.post('https://api.freshbooks.com/auth/oauth/token', {
      grant_type:    'authorization_code',
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      code,
    });

    const { access_token, refresh_token, expires_in } = res.data;

    console.log('\n✓ Tokens received!\n');
    console.log('Paste these two lines into your backend/.env:\n');
    console.log(`FRESHBOOKS_ACCESS_TOKEN=${access_token}`);
    console.log(`FRESHBOOKS_REFRESH_TOKEN=${refresh_token}`);
    console.log(`\n(Access token expires in ${expires_in}s — after that, the server auto-refreshes it from the DB)`);
    console.log('\nDone. Start your server and the tokens will be saved to MongoDB automatically.\n');
  } catch (err) {
    const detail = err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message;
    console.error('\nFailed to exchange code for tokens:\n', detail);
    console.error('\nMake sure you used the code immediately — it expires in ~30 seconds.');
    process.exit(1);
  }
})();
