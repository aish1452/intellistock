const bcrypt = require('bcrypt');
const { sequelize, User, Product, Inventory, Sales } = require('../models');
require('dotenv').config();

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    
    console.log('Database synced. Seeding data...');

    // 1. Users
    const adminPassword = await bcrypt.hash('Admin@1234', 12);
    const managerPassword = await bcrypt.hash('Manager@1234', 12);
    
    await User.bulkCreate([
      { name: 'Admin User', email: 'admin@intellistock.com', password_hash: adminPassword, role: 'admin' },
      { name: 'Manager User', email: 'manager@intellistock.com', password_hash: managerPassword, role: 'manager' }
    ]);

    // 2. Products
    const products = await Product.bulkCreate([
      { sku: 'ELC-001', name: 'Smartphone X', category: 'Electronics', unit_price: 699.99, reorder_level: 50 },
      { sku: 'ELC-002', name: 'Wireless Earbuds', category: 'Electronics', unit_price: 129.99, reorder_level: 100 },
      { sku: 'ELC-003', name: '4K Monitor', category: 'Electronics', unit_price: 299.99, reorder_level: 20 },
      { sku: 'FOD-001', name: 'Organic Coffee Beans', category: 'Food', unit_price: 19.99, reorder_level: 200 },
      { sku: 'FOD-002', name: 'Almond Milk', category: 'Food', unit_price: 4.99, reorder_level: 300 },
      { sku: 'FOD-003', name: 'Protein Bar Box', category: 'Food', unit_price: 24.99, reorder_level: 150 },
      { sku: 'APP-001', name: 'Cotton T-Shirt', category: 'Apparel', unit_price: 14.99, reorder_level: 120 },
      { sku: 'APP-002', name: 'Running Shoes', category: 'Apparel', unit_price: 89.99, reorder_level: 40 },
      { sku: 'APP-003', name: 'Denim Jacket', category: 'Apparel', unit_price: 59.99, reorder_level: 30 },
      { sku: 'APP-004', name: 'Winter Beanie', category: 'Apparel', unit_price: 12.99, reorder_level: 80 }
    ]);

    // 3. Inventory
    const inventoryData = products.map((p, i) => ({
      product_id: p.id,
      quantity: p.reorder_level + Math.floor(Math.random() * 100) // Some extra stock
    }));
    await Inventory.bulkCreate(inventoryData);

    // 4. Sales (180 days)
    const salesData = [];
    const today = new Date();
    
    for (let i = 180; i >= 0; i--) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() - i);
      
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      
      for (const product of products) {
        // base trend
        let quantity = Math.floor(Math.random() * 5) + 1;
        if (product.category === 'Food') quantity += 5;
        if (isWeekend && product.category === 'Apparel') quantity += 3;
        
        // Add random seasonality wave
        const wave = Math.sin((i / 180) * Math.PI) * 5;
        quantity += Math.floor(wave);
        
        if (quantity < 1) quantity = 1;

        salesData.push({
          product_id: product.id,
          quantity: quantity,
          unit_price: product.unit_price,
          total_price: parseFloat((product.unit_price * quantity).toFixed(2)),
          sale_date: currentDate.toISOString().split('T')[0],
          region: 'North America',
          channel: 'Online'
        });
      }
    }

    // Chunking to avoid massive inserts at once
    for (let i = 0; i < salesData.length; i += 500) {
      await Sales.bulkCreate(salesData.slice(i, i + 500));
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
