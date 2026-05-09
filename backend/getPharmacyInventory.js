const { pool } = require('./src/config/database');

async function getPharmacyInventory(pharmacyId) {
  try {
    const result = await pool.query(`
      SELECT m.*, ps.stock_id, ps.quantity, ps.expiry_date
      FROM pharmacy_stocks ps
      JOIN medicines m ON ps.medicine_id = m.medicine_id
      WHERE ps.pharmacy_id = $1
      ORDER BY m.generic_name
    `, [pharmacyId]);
    
    console.log(`\n=== PHARMACY ID ${pharmacyId} INVENTORY ===`);
    console.log(`Total items: ${result.rows.length}\n`);
    
    result.rows.forEach((item, index) => {
      console.log(`${index + 1}. ${item.generic_name} (${item.brand_name})`);
      console.log(`   Stock ID: ${item.stock_id}`);
      console.log(`   Quantity: ${item.quantity}`);
      console.log(`   Expiry: ${item.expiry_date}`);
      console.log(`   Category: ${item.category}`);
      console.log('');
    });
    
    await pool.end();
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Get pharmacy ID from command line or default to 1
const pharmacyId = process.argv[2] || 1;
getPharmacyInventory(pharmacyId);
