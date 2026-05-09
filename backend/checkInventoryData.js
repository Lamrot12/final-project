const { pool } = require('./src/config/database');

async function checkInventoryData() {
  try {
    console.log('Checking inventory data structure...\n');
    
    const result = await pool.query(`
      SELECT ps.*, m.brand_name, m.generic_name, m.strength, m.category
      FROM pharmacy_stocks ps
      JOIN medicines m ON ps.medicine_id = m.medicine_id
      WHERE ps.pharmacy_id = 1
      ORDER BY ps.stock_id
    `);
    
    console.log('Total records:', result.rows.length);
    console.log('\nRaw data structure:');
    console.log('------------------------------------------------------------');
    
    if (result.rows.length > 0) {
      const firstItem = result.rows[0];
      console.log('Sample item structure:');
      Object.keys(firstItem).forEach(key => {
        console.log(`  ${key}: ${firstItem[key]}`);
      });
      
      console.log('\n------------------------------------------------------------');
      console.log('\nAll items:');
      result.rows.forEach((row, index) => {
        console.log(`\nItem ${index + 1}:`);
        console.log(`  stock_id: ${row.stock_id}`);
        console.log(`  pharmacy_id: ${row.pharmacy_id}`);
        console.log(`  medicine_id: ${row.medicine_id}`);
        console.log(`  generic_name: ${row.generic_name}`);
        console.log(`  brand_name: ${row.brand_name}`);
        console.log(`  strength: ${row.strength}`);
        console.log(`  category: ${row.category}`);
        console.log(`  quantity: ${row.quantity}`);
        console.log(`  expiry_date: ${row.expiry_date}`);
      });
    } else {
      console.log('No inventory found for pharmacy_id 1');
    }
    
  } catch (error) {
    console.error('Error checking inventory:', error);
  } finally {
    await pool.end();
  }
}

checkInventoryData();
