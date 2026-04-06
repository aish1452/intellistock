const axios = require('axios');
const { Sales } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config();

// POST /api/v1/forecast/:productId
exports.generateForecast = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const horizonDays = parseInt(req.body.horizon_days) || 30;

    // Fetch historical sales data (last 365 days to ensure enough data for 90-day windows)
    const historyStart = new Date();
    historyStart.setDate(historyStart.getDate() - 365);

    const salesHistoryRaw = await Sales.findAll({
      where: {
        product_id: productId,
        sale_date: { [Op.gte]: historyStart.toISOString().split('T')[0] }
      },
      attributes: ['sale_date', 'quantity'],
      order: [['sale_date', 'ASC']]
    });

    const salesHistory = salesHistoryRaw.map(s => ({
      date: s.sale_date,
      quantity: s.quantity
    }));

    if (salesHistory.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'NOT_ENOUGH_DATA', message: 'No sales history found for this product.' } });
    }

    const payload = {
      product_id: parseInt(productId),
      sales_history: salesHistory,
      horizon_days: horizonDays
    };

    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    
    let mlResponse;
    try {
      mlResponse = await axios.post(`${mlUrl}/predict`, payload);
    } catch (mlErr) {
      console.error('ML Service Error', mlErr.response?.data || mlErr.message);
      return res.status(503).json({ success: false, error: { code: 'ML_SERVICE_ERROR', message: 'Failed to contact forecasting service' } });
    }

    res.status(200).json({
      success: true,
      data: mlResponse.data
    });
  } catch (err) {
    next(err);
  }
};
