const express = require('express');
const router = express.Router();
const { authLimiter } = require('../utils/rateLimiter');
const { 
  register, 
  login,
  logout,
  logoutAll,
  forgotPassword, 
  resetPassword,
  changePassword,
  loginWithCode,
  verifyLoginCode
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// Apply stricter rate limiting to authentication routes
router.use(authLimiter);

router.post('/register', register);
router.post('/login', login);
router.post('/login-with-code', loginWithCode);
router.post('/verify-login-code', verifyLoginCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes don't need auth rate limiting
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);
router.post('/change-password', protect, changePassword);

module.exports = router; 