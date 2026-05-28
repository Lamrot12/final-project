const { pool } = require('./src/config/database');

async function addCommonMedicines() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('💊 Adding 25 common medicines...');

    const commonMedicines = [
      // Pain & Fever
      { brand_name: 'Panadol', generic_name: 'Paracetamol', category: 'Analgesic', description: 'Pain and fever relief', dosage_form: 'Tablet', strength: '500mg' },
      { brand_name: 'Advil', generic_name: 'Ibuprofen', category: 'Analgesic', description: 'Pain and inflammation relief', dosage_form: 'Tablet', strength: '400mg' },
      { brand_name: 'Aspirin', generic_name: 'Aspirin', category: 'Analgesic', description: 'Pain relief and blood thinner', dosage_form: 'Tablet', strength: '300mg' },
      
      // Antibiotics
      { brand_name: 'Amoxil', generic_name: 'Amoxicillin', category: 'Antibiotic', description: 'Broad spectrum antibiotic', dosage_form: 'Capsule', strength: '500mg' },
      { brand_name: 'Zithromax', generic_name: 'Azithromycin', category: 'Antibiotic', description: 'Macrolide antibiotic', dosage_form: 'Tablet', strength: '250mg' },
      { brand_name: 'Cipro', generic_name: 'Ciprofloxacin', category: 'Antibiotic', description: 'Fluoroquinolone antibiotic', dosage_form: 'Tablet', strength: '500mg' },
      
      // Cold & Allergy
      { brand_name: 'Benadryl', generic_name: 'Diphenhydramine', category: 'Antihistamine', description: 'Allergy relief', dosage_form: 'Tablet', strength: '25mg' },
      { brand_name: 'Claritin', generic_name: 'Loratadine', category: 'Antihistamine', description: 'Non-drowsy allergy relief', dosage_form: 'Tablet', strength: '10mg' },
      { brand_name: 'Sudafed', generic_name: 'Pseudoephedrine', category: 'Decongestant', description: 'Nasal decongestant', dosage_form: 'Tablet', strength: '60mg' },
      
      // Stomach & Digestive
      { brand_name: 'Omeprazole', generic_name: 'Omeprazole', category: 'PPI', description: 'Acid reflux treatment', dosage_form: 'Capsule', strength: '20mg' },
      { brand_name: 'Gaviscon', generic_name: 'Alginate', category: 'Antacid', description: 'Heartburn relief', dosage_form: 'Tablet', strength: '500mg' },
      { brand_name: 'Imodium', generic_name: 'Loperamide', category: 'Antidiarrheal', description: 'Diarrhea treatment', dosage_form: 'Capsule', strength: '2mg' },
      
      // Vitamins & Supplements
      { brand_name: 'Vitamin C', generic_name: 'Ascorbic Acid', category: 'Vitamin', description: 'Immune support', dosage_form: 'Tablet', strength: '500mg' },
      { brand_name: 'Vitamin D3', generic_name: 'Cholecalciferol', category: 'Vitamin', description: 'Bone health', dosage_form: 'Capsule', strength: '1000IU' },
      { brand_name: 'Centrum', generic_name: 'Multivitamin', category: 'Vitamin', description: 'Daily multivitamin', dosage_form: 'Tablet', strength: 'Complex' },
      
      // Chronic Conditions
      { brand_name: 'Metformin', generic_name: 'Metformin', category: 'Antidiabetic', description: 'Type 2 diabetes treatment', dosage_form: 'Tablet', strength: '500mg' },
      { brand_name: 'Lisinopril', generic_name: 'Lisinopril', category: 'ACE Inhibitor', description: 'Blood pressure medication', dosage_form: 'Tablet', strength: '10mg' },
      { brand_name: 'Atorvastatin', generic_name: 'Atorvastatin', category: 'Statin', description: 'Cholesterol lowering', dosage_form: 'Tablet', strength: '20mg' },
      
      // Skin Care
      { brand_name: 'Neosporin', generic_name: 'Neomycin', category: 'Topical Antibiotic', description: 'Wound infection prevention', dosage_form: 'Ointment', strength: '5mg/g' },
      { brand_name: 'Hydrocortisone', generic_name: 'Hydrocortisone', category: 'Steroid', description: 'Anti-inflammatory cream', dosage_form: 'Cream', strength: '1%' },
      
      // Eye & Ear
      { brand_name: 'Visine', generic_name: 'Tetrahydrozoline', category: 'Eye Drops', description: 'Red eye relief', dosage_form: 'Eye Drops', strength: '0.05%' },
      { brand_name: 'Cortisporin', generic_name: 'Hydrocortisone', category: 'Ear Drops', description: 'Ear infection treatment', dosage_form: 'Ear Drops', strength: '10mg/ml' },
      
      // Respiratory
      { brand_name: 'Ventolin', generic_name: 'Albuterol', category: 'Bronchodilator', description: 'Asthma inhaler', dosage_form: 'Inhaler', strength: '90mcg' },
      { brand_name: 'Serevent', generic_name: 'Salmeterol', category: 'Bronchodilator', description: 'Long-acting asthma inhaler', dosage_form: 'Inhaler', strength: '25mcg' }
    ];

    for (const medicine of commonMedicines) {
      const result = await client.query(`
        INSERT INTO medicines (brand_name, generic_name, category, description, dosage_form, strength, manufacturer)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING medicine_id
      `, [
        medicine.brand_name,
        medicine.generic_name,
        medicine.category,
        medicine.description,
        medicine.dosage_form,
        medicine.strength,
        'Generic Pharma'
      ]);
      
      console.log(`✅ Added: ${medicine.brand_name} (${medicine.generic_name})`);
    }

    await client.query('COMMIT');
    console.log(`\n🎉 Successfully added ${commonMedicines.length} common medicines!`);

    // Show summary
    const summary = await client.query(`
      SELECT category, COUNT(*) as count 
      FROM medicines 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    console.log('\n📊 Medicine Summary by Category:');
    summary.rows.forEach(row => {
      console.log(`  - ${row.category}: ${row.count} medicines`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding medicines:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

addCommonMedicines();
