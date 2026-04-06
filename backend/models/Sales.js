const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Sales = sequelize.define('Sales', {
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
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  sale_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  region: {
    type: DataTypes.STRING(100),
  },
  channel: {
    type: DataTypes.STRING(100),
  },
}, {
  tableName: 'sales',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Sales;
