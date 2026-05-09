const { pool } = require('./src/config/database');

async function fixSchema() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Drop tables in correct order (respecting foreign key dependencies)
    console.log('Dropping existing tables...');
    
    await client.query('DROP TABLE IF EXISTS bincard CASCADE');
    await client.query('DROP TABLE IF EXISTS pharmacy_stocks CASCADE');
    await client.query('DROP TABLE IF EXISTS pharmacy_license CASCADE');
    await client.query('DROP TABLE IF EXISTS pharmacies CASCADE');
    await client.query('DROP TABLE IF EXISTS prescriptions CASCADE');
    await client.query('DROP TABLE IF EXISTS prescription_result CASCADE');
    await client.query('DROP TABLE IF EXISTS subscription CASCADE');
    await client.query('DROP TABLE IF EXISTS subscription_plan CASCADE');
    await client.query('DROP TABLE IF EXISTS advertisement CASCADE');
    await client.query('DROP TABLE IF EXISTS advertisement_plan CASCADE');
    await client.query('DROP TABLE IF EXISTS chatbot_query CASCADE');
    await client.query('DROP TABLE IF EXISTS medicines CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    await client.query('DROP TABLE IF EXISTS user_role CASCADE');
    
    await client.query('COMMIT');
    console.log('Tables dropped successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error dropping tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

fixSchema()
  .then(() => {
    console.log('Schema fix complete. Now run npm start to reinitialize the database.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Schema fix failed:', error);
    process.exit(1);
  });
