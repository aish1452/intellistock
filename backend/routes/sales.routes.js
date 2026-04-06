const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.use(authMiddleware);

router.get('/', salesController.getSales);
router.get('/summary', salesController.getSalesSummary);
router.post('/', requireRole('admin', 'manager', 'analyst', 'viewer'), salesController.createSale);

module.exports = router;
