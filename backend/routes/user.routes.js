const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.use(authMiddleware);

// Admin only routes
router.get('/', requireRole('admin'), userController.getUsers);
router.patch('/:id/role', requireRole('admin'), userController.updateUserRole);
router.delete('/:id', requireRole('admin'), userController.deleteUser);

module.exports = router;
