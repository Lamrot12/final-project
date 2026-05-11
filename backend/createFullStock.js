const { pool } = require('./src/config/database');

async function createFullStock() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing stock
    await client.query('DELETE FROM pharmacy_stocks');
    console.log('✅ Cleared existing stock data');

    // Get approved pharmacies
    const pharmacyResult = await client.query('SELECT pharmacy_id, pharmacy_name FROM pharmacies WHERE is_verified = true');
    console.log(`\n📋 Found ${pharmacyResult.rows.length} approved pharmacies`);

    // Get all medicines
    const medicineResult = await client.query('SELECT medicine_id, brand_name FROM medicines');
    console.log(`💊 Found ${medicineResult.rows.length} medicines`);

    // Create stock for each pharmacy-medicine combination
    for (const pharmacy of pharmacyResult.rows) {
      console.log(`\n📦 Creating stock for ${pharmacy.pharmacy_name}:`);
      
      for (const medicine of medicineResult.rows) {
        const quantity = Math.floor(Math.random() * 200) + 50; // 50-250 quantity
        const price = (Math.random() * 100 + 10).toFixed(2); // 10-110 price
        
        await client.query(`
          INSERT INTO pharmacy_stocks (pharmacy_id, medicine_id, quantity, expiry_date)
          VALUES ($1, $2, $3, $4)
        `, [
          pharmacy.pharmacy_id,
          medicine.medicine_id,
          quantity,
          new Date(Date.now() + (Math.random() * 730 + 365) * 24 * 60 * 60 * 1000) // 1-3 years from now
        ]);
        
        console.log(`  ✅ ${medicine.brand_name}: ${quantity} units, $${price}`);
      }
    }

    await client.query('COMMIT');
    
    // Show summary
    const stockCount = await client.query('SELECT COUNT(*) as total FROM pharmacy_stocks');
    console.log(`\n🎉 Created ${stockCount.rows[0].total} stock records successfully!`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating stock:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

createFullStock();
