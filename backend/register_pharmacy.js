const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { pool } = require(path.join(__dirname, './src/config/database'));
const bcrypt = require('bcryptjs');

async function registerPharmacy(pharmacyData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert pharmacy
    const pharmacyResult = await client.query(`
      INSERT INTO pharmacies (pharmacy_name, address, phone, email, latitude, longitude, operating_hours, license_number, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING pharmacy_id
    `, [
      pharmacyData.name,
      pharmacyData.address,
      pharmacyData.phone,
      pharmacyData.email,
      pharmacyData.latitude,
      pharmacyData.longitude,
      pharmacyData.operating_hours,
      pharmacyData.license_number,
      pharmacyData.image_url || 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800'
    ]);
    
    const pharmacyId = pharmacyResult.rows[0].pharmacy_id;
    
    // Create user account for pharmacy
    const hashedPassword = await bcrypt.hash(pharmacyData.password, 10);
    const userResult = await client.query(`
      INSERT INTO users (email, password, full_name, phone, user_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id
    `, [
      pharmacyData.user_email,
      hashedPassword,
      pharmacyData.name,
      pharmacyData.phone,
      'pharmacy'
    ]);
    
    // Add sample inventory
    const medicines = await client.query('SELECT medicine_id FROM medicines LIMIT 5');
    for (const med of medicines.rows) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 12);
      
      await client.query(`
        INSERT INTO pharmacy_stocks (pharmacy_id, medicine_id, quantity, expiry_date)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (pharmacy_id, medicine_id) DO UPDATE SET quantity = EXCLUDED.quantity
      `, [pharmacyId, med.medicine_id, Math.floor(Math.random() * 50) + 20, expiryDate]);
    }
    
    await client.query('COMMIT');
    
    console.log('\n=== PHARMACY REGISTERED ===');
    console.log(`Pharmacy: ${pharmacyData.name}`);
    console.log(`ID: ${pharmacyId}`);
    console.log(`\nLogin Credentials:`);
    console.log(`Email: ${pharmacyData.user_email}`);
    console.log(`Password: ${pharmacyData.password}`);
    console.log(`User Type: pharmacy`);
    console.log('===========================\n');
    
    return { pharmacyId, email: pharmacyData.user_email, password: pharmacyData.password };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Register a new pharmacy
const newPharmacy = {
  name: 'Test Pharmacy',
  address: '123 Test Street, Addis Ababa',
  phone: '+251911234567',
  email: 'test@pharmacy.com',
  user_email: 'admin_testpharmacy@pharmalink.com',
  password: 'test123',
  latitude: 9.03,
  longitude: 38.74,
  operating_hours: 'Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM',
  license_number: 'PH-2024-001'
};

registerPharmacy(newPharmacy);
