const axios = require('axios');
const { Sequelize } = require('sequelize');

async function seedAdmin() {
  const email = 'admin@test.com';
  try {
    await axios.post('http://localhost:5000/api/v1/auth/register', {
      name: 'System Admin',
      email,
      password: 'password'
    });
    
    const seq = new Sequelize({ dialect: 'sqlite', storage: './database.sqlite', logging: false });
    await seq.query(`UPDATE users SET role = 'admin' WHERE email = '${email}'`);
    console.log('seeded admin');
  } catch (e) {
    if (e.response && e.response.status === 409) {
      console.log('Admin already exists');
    } else {
      console.error(e.message);
    }
  }
}
seedAdmin();
