const { Inventory, Product, AuditLog } = require('../models');
const { Op } = require('sequelize');

// GET /api/v1/inventory
exports.getInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.findAll({
      include: [{ model: Product, attributes: ['name', 'sku', 'reorder_level'] }]
    });

    res.status(200).json({ success: true, data: inventory });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/inventory/low-stock
exports.getLowStock = async (req, res, next) => {
  try {
    const inventoryItems = await Inventory.findAll({
      include: [{
        model: Product,
        attributes: ['name', 'sku', 'reorder_level']
      }]
    });

    // Filter locally because nested column compare is tricky in basic sequelize querying
    const lowStockItems = inventoryItems.filter(item => item.quantity <= item.Product.reorder_level);

    res.status(200).json({ success: true, data: lowStockItems });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/inventory/:id
exports.updateInventory = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    
    if (quantity === undefined || isNaN(quantity)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid quantity is required' }});
    }

    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Inventory record not found' }});
    }

    const oldQuantity = inventory.quantity;
    await inventory.update({ quantity: parseInt(quantity) });

    // Log to AuditLog
    await AuditLog.create({
      user_id: req.user.id,
      action: 'UPDATE_INVENTORY',
      entity: 'Inventory',
      entity_id: inventory.id,
      details: `Changed quantity from ${oldQuantity} to ${quantity}`
    });

    res.status(200).json({ success: true, data: inventory });
  } catch (err) {
    next(err);
  }
};
