const axios = require('axios');
const OAuthToken = require('../models/OAuthToken');

const FB_BASE = 'https://api.freshbooks.com';
const TOKEN_URL = `${FB_BASE}/auth/oauth/token`;
const PROVIDER = 'freshbooks';

// In-memory cache to avoid hitting DB on every API call
let _cached = null; // { accessToken, refreshToken, expiresAt }

async function _loadTokens() {
  if (_cached && _cached.expiresAt > Date.now() + 60_000) return _cached;

  // Try DB first
  const row = await OAuthToken.findOne({ provider: PROVIDER });
  if (row && row.expiresAt > new Date(Date.now() + 60_000)) {
    _cached = { accessToken: row.accessToken, refreshToken: row.refreshToken, expiresAt: row.expiresAt.getTime() };
    return _cached;
  }

  // Fall back to env vars (only on first boot or if DB is empty)
  const envAccess = process.env.FRESHBOOKS_ACCESS_TOKEN;
  const envRefresh = process.env.FRESHBOOKS_REFRESH_TOKEN;
  if (!envRefresh) throw new Error('No FreshBooks refresh token available — set FRESHBOOKS_REFRESH_TOKEN in .env');

  return _refresh(envRefresh);
}

// Calls the FreshBooks identity endpoint and returns the first account id found.
// This is how we auto-detect FRESHBOOKS_ACCOUNT_ID so the user never has to hunt for it.
async function _fetchAccountId(accessToken) {
  const res = await axios.get(`${FB_BASE}/auth/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const memberships = res.data?.response?.business_memberships || [];
  for (const m of memberships) {
    const id = m?.business?.account_id;
    if (id) return String(id);
  }
  return '';
}

// Exchanges an OAuth2 authorization code for tokens and persists them.
// Used by the /auth/freshbooks/callback route so no manual copy-paste is needed.
async function exchangeCodeForTokens(code) {
  const res = await axios.post(TOKEN_URL, {
    grant_type: 'authorization_code',
    client_id: process.env.FRESHBOOKS_CLIENT_ID,
    client_secret: process.env.FRESHBOOKS_CLIENT_SECRET,
    redirect_uri: process.env.FRESHBOOKS_REDIRECT_URI,
    code,
  });

  const { access_token, refresh_token, expires_in } = res.data;
  const expiresAt = new Date(Date.now() + expires_in * 1000);

  // Best-effort: auto-detect the account id so it doesn't have to be set by hand.
  let accountId = '';
  try {
    accountId = await _fetchAccountId(access_token);
  } catch (err) {
    console.error('FreshBooks account-id auto-detect failed:', err.message);
  }

  const update = { accessToken: access_token, refreshToken: refresh_token, expiresAt };
  if (accountId) update.accountId = accountId;

  await OAuthToken.findOneAndUpdate(
    { provider: PROVIDER },
    update,
    { upsert: true, new: true }
  );

  _cached = { accessToken: access_token, refreshToken: refresh_token, expiresAt: expiresAt.getTime() };
  return { ..._cached, accountId };
}

// Env var wins; otherwise use the account id auto-detected at connect time.
async function resolveAccountId() {
  if (process.env.FRESHBOOKS_ACCOUNT_ID) return process.env.FRESHBOOKS_ACCOUNT_ID;
  const row = await OAuthToken.findOne({ provider: PROVIDER });
  if (row?.accountId) return row.accountId;
  throw new Error(
    'No FreshBooks account id — set FRESHBOOKS_ACCOUNT_ID in .env or reconnect at /auth/freshbooks'
  );
}

// Builds the FreshBooks consent URL the user must visit once.
function getAuthorizationUrl() {
  const params = new URLSearchParams({
    client_id: process.env.FRESHBOOKS_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.FRESHBOOKS_REDIRECT_URI,
  });
  return `https://my.freshbooks.com/service/auth/oauth/authorize?${params.toString()}`;
}

async function _refresh(refreshToken) {
  const res = await axios.post(TOKEN_URL, {
    grant_type: 'refresh_token',
    client_id: process.env.FRESHBOOKS_CLIENT_ID,
    client_secret: process.env.FRESHBOOKS_CLIENT_SECRET,
    redirect_uri: process.env.FRESHBOOKS_REDIRECT_URI,
    refresh_token: refreshToken,
  });

  const { access_token, refresh_token, expires_in } = res.data;
  const expiresAt = new Date(Date.now() + expires_in * 1000);

  // Persist the new tokens so they survive server restarts and rotation
  await OAuthToken.findOneAndUpdate(
    { provider: PROVIDER },
    { accessToken: access_token, refreshToken: refresh_token, expiresAt },
    { upsert: true, new: true }
  );

  _cached = { accessToken: access_token, refreshToken: refresh_token, expiresAt: expiresAt.getTime() };
  return _cached;
}

async function _getToken() {
  const tokens = await _loadTokens();
  return tokens.accessToken;
}

function _headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Api-Version': 'alpha',
  };
}

// Returns FreshBooks numeric client id (creates the client if not found by email)
async function findOrCreateClient(name, email) {
  const token = await _getToken();
  const accountId = await resolveAccountId();

  const searchRes = await axios.get(
    `${FB_BASE}/accounting/account/${accountId}/users/clients`,
    { headers: _headers(token), params: { search_email: email } }
  );

  const existing = searchRes.data?.response?.result?.clients || [];
  if (existing.length > 0) return String(existing[0].id);

  const [firstName, ...rest] = name.trim().split(' ');
  const createRes = await axios.post(
    `${FB_BASE}/accounting/account/${accountId}/users/clients`,
    { client: { email, fname: firstName, lname: rest.join(' ') || '-' } },
    { headers: _headers(token) }
  );

  return String(createRes.data.response.result.client.id);
}

// Creates a FreshBooks invoice and returns { invoiceId, paymentLink }
async function createInvoice({ clientId, description, amount, date }) {
  const token = await _getToken();
  const accountId = await resolveAccountId();

  const res = await axios.post(
    `${FB_BASE}/accounting/account/${accountId}/invoices/invoices`,
    {
      invoice: {
        customerid: Number(clientId),
        create_date: date,
        currency_code: 'INR',
        status: 1, // 1 = sent — generates a shareable payment link
        lines: [
          {
            type: 0,
            name: 'Co-Working Space Booking',
            description,
            unit_cost: { amount: String(amount), code: 'INR' },
            qty: 1,
          },
        ],
      },
    },
    { headers: _headers(token) }
  );

  const invoice = res.data.response.result.invoice;
  const paymentLink =
    invoice.links?.client_view ||
    `https://my.freshbooks.com/#/invoice/${invoice.id}`;

  return { invoiceId: String(invoice.id), paymentLink };
}

// Asks FreshBooks whether an invoice is fully paid. Returns 'paid' | 'unpaid' | 'unknown'.
// Used as a fallback for environments where the webhook can't reach the server (local dev).
async function getInvoicePaymentStatus(invoiceId) {
  const token = await _getToken();
  const accountId = await resolveAccountId();

  const res = await axios.get(
    `${FB_BASE}/accounting/account/${accountId}/invoices/invoices/${invoiceId}`,
    { headers: _headers(token) }
  );

  const invoice = res.data?.response?.result?.invoice;
  if (!invoice) return 'unknown';

  const outstanding = Number(
    invoice.outstanding?.amount ?? invoice.outstanding ?? NaN
  );
  if (invoice.v3_status === 'paid' || outstanding === 0) return 'paid';
  return 'unpaid';
}

// Reports whether a usable token is already stored (DB or valid env token).
async function isConnected() {
  try {
    const row = await OAuthToken.findOne({ provider: PROVIDER });
    if (row) return true;
    return Boolean(process.env.FRESHBOOKS_REFRESH_TOKEN);
  } catch {
    return false;
  }
}

module.exports = {
  findOrCreateClient,
  createInvoice,
  getInvoicePaymentStatus,
  exchangeCodeForTokens,
  getAuthorizationUrl,
  isConnected,
  resolveAccountId,
  // Always returns a valid (auto-refreshed) access token — use this instead of
  // reading process.env.FRESHBOOKS_ACCESS_TOKEN directly.
  getAccessToken: _getToken,
};
