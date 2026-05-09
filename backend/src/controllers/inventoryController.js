const { pool } = require('../config/database');

console.log('inventoryController loaded -', new Date().toISOString());

const inventoryController = {
  async addStock(req, res) {
    console.log('=== addStock called ===');
    const client = await pool.connect();
    try {
      // Use pharmacyId from authenticated user
      const pharmacy_id = req.user.pharmacyId;
      const { medicine_id, quantity, expiry_date } = req.body;
      console.log('addStock called with:', { pharmacy_id, medicine_id, quantity, expiry_date });

      if (!pharmacy_id) {
        return res.status(403).json({ error: 'Only pharmacy staff can manage inventory' });
      }
      if (!medicine_id || !quantity) {
        return res.status(400).json({ error: 'medicine_id and quantity are required' });
      }

      await client.query('BEGIN');
      console.log('Transaction started');

      // Check if stock record exists
      const existingStock = await client.query(
        'SELECT * FROM pharmacy_stocks WHERE pharmacy_id = $1 AND medicine_id = $2',
        [pharmacy_id, medicine_id]
      );
      console.log('Existing stock:', existingStock.rows);

      let result;
      if (existingStock.rows.length > 0) {
        // Update existing stock
        const newQuantity = parseInt(existingStock.rows[0].quantity) + parseInt(quantity);
        console.log('Updating stock to:', newQuantity);
        result = await client.query(`
          UPDATE pharmacy_stocks
          SET quantity = $1, expiry_date = COALESCE($2, expiry_date), updated_at = CURRENT_TIMESTAMP
          WHERE pharmacy_id = $3 AND medicine_id = $4
          RETURNING *
        `, [newQuantity, expiry_date, pharmacy_id, medicine_id]);
        console.log('Update result:', result.rows);
      } else {
        // Insert new stock
        console.log('Inserting new stock');
        result = await client.query(`
          INSERT INTO pharmacy_stocks (pharmacy_id, medicine_id, quantity, expiry_date)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [pharmacy_id, medicine_id, quantity, expiry_date]);
        console.log('Insert result:', result.rows);
      }

      // Record transaction
      console.log('Recording transaction');
      const transResult = await client.query(`
        INSERT INTO transactions (pharmacy_id, medicine_id, transaction_type, quantity, expiry_date, notes)
        VALUES ($1, $2, 'stock_in', $3, $4, 'Stock added via pharmacy dashboard')
        RETURNING *
      `, [pharmacy_id, medicine_id, quantity, expiry_date]);
      console.log('Transaction recorded:', transResult.rows);

      await client.query('COMMIT');
      console.log('Transaction committed');
      res.json({ message: 'Stock added successfully', stock: result.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error adding stock:', error);
      res.status(500).json({ error: 'Failed to add stock', details: error.message });
    } finally {
      client.release();
    }
  },

  async reduceStock(req, res) {
    try {
      // Use pharmacyId from authenticated user
      const pharmacy_id = req.user.pharmacyId;
      const { medicine_id, quantity } = req.body;
      console.log('reduceStock called with:', { pharmacy_id, medicine_id, quantity });

      if (!pharmacy_id) {
        return res.status(403).json({ error: 'Only pharmacy staff can manage inventory' });
      }
      if (!medicine_id || !quantity) {
        console.error('Missing required fields');
        return res.status(400).json({ error: 'medicine_id and quantity are required' });
      }

      // Get current stock
      const stockResult = await pool.query(
        'SELECT quantity FROM pharmacy_stocks WHERE pharmacy_id = $1 AND medicine_id = $2',
        [pharmacy_id, medicine_id]
      );
      console.log('Current stock result:', stockResult.rows);

      if (stockResult.rows.length === 0) {
        console.error('Stock not found');
        return res.status(404).json({ error: 'Stock not found' });
      }

      const currentQuantity = parseInt(stockResult.rows[0].quantity);
      const newQuantity = Math.max(0, currentQuantity - parseInt(quantity));
      console.log('Current quantity:', currentQuantity, 'New quantity:', newQuantity);

      const updateResult = await pool.query(`
        UPDATE pharmacy_stocks
        SET quantity = $1, updated_at = CURRENT_TIMESTAMP
        WHERE pharmacy_id = $2 AND medicine_id = $3
      `, [newQuantity, pharmacy_id, medicine_id]);
      console.log('Update result:', updateResult.rowCount, 'rows affected');

      // Record transaction
      await pool.query(`
        INSERT INTO transactions (pharmacy_id, medicine_id, transaction_type, quantity, notes)
        VALUES ($1, $2, 'stock_out', $3, 'Stock reduced via pharmacy dashboard')
      `, [pharmacy_id, medicine_id, quantity]);

      res.json({ message: 'Stock reduced successfully', newQuantity });
    } catch (error) {
      console.error('Error reducing stock:', error);
      res.status(500).json({ error: 'Failed to reduce stock' });
    }
  },

  async getInventory(req, res) {
    console.log('=== getInventory START ===');
    try {
      // Use pharmacyId from authenticated user
      const pharmacyId = req.user.pharmacyId || req.params.pharmacyId;
      console.log('getInventory called with pharmacyId:', pharmacyId);
      
      if (!pharmacyId) {
        return res.status(403).json({ error: 'Pharmacy ID required' });
      }

      const result = await pool.query(`
        SELECT m.*, ps.stock_id, ps.quantity, ps.expiry_date
        FROM pharmacy_stocks ps
        JOIN medicines m ON ps.medicine_id = m.medicine_id
        WHERE ps.pharmacy_id = $1
        ORDER BY m.generic_name
      `, [pharmacyId]);

      console.log('Query result rows:', result.rows.length);
      console.log('Query result:', result.rows);

      res.json(result.rows);
    } catch (error) {
      console.error('Error getting inventory:', error);
      res.status(500).json({ error: 'Failed to get inventory' });
    }
  },

  async getTransactions(req, res) {
    try {
      // Use pharmacyId from authenticated user
      const pharmacyId = req.user.pharmacyId || req.params.pharmacyId;
      
      if (!pharmacyId) {
        return res.status(403).json({ error: 'Pharmacy ID required' });
      }

      const result = await pool.query(`
        SELECT t.*, m.brand_name, m.generic_name
        FROM transactions t
        JOIN medicines m ON t.medicine_id = m.medicine_id
        WHERE t.pharmacy_id = $1
        ORDER BY t.created_at DESC
        LIMIT 50
      `, [pharmacyId]);

      res.json(result.rows);
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  }
};

module.exports = inventoryController;
