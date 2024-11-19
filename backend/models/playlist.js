const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  youtubePlaylistId: {
    type: String,
    required: true,
  },
  title: String,
  description: String,
  thumbnailUrl: String,
  videoCount: Number,
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema); 