const { pool } = require('./src/config/database');

async function checkPharmacy() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT p.pharmacy_id, p.pharmacy_name, p.is_verified, u.email 
      FROM pharmacies p
      JOIN users u ON p.user_id = u.user_id
      WHERE u.email = 'dina@gmail.com'
    `);
    console.log('Pharmacy data:', result.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

checkPharmacy();
