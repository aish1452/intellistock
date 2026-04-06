const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = (process.env.DB_DIALECT || 'sqlite').trim();

const sequelize = dialect === 'mysql'
  ? new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      port: process.env.DB_PORT || 3306,
      logging: false,
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: process.env.SQLITE_DB_PATH || './database.sqlite',
      logging: false,
    });

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully via SQLite.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };
