const { pool } = require('./src/config/database');

async function listAll() {
  try {
    console.log('\n=== PHARMACIES ===\n');
    const p = await pool.query('SELECT pharmacy_id, pharmacy_name, email FROM pharmacies');
    p.rows.forEach(r => console.log(`ID:${r.pharmacy_id} | ${r.pharmacy_name} | ${r.email}`));

    console.log('\n=== USERS ===\n');
    const u = await pool.query('SELECT user_id, email, full_name, user_type FROM users');
    u.rows.forEach(r => console.log(`ID:${r.user_id} | ${r.email} | ${r.full_name} | ${r.user_type}`));

    await pool.end();
  } catch (e) {
    console.error(e);
    await pool.end();
  }
}

listAll();
