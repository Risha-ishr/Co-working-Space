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
  const accountId = process.env.FRESHBOOKS_ACCOUNT_ID;

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
  const accountId = process.env.FRESHBOOKS_ACCOUNT_ID;

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

module.exports = { findOrCreateClient, createInvoice };
