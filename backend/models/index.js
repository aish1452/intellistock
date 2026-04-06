const User = require('./User');
const Product = require('./Product');
const Inventory = require('./Inventory');
const Sales = require('./Sales');
const PurchaseOrder = require('./PurchaseOrder');
const AuditLog = require('./AuditLog');
const { sequelize } = require('../config/db');

// Define relationships
// inventory.product_id → products.id (CASCADE DELETE)
Product.hasMany(Inventory, { foreignKey: 'product_id', onDelete: 'CASCADE' });
Inventory.belongsTo(Product, { foreignKey: 'product_id' });

// sales.product_id → products.id (CASCADE DELETE)
Product.hasMany(Sales, { foreignKey: 'product_id', onDelete: 'CASCADE' });
Sales.belongsTo(Product, { foreignKey: 'product_id' });

// purchase_orders.product_id → products.id
Product.hasMany(PurchaseOrder, { foreignKey: 'product_id' });
PurchaseOrder.belongsTo(Product, { foreignKey: 'product_id' });

// audit_logs.user_id → users.id
User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Product,
  Inventory,
  Sales,
  PurchaseOrder,
  AuditLog,
};
