const { Sales, Product, Inventory, AuditLog } = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// GET /api/v1/sales
exports.getSales = async (req, res, next) => {
  try {
    const { productId, startDate, endDate, page = 1, limit = 10 } = req.query;
    let whereClause = {};

    if (productId) whereClause.product_id = productId;
    
    if (startDate && endDate) {
      whereClause.sale_date = { [Op.between]: [startDate, endDate] };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Sales.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: Product, attributes: ['name', 'sku'] }],
      order: [['sale_date', 'DESC'], ['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
      meta: { page: parseInt(page), total: count, totalPages: Math.ceil(count/limit) }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/sales/summary
exports.getSalesSummary = async (req, res, next) => {
  try {
    // 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await Sales.findAll({
      where: { sale_date: { [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0] } }
    });

    let totalRevenue = 0;
    let unitsSold = 0;
    const productCounts = {};

    sales.forEach(sale => {
      totalRevenue += parseFloat(sale.total_price);
      unitsSold += sale.quantity;
      productCounts[sale.product_id] = (productCounts[sale.product_id] || 0) + sale.quantity;
    });

    // Top products
    const sortedProductIds = Object.keys(productCounts).sort((a,b) => productCounts[b] - productCounts[a]).slice(0, 5);
    
    let topProducts = [];
    if (sortedProductIds.length > 0) {
      topProducts = await Product.findAll({
        where: { id: { [Op.in]: sortedProductIds } },
        attributes: ['id', 'name']
      });
      topProducts = topProducts.map(p => ({
        id: p.id,
        name: p.name,
        quantitySold: productCounts[p.id]
      })).sort((a,b) => b.quantitySold - a.quantitySold);
    }

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue.toFixed(2),
        unitsSold,
        topProducts
      }
    });

  } catch (err) {
    next(err);
  }
};

// POST /api/v1/sales
exports.createSale = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { product_id, quantity, sale_date, region, channel } = req.body;

    const product = await Product.findByPk(product_id);
    if (!product) throw new Error('Product not found');

    const total_price = product.unit_price * quantity;

    const sale = await Sales.create({
      product_id,
      quantity,
      unit_price: product.unit_price,
      total_price,
      sale_date,
      region,
      channel
    }, { transaction: t });

    const inventory = await Inventory.findOne({ where: { product_id }, transaction: t });
    if (!inventory) throw new Error('Inventory record not found for this product');
    
    if (inventory.quantity < quantity) {
      throw new Error(`Insufficient inventory. Available: ${inventory.quantity}, Requested: ${quantity}`);
    }

    await inventory.decrement('quantity', { by: quantity, transaction: t });

    await AuditLog.create({
      user_id: req.user.id,
      action: 'RECORD_SALE',
      entity: 'Sales',
      entity_id: sale.id,
      details: `Recorded sale of ${quantity} units for product ${product_id}. Inventory deducted.`
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ success: true, data: sale });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ success: false, error: { code: 'SALE_CREATE_FAILED', message: err.message } });
  }
};
