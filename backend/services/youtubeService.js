const { getPlaylistDetails, getPlaylistVideos } = require('../utils/youtube');
const Playlist = require('../models/playlist');
const Video = require('../models/video');
const { ValidationError } = require('../utils/customErrors');
const { youtubeLimiter } = require('../utils/rateLimiter');

class YoutubeService {
  static async syncPlaylist(playlistId, userId) {
    await new Promise((resolve) => youtubeLimiter.consume(userId, resolve));
    
    const playlistDetails = await getPlaylistDetails(playlistId);
    const existingPlaylist = await Playlist.findOne({
      youtubePlaylistId: playlistId,
      userId,
    });

    if (existingPlaylist) {
      Object.assign(existingPlaylist, playlistDetails);
      existingPlaylist.lastUpdated = new Date();
      await existingPlaylist.save();
      return existingPlaylist;
    }

    return await Playlist.create({
      userId,
      ...playlistDetails,
    });
  }

  static async syncVideos(playlist) {
    await new Promise((resolve) => youtubeLimiter.consume(playlist.userId, resolve));
    
    const videos = await getPlaylistVideos(playlist.youtubePlaylistId);
    const operations = videos.map(video => ({
      updateOne: {
        filter: { 
          playlistId: playlist._id,
          youtubeVideoId: video.youtubeVideoId 
        },
        update: { 
          $set: {
            ...video,
            playlistId: playlist._id,
          }
        },
        upsert: true
      }
    }));

    await Video.bulkWrite(operations);
    return await Video.find({ playlistId: playlist._id }).sort('position');
  }

  static async shouldUpdatePlaylist(playlist, cacheDuration) {
    if (!playlist.lastUpdated) return true;
    const timeSinceLastUpdate = (Date.now() - playlist.lastUpdated.getTime()) / 1000;
    return timeSinceLastUpdate > cacheDuration;
  }
}

module.exports = YoutubeService; 