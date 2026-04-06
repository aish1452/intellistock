const { Product, Inventory } = require('../models');
const Joi = require('joi');

const productSchema = Joi.object({
  sku: Joi.string().required(),
  name: Joi.string().required(),
  category: Joi.string().optional(),
  unit_price: Joi.number().precision(2).required(),
  reorder_level: Joi.number().integer().optional(),
});

// GET /api/v1/products
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    let whereClause = {};

    if (category) whereClause.category = category;
    // Add search logic if needed

    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: Inventory, attributes: ['quantity'] }]
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

// GET /api/v1/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Inventory, attributes: ['quantity'] }]
    });

    if (!product) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/products (manager+)
exports.createProduct = async (req, res, next) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.details[0].message } });
    }

    const existingProduct = await Product.findOne({ where: { sku: value.sku } });
    if (existingProduct) {
      return res.status(409).json({ success: false, error: { code: 'DUPLICATE_SKU', message: 'A product with this SKU already exists' } });
    }

    const product = await Product.create(value);
    
    // Create zero inventory by default
    await Inventory.create({ product_id: product.id, quantity: 0 });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/products/:id (manager+)
exports.updateProduct = async (req, res, next) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.details[0].message } });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    // Check SKU if changing
    if (value.sku !== product.sku) {
      const existingProduct = await Product.findOne({ where: { sku: value.sku } });
      if (existingProduct) {
        return res.status(409).json({ success: false, error: { code: 'DUPLICATE_SKU', message: 'A product with this SKU already exists' } });
      }
    }

    await product.update(value);

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/products/:id (admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    // Related Inventory and Sales cascade deleted
    await product.destroy();

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};
