const Playlist = require('../models/playlist');
const Video = require('../models/video');
const YoutubeService = require('../services/youtubeService');
const WatchService = require('../services/watchService');
const { successResponse } = require('../utils/responseHandler');
const { ValidationError, NotFoundError } = require('../utils/customErrors');

exports.addPlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.body;
    
    const playlist = await YoutubeService.syncPlaylist(playlistId, req.user.id);
    const videos = await YoutubeService.syncVideos(playlist);
    const progress = await WatchService.getWatchProgress(playlist._id);

    return successResponse(res, 201, 'Playlist added successfully', {
      playlist,
      videos,
      progress,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id });
    const playlistsWithProgress = await Promise.all(
      playlists.map(async (playlist) => {
        const progress = await WatchService.getWatchProgress(playlist._id);
        return {
          ...playlist.toObject(),
          progress,
        };
      })
    );

    return successResponse(res, 200, 'Playlists retrieved successfully', playlistsWithProgress);
  } catch (error) {
    next(error);
  }
};

exports.getPlaylistVideos = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const playlist = await Playlist.findOne({
      _id: playlistId,
      userId: req.user.id,
    });

    if (!playlist) {
      throw new NotFoundError('Playlist not found');
    }

    const cacheDuration = process.env.CACHE_DURATION || 3600;
    if (await YoutubeService.shouldUpdatePlaylist(playlist, cacheDuration)) {
      await YoutubeService.syncPlaylist(playlist.youtubePlaylistId, req.user.id);
      await YoutubeService.syncVideos(playlist);
    }

    const videos = await Video.find({ playlistId }).sort('position');
    const progress = await WatchService.getWatchProgress(playlistId);

    return successResponse(res, 200, 'Videos retrieved successfully', {
      playlist,
      videos,
      progress,
    });
  } catch (error) {
    next(error);
  }
};

exports.markVideoWatched = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { watched } = req.body;

    const video = await WatchService.markVideoWatched(videoId, req.user.id, watched);
    const progress = await WatchService.getWatchProgress(video.playlistId);

    return successResponse(res, 200, 'Video updated successfully', { video, progress });
  } catch (error) {
    next(error);
  }
};

exports.markAllWatched = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const { watched } = req.body;

    const progress = await WatchService.markAllVideosWatched(playlistId, req.user.id, watched);
    return successResponse(res, 200, 'All videos updated successfully', { progress });
  } catch (error) {
    next(error);
  }
}; 