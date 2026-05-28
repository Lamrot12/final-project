const { pool } = require('../config/database');

class Medicine {
  static async create(medicineData) {
    const { generic_name, brand_name, strength, category, description, manufacturer } = medicineData;
    const query = `
      INSERT INTO medicine (generic_name, brand_name, strength, category, description, manufacturer)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [generic_name, brand_name, strength, category, description, manufacturer];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM medicine ORDER BY generic_name';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM medicine WHERE medicine_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async search(searchTerm) {
    const query = `
      SELECT * FROM medicine 
      WHERE generic_name ILIKE $1 
         OR brand_name ILIKE $1 
         OR category ILIKE $1
      ORDER BY generic_name
    `;
    const result = await pool.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }

  static async getPopular(limit = 10) {
    const query = `
      SELECT m.*, COALESCE(SUM(
        CASE 
          WHEN b.transaction_type = 'sale' THEN ABS(b.quantity_changed)
          ELSE 0
        END
      ), 0) as total_sold
      FROM medicine m
      LEFT JOIN bincard b ON m.medicine_id = b.medicine_id
      GROUP BY m.medicine_id
      ORDER BY total_sold DESC, m.brand_name ASC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

module.exports = Medicine;
