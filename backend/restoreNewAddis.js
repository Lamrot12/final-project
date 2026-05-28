const { pool } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function restoreNewAddis() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get pharmacy role
    const roleResult = await client.query(`SELECT role_id FROM user_role WHERE role_name = 'pharmacy'`);
    const pharmacyRoleId = roleResult.rows[0]?.role_id;

    if (!pharmacyRoleId) {
      throw new Error('Pharmacy role not found');
    }

    // Create user for NewAddis
    const userPassword = await bcrypt.hash('123456789', 10);
    const userResult = await client.query(`
      INSERT INTO users (email, password_hash, full_name, phone, role_id)
      VALUES ('tarikulamrot4@gmail.com', $1, 'NewAddis', '0984962163', $2)
      ON CONFLICT (email) DO UPDATE SET full_name = 'NewAddis'
      RETURNING *
    `, [userPassword, pharmacyRoleId]);

    const user = userResult.rows[0];
    console.log('✅ Created user:', user.full_name);

    // Create pharmacy for NewAddis
    const pharmacyResult = await client.query(`
      INSERT INTO pharmacies (pharmacy_name, address, contact_phone, contact_email, operating_hours, user_id, is_verified)
      VALUES ('NewAddis', 'addis ababa', '0984962163', 'tarikulamrot4@gmail.com', '24/7', $1, false)
      RETURNING *
    `, [user.user_id]);

    const pharmacy = pharmacyResult.rows[0];
    console.log('✅ Created pharmacy:', pharmacy.pharmacy_name);

    await client.query('COMMIT');
    console.log('\n📋 All pharmacies after restore:');
    const allPharmacies = await client.query('SELECT pharmacy_name, is_verified FROM pharmacies ORDER BY pharmacy_name');
    allPharmacies.rows.forEach(p => {
      console.log(`  - ${p.pharmacy_name} (${p.is_verified ? 'Approved' : 'Pending'})`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error restoring NewAddis:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

restoreNewAddis();
