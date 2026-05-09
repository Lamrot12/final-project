const { pool } = require('./src/config/database');

async function checkUsers() {
  try {
    console.log('Checking pharmacy users...');
    const result = await pool.query('SELECT email, user_type, password FROM users WHERE user_type = $1', ['pharmacy']);
    console.log('Pharmacy users found:', result.rows.length);
    console.log('Users:', result.rows.map(u => ({ email: u.email, userType: u.user_type, passwordHash: u.password.substring(0, 20) + '...' })));
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkUsers();
