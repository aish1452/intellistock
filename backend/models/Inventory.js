const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  warehouse_id: {
    type: DataTypes.STRING(50),
    defaultValue: 'WH-01',
  },
}, {
  tableName: 'inventory',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
});

module.exports = Inventory;
