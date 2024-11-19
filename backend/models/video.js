const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  playlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    required: true,
  },
  youtubeVideoId: {
    type: String,
    required: true,
  },
  title: String,
  description: String,
  thumbnailUrl: String,
  duration: String,
  position: Number,
  watched: {
    type: Boolean,
    default: false,
  },
  watchedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema); 