const mongoose = require('mongoose');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

exports.checkHealth = async (req, res) => {
  try {
    const isDetailed = req.path === '/detailed';
    const healthCheck = {
      uptime: process.uptime(),
      timestamp: Date.now(),
      message: 'OK',
    };

    if (isDetailed) {
      healthCheck.database = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
      healthCheck.memory = process.memoryUsage();
      healthCheck.cpu = process.cpuUsage();

      const logDir = path.join(__dirname, '../logs');
      if (fs.existsSync(logDir)) {
        healthCheck.logs = {};
        const logFiles = fs.readdirSync(logDir);
        for (const file of logFiles) {
          const stats = fs.statSync(path.join(logDir, file));
          healthCheck.logs[file] = {
            size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
            lastModified: stats.mtime,
          };
        }
      }
    }

    logger.info('Health check performed', healthCheck);
    return successResponse(res, 200, 'Health check successful', healthCheck);
  } catch (error) {
    logger.error('Health check failed', error);
    return errorResponse(res, 503, 'Service Unavailable');
  }
}; 