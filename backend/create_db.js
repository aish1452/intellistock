const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
    });
    await connection.query('CREATE DATABASE IF NOT EXISTS inventory_db;');
    console.log('Database inventory_db created successfully or already exists.');
    await connection.end();
  } catch (error) {
    console.error('Failed to create database:', error.message);
  }
}

createDatabase();
