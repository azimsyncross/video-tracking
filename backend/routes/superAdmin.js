const express = require('express');
const router = express.Router();
const { superAdminLimiter } = require('../utils/rateLimiter');
const { 
  initialize,
  login,
  getSystemStats,
  getSystemLogs,
  getAllUsers,
} = require('../controllers/superAdmin');
const { protectSuperAdmin, checkInitialization } = require('../middleware/superAdmin');

// Apply super admin rate limiting
router.use(superAdminLimiter);

// Public routes
router.post('/initialize', checkInitialization, initialize);
router.post('/login', login);

// Protected routes
router.use(protectSuperAdmin);
router.get('/stats', getSystemStats);
router.get('/logs', getSystemLogs);
router.get('/users', getAllUsers);

module.exports = router; 