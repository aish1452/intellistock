const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.use(authMiddleware);

router.get('/', inventoryController.getInventory);
router.get('/low-stock', inventoryController.getLowStock);

// Manager+ can update inventory manually (though sales auto-update)
router.patch('/:id', requireRole('admin', 'manager'), inventoryController.updateInventory);

module.exports = router;
