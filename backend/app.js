const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');
const { requestLogger, errorLogger } = require('./middleware/loggerMiddleware');
const { apiLimiter } = require('./utils/rateLimiter');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const healthRoutes = require('./routes/health');
const playlistRoutes = require('./routes/playlist');
const superAdminRoutes = require('./routes/superAdmin');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./utils/customErrors');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Apply rate limiting to all routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/super-admin', superAdminRoutes);

// Handle 404
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

// Error logging and handling
app.use(errorLogger);
app.use(errorHandler);

module.exports = app; 