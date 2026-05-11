const { pool } = require('./src/config/database');

async function checkStockSchema() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'pharmacy_stocks'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 pharmacy_stocks table structure:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

checkStockSchema();
