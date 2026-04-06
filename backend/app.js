const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./utils/errorHandler');
const { testConnection, sequelize } = require('./config/db');

// Require models to initialize associations before sync
require('./models');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/products', require('./routes/product.routes'));
app.use('/api/v1/inventory', require('./routes/inventory.routes'));
app.use('/api/v1/sales', require('./routes/sales.routes'));
app.use('/api/v1/forecast', require('./routes/forecast.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));

// Healthcheck Route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB and Start Server
const startServer = async () => {
  await testConnection();
  
  // Sync DB
  try {
    await sequelize.sync({ alter: true });
    logger.info('Database synced successfully.');
    
    // Auto-seed admin user to ensure login works immediately
    const User = require('./models/User');
    const bcrypt = require('bcrypt');
    const existingAdmin = await User.findOne({ where: { email: 'admin@test.com' } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('password', 10);
      await User.create({
        name: 'System Admin',
        email: 'admin@test.com',
        password_hash: hashedPassword,
        role: 'admin'
      });
      logger.info('Seeded admin user (admin@test.com)');
    }
  } catch (err) {
    logger.error('Database sync failed: ' + err);
  }

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

startServer();
