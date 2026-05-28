const { pool } = require('./src/config/database');

async function approvePharmacies() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Approve all pharmacies
    const result = await client.query(`
      UPDATE pharmacies 
      SET is_verified = true 
      WHERE pharmacy_name IN ('New', 'NewAddis')
      RETURNING pharmacy_name, is_verified
    `);

    console.log('✅ Approved pharmacies:');
    result.rows.forEach(p => {
      console.log(`  - ${p.pharmacy_name} (${p.is_verified ? 'Approved' : 'Pending'})`);
    });

    await client.query('COMMIT');
    console.log('\n🎉 All pharmacies approved successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error approving pharmacies:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

approvePharmacies();
