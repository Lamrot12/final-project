const { pool } = require('./src/config/database');

async function checkCount() {
  const client = await pool.connect();
  try {
    const totalResult = await client.query('SELECT COUNT(*) as total FROM medicines');
    console.log(`📊 Total medicines in database: ${totalResult.rows[0].total}`);
    
    const recentResult = await client.query(`
      SELECT brand_name, generic_name, category, created_at
      FROM medicines 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log('\n📋 Most recently added medicines:');
    recentResult.rows.forEach(med => {
      console.log(`  - ${med.brand_name} (${med.generic_name}) - ${med.category}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

checkCount();
