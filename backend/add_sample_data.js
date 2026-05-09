const { pool } = require('./src/config/database');

async function addSamplePharmacyStocks() {
  try {
    console.log('Adding sample pharmacy_stocks data...');
    
    // First, let's get existing pharmacies and medicines
    const pharmaciesResult = await pool.query('SELECT pharmacy_id, pharmacy_name FROM pharmacies LIMIT 2');
    const medicinesResult = await pool.query('SELECT medicine_id, generic_name, brand_name, strength FROM medicines LIMIT 3');
    
    if (pharmaciesResult.rows.length === 0 || medicinesResult.rows.length === 0) {
      console.log('No pharmacies or medicines found. Please add some first.');
      return;
    }
    
    // Add sample pharmacy_stocks data with simplified schema
    const sampleData = [
      {
        pharmacy_id: pharmaciesResult.rows[0].pharmacy_id,
        medicine_id: medicinesResult.rows[0].medicine_id,
        quantity: 50,
        expiry_date: '2025-12-31'
      },
      {
        pharmacy_id: pharmaciesResult.rows[0].pharmacy_id,
        medicine_id: medicinesResult.rows[1].medicine_id,
        quantity: 30,
        expiry_date: '2025-11-30'
      },
      {
        pharmacy_id: pharmaciesResult.rows[1]?.pharmacy_id || pharmaciesResult.rows[0].pharmacy_id,
        medicine_id: medicinesResult.rows[2]?.medicine_id || medicinesResult.rows[0].medicine_id,
        quantity: 25,
        expiry_date: '2025-10-30'
      }
    ];
    
    for (const stock of sampleData) {
      await pool.query(`
        INSERT INTO pharmacy_stocks (pharmacy_id, medicine_id, quantity, expiry_date)
        VALUES ($1, $2, $3, $4)
      `, [stock.pharmacy_id, stock.medicine_id, stock.quantity, stock.expiry_date]);
      
      console.log(`Added stock: ${stock.quantity} units of medicine ID: ${stock.medicine_id} to pharmacy ID: ${stock.pharmacy_id}`);
    }
    
    console.log('Sample pharmacy_stocks data added successfully!');
    await pool.end();
  } catch (error) {
    console.error('Error adding sample data:', error);
    await pool.end();
  }
}

addSamplePharmacyStocks();
