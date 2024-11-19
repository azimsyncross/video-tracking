const rateLimit = require('express-rate-limit');
const { errorResponse } = require('./responseHandler');
const logger = require('./logger');

// Helper function to create limiter with custom configurations
const createLimiter = ({ windowMs, max, message, type }) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.',
    },
    handler: (req, res, next) => {
      logger.warn(`Rate limit exceeded for ${type}`, {
        ip: req.ip,
        path: req.originalUrl,
        userId: req.user?.id || 'anonymous',
      });
      return errorResponse(res, 429, message || 'Too many requests, please try again later.');
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
};

// General API limiter - 100 requests per minute
exports.apiLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests from this IP, please try again after a minute',
  type: 'API',
});

// Auth routes limiter - 5 requests per minute
exports.authLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many authentication attempts, please try again after a minute',
  type: 'Auth',
});

// Super admin limiter - 20 requests per minute
exports.superAdminLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many super admin requests, please try again after a minute',
  type: 'SuperAdmin',
});

// YouTube API limiter - 50 requests per minute
exports.youtubeLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  message: 'YouTube API rate limit reached, please try again after a minute',
  type: 'YouTube',
}); 