const { pool } = require('./src/config/database');

async function deletePharmacies() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get all pharmacies except "New" and "NewAddis"
    const result = await client.query(`
      SELECT pharmacy_id, pharmacy_name, user_id 
      FROM pharmacies 
      WHERE pharmacy_name NOT IN ('New', 'NewAddis')
    `);

    console.log('Found pharmacies to delete:', result.rows.length);
    console.log('Pharmacies to delete:', result.rows.map(p => p.pharmacy_name));

    // Delete related records for each pharmacy
    for (const pharmacy of result.rows) {
      console.log(`Deleting pharmacy: ${pharmacy.pharmacy_name}`);
      
      // Delete from bincard
      await client.query('DELETE FROM bincard WHERE pharmacy_id = $1', [pharmacy.pharmacy_id]);
      
      // Delete from pharmacy_stocks
      await client.query('DELETE FROM pharmacy_stocks WHERE pharmacy_id = $1', [pharmacy.pharmacy_id]);
      
      // Delete from pharmacy_license
      await client.query('DELETE FROM pharmacy_license WHERE pharmacy_id = $1', [pharmacy.pharmacy_id]);
      
      // Delete from pharmacies
      await client.query('DELETE FROM pharmacies WHERE pharmacy_id = $1', [pharmacy.pharmacy_id]);
      
      // Delete from users (if user_id exists and is not used by other pharmacies)
      if (pharmacy.user_id) {
        const otherPharmacies = await client.query(
          'SELECT COUNT(*) FROM pharmacies WHERE user_id = $1', 
          [pharmacy.user_id]
        );
        
        if (parseInt(otherPharmacies.rows[0].count) === 0) {
          await client.query('DELETE FROM users WHERE user_id = $1', [pharmacy.user_id]);
        }
      }
    }

    await client.query('COMMIT');
    console.log('✅ Successfully deleted all pharmacies except "New" and "NewAddis"');

    // Show remaining pharmacies
    const remaining = await client.query('SELECT pharmacy_name, is_verified FROM pharmacies ORDER BY pharmacy_name');
    console.log('\n📋 Remaining pharmacies:');
    remaining.rows.forEach(p => {
      console.log(`  - ${p.pharmacy_name} (${p.is_verified ? 'Approved' : 'Pending'})`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error deleting pharmacies:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

deletePharmacies();
