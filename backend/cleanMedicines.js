const { pool } = require('./src/config/database');

async function cleanMedicinesAndInventory() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🧹 Cleaning medicines and inventory data...');

    // Delete from pharmacy_stocks (inventory)
    const stockResult = await client.query('DELETE FROM pharmacy_stocks');
    console.log(`✅ Deleted ${stockResult.rowCount} records from pharmacy_stocks`);

    // Delete from bincard
    const bincardResult = await client.query('DELETE FROM bincard');
    console.log(`✅ Deleted ${bincardResult.rowCount} records from bincard`);

    // Delete from medicines
    const medicineResult = await client.query('DELETE FROM medicines');
    console.log(`✅ Deleted ${medicineResult.rowCount} records from medicines`);

    // Reset sequences
    await client.query('ALTER SEQUENCE medicines_medicine_id_seq RESTART WITH 1');
    console.log('✅ Reset medicines sequence');

    await client.query('COMMIT');
    console.log('\n🎉 All medicines and inventory data cleaned successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error cleaning data:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

cleanMedicinesAndInventory();
