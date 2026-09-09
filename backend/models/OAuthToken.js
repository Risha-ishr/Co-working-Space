const mongoose = require('mongoose');

const oauthTokenSchema = new mongoose.Schema({
  provider: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model('OAuthToken', oauthTokenSchema);
