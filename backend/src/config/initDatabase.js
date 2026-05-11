const { pool } = require('./database');

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

    // Migration: Add image_url column to pharmacies table if it doesn't exist
    try {
      await client.query(`
        ALTER TABLE pharmacies 
        ADD COLUMN IF NOT EXISTS image_url TEXT
      `);
      console.log('Migration: image_url column added to pharmacies table');
    } catch (migrationError) {
      console.log('Migration: image_url column may already exist or other error:', migrationError.message);
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
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
