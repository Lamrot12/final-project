const { pool } = require('./database');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create tables if they don't exist (preserve data between restarts)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        user_type VARCHAR(50) DEFAULT 'patient',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS medicines (
        medicine_id SERIAL PRIMARY KEY,
        generic_name VARCHAR(255) NOT NULL,
        brand_name VARCHAR(255),
        strength VARCHAR(50),
        category VARCHAR(100),
        description TEXT,
        manufacturer VARCHAR(255),
        search_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pharmacies (
        pharmacy_id SERIAL PRIMARY KEY,
        pharmacy_name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        operating_hours TEXT,
        license_number VARCHAR(100),
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pharmacy_stocks (
        stock_id SERIAL PRIMARY KEY,
        pharmacy_id INTEGER REFERENCES pharmacies(pharmacy_id) ON DELETE CASCADE,
        medicine_id INTEGER REFERENCES medicines(medicine_id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 0,
        expiry_date DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(pharmacy_id, medicine_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        transaction_id SERIAL PRIMARY KEY,
        pharmacy_id INTEGER REFERENCES pharmacies(pharmacy_id) ON DELETE CASCADE,
        medicine_id INTEGER REFERENCES medicines(medicine_id) ON DELETE CASCADE,
        transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('stock_in', 'stock_out', 'sale')),
        quantity INTEGER NOT NULL,
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        prescription_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        file_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    console.log('Database tables created successfully');

    // Insert sample data
    await insertSampleData();
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function insertSampleData() {
  try {
    // Insert sample medicines
    const medicines = [
      { generic_name: 'Amoxicillin', brand_name: 'Amoxil', strength: '500mg', category: 'Antibiotic', description: 'Antibiotic for bacterial infections', manufacturer: 'GSK', search_count: 15420 },
      { generic_name: 'Paracetamol', brand_name: 'Panadol', strength: '500mg', category: 'Pain Relief', description: 'Pain reliever and fever reducer', manufacturer: 'GSK', search_count: 12350 },
      { generic_name: 'Ibuprofen', brand_name: 'Advil', strength: '400mg', category: 'Pain Relief', description: 'NSAID for pain and inflammation', manufacturer: 'Pfizer', search_count: 9870 },
      { generic_name: 'Omeprazole', brand_name: 'Prilosec', strength: '20mg', category: 'Antacid', description: 'Proton pump inhibitor for GERD', manufacturer: 'AstraZeneca', search_count: 8650 },
      { generic_name: 'Metformin', brand_name: 'Glucophage', strength: '500mg', category: 'Diabetes', description: 'Type 2 diabetes medication', manufacturer: 'Merck', search_count: 7890 },
      { generic_name: 'Lisinopril', brand_name: 'Prinivil', strength: '10mg', category: 'Blood Pressure', description: 'ACE inhibitor for hypertension', manufacturer: 'Merck', search_count: 6540 },
      { generic_name: 'Aspirin', brand_name: 'Bayer Aspirin', strength: '100mg', category: 'Pain Relief', description: 'Antiplatelet and pain reliever', manufacturer: 'Bayer', search_count: 5430 },
      { generic_name: 'Vitamin D3', brand_name: 'Nature Made', strength: '1000 IU', category: 'Supplements', description: 'Vitamin D supplement', manufacturer: 'Nature Made', search_count: 4890 },
      { generic_name: 'Ciprofloxacin', brand_name: 'Cipro', strength: '500mg', category: 'Antibiotic', description: 'Antibiotic for bacterial infections', manufacturer: 'Bayer', search_count: 4560 },
      { generic_name: 'Azithromycin', brand_name: 'Zithromax', strength: '250mg', category: 'Antibiotic', description: 'Antibiotic for respiratory infections', manufacturer: 'Pfizer', search_count: 4320 },
      { generic_name: 'Doxycycline', brand_name: 'Vibramycin', strength: '100mg', category: 'Antibiotic', description: 'Antibiotic for bacterial infections', manufacturer: 'Pfizer', search_count: 4100 },
      { generic_name: 'Cephalexin', brand_name: 'Keflex', strength: '500mg', category: 'Antibiotic', description: 'Antibiotic for bacterial infections', manufacturer: 'Eli Lilly', search_count: 3890 },
      { generic_name: 'Naproxen', brand_name: 'Aleve', strength: '220mg', category: 'Pain Relief', description: 'NSAID for pain relief', manufacturer: 'Bayer', search_count: 3670 },
      { generic_name: 'Diclofenac', brand_name: 'Voltaren', strength: '50mg', category: 'Pain Relief', description: 'NSAID for pain and inflammation', manufacturer: 'Novartis', search_count: 3450 },
      { generic_name: 'Codeine', brand_name: 'Tylenol #3', strength: '30mg', category: 'Pain Relief', description: 'Opioid pain reliever', manufacturer: 'J&J', search_count: 3230 },
      { generic_name: 'Tramadol', brand_name: 'Ultram', strength: '50mg', category: 'Pain Relief', description: 'Opioid pain reliever', manufacturer: 'Janssen', search_count: 3010 },
      { generic_name: 'Gabapentin', brand_name: 'Neurontin', strength: '300mg', category: 'Neurology', description: 'Anticonvulsant for nerve pain', manufacturer: 'Pfizer', search_count: 2890 },
      { generic_name: 'Pregabalin', brand_name: 'Lyrica', strength: '75mg', category: 'Neurology', description: 'Anticonvulsant for nerve pain', manufacturer: 'Pfizer', search_count: 2670 },
      { generic_name: 'Amlodipine', brand_name: 'Norvasc', strength: '5mg', category: 'Blood Pressure', description: 'Calcium channel blocker', manufacturer: 'Pfizer', search_count: 2450 },
      { generic_name: 'Losartan', brand_name: 'Cozaar', strength: '50mg', category: 'Blood Pressure', description: 'ARB for hypertension', manufacturer: 'Merck', search_count: 2230 },
      { generic_name: 'Atorvastatin', brand_name: 'Lipitor', strength: '20mg', category: 'Cholesterol', description: 'Statin for cholesterol', manufacturer: 'Pfizer', search_count: 2010 },
      { generic_name: 'Simvastatin', brand_name: 'Zocor', strength: '20mg', category: 'Cholesterol', description: 'Statin for cholesterol', manufacturer: 'Merck', search_count: 1890 },
      { generic_name: 'Rosuvastatin', brand_name: 'Crestor', strength: '10mg', category: 'Cholesterol', description: 'Statin for cholesterol', manufacturer: 'AstraZeneca', search_count: 1770 },
      { generic_name: 'Ezetimibe', brand_name: 'Zetia', strength: '10mg', category: 'Cholesterol', description: 'Cholesterol absorption inhibitor', manufacturer: 'Merck', search_count: 1650 },
      { generic_name: 'Insulin Glargine', brand_name: 'Lantus', strength: '100U/mL', category: 'Diabetes', description: 'Long-acting insulin', manufacturer: 'Sanofi', search_count: 1530 },
      { generic_name: 'Insulin Lispro', brand_name: 'Humalog', strength: '100U/mL', category: 'Diabetes', description: 'Fast-acting insulin', manufacturer: 'Eli Lilly', search_count: 1410 },
      { generic_name: 'Sitagliptin', brand_name: 'Januvia', strength: '100mg', category: 'Diabetes', description: 'DPP-4 inhibitor', manufacturer: 'Merck', search_count: 1390 },
      { generic_name: 'Empagliflozin', brand_name: 'Jardiance', strength: '10mg', category: 'Diabetes', description: 'SGLT2 inhibitor', manufacturer: 'Boehringer', search_count: 1370 },
      { generic_name: 'Dapagliflozin', brand_name: 'Farxiga', strength: '10mg', category: 'Diabetes', description: 'SGLT2 inhibitor', manufacturer: 'AstraZeneca', search_count: 1350 },
      { generic_name: 'Levothyroxine', brand_name: 'Synthroid', strength: '50mcg', category: 'Thyroid', description: 'Thyroid hormone replacement', manufacturer: 'AbbVie', search_count: 1330 },
      { generic_name: 'Prednisone', brand_name: 'Deltasone', strength: '5mg', category: 'Steroid', description: 'Corticosteroid for inflammation', manufacturer: 'Roxane', search_count: 1310 },
      { generic_name: 'Hydrocortisone', brand_name: 'Cortef', strength: '10mg', category: 'Steroid', description: 'Corticosteroid', manufacturer: 'Pfizer', search_count: 1290 },
      { generic_name: 'Methylprednisolone', brand_name: 'Medrol', strength: '4mg', category: 'Steroid', description: 'Corticosteroid', manufacturer: 'Pfizer', search_count: 1270 },
      { generic_name: 'Montelukast', brand_name: 'Singulair', strength: '10mg', category: 'Asthma', description: 'Leukotriene receptor antagonist', manufacturer: 'Merck', search_count: 1250 },
      { generic_name: 'Fluticasone', brand_name: 'Flonase', strength: '50mcg', category: 'Asthma', description: 'Corticosteroid nasal spray', manufacturer: 'GSK', search_count: 1230 },
      { generic_name: 'Albuterol', brand_name: 'Ventolin', strength: '100mcg', category: 'Asthma', description: 'Bronchodilator inhaler', manufacturer: 'GSK', search_count: 1210 },
      { generic_name: 'Tiotropium', brand_name: 'Spiriva', strength: '18mcg', category: 'Asthma', description: 'Long-acting bronchodilator', manufacturer: 'Boehringer', search_count: 1190 },
      { generic_name: 'Furosemide', brand_name: 'Lasix', strength: '40mg', category: 'Diuretic', description: 'Loop diuretic for edema', manufacturer: 'Sanofi', search_count: 1170 },
      { generic_name: 'Hydrochlorothiazide', brand_name: 'Microzide', strength: '25mg', category: 'Diuretic', description: 'Thiazide diuretic', manufacturer: 'Mylan', search_count: 1150 },
      { generic_name: 'Spironolactone', brand_name: 'Aldactone', strength: '25mg', category: 'Diuretic', description: 'Potassium-sparing diuretic', manufacturer: 'Pfizer', search_count: 1130 },
      { generic_name: 'Warfarin', brand_name: 'Coumadin', strength: '5mg', category: 'Anticoagulant', description: 'Blood thinner', manufacturer: 'Bristol Myers', search_count: 1110 },
      { generic_name: 'Rivaroxaban', brand_name: 'Xarelto', strength: '20mg', category: 'Anticoagulant', description: 'Factor Xa inhibitor', manufacturer: 'J&J', search_count: 1090 },
      { generic_name: 'Apixaban', brand_name: 'Eliquis', strength: '5mg', category: 'Anticoagulant', description: 'Factor Xa inhibitor', manufacturer: 'Bristol Myers', search_count: 1070 },
      { generic_name: 'Clopidogrel', brand_name: 'Plavix', strength: '75mg', category: 'Anticoagulant', description: 'Antiplatelet', manufacturer: 'Sanofi', search_count: 1050 },
      { generic_name: 'Esomeprazole', brand_name: 'Nexium', strength: '40mg', category: 'Antacid', description: 'Proton pump inhibitor', manufacturer: 'AstraZeneca', search_count: 1030 },
      { generic_name: 'Pantoprazole', brand_name: 'Protonix', strength: '40mg', category: 'Antacid', description: 'Proton pump inhibitor', manufacturer: 'Pfizer', search_count: 1010 },
      { generic_name: 'Ranitidine', brand_name: 'Zantac', strength: '150mg', category: 'Antacid', description: 'H2 blocker for acid reflux', manufacturer: 'Sanofi', search_count: 990 },
      { generic_name: 'Famotidine', brand_name: 'Pepcid', strength: '20mg', category: 'Antacid', description: 'H2 blocker for acid reflux', manufacturer: 'J&J', search_count: 970 },
      { generic_name: 'Loratadine', brand_name: 'Claritin', strength: '10mg', category: 'Allergy', description: 'Antihistamine for allergies', manufacturer: 'Bayer', search_count: 950 },
      { generic_name: 'Cetirizine', brand_name: 'Zyrtec', strength: '10mg', category: 'Allergy', description: 'Antihistamine for allergies', manufacturer: 'J&J', search_count: 930 },
      { generic_name: 'Fexofenadine', brand_name: 'Allegra', strength: '180mg', category: 'Allergy', description: 'Antihistamine for allergies', manufacturer: 'Sanofi', search_count: 910 },
      { generic_name: 'Diphenhydramine', brand_name: 'Benadryl', strength: '25mg', category: 'Allergy', description: 'Antihistamine for allergies', manufacturer: 'J&J', search_count: 890 },
    ];
    
    for (const med of medicines) {
      await pool.query(`
        INSERT INTO medicines (generic_name, brand_name, strength, category, description, manufacturer, search_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [med.generic_name, med.brand_name, med.strength, med.category, med.description, med.manufacturer, med.search_count]);
    }
    
    // Insert sample pharmacies
    const pharmacies = [
      { pharmacy_name: 'Abeba Pharmacy', address: 'Bole, Addis Ababa', phone: '+251 911 123 456', email: 'admin_abeba@pharmalink.com', latitude: 8.9636, longitude: 38.7428, image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop' },
      { pharmacy_name: 'MediCare Plus', address: 'Kazanchis, Addis Ababa', phone: '+251 911 234 567', email: 'admin_medicare@pharmalink.com', latitude: 8.9700, longitude: 38.7500, image_url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=300&fit=crop' },
      { pharmacy_name: 'Health First', address: 'Megenagna, Addis Ababa', phone: '+251 911 345 678', email: 'admin_healthfirst@pharmalink.com', latitude: 8.9800, longitude: 38.7600, image_url: 'https://images.unsplash.com/photo-1576726825112-4d6eb84c9d2b?w=400&h=300&fit=crop' },
      { pharmacy_name: 'Quick Meds', address: 'Piassa, Addis Ababa', phone: '+251 911 456 789', email: 'admin_quickmeds@pharmalink.com', latitude: 9.0000, longitude: 38.7700, image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop' },
      { pharmacy_name: 'City Pharmacy', address: 'Meskel Square, Addis Ababa', phone: '+251 911 567 890', email: 'admin_city@pharmalink.com', latitude: 9.0100, longitude: 38.7800, image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop' },
      { pharmacy_name: 'Wellness Center', address: 'Casa, Addis Ababa', phone: '+251 911 678 901', email: 'admin_wellness@pharmalink.com', latitude: 9.0200, longitude: 38.7900, image_url: 'https://images.unsplash.com/photo-1607619055127-2e9b3c3e0e1a?w=400&h=300&fit=crop' },
    ];
    
    for (const pharm of pharmacies) {
      await pool.query(`
        INSERT INTO pharmacies (pharmacy_name, address, phone, email, latitude, longitude, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [pharm.pharmacy_name, pharm.address, pharm.phone, pharm.email, pharm.latitude, pharm.longitude, pharm.image_url]);
    }
    
    // Insert pharmacy users with login credentials
    const defaultPassword = await bcrypt.hash('password123', 10);
    const pharmacyUsers = [
      { email: 'admin_abeba@pharmalink.com', full_name: 'Abeba Pharmacy', phone: '+251 911 123 456' },
      { email: 'admin_medicare@pharmalink.com', full_name: 'MediCare Plus', phone: '+251 911 234 567' },
      { email: 'admin_healthfirst@pharmalink.com', full_name: 'Health First', phone: '+251 911 345 678' },
      { email: 'admin_quickmeds@pharmalink.com', full_name: 'Quick Meds', phone: '+251 911 456 789' },
      { email: 'admin_city@pharmalink.com', full_name: 'City Pharmacy', phone: '+251 911 567 890' },
      { email: 'admin_wellness@pharmalink.com', full_name: 'Wellness Center', phone: '+251 911 678 901' },
    ];
    
    for (const user of pharmacyUsers) {
      await pool.query(`
        INSERT INTO users (email, password, full_name, phone, user_type)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [user.email, defaultPassword, user.full_name, user.phone, 'pharmacy']);
    }

    // Insert sample inventory data for pharmacies
    const sampleInventory = [
      // Abeba Pharmacy (pharmacy_id: 1)
      { pharmacy_id: 1, medicine_id: 1, quantity: 50, expiry_date: '2026-12-31' },
      { pharmacy_id: 1, medicine_id: 2, quantity: 30, expiry_date: '2026-10-15' },
      { pharmacy_id: 1, medicine_id: 3, quantity: 25, expiry_date: '2026-08-20' },
      { pharmacy_id: 1, medicine_id: 4, quantity: 40, expiry_date: '2026-11-30' },
      { pharmacy_id: 1, medicine_id: 5, quantity: 15, expiry_date: '2026-09-10' },
      { pharmacy_id: 1, medicine_id: 6, quantity: 60, expiry_date: '2027-01-15' },
      { pharmacy_id: 1, medicine_id: 7, quantity: 20, expiry_date: '2026-07-25' },
      { pharmacy_id: 1, medicine_id: 8, quantity: 35, expiry_date: '2026-12-01' },
      { pharmacy_id: 1, medicine_id: 9, quantity: 45, expiry_date: '2026-10-30' },
      { pharmacy_id: 1, medicine_id: 10, quantity: 10, expiry_date: '2026-08-15' },
      // MediCare Plus (pharmacy_id: 2)
      { pharmacy_id: 2, medicine_id: 11, quantity: 55, expiry_date: '2026-11-20' },
      { pharmacy_id: 2, medicine_id: 12, quantity: 28, expiry_date: '2026-09-25' },
      { pharmacy_id: 2, medicine_id: 13, quantity: 33, expiry_date: '2026-12-10' },
      { pharmacy_id: 2, medicine_id: 14, quantity: 42, expiry_date: '2026-10-05' },
      { pharmacy_id: 2, medicine_id: 15, quantity: 18, expiry_date: '2026-08-30' },
    ];

    for (const inv of sampleInventory) {
      await pool.query(`
        INSERT INTO pharmacy_stocks (pharmacy_id, medicine_id, quantity, expiry_date)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (pharmacy_id, medicine_id) DO NOTHING
      `, [inv.pharmacy_id, inv.medicine_id, inv.quantity, inv.expiry_date]);
    }

    console.log('Sample data inserted successfully');
    console.log('Pharmacy login credentials created:');
    pharmacyUsers.forEach(u => console.log(`  ${u.email} / password123`));
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
