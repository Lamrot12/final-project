const { pool } = require('./src/config/database');

async function checkPharmacies() {
  try {
    const result = await pool.query('SELECT pharmacy_id, pharmacy_name, contact_email, address, is_verified, created_at FROM pharmacies ORDER BY created_at DESC');
    console.log('Pharmacies in database:');
    console.log('======================');
    result.rows.forEach((pharmacy, index) => {
      console.log(`${index + 1}. ${pharmacy.pharmacy_name}`);
      console.log(`   Email: ${pharmacy.contact_email}`);
      console.log(`   Address: ${pharmacy.address}`);
      console.log(`   Verified: ${pharmacy.is_verified}`);
      console.log(`   Created: ${pharmacy.created_at}`);
      console.log('');
    });
    console.log(`Total: ${result.rows.length} pharmacies`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkPharmacies();
