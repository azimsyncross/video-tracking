const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  deleteAccount, 
  getUserStats 
} = require('../controllers/user');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/account', deleteAccount);
router.get('/stats', getUserStats);

module.exports = router; 