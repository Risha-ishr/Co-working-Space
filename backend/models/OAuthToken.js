const mongoose = require('mongoose');

const oauthTokenSchema = new mongoose.Schema({
  provider: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  // FreshBooks account id, auto-detected from /users/me after connecting.
  accountId: { type: String, default: '' },
});

module.exports = mongoose.model('OAuthToken', oauthTokenSchema);
