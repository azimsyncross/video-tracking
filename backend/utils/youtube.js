const axios = require('axios');
const { youtubeApiKey } = require('../config/variables.config');

const youtube = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
  params: {
    key: youtubeApiKey,
  },
});

exports.getPlaylistDetails = async (playlistId) => {
  const response = await youtube.get('/playlists', {
    params: {
      part: 'snippet,contentDetails',
      id: playlistId,
    },
  });

  const playlist = response.data.items[0];
  return {
    youtubePlaylistId: playlist.id,
    title: playlist.snippet.title,
    description: playlist.snippet.description,
    thumbnailUrl: playlist.snippet.thumbnails.default.url,
    videoCount: playlist.contentDetails.itemCount,
  };
};

exports.getPlaylistVideos = async (playlistId) => {
  let videos = [];
  let nextPageToken = '';

  do {
    const response = await youtube.get('/playlistItems', {
      params: {
        part: 'snippet,contentDetails',
        playlistId: playlistId,
        maxResults: 50,
        pageToken: nextPageToken,
      },
    });

    const videoIds = response.data.items.map(item => item.contentDetails.videoId).join(',');
    const videoDetails = await youtube.get('/videos', {
      params: {
        part: 'contentDetails',
        id: videoIds,
      },
    });

    videos = videos.concat(
      response.data.items.map((item, index) => ({
        youtubeVideoId: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.default.url,
        duration: videoDetails.data.items[index].contentDetails.duration,
        position: item.snippet.position,
      }))
    );

    nextPageToken = response.data.nextPageToken;
  } while (nextPageToken);

  return videos;
}; 