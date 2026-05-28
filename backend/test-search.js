const { pool } = require('./src/config/database');

(async () => {
  try {
    console.log('Testing search query...');
    const result = await pool.query(`
      SELECT DISTINCT
        p.pharmacy_id,
        p.pharmacy_name,
        p.address,
        p.contact_phone,
        p.contact_email,
        p.latitude,
        p.longitude,
        p.is_open,
        p.is_verified,
        m.brand_name,
        m.generic_name,
        ps.quantity,
        ps.expiry_date
      FROM pharmacies p
      INNER JOIN pharmacy_stocks ps ON p.pharmacy_id = ps.pharmacy_id
      INNER JOIN medicines m ON ps.medicine_id = m.medicine_id
      WHERE p.is_verified = true
        AND ps.quantity > 0
        AND (m.brand_name ILIKE $1 OR m.generic_name ILIKE $1)
      ORDER BY p.is_open DESC, ps.quantity DESC
    `, ['%Gaviscon%']);
    console.log('Query successful, rows:', result.rows.length);
    console.log('First row:', JSON.stringify(result.rows[0] || null));
  } catch (error) {
    console.error('Query error:', error.message);
    console.error('Error details:', error);
  } finally {
    process.exit(0);
  }
})();
