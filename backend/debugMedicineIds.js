const { pool } = require('./src/config/database');

async function debugMedicineIds() {
  const client = await pool.connect();
  try {
    // Check medicines table
    const medicinesResult = await client.query('SELECT medicine_id, brand_name FROM medicines LIMIT 5');
    console.log('📋 Medicines table IDs:');
    medicinesResult.rows.forEach(med => {
      console.log(`  - ${med.brand_name}: ${med.medicine_id} (type: ${typeof med.medicine_id})`);
    });

    // Check pharmacy_stocks table
    const stocksResult = await client.query('SELECT pharmacy_id, medicine_id, quantity FROM pharmacy_stocks LIMIT 5');
    console.log('\n📦 Pharmacy stocks IDs:');
    stocksResult.rows.forEach(stock => {
      console.log(`  - Pharmacy: ${stock.pharmacy_id}, Medicine: ${stock.medicine_id}, Qty: ${stock.quantity}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

debugMedicineIds();
