const SuperAdmin = require('../models/superAdmin');
const User = require('../models/user');
const Playlist = require('../models/playlist');
const { generateToken } = require('../utils/jwt');
const { ValidationError, AuthenticationError } = require('../utils/customErrors');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class SuperAdminService {
  static async initialize(credentials) {
    const existingAdmin = await SuperAdmin.findOne({ isInitialized: true });
    if (existingAdmin) {
      throw new ValidationError('Super admin already initialized');
    }

    const { username, password } = credentials;
    if (!username || !password) {
      throw new ValidationError('Username and password are required');
    }

    const superAdmin = await SuperAdmin.create({
      username,
      password,
      isInitialized: true,
    });

    const token = await generateToken(superAdmin._id);
    return { token, username: superAdmin.username };
  }

  static async login(credentials) {
    const { username, password } = credentials;
    const superAdmin = await SuperAdmin.findOne({ username });

    if (!superAdmin || !(await superAdmin.comparePassword(password))) {
      throw new AuthenticationError('Invalid credentials');
    }

    const token = await generateToken(superAdmin._id);
    return { token, username: superAdmin.username };
  }

  static async getSystemStats() {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get playlist statistics
    const totalPlaylists = await Playlist.countDocuments();
    const playlistsByUser = await Playlist.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);

    // Get API call statistics from logs
    const apiStats = await this.getApiCallStats();

    return {
      users: {
        total: totalUsers,
        byRole: usersByRole,
      },
      playlists: {
        total: totalPlaylists,
        byUser: playlistsByUser.length,
        averagePerUser: totalPlaylists / (await User.countDocuments()),
      },
      api: apiStats,
    };
  }

  static async getApiCallStats() {
    try {
      const logPath = path.join(__dirname, '../logs/api-requests.log');
      const logs = await fs.readFile(logPath, 'utf8');
      const logLines = logs.split('\n').filter(Boolean);
      
      const apiCalls = logLines.map(line => JSON.parse(line));
      const last24Hours = Date.now() - (24 * 60 * 60 * 1000);

      return {
        total: apiCalls.length,
        last24Hours: apiCalls.filter(log => new Date(log.timestamp) > last24Hours).length,
        byEndpoint: this.groupApiCallsByEndpoint(apiCalls),
        byUser: this.groupApiCallsByUser(apiCalls),
      };
    } catch (error) {
      logger.error('Error reading API logs:', error);
      return { error: 'Could not retrieve API statistics' };
    }
  }

  static async getSystemLogs(type = 'all', limit = 100) {
    try {
      const logTypes = {
        error: 'error.log',
        api: 'api-requests.log',
        all: 'combined.log',
      };

      const logFile = logTypes[type] || logTypes.all;
      const logPath = path.join(__dirname, '../logs', logFile);
      const logs = await fs.readFile(logPath, 'utf8');
      
      return logs
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line))
        .slice(-limit);
    } catch (error) {
      logger.error('Error reading system logs:', error);
      throw new Error('Could not retrieve system logs');
    }
  }

  static groupApiCallsByEndpoint(apiCalls) {
    return apiCalls.reduce((acc, call) => {
      const endpoint = call.url.split('?')[0];
      acc[endpoint] = (acc[endpoint] || 0) + 1;
      return acc;
    }, {});
  }

  static groupApiCallsByUser(apiCalls) {
    return apiCalls.reduce((acc, call) => {
      const userId = call.userId || 'anonymous';
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {});
  }

  static async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');

    const total = await User.countDocuments();

    return {
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    };
  }
}

module.exports = SuperAdminService; 