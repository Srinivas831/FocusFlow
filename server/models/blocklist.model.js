const mongoose = require('mongoose');

const blocklistSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['website', 'app'], required: true },
  value: { type: String, required: true } // e.g., "facebook.com", "com.netflix.app"
});

const BlocklistModel = mongoose.model('Blocklist', blocklistSchema);
module.exports = { BlocklistModel };
