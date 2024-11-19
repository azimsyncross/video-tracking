const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  addPlaylist,
  getPlaylists,
  getPlaylistVideos,
  updatePlaylist,
  markVideoWatched,
  markAllWatched,
} = require('../controllers/playlist');

router.use(protect);

router.post('/', addPlaylist);
router.get('/', getPlaylists);
router.get('/:playlistId/videos', getPlaylistVideos);
router.put('/:playlistId', updatePlaylist);
router.patch('/videos/:videoId/watched', markVideoWatched);
router.patch('/:playlistId/watch-all', markAllWatched);

module.exports = router; 