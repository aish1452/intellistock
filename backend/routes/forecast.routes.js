const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecast.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.use(authMiddleware);

// Analyst+ can request forecast
router.post('/:productId', requireRole('admin', 'manager', 'analyst'), forecastController.generateForecast);

module.exports = router;
