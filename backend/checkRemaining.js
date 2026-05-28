const { pool } = require('./src/config/database');

async function checkRemaining() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT pharmacy_id, pharmacy_name, is_verified, user_id 
      FROM pharmacies 
      ORDER BY pharmacy_name
    `);
    
    console.log('📋 Remaining pharmacies:');
    result.rows.forEach(p => {
      console.log(`  - ${p.pharmacy_name} (${p.is_verified ? 'Approved' : 'Pending'})`);
    });
    
    // Check if NewAddis exists in users table
    const userResult = await client.query(`
      SELECT u.user_id, u.email, u.full_name 
      FROM users u 
      WHERE u.full_name ILIKE '%NewAddis%' OR u.email ILIKE '%tarikulamrot4%'
    `);
    
    console.log('\n👤 Users related to NewAddis:');
    userResult.rows.forEach(u => {
      console.log(`  - ${u.full_name} (${u.email})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

checkRemaining();
