const Video = require('../models/video');
const { NotFoundError } = require('../utils/customErrors');

class WatchService {
  static async getWatchProgress(playlistId) {
    const videos = await Video.find({ playlistId });
    const totalVideos = videos.length;
    const watchedVideos = videos.filter(video => video.watched).length;
    
    return {
      total: totalVideos,
      watched: watchedVideos,
      unwatched: totalVideos - watchedVideos,
      progress: totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0,
    };
  }

  static async markVideoWatched(videoId, userId, watched = true) {
    const video = await Video.findById(videoId).populate({
      path: 'playlistId',
      select: 'userId'
    });

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    if (video.playlistId.userId.toString() !== userId.toString()) {
      throw new NotFoundError('Video not found');
    }

    video.watched = watched;
    video.watchedAt = watched ? new Date() : null;
    await video.save();

    return video;
  }

  static async markAllVideosWatched(playlistId, userId, watched = true) {
    const playlist = await Playlist.findOne({ _id: playlistId, userId });
    if (!playlist) {
      throw new NotFoundError('Playlist not found');
    }

    await Video.updateMany(
      { playlistId },
      { 
        $set: { 
          watched,
          watchedAt: watched ? new Date() : null
        }
      }
    );

    return await this.getWatchProgress(playlistId);
  }
}

module.exports = WatchService; 