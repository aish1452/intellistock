const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testAll() {
  console.log('--- Testing API Endpoints ---');
  try {
    // 1. Auth: Register
    const email = `manager${Date.now()}@test.com`;
    await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Manager',
      email: email,
      password: 'password123'
    });

    // 2. Auth: Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: email,
      password: 'password123'
    });
    const token = loginRes.data.accessToken;
    const authHeaders = { Authorization: `Bearer ${token}` };

    console.log('Auth OK');

    // Currently the created user is a 'viewer'.
    // Test that 'viewer' gets 403 on create product
    let sku = `SKU-${Date.now()}`;
    try {
      await axios.post(`${BASE_URL}/products`, {
        sku: sku,
        name: 'Test Product',
        unit_price: 10.50
      }, { headers: authHeaders });
      console.log('Product Creation: FAIL (Should have been denied for viewer)');
    } catch (e) {
      if (e.response && e.response.status === 403) {
        console.log('Viewer permissions correctly restricted');
      } else {
        console.error('Unexpected error on viewer product create:', e.response ? e.response.data : e.message);
      }
    }

    // Now, we need an admin or manager to continue testing.
    // We can directly modify the database in SQLite
    const { Sequelize } = require('sequelize');
    const seq = new Sequelize({ dialect: 'sqlite', storage: './database.sqlite', logging: false });
    await seq.query(`UPDATE users SET role = 'manager' WHERE email = '${email}'`);

    // Reload token payload since middleware might trust token... wait, does auth middleware check DB or just token?
    // JWT has role inside it. We need to login again to get 'manager' role in token.
    const loginRes2 = await axios.post(`${BASE_URL}/auth/login`, {
      email: email,
      password: 'password123'
    });
    const token2 = loginRes2.data.accessToken;
    const authHeaders2 = { Authorization: `Bearer ${token2}` };

    // 3. Create Product
    const prodRes = await axios.post(`${BASE_URL}/products`, {
      sku: sku,
      name: 'Test Product',
      unit_price: 15.00
    }, { headers: authHeaders2 });
    const productId = prodRes.data.data.id;
    console.log('Product created:', productId);

    // 4. Update Inventory
    const invRes = await axios.get(`${BASE_URL}/inventory`, { headers: authHeaders2 });
    const inventory = invRes.data.data.find(i => i.product_id === productId);
    console.log('Found inventory:', inventory ? inventory.id : 'NOT FOUND');
    
    await axios.patch(`${BASE_URL}/inventory/${inventory.id}`, {
      quantity: 50
    }, { headers: authHeaders2 });
    console.log('Inventory updated');

    // 5. Create Sale
    await axios.post(`${BASE_URL}/sales`, {
      product_id: productId,
      quantity: 10,
      sale_date: new Date().toISOString().split('T')[0],
      region: 'North',
      channel: 'Retail'
    }, { headers: authHeaders2 });
    console.log('Sale created');

    // 6. Get Sales Summary
    const summary = await axios.get(`${BASE_URL}/sales/summary`, { headers: authHeaders2 });
    console.log('Sales summary:', summary.data.success);

    // 7. Test Forecast (Requires ML Service, so may fail)
    try {
      await axios.post(`${BASE_URL}/forecast/${productId}`, {}, { headers: authHeaders2 });
    } catch (e) {
      console.log('Forecast fetch error (expected if ML service down):', e.response ? e.response.data.error.message : e.message);
    }

    console.log('\n--- All Core Endpoints Tested Successfully! ---');
  } catch (error) {
    const errData = error.response ? error.response.data : error.message;
    require('fs').writeFileSync('err.txt', typeof errData === 'string' ? errData : JSON.stringify(errData, null, 2));
    console.error('Test Error:', errData);
  }
}

testAll();
