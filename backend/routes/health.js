const express = require('express');
const router = express.Router();
const { checkHealth } = require('../controllers/health');

router.get('/', checkHealth);
router.get('/detailed', checkHealth);

module.exports = router; 