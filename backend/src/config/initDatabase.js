const { pool } = require('./database');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Enable UUID extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create user_role table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_role (
        role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        role_name VARCHAR(100) NOT NULL
      )
    `);

    // Insert default roles
    await client.query(`
      INSERT INTO user_role (role_name) VALUES ('admin'), ('pharmacy'), ('patient')
      ON CONFLICT DO NOTHING
    `);

    // Create users table with UUID
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        phone VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        role_id UUID,
        FOREIGN KEY (role_id) REFERENCES user_role(role_id)
      )
    `);

    // Create medicines table with UUID
    await client.query(`
      CREATE TABLE IF NOT EXISTS medicines (
        medicine_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        generic_name VARCHAR(150) NOT NULL,
        brand_name VARCHAR(150),
        dosage_form VARCHAR(100),
        strength VARCHAR(100),
        category VARCHAR(100),
        description TEXT,
        manufacturer VARCHAR(255),
        side_effects TEXT,
        contraindications TEXT,
        usage_instructions TEXT,
        storage_instructions TEXT,
        search_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create pharmacy table with UUID
    await client.query(`
      CREATE TABLE IF NOT EXISTS pharmacies (
        pharmacy_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pharmacy_name VARCHAR(200) NOT NULL,
        address TEXT NOT NULL,
        contact_phone VARCHAR(50),
        contact_email VARCHAR(150),
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        operating_hours VARCHAR(100),
        is_verified BOOLEAN DEFAULT FALSE,
        is_open BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified_at TIMESTAMP,
        user_id UUID,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

    // Create pharmacy_license table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pharmacy_license (
        license_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        license_number VARCHAR(100) NOT NULL,
        issue_date DATE,
        expiry_date DATE,
        license_document_url TEXT,
        verification_status VARCHAR(50) DEFAULT 'pending',
        verified_by UUID,
        verified_at TIMESTAMP,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        pharmacy_id UUID,
        FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(pharmacy_id)
      )
    `);

    // Create pharmacy_stock table with UUID
    await client.query(`
      CREATE TABLE IF NOT EXISTS pharmacy_stocks (
        stock_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pharmacy_id UUID REFERENCES pharmacies(pharmacy_id) ON DELETE CASCADE,
        medicine_id UUID REFERENCES medicines(medicine_id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 0,
        expiry_date DATE,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(pharmacy_id, medicine_id)
      )
    `);

    // Create bincard table (replaces transactions)
    await client.query(`
      CREATE TABLE IF NOT EXISTS bincard (
        bin_card_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pharmacy_id UUID REFERENCES pharmacies(pharmacy_id) ON DELETE CASCADE,
        medicine_id UUID REFERENCES medicines(medicine_id) ON DELETE CASCADE,
        transaction_type VARCHAR(50) NOT NULL,
        quantity_changed INT NOT NULL,
        balance_after INT NOT NULL,
        expiry_date DATE,
        reference_note TEXT,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        performed_by_user_id UUID,
        FOREIGN KEY (performed_by_user_id) REFERENCES users(user_id)
      )
    `);

    // Create prescription table with UUID
    await client.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        prescription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        pharmacy_id UUID REFERENCES pharmacies(pharmacy_id) ON DELETE CASCADE,
        prescription_image_url TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending'
      )
    `);

    // Create prescription_result table
    await client.query(`
      CREATE TABLE IF NOT EXISTS prescription_result (
        result_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        prescription_id UUID REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
        extracted_text TEXT,
        confidence_score FLOAT,
        is_confirmed BOOLEAN DEFAULT FALSE,
        confirmed_at TIMESTAMP
      )
    `);

    // Create subscription_plan table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscription_plan (
        plan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        plan_name VARCHAR(100) NOT NULL,
        description TEXT,
        duration_days INT,
        price FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create subscription table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscription (
        subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        plan_id UUID REFERENCES subscription_plan(plan_id),
        pharmacy_id UUID REFERENCES pharmacies(pharmacy_id) ON DELETE CASCADE,
        receipt_image_url TEXT,
        verification_status BOOLEAN DEFAULT FALSE,
        verified_by UUID,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create advertisement_plan table
    await client.query(`
      CREATE TABLE IF NOT EXISTS advertisement_plan (
        plan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        plan_name VARCHAR(100) NOT NULL,
        description TEXT,
        duration_days INT,
        price FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create advertisement table
    await client.query(`
      CREATE TABLE IF NOT EXISTS advertisement (
        ad_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        plan_id UUID REFERENCES advertisement_plan(plan_id),
        pharmacy_id UUID REFERENCES pharmacies(pharmacy_id) ON DELETE CASCADE,
        ad_title VARCHAR(150),
        ad_content TEXT,
        advertisement_image TEXT,
        receipt_image_url TEXT,
        verification_status BOOLEAN DEFAULT FALSE,
        approved_by UUID,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create chatbot_query table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chatbot_query (
        query_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        query_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    console.log('Database tables created successfully');

    // Migration: Add is_open column to pharmacies table if it doesn't exist
    try {
      await client.query(`
        ALTER TABLE pharmacies 
        ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT TRUE
      `);
      console.log('Migration: is_open column added to pharmacies table');
    } catch (migrationError) {
      console.log('Migration: is_open column may already exist or other error:', migrationError.message);
    }

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
    
    // Get pharmacy role_id
    const roleResult = await pool.query(`SELECT role_id FROM user_role WHERE role_name = 'pharmacy'`);
    const pharmacyRoleId = roleResult.rows[0]?.role_id;

    // Insert pharmacy users and get their UUIDs
    const defaultPassword = await bcrypt.hash('password123', 10);
    const pharmacyData = [
      { email: 'admin_abeba@pharmalink.com', full_name: 'Abeba Pharmacy', phone: '+251 911 123 456', address: 'Bole, Addis Ababa', lat: 8.9636, lng: 38.7428 },
      { email: 'admin_medicare@pharmalink.com', full_name: 'MediCare Plus', phone: '+251 911 234 567', address: 'Kazanchis, Addis Ababa', lat: 8.9700, lng: 38.7500 },
      { email: 'admin_healthfirst@pharmalink.com', full_name: 'Health First', phone: '+251 911 345 678', address: 'Megenagna, Addis Ababa', lat: 8.9800, lng: 38.7600 },
      { email: 'admin_quickmeds@pharmalink.com', full_name: 'Quick Meds', phone: '+251 911 456 789', address: 'Piassa, Addis Ababa', lat: 9.0000, lng: 38.7700 },
      { email: 'admin_city@pharmalink.com', full_name: 'City Pharmacy', phone: '+251 911 567 890', address: 'Meskel Square, Addis Ababa', lat: 9.0100, lng: 38.7800 },
      { email: 'admin_wellness@pharmalink.com', full_name: 'Wellness Center', phone: '+251 911 678 901', address: 'Casa, Addis Ababa', lat: 9.0200, lng: 38.7900 },
    ];

    const createdPharmacies = [];
    
    for (const data of pharmacyData) {
      // Insert user and get UUID
      const userResult = await pool.query(`
        INSERT INTO users (email, password_hash, full_name, phone, role_id)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE SET email = $1
        RETURNING user_id
      `, [data.email, defaultPassword, data.full_name, data.phone, pharmacyRoleId]);
      
      const userId = userResult.rows[0].user_id;
      
      // Insert pharmacy linked to user
      const pharmResult = await pool.query(`
        INSERT INTO pharmacies (pharmacy_name, address, contact_phone, contact_email, latitude, longitude, is_verified, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, true, $7)
        ON CONFLICT DO NOTHING
        RETURNING pharmacy_id
      `, [data.full_name, data.address, data.phone, data.email, data.lat, data.lng, userId]);
      
      if (pharmResult.rows[0]) {
        createdPharmacies.push({
          id: pharmResult.rows[0].pharmacy_id,
          name: data.full_name
        });
      }
    }
    
    // Get medicine UUIDs for inventory
    const medResult = await pool.query(`SELECT medicine_id FROM medicines LIMIT 15`);
    const medicineIds = medResult.rows.map(r => r.medicine_id);
    
    if (createdPharmacies.length >= 2 && medicineIds.length >= 15) {
      // Insert sample inventory for first 2 pharmacies
      const sampleInventory = [
        // First pharmacy
        { pharmacy_idx: 0, medicine_idx: 0, quantity: 50, expiry_date: '2026-12-31' },
        { pharmacy_idx: 0, medicine_idx: 1, quantity: 30, expiry_date: '2026-10-15' },
        { pharmacy_idx: 0, medicine_idx: 2, quantity: 25, expiry_date: '2026-08-20' },
        { pharmacy_idx: 0, medicine_idx: 3, quantity: 40, expiry_date: '2026-11-30' },
        { pharmacy_idx: 0, medicine_idx: 4, quantity: 15, expiry_date: '2026-09-10' },
        { pharmacy_idx: 0, medicine_idx: 5, quantity: 60, expiry_date: '2027-01-15' },
        { pharmacy_idx: 0, medicine_idx: 6, quantity: 20, expiry_date: '2026-07-25' },
        { pharmacy_idx: 0, medicine_idx: 7, quantity: 35, expiry_date: '2026-12-01' },
        { pharmacy_idx: 0, medicine_idx: 8, quantity: 45, expiry_date: '2026-10-30' },
        { pharmacy_idx: 0, medicine_idx: 9, quantity: 10, expiry_date: '2026-08-15' },
        // Second pharmacy
        { pharmacy_idx: 1, medicine_idx: 10, quantity: 55, expiry_date: '2026-11-20' },
        { pharmacy_idx: 1, medicine_idx: 11, quantity: 28, expiry_date: '2026-09-25' },
        { pharmacy_idx: 1, medicine_idx: 12, quantity: 33, expiry_date: '2026-12-10' },
        { pharmacy_idx: 1, medicine_idx: 13, quantity: 42, expiry_date: '2026-10-05' },
        { pharmacy_idx: 1, medicine_idx: 14, quantity: 18, expiry_date: '2026-08-30' },
      ];
      
      for (const inv of sampleInventory) {
        const pharmacyId = createdPharmacies[inv.pharmacy_idx]?.id;
        const medicineId = medicineIds[inv.medicine_idx];
        if (pharmacyId && medicineId) {
          await pool.query(`
            INSERT INTO pharmacy_stocks (pharmacy_id, medicine_id, quantity, expiry_date)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (pharmacy_id, medicine_id) DO NOTHING
          `, [pharmacyId, medicineId, inv.quantity, inv.expiry_date]);
        }
      }
    }

    console.log('Sample data inserted successfully');
    console.log('Pharmacy login credentials created:');
    pharmacyData.forEach(u => console.log(`  ${u.email} / password123`));
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
