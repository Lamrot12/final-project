const { pool } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function addPharmacyUsers() {
  try {
    console.log('Adding pharmacy users...');
    
    // Get existing pharmacies
    const pharmaciesResult = await pool.query('SELECT pharmacy_id, pharmacy_name, email FROM pharmacies LIMIT 6');
    const pharmacies = pharmaciesResult.rows;
    
    if (pharmacies.length === 0) {
      console.log('No pharmacies found. Please add pharmacies first.');
      return;
    }
    
    // Create pharmacy users
    for (const pharmacy of pharmacies) {
      const email = `admin_${pharmacy.pharmacy_name.toLowerCase().replace(/\s+/g, '')}@pharmalink.com`;
      const password = 'password123'; // Default password for testing
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Check if user already exists
      const existingUser = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        console.log(`User for ${pharmacy.pharmacy_name} already exists: ${email}`);
        continue;
      }
      
      // Create user
      const userResult = await pool.query(`
        INSERT INTO users (email, password, full_name, phone, user_type)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id
      `, [email, hashedPassword, pharmacy.pharmacy_name, pharmacy.phone, 'pharmacy']);
      
      const userId = userResult.rows[0].user_id;
      console.log(`Created user for ${pharmacy.pharmacy_name}: ${email} (password: ${password})`);
      
      // Add sample inventory for this pharmacy
      const medicinesResult = await pool.query('SELECT medicine_id, generic_name, brand_name FROM medicines LIMIT 8');
      const medicines = medicinesResult.rows;
      
      for (const medicine of medicines) {
        const quantity = Math.floor(Math.random() * 100) + 10;
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + Math.floor(Math.random() * 12) + 6);
        
        await pool.query(`
          INSERT INTO pharmacy_stocks (pharmacy_id, medicine_id, quantity, expiry_date)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (pharmacy_id, medicine_id) DO UPDATE SET
            quantity = EXCLUDED.quantity,
            expiry_date = EXCLUDED.expiry_date
        `, [pharmacy.pharmacy_id, medicine.medicine_id, quantity, expiryDate]);
      }
      
      console.log(`Added sample inventory for ${pharmacy.pharmacy_name}`);
    }
    
    console.log('Pharmacy users and inventory added successfully!');
    await pool.end();
  } catch (error) {
    console.error('Error adding pharmacy users:', error);
    await pool.end();
  }
}

addPharmacyUsers();
