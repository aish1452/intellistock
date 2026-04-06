const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');
const seq = new Sequelize({ dialect: 'sqlite', storage: './database.sqlite', logging: false });

async function reset() {
  const hash1 = await bcrypt.hash('Admin@1234', 12);
  const hash2 = await bcrypt.hash('Manager@1234', 12);
  await seq.query(`UPDATE users SET password_hash = '${hash1}' WHERE email = 'admin@intellistock.com'`);
  await seq.query(`UPDATE users SET password_hash = '${hash2}' WHERE email = 'manager@intellistock.com'`);
  console.log('Passwords reset successfully!');
}

reset();
