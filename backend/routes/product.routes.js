const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.use(authMiddleware);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Manager+ route constraints
router.post('/', requireRole('admin', 'manager'), productController.createProduct);
router.put('/:id', requireRole('admin', 'manager'), productController.updateProduct);

// Admin only
router.delete('/:id', requireRole('admin'), productController.deleteProduct);

module.exports = router;
