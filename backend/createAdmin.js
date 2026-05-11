const { pool } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get admin role
    const roleResult = await client.query(`SELECT role_id FROM user_role WHERE role_name = 'admin'`);
    const adminRoleId = roleResult.rows[0]?.role_id;

    if (!adminRoleId) {
      console.log('Admin role not found, creating it...');
      await client.query(`INSERT INTO user_role (role_name) VALUES ('admin')`);
      const newRoleResult = await client.query(`SELECT role_id FROM user_role WHERE role_name = 'admin'`);
      const roleId = newRoleResult.rows[0].role_id;
      console.log('Admin role created with ID:', roleId);
    }

    // Hash password
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const userResult = await client.query(`
      INSERT INTO users (email, password_hash, full_name, role_id)
      VALUES ($1, $2, 'Admin User', $3)
      ON CONFLICT (email) DO UPDATE SET password_hash = $2
      RETURNING *
    `, ['admin@pharmalink.com', adminPassword, adminRoleId || roleResult.rows[0]?.role_id]);

    console.log('Admin user created:', userResult.rows[0]);
    console.log('Email: admin@pharmalink.com');
    console.log('Password: admin123');

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating admin:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

createAdmin();
