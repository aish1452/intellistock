const { User } = require('../models');

// GET /api/v1/users (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }
    });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/users/:id/role (Admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'manager', 'analyst', 'viewer'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_ROLE', message: 'Invalid role provided' } });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    await user.update({ role });
    res.status(200).json({ success: true, data: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/users/:id (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, error: { code: 'CANT_DELETE_SELF', message: 'Cannot delete yourself' } });
    }

    await user.destroy();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};
