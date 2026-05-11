const { pool } = require('./src/config/database');

async function checkStock() {
  const client = await pool.connect();
  try {
    // Check pharmacy_stocks table
    const stockResult = await client.query('SELECT COUNT(*) as count FROM pharmacy_stocks');
    console.log(`📊 Pharmacy stocks count: ${stockResult.rows[0].count}`);

    // Get pharmacy IDs
    const pharmacyResult = await client.query('SELECT pharmacy_id, pharmacy_name FROM pharmacies WHERE is_verified = true');
    console.log('\n📋 Approved pharmacies:');
    pharmacyResult.rows.forEach(p => {
      console.log(`  - ${p.pharmacy_name} (${p.pharmacy_id})`);
    });

    // Get medicine IDs
    const medicineResult = await client.query('SELECT medicine_id, brand_name FROM medicines LIMIT 5');
    console.log('\n💊 Sample medicines:');
    medicineResult.rows.forEach(m => {
      console.log(`  - ${m.brand_name} (${m.medicine_id})`);
    });

    // If no stocks, create sample data
    if (parseInt(stockResult.rows[0].count) === 0 && pharmacyResult.rows.length > 0) {
      console.log('\n➕ Creating sample stock data...');
      
      for (const pharmacy of pharmacyResult.rows) {
        console.log(`\nAdding stock for ${pharmacy.pharmacy_name}:`);
        
        for (const medicine of medicineResult.rows) {
          await client.query(`
            INSERT INTO pharmacy_stocks (pharmacy_id, medicine_id, quantity, unit_price, batch_number, expiry_date)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            pharmacy.pharmacy_id,
            medicine.medicine_id,
            Math.floor(Math.random() * 100) + 10, // Random quantity 10-110
            (Math.random() * 50 + 5).toFixed(2), // Random price 5-55
            `BATCH${Date.now()}`,
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
          ]);
          console.log(`  ✅ Added stock for ${medicine.brand_name}`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

checkStock();
