const { pool } = require('./src/config/database');

async function checkTables() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database');
    console.log('Database info:');
    
    // Get current database
    const dbResult = await client.query('SELECT current_database()');
    console.log('Current database:', dbResult.rows[0].current_database);
    
    // Get current schema
    const schemaResult = await client.query('SELECT current_schema()');
    console.log('Current schema:', schemaResult.rows[0].current_schema);
    
    // List all tables in current schema
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nTables in public schema:');
    if (tablesResult.rows.length === 0) {
      console.log('No tables found in public schema');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    // Check for specific tables
    const specificTables = ['users', 'pharmacy', 'medicine', 'pharmacy_stock', 'pharmacy_license', 'bincard'];
    console.log('\nChecking for specific tables:');
    
    for (const tableName of specificTables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [tableName]);
      
      console.log(`${tableName}: ${result.rows[0].exists ? 'EXISTS' : 'MISSING'}`);
    }
    
    // If pharmacy table exists, show its structure
    const pharmacyExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pharmacy'
      )
    `);
    
    if (pharmacyExists.rows[0].exists) {
      console.log('\nPharmacy table structure:');
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'pharmacy' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      columnsResult.rows.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTables();
